export class OsWindow {

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
  constructor(name) {
    this.#windowName = name

    this.#container.classList.add('window');
    this.#container.id = `window-${this.#windowName}`;
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
    this.#files = directory.files
    this.populateBodyWithFiles()
  }
  setWindowID(id) {
    this.#container.id = id;
  }
  appendToWindowBody(...nodes) {
    this.#bodyTag.append(...nodes);
  }
  addClassToWindowBody(...classNames) {
    this.#bodyTag.classList.add(...classNames);
  }
  removeClassFromWindowBody(token) {
    this.#bodyTag.classList.remove(token);
  }
  clearWindowBody() {
    this.#bodyTag.innerHTML = "";
  }
  // TODO: remove and use methods from above
  setAsTerminal(outputContainer, inputContainer) {
    if(!outputContainer) {
      throw new TypeError(`Error while setting window as terminal, outputContainer is ${outputContainer}`)
    }
    if(!inputContainer) {
      throw new TypeError(`Error while setting window as terminal, inputContainer is ${inputContainer}`)
    }
    this.#container.classList.add('window-terminal');
    this.#bodyTag.classList.add('terminal-body');
    this.#bodyTag.classList.remove('window-body');

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