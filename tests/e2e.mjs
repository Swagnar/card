// End-to-end tests of OS_OS, run in headless Chrome via the Chrome DevTools Protocol.
// No dependencies, requires Node 22+ (built-in WebSocket) and Chrome or Edge.
//
//   node tests/e2e.mjs
//
// Set CHROME_PATH if the browser is not found automatically.

import http from 'node:http'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const STEP_TIMEOUT = 30000

const BROWSER_PATHS = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean)

const MIME_TYPES = {
  '.js': 'application/javascript', '.mjs': 'application/javascript', '.html': 'text/html', '.css': 'text/css',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.gif': 'image/gif', '.ico': 'image/x-icon',
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

/* ---------------------------------------------------------------- */
/*                     Static server and browser                    */
/* ---------------------------------------------------------------- */

function startServer() {
  const server = http.createServer((req, res) => {
    let file = decodeURIComponent(new URL(req.url, 'http://x').pathname)
    if (file.endsWith('/')) file += 'index.html'
    const fullPath = path.join(ROOT, file)

    if (!fullPath.startsWith(ROOT)) {
      res.writeHead(403)
      return res.end()
    }
    fs.readFile(fullPath, (err, data) => {
      if (err) {
        res.writeHead(404)
        return res.end()
      }
      res.writeHead(200, { 'content-type': MIME_TYPES[path.extname(fullPath)] ?? 'application/octet-stream' })
      res.end(data)
    })
  })
  return new Promise(r => server.listen(0, '127.0.0.1', () => r(server)))
}

async function startBrowser() {
  const browserPath = BROWSER_PATHS.find(p => fs.existsSync(p))
  if (!browserPath) {
    throw new Error('Chrome not found, set the CHROME_PATH environment variable')
  }

  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'os_os-e2e-'))
  const browser = spawn(browserPath, [
    '--headless=new',
    '--remote-debugging-port=0',
    `--user-data-dir=${profileDir}`,
    '--autoplay-policy=no-user-gesture-required',
    '--no-first-run',
    'about:blank',
  ], { stdio: 'ignore' })

  // the browser writes its debugging port into the profile directory
  const portFile = path.join(profileDir, 'DevToolsActivePort')
  for (let i = 0; i < 100 && !fs.existsSync(portFile); i++) await sleep(100)
  await sleep(100)
  const port = fs.readFileSync(portFile, 'utf8').split('\n')[0].trim()

  const stop = () => {
    browser.kill()
    setTimeout(() => fs.rmSync(profileDir, { recursive: true, force: true }), 500)
  }
  return { port, stop }
}

/* ---------------------------------------------------------------- */
/*                         DevTools Protocol                        */
/* ---------------------------------------------------------------- */

async function openPage(port) {
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json()
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise(r => ws.addEventListener('open', r))

  let lastId = 0
  const pending = new Map()
  const errors = []

  ws.addEventListener('message', (m) => {
    const msg = JSON.parse(m.data)
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg)
      pending.delete(msg.id)
      return
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      const details = msg.params.exceptionDetails
      errors.push(`exception: ${details.exception?.description?.split('\n')[0] ?? details.text}`)
    }
    if (msg.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(msg.params.type)) {
      errors.push(`console.${msg.params.type}: ${msg.params.args.map(a => a.value ?? a.description).join(' ')}`)
    }
  })

  const send = (method, params = {}) => new Promise(r => {
    const id = ++lastId
    pending.set(id, r)
    ws.send(JSON.stringify({ id, method, params }))
  })

  /** Runs the async function body in the page and returns its result */
  const run = async (body) => {
    const evaluation = send('Runtime.evaluate', {
      expression: `(async () => { ${body} })()`,
      awaitPromise: true, returnByValue: true, userGesture: true,
    })
    const res = await Promise.race([evaluation, sleep(STEP_TIMEOUT).then(() => ({ result: { result: { value: 'TIMEOUT' } } }))])
    if (res.result.exceptionDetails) {
      return `EVAL ERROR: ${res.result.exceptionDetails.exception?.description}`
    }
    return res.result.result.value
  }

  return { send, run, errors, close: () => ws.close() }
}

// Injected before the page scripts - counts animation loops, audio contexts and media calls
const INSTRUMENTATION = `
  window.__loops = new Set();
  const raf = window.requestAnimationFrame.bind(window), caf = window.cancelAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => { const id = raf((t) => { __loops.delete(id); cb(t) }); __loops.add(id); return id };
  window.cancelAnimationFrame = (id) => { __loops.delete(id); caf(id) };

  window.__audioContexts = 0;
  const AC = window.AudioContext;
  window.AudioContext = class extends AC { constructor(...a) { super(...a); window.__audioContexts++ } };

  window.__pauses = 0;
  window.__played = [];
  const pause = HTMLMediaElement.prototype.pause, play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.pause = function() { window.__pauses++; return pause.call(this) };
  HTMLMediaElement.prototype.play = function() { window.__played.push(this); return play.call(this) };
`

