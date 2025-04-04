import CDirectory from "../yggdrasil/CDirectory.js";

import { DESKTOP } from "../../../script.js";
import { applyDithering } from "../../utils/dithering.js";
import logWithColors from "../../utils/logs.js";

export default class OsWindow {

  #container = document.createElement('div');
    #headerTag = document.createElement('header');
    #bodyTag = document.createElement('div');

  /** @type {string} */
  #windowName

  /** @type {CFile[]} */
  #files

  // TODO: Change to #directory and use #directory.files?
  
  /**
   * 
   * @param {string} name Window name, shown in the header tag
   * @param {string?} id If you want to have a custom window ID, pass this parameter
   */
  constructor(name, id = "") {
    this.#windowName = name

    this.#container.classList.add('window');

    if(id !== "") {
      this.#container.id = `window-${id}`;
    } else {
      this.#container.id = `window-${name}`
    }

    // why
    //
    // TODO: change to a class method - setDraggable
    this.#container.draggable = true;

    this.#headerTag = document.createElement('header')

    let span = document.createElement('span')
    let closeButton = document.createElement('button')

    span.innerText = this.#windowName
    closeButton.innerText = "X"
    closeButton.addEventListener('click', () => { this.closeWindow() })
    this.#headerTag.append(span, closeButton)

    this.#bodyTag.classList.add('window-body')

    this.#container.append(this.#headerTag)
    this.#container.append(this.#bodyTag)

    logWithColors("Successfully created OsWindow with name {}", name)
  }
  
  get container() {
    return this.#container
  }

  /**
   * @returns {CFile[]}
   */
  get files() {
    if(!this.#files) {
      throw new Error("No files found while using files() getter")
    }
    return this.#files;
  }

  /**
   * @param {CDirectory} directory 
   */
  setAsDirectory(directory) {
    if(!directory || !directory instanceof CDirectory) {
      throw new TypeError("Directory passed to the window is undefined or not a CDirectory");
    }
    this.#files = directory.files
    this.populateBodyWithFiles()
  }

  /**
   * Set the OsWindow id attribiute
   * @param {string} id string value to be set as the id
   */
  setWindowID(id) { this.#container.id = id; }

  /**
   * Returns the OsWindow id attribiute value
   * @returns {string} id attribiute value
   */
  getWindowID()   { return this.#container.id; }

  /**
   * This method appends passed HTML nodes into the OsWindow body
   * @param {...HTMLElement} nodes 
   */
  appendToWindowBody(...nodes) {
    this.#bodyTag.append(...nodes);
  }

  /**
   * Clear the OsWindow body, leave only the header bar
   */
  clearWindowBody() {
    this.#bodyTag.innerHTML = "";
  }

  /**
   * Append parameter values as class names to the OsWindow body element. This
   * @param {string} classNames class names to be added to the OsWindow body
   */
  addClassToWindowBody(...classNames) {
    this.#bodyTag.classList.add(...classNames);
  }
  removeAllClassFromWindowBody() {
    this.#bodyTag.setAttribute('class', '') // lmao?
  }
  removeClassFromWindowBody(token) {
    this.#bodyTag.classList.remove(token);
  }
  
  /**
   * Used by OsTerminal to set up the window to look like a terminal screen
   * 
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
    this.#container.classList.add('window-terminal');
    this.addClassToWindowBody('terminal-body');
    this.removeClassFromWindowBody('window-body');

    this.#bodyTag.append(outputContainer, inputContainer)
  }

  /**
   * Used when double clicked on a file to open it up
   * @param {string} fileContent A string containing all of the file contents. The string can have HTML tags inside since its injected into `innerHTML` of the window
   * @throws An error if there is a mismatch between the number of `<img>` tags and `<canvas>` tags
   * 
   */
  setAsFileViewer(fileContent) {
    this.#bodyTag.classList.add('file-viewer')
    this.#bodyTag.innerHTML = fileContent

    const imgs = this.#bodyTag.querySelectorAll('img')
    const cnvs = this.#bodyTag.querySelectorAll('canvas')

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


  // Fill the #bodyTag with visual representation for each file found inside the OsWindow.#files
  populateBodyWithFiles() {
    try {

      let layout = this.#bodyTag.firstChild
      
      if(!layout) {
        layout = document.createElement('div');
        layout.classList.add('d-flex', 'flex-wrap');
        this.#bodyTag.append(layout);
      }
      if(!this.#files || this.#files.length == 0) {
        throw new Error('Files array is empty or not set')
      }
      
      this.#files.forEach(file /** @type {CFile} */ => {
        layout.append(file.fileContainer)
      })
      logWithColors("Finished populating {} with {} files", this.#windowName, this.#files.length)
    } catch(e) {
      console.error(`Something went wrong while populating OsWindow with name ${this.#windowName}`, e)
    }
  }

  closeWindow() {
    setTimeout(() => {
      this.#container.classList.remove('show')
      this.#container.classList.add('hide')
    }, 50)

    const closeWindowEvent = new CustomEvent("windowClosed", {
      detail: this.#container
    })

    document.dispatchEvent(closeWindowEvent)
    this.#container.remove()
  }
  showWindow() {
    DESKTOP.append(this.#container)
    setTimeout(() => {
      this.#container.style.transition = 'none'
      this.#container.classList.remove('show')
      this.#container.classList.add('hide')
      this.#container.offsetHeight
      this.#container.style.transition = ''
      this.#container.classList.remove('hide')
      this.#container.classList.add('show')
    }, 50)
  }

  
}