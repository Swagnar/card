import { YGGDRASIL } from "./classes/yggdrasil/Yggdrasil.js"
import CDirectory from "./classes/yggdrasil/CDirectory.js"
import CArchive from "./classes/yggdrasil/CArchive.js"
import CAppShortcut from "./classes/yggdrasil/CAppShortcut.js"

import logWithColors from "./utils/logs.js"
import sleep from "./utils/sleep.js"
import { OS_CONSTANS } from "./constans.js"

const BIOS_LOGO = String.raw`
_______/\\\\\__________/\\\\\\\\\\\___________________________/\\\\\__________/\\\\\\\\\\\___        
 _____/\\\///\\\______/\\\/////////\\\_______________________/\\\///\\\______/\\\/////////\\\_       
  ___/\\\/__\///\\\___\//\\\______\///______________________/\\\/__\///\\\___\//\\\______\///__      
   __/\\\______\//\\\___\////\\\____________________________/\\\______\//\\\___\////\\\_________     
    _\/\\\_______\/\\\______\////\\\________________________\/\\\_______\/\\\______\////\\\______    
     _\//\\\______/\\\__________\////\\\_____________________\//\\\______/\\\__________\////\\\___   
      __\///\\\__/\\\_____/\\\______\//\\\_____________________\///\\\__/\\\_____/\\\______\//\\\__  
       ____\///\\\\\/_____\///\\\\\\\\\\\/____/\\\\\\\\\\\\\\\____\///\\\\\/_____\///\\\\\\\\\\\/___ 
        ______\/////_________\///////////_____\///////////////_______\/////_________\///////////_____
`

const BIOS_INFO = `
#   Copyright (c) 2023-2025. All Rights   #
#           OS_OS BIOS v202547            #
`

/**
 * Lines shown during the BIOS POST, `slow` lines take longer to finish
 */
const BIOS_POST_LINES = [
  {name: "[CPU] ", value: "Apophis® MN99942 0.66 MHz", status: "[ PASS ]", color: "#fff" },
  {name: "[Battery] ", value: "YEG P2 @ 95%", status: "[ PASS ]", color: "#fff" },
  {name: "[Memory 1 Test] ", value: "UNDEFINED DDR 31923B", status: "[ PASS ]", color: "#fff" },
  {name: "[Memory 2 Test] ", value: "UNDEFINED 0B", status: "[ MISSING ]", color: "#fff", slow: true },
  {name: "Initializing Holy USB Controllers ... ", value: " ", status: "[ BLESSED ]", color: "#fff", slow: true },
  {name: "Connecting the Vulture ...", value: " ", status: "[ ACTIVE ] ", color: "#fff"},
  {name: "Press Any Key to boot system", value:"", status:"", color:"#fff" },
]

// Apps are placed on the right side of the desktop, from right to left
const APP_ICONS_START_RIGHT = 10
const APP_ICON_OFFSET = 70

/**
 * @param {string} id
 * @param {string} text
 * @returns {HTMLPreElement}
 */
function createPre(id, text) {
  const pre = document.createElement('pre')
  pre.id = id
  pre.textContent = text
  return pre
}

/**
 * Creates a single BIOS POST line. The status is returned separately, since it shows up with a delay
 * @param {{name: string, value: string, status: string, color: string}} postLine
 * @returns {{line: HTMLParagraphElement, statusSpan: HTMLSpanElement}}
 */
function createPostLine({ name, value, status, color }) {
  const line = document.createElement('p')

  const nameSpan = document.createElement('span')
  nameSpan.innerHTML = name
  nameSpan.style.color = color || '#00ff00'
  nameSpan.style.fontWeight = name.includes('[') && name.includes(']') ? 'bold' : 'normal'
  line.append(nameSpan)

  if (value) {
    const valueSpan = document.createElement('span')
    valueSpan.innerHTML = ` ${value}`
    valueSpan.style.color = '#ffffff'
    line.append(valueSpan)
  }

  const statusSpan = document.createElement('span')
  if (status) {
    const passed = OS_CONSTANS.BIOS_POST_CODES.some(code => status.includes(code))
    statusSpan.innerHTML = ` ${status}`
    statusSpan.style.color = passed ? OS_CONSTANS.CSS_COLORS.green : OS_CONSTANS.CSS_COLORS.red
    statusSpan.style.fontWeight = 'bold'
  }

  return { line, statusSpan }
}

export async function bootBIOS() {
  const bios = document.getElementById('bios')

  bios.append(createPre('bios-logo', BIOS_LOGO), createPre('bios-info', BIOS_INFO))

  await sleep(OS_CONSTANS.BOOT_TIME)

  for (const [i, postLine] of BIOS_POST_LINES.entries()) {
    const { line, statusSpan } = createPostLine(postLine)

    bios.append(line)

    if (i === BIOS_POST_LINES.length - 1) {
      bios.addEventListener('click', () => bootOS())
      line.id = 'any-key'
    }
    await sleep(OS_CONSTANS.BOOT_POST_TIME)

    if (postLine.status) line.append(statusSpan)

    await sleep(OS_CONSTANS.BOOT_POST_TIME)
    if (postLine.slow) await sleep(2 * OS_CONSTANS.BOOT_POST_TIME)
  }
}

function bootOS() {
  document.getElementById('bios').style.display = 'none'
  document.body.classList.add('cursor-wait')

  setTimeout(() => {
    document.body.classList.remove('cursor-wait')
    loadDesktop()
  }, OS_CONSTANS.DESKTOP_LOAD_TIME)
}

/**
 * @param {*} element Yggdrasil element
 * @returns {string|null} name of the OS type of the element, `null` if it's not recognized
 */
function getOsTypeName(element) {
  if (element instanceof CDirectory) return 'CDirectory'
  if (element instanceof CArchive) return 'CArchive'
  if (element instanceof CAppShortcut) return 'CApp'
  return null
}

function loadDesktop() {
  const navbar = document.querySelector('.navbar')
  let appIconRight = APP_ICONS_START_RIGHT

  YGGDRASIL.forEach(element => {
    const typeName = getOsTypeName(element)
    if (!typeName) {
      throw new TypeError(`Yggdrasil element does not have OS recognizable type, got:`, element)
    }

    if (element instanceof CAppShortcut) {
      element.desktopIcon.container.style.right = `${appIconRight}px`
      appIconRight += APP_ICON_OFFSET
    }
    logWithColors(`Appending ${typeName} {} to DESKTOP element`, element.name)

    navbar.after(element.desktopIcon.container)
  })
  navbar.style.display = 'flex'
}