// Page helpers, defined after every page load
const HELPERS = `
  window.__wait = ms => new Promise(r => setTimeout(r, ms));
  window.__find = (sel, text) => [...document.querySelectorAll(sel)].find(e => e.textContent.trim() === text);
  window.__fire = (el, type, init = {}) => el.dispatchEvent(new (type.startsWith('pointer') ? PointerEvent : MouseEvent)(type, { bubbles: true, cancelable: true, ...init }));
  window.__term = async (cmd) => {
    const inputs = document.querySelectorAll('.terminal-input');
    const input = inputs[inputs.length - 1];
    input.value = cmd;
    input.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter', bubbles: true }));
    await __wait(200);
  };
  window.__lastWindow = () => [...document.querySelectorAll('.window')].pop();
  window.__closeAll = () => document.querySelectorAll('.window header button').forEach(b => b.click());
  window.__desk = () => document.getElementById('desktop').classList;
`

/* ---------------------------------------------------------------- */
/*                               Tests                              */
/* ---------------------------------------------------------------- */

const results = []

function check(name, actual, expected) {
  const passed = JSON.stringify(actual) === JSON.stringify(expected)
  results.push({ name, passed, actual, expected })
  console.log(`${passed ? 'PASS' : 'FAIL'}  ${name}`)
  if (!passed) {
    console.log(`      got:      ${JSON.stringify(actual)}\n      expected: ${JSON.stringify(expected)}`)
  }
}

async function runTests(page, url) {
  const { send, run } = page

  await send('Runtime.enable')
  await send('Page.enable')
  await send('Storage.clearDataForOrigin', { origin: new URL(url).origin, storageTypes: 'all' })
  await send('Page.addScriptToEvaluateOnNewDocument', { source: INSTRUMENTATION })

  const load = async () => {
    await send('Page.navigate', { url })
    await sleep(400)
    await run(HELPERS)
    // BIOS, then "press any key" and wait for the desktop
    await run(`await __wait(5000); document.getElementById('bios').click(); await __wait(2500)`)
  }

  await load()

  // --- desktop
  check('desktop has default settings', await run(`return [...__desk()].sort()`), ['flicker', 'res800x600'])
  check('apps are not created before they are opened', await run(`return [__audioContexts, document.querySelectorAll('.window').length]`), [0, 0])
  check('all desktop icons are shown', await run(`return document.querySelectorAll('#desktop > .file').length`), 8)
  check('context menu is shown above windows', await run(`return getComputedStyle(document.getElementById('context-menu')).zIndex`), '8')

  // --- terminal
  await run(`__fire(document.getElementById('desktop'), 'contextmenu', {clientX: 300, clientY: 300}); document.getElementById('context-menu-item-terminal').click(); await __wait(300)`)
  check('terminal opens from the context menu', await run(`return document.querySelectorAll('.terminal-body').length`), 1)
  check('help lists the alert flags', await run(`await __term('help'); return document.querySelector('.terminal-output').textContent.includes('-w | warning')`), true)
  check('unknown command', await run(`await __term('nope'); return document.querySelector('.terminal-output').textContent.includes("Command 'nope' was not found")`), true)
  check('alert -w is warning styled, nothing logged as undefined', await run(`
    await __term('alert careful -w');
    const box = document.getElementById('alert-body');
    const r = [box.className, box.textContent, document.querySelector('.terminal-output').textContent.includes('undefined')];
    box.querySelector('button').click(); await __wait(100);
    return r`), ['alert-warning', 'carefulOK', false])
  check('clear empties the terminal output', await run(`await __term('clear'); return document.querySelector('.terminal-output').children.length`), 0)

  // --- settings
  check('settings are saved and applied', await run(`
    document.dispatchEvent(new Event('showSettings')); await __wait(100);
    const dm = document.getElementById('dark-mode-chbx'); dm.checked = true; dm.dispatchEvent(new Event('input', {bubbles: true}));
    const res = document.getElementById('resolution-select'); res.value = '1280x768'; res.dispatchEvent(new Event('input', {bubbles: true}));
    __find('#dialog-body button', 'SAVE').click(); await __wait(100);
    return [dm.checked, [...__desk()].sort(), JSON.parse(localStorage.getItem('OsSettings'))]`),
    [true, ['dark-mode', 'flicker', 'res1280x768'], { 'flickering': true, 'dark-mode': true, 'resolution': '1280x768' }])
  check('dialog contents are replaced when switching dialogs', await run(`
    document.dispatchEvent(new CustomEvent('showDialog', { detail: 'about' })); await __wait(50);
    const body = document.getElementById('dialog-body'); return [body.className, body.querySelectorAll('input, select').length]`), ['dialog-body', 0])
  check('properties show the current desktop height', await run(`
    document.dispatchEvent(new CustomEvent('showDialog', { detail: 'properties' })); await __wait(50);
    return /Screen size: \\d+px X 768px/.test(document.getElementById('dialog-body').textContent)`), true)

  await load()
  check('saved settings are loaded after reload', await run(`return [[...__desk()].sort(), document.querySelector('.navbar').classList.contains('dark-mode')]`),
    [['dark-mode', 'flicker', 'res1280x768'], true])
  check('ctrl+s opens the settings', await run(`
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 's', keyCode: 83, which: 83, ctrlKey: true, bubbles: true })); await __wait(100);
    return [document.getElementById('dialog-body').className, document.getElementById('dark-mode-chbx').checked, document.querySelector('#dialog-body .checkbox-wrapper').classList.contains('dark-mode')]`),
    ['dialog-body settings-body', true, true])
  check('reset restores the default settings', await run(`
    __find('#dialog-body button', 'RESET').click(); await __wait(50);
    return [[...__desk()].sort(), document.querySelector('.navbar').classList.contains('dark-mode'), document.getElementById('dark-mode-chbx').checked, document.getElementById('resolution-select').value]`),
    [['flicker', 'res800x600'], false, false, '800x600'])
  await run(`__fire(document.getElementById('dialog-close-btn'), 'pointerdown')`)

  // --- navbar
  check('navbar dropdown toggles', await run(`
    const file = __find('.item > button', 'File');
    file.click(); const opened = file.parentElement.classList.contains('active');
    file.click(); return [opened, file.parentElement.classList.contains('active')]`), [true, false])
  check('File > New opens Composer', await run(`
    __fire(document.getElementById('navbar-submenu-item-new'), 'pointerdown'); await __wait(300);
    return __lastWindow().id.startsWith('composer-')`), true)
  check('File > Share shows an alert', await run(`
    __fire(document.getElementById('navbar-submenu-item-share'), 'pointerdown'); await __wait(300);
    const alertBody = document.getElementById('alert-body'); const shown = Boolean(alertBody);
    alertBody?.querySelector('button').click(); return shown`), true)

  // --- directories and files
  check('directory window lists its files', await run(`
    __closeAll(); __fire(__find('.folder', 'WORK'), 'dblclick'); await __wait(300);
    return [...__lastWindow().querySelectorAll('button.file span')].map(s => s.textContent)`), ['Misc.bat', 'Amazon.bat', 'Teacher.txt', 'Hosting.txt'])
  check('file images are dithered', await run(`
    __fire(__find('.window button.file', 'Teacher.txt'), 'dblclick'); await __wait(800);
    const body = __lastWindow().querySelector('.file-viewer');
    return [body.querySelector('h1').textContent, [...body.querySelectorAll('img')].every(i => i.style.display === 'none')]`), ['I was a teacher', true])

  // --- composer
  check('cancelled save does not create a file', await run(`
    __closeAll(); document.dispatchEvent(new CustomEvent('showComposer')); await __wait(300);
    __find('button', '💾').click(); await __wait(100);
    document.getElementById('prompt-cancel-btn').click(); await __wait(100);
    return Object.keys(localStorage).filter(k => k.startsWith('userFile-'))`), [])
  check('saved file is sanitized and shows up in MY FILES', await run(`
    __lastWindow().querySelector('.window-body').innerHTML = '<p onclick="alert(1)">hi</p><script>alert(2)<\\/script><a href="javascript:alert(3)">x</a>';
    __find('button', '💾').click(); await __wait(100);
    document.getElementById('prompt-input').value = ' note '; document.getElementById('prompt-ok-btn').click(); await __wait(100);
    __fire(__find('.folder', 'MY FILES'), 'dblclick'); await __wait(300);
    return [localStorage.getItem('userFile-note'), [...__lastWindow().querySelectorAll('button.file span')].map(s => s.textContent)]`),
    ['<p>hi</p><a>x</a>', ['note.txt']])

  // --- choir
  check('play button does nothing before a track is selected', await run(`
    __closeAll();
    document.dispatchEvent(new CustomEvent('showChoir')); await __wait(300);
    document.dispatchEvent(new CustomEvent('showChoir')); await __wait(4000);
    const [a] = document.querySelectorAll('.choir-body');
    a.querySelector('[role=switch]').click(); await __wait(50);
    return a.querySelector('[role=switch]').dataset.playing`), 'false')
  check('selecting an album affects only its own window', await run(`
    const [a, b] = document.querySelectorAll('.choir-body');
    b.querySelector('.choir-album-cover').click(); await __wait(500);
    return [a.querySelectorAll('.choir-album-cover').length > 0, b.querySelectorAll('.choir-playback-track-container').length > 0]`), [true, true])
  check('playing tracks keeps a single visualizer loop', await run(`
    const b = document.querySelectorAll('.choir-body')[1];
    const playable = b.querySelectorAll('.choir-playback-track-container.playable');
    const before = __loops.size;
    playable[0].click(); await __wait(300); playable[0].click(); await __wait(300);
    playable[1]?.click(); await __wait(300);
    return [__loops.size - before, playable.length >= 2]`), [1, true])
  check('prev and next buttons switch tracks', await run(`
    const b = document.querySelectorAll('.choir-body')[1];
    const [prev, playPause, next] = b.querySelectorAll('.choir-buttons > button');
    const playing = () => b.querySelector('.choir-playback-track-container.playing span:nth-child(2)').textContent;
    const states = [[playing(), prev.disabled, next.disabled, playPause.dataset.playing]];
    prev.click(); await __wait(200);
    states.push([playing(), prev.disabled, next.disabled, playPause.dataset.playing]);
    playPause.click(); await __wait(200);
    states.push([playPause.dataset.playing]);
    return states`), await run(`
    const tracks = [...document.querySelectorAll('.choir-body')[1].querySelectorAll('.choir-playback-track-container.playable span:nth-child(2)')].map(s => s.textContent);
    return [[tracks[1], false, tracks.length === 2, 'true'], [tracks[0], true, false, 'true'], ['false']]`))
  check('next track starts after the current one ends', await run(`
    const b = document.querySelectorAll('.choir-body')[1];
    const playable = b.querySelectorAll('.choir-playback-track-container.playable');
    playable[0].click(); await __wait(200);
    __played[__played.length - 1].dispatchEvent(new Event('ended')); await __wait(200);
    return b.querySelector('.choir-playback-track-container.playing') === playable[1]`), true)
  check('closing another window does not pause Choir', await run(`
    const before = __pauses;
    __fire(__find('.folder', 'WORK'), 'dblclick'); await __wait(300);
    __lastWindow().querySelector('header button').click(); await __wait(100);
    return __pauses - before`), 0)
  check('closing Choir stops the music and the visualizer', await run(`
    const before = __pauses, loops = __loops.size;
    document.querySelectorAll('.choir-body')[1].closest('.window').querySelector('header button').click(); await __wait(200);
    return [__pauses - before, loops - __loops.size]`), [1, 1])

  // --- dragging
  check('window can be dragged, listeners are removed after', await run(`
    __closeAll(); __fire(__find('.folder', 'WORK'), 'dblclick'); await __wait(300);
    const w = __lastWindow(), x0 = w.offsetLeft;
    __fire(w.querySelector('header'), 'pointerdown', {clientX: 100, clientY: 100});
    __fire(document, 'pointermove', {clientX: 150, clientY: 120}); __fire(document, 'pointerup');
    const x1 = w.offsetLeft;
    __fire(document, 'pointermove', {clientX: 300, clientY: 300});
    return [x1 - x0, w.offsetLeft - x1]`), [50, 0])
  check('reset desktop moves dragged icons back', await run(`
    __closeAll();
    const icon = __find('.folder', 'D&D'), before = icon.style.cssText;
    __fire(icon, 'pointerdown', {clientX: 100, clientY: 100}); __fire(document, 'pointermove', {clientX: 150, clientY: 170}); __fire(document, 'pointerup');
    const moved = icon.style.cssText !== before;
    document.getElementById('context-menu-item-reset-desktop').click();
    return [moved, icon.style.cssText === before]`), [true, true])

  // --- reload
  await load()
  check('saved file is still in MY FILES after reload', await run(`
    __fire(__find('.folder', 'MY FILES'), 'dblclick'); await __wait(300);
    return [...__lastWindow().querySelectorAll('button.file span')].map(s => s.textContent)`), ['note.txt'])
}

/* ---------------------------------------------------------------- */

const server = await startServer()
const browser = await startBrowser()
const url = `http://127.0.0.1:${server.address().port}/`

let page
try {
  page = await openPage(browser.port)
  await runTests(page, url)
} finally {
  page?.close()
  browser.stop()
  server.close()
}

// clipboard is not available in headless mode, the Share alert falls back to a warning
const unexpectedErrors = page.errors.filter(e => !/clipboard/i.test(e))
if (unexpectedErrors.length) {
  console.log('\nErrors in the page:\n  ' + unexpectedErrors.join('\n  '))
}

const failed = results.filter(r => !r.passed).length
console.log(`\n${results.length - failed}/${results.length} passed`)
process.exit(failed || unexpectedErrors.length ? 1 : 0)
