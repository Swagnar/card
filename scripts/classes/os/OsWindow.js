import { CDirectory } from "../yggdrasil/CDirectory.js";

export default class OsWindow {

  /** @type {HTMLDivElement} */
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
   */
  constructor(name, blob = "") {
    this.#windowName = name

    this.#container.classList.add('window');

    if(blob !== "") {
      this.#container.id = `window-${blob}`;
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


    this.joinElements()

  }
  
  get container() {
    return this.#container
  }

  /**
   * @returns
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
   * This methods appends the header and body containers to the main HTML tag of the OsWindow - `container`
   */
  joinElements() {
    this.#container.append(this.#headerTag)
    this.#container.append(this.#bodyTag)
  }

  // Fill the #bodyTag with visual representation for each file found inside the OsWindow.#files
  populateBodyWithFiles() {

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

      // Each file is a button with span element inside that acts as a label
      //
      let fileTag = document.createElement('button')
      
      fileTag.classList.add('file', file.type)
      fileTag.innerHTML = `
        <span>${file.name}</span>
      `
      layout.append(fileTag)
    })
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
  }
  showWindow() {
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