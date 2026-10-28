import CDirectory from "../yggdrasil/CDirectory.js";

import { applyDithering } from "../../utils/dithering.js";
import logWithColors from "../../utils/logs.js";

function generateWindowId(appName) {
  return `${appName.toLowerCase()}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export default class OsWindow {

  container = document.createElement('div');

  headerTag = document.createElement('header');
  headerWindowName = document.createElement('span')
  closeButton = document.createElement('button')

  bodyTag = document.createElement('div');

  /**
   * @type {boolean}
   * A flag used to detect if the window is moving or still in place
   */
  isDragging = false;
  offsetX;
  offsetY;

  // bound once, so they can be removed from the document after moving the window
  #onPointerMove = (ev) => this.moveWindow(ev)
  #onPointerUp = () => this.stopMovingWindow()


  /**
   *
   * @param {string} name Window name, shown in the header tag
   * @param {boolean} [resize=false] whether the user can resize the window
   */
  constructor(name, resize = false) {
    this.name = name

    this.container.classList.add('window');
    this.container.id = generateWindowId(name)

    if(resize) {
      this.container.style.resize = 'both'
    }

    this.headerWindowName.innerText = `[ ${this.name} ]`
    this.closeButton.innerText = "X"
    this.closeButton.addEventListener('click', () => { this.closeWindow() })
    this.headerTag.append(this.headerWindowName, this.closeButton)

    this.bodyTag.classList.add('window-body')

    this.container.append(this.headerTag, this.bodyTag)

    this.container.addEventListener('pointerdown', (ev) => this.focusWindow(ev) )

    this.headerTag.addEventListener('pointerdown', (ev) => this.startMovingWindow(ev) )

    logWithColors("Successfully created OsWindow with name {}", name)
  }

  /**
   * Fills the window body with icons of all the files from the directory
   * @param {CDirectory} directory
   */
  setAsDirectory(directory) {
    if(!directory || !(directory instanceof CDirectory)) {
      throw new TypeError("Directory passed to the window is undefined or not a CDirectory");
    }
    const files = directory.files
    try {
      /**
       * @type {HTMLDivElement} `<div>` tag with `d-flex` and `flex-wrap` CSS classes
       */
      let layout = this.bodyTag.firstChild

      if(!layout) {
        layout = document.createElement('div');
        layout.classList.add('d-flex', 'flex-wrap');
        this.bodyTag.append(layout);
      }
      if(!files) {
        throw new Error('Files array is not set')
      }

      files.forEach(file /** @type {CFile} */ => {
        layout.append(file.fileContainer)
      })
      logWithColors("Finished populating {} with {} files", this.name, files.length)
    } catch(e) {
      console.error(`Error while populating ${this.name} window body:`, e)
    }
  }

  /**
   * This method appends passed HTML nodes into the OsWindow body
   * @param {...HTMLElement} nodes
   */
  appendToWindowBody(...nodes) {
    this.bodyTag.append(...nodes);
  }

  /**
   * Append parameter values as class names to the OsWindow body element.
   * @param {string} classNames class names to be added to the OsWindow body
   */
  addClassToWindowBody(...classNames) {
    this.bodyTag.classList.add(...classNames);
  }
  removeAllClassFromWindowBody() {
    this.bodyTag.setAttribute('class', '')
  }
  removeClassFromWindowBody(token) {
    this.bodyTag.classList.remove(token);
  }

  /**
   * Used by OsTerminal to set up the window to look like a terminal screen
   * TODO: move this to OsTerminal.js
   * @param {HTMLDivElement} outputContainer - HTML <div> element that shows all runned commands and their outputs
   * @param {HTMLDivElement} inputContainer - HTML <div> element that contains the <input> tag
   */
  setAsTerminal(outputContainer, inputContainer) {
    if(!outputContainer) {
      throw new TypeError(`Error while setting window as terminal, outputContainer is ${outputContainer}`)
    }
    if(!inputContainer) {
      throw new TypeError(`Error while setting window as terminal, inputContainer is ${inputContainer}`)
    }
    this.addClassToWindowBody('terminal-body');
    this.removeClassFromWindowBody('window-body');

    this.bodyTag.append(outputContainer, inputContainer)
  }

  /**
   * Used when double clicked on a file to open it up
   * @param {string} fileContent A string containing all of the file contents. The string can have HTML tags inside since its injected into `innerHTML` of the window
   * @throws An error if there is a mismatch between the number of `<img>` tags and `<canvas>` tags
   *
   */
  setAsFileViewer(fileContent) {
    this.bodyTag.classList.add('file-viewer')
    this.bodyTag.innerHTML = fileContent

    const imgs = this.bodyTag.querySelectorAll('img')
    const cnvs = this.bodyTag.querySelectorAll('canvas')

    if(imgs.length !== cnvs.length) {
      throw new Error('Mismatch between <img> and <canvas> counts, while setting the window up as a file viewer')
    }

    imgs.forEach((img, i) => {
      const canvas = cnvs[i]
      if(!canvas) {
        throw new Error(`Canvas element missing for image number ${i+1} with src: ${img.src}`)
      }
      applyDithering(img, canvas)
      img.style.display = 'none'
    })
  }

  setAsGame(width, height) {
    const canvas = document.createElement('canvas')
    canvas.id = this.name
    canvas.width = width
    canvas.height = height

    this.bodyTag.append(canvas)
    return canvas
  }

  setAsBlank() {
    this.bodyTag.innerHTML = ''
  }

  focusWindow() {
    const allWindows = document.querySelectorAll('.window.show')
    allWindows.forEach(window => window.style.zIndex = 1)
    this.container.style.zIndex = 3
  }

  /*---------------------------------------------//
  //       Opening and Closing the Window        //
  //---------------------------------------------*/

  /**
   * Removes the window from the desktop and dispatches `closeWindow` event on the window container
   */
  closeWindow() {
    this.container.classList.remove('show')
    this.container.classList.add('hide')
    this.container.remove()
    this.container.dispatchEvent(new CustomEvent('closeWindow'))
  }

  showWindow() {
    const desktop = document.getElementById('desktop')
    desktop.append(this.container)
    setTimeout(() => {
      // Restart the opening animation
      this.container.style.transition = 'none'
      this.container.classList.remove('show')
      this.container.classList.add('hide')
      this.container.offsetHeight
      this.container.style.transition = ''
      this.container.classList.remove('hide')
      this.container.classList.add('show')
    }, 50)
    this.container.style.zIndex = 3
  }

  /*---------------------------------------------//
  //             Moving the Window               //
  //---------------------------------------------*/

  /**
   * @param {PointerEvent} e
   */
  startMovingWindow(e) {
    this.isDragging = true
    this.offsetX = e.clientX - this.container.offsetLeft
    this.offsetY = e.clientY - this.container.offsetTop
    this.headerTag.style.cursor = 'grabbing'

    // Globally disable text selection
    document.body.style.userSelect = 'none'

    document.addEventListener('pointermove', this.#onPointerMove)
    document.addEventListener('pointerup', this.#onPointerUp)
  }

  /**
   * @param {PointerEvent} e
   */
  moveWindow(e) {
    if(!this.isDragging) return;
    this.container.style.left = (e.clientX - this.offsetX) + 'px'
    this.container.style.top = (e.clientY - this.offsetY) + 'px'
  }

  stopMovingWindow() {
    document.removeEventListener('pointermove', this.#onPointerMove)
    document.removeEventListener('pointerup', this.#onPointerUp)

    this.isDragging = false;
    this.headerTag.style.cursor = 'grab'

    // Globally enable text selection
    document.body.style.userSelect = ''
  }
}
