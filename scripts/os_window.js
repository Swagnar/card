export class OsWindow {

  /**
   * @type {HTMLDivElement}
   */
  #container

  /**
   * @type {HTMLElement} 
   */
  #headerTag

  /**
   * @type {HTMLDivElement}
   */
  #bodyTag

  /**
   * 
   * @param {CDirectory} directory 
   */
  constructor(directory) {
    this.headerName = directory.name;
    this.files = directory.files
    this.createContainer()
    this.createHeaderElement()
    this.createBodyElement()

    // XD
    this.joinElements()
  }
  
  get container() {
    return this.#container
  } 

  createContainer() {
    this.#container = document.createElement('div')
    this.#container.classList.add('window')
    this.#container.draggable = true
    this.#container.id = `window-${this.headerName}`
  }
  createHeaderElement() {
    this.#headerTag = document.createElement('header')

    let span = document.createElement('span')
    let closeButton = document.createElement('button')

    span.innerText = this.headerName
    closeButton.innerText = "X"
    closeButton.addEventListener('click', () => { this.closeWindow() })
    this.#headerTag.append(span, closeButton)
  }
  createBodyElement() {
    this.#bodyTag = document.createElement('div')
    this.#bodyTag.classList.add('window-body')

    let layout = document.createElement('div') 
    layout.classList.add('d-flex', 'flex-wrap')

    this.#bodyTag.append(layout)
    this.populateBody()
  }
  joinElements() {
    this.#container.append(this.#headerTag)
    this.#container.append(this.#bodyTag)
  }

  populateBody() {
    let layout = this.#bodyTag.firstChild
    if(!layout) {
      throw new Error("Couldn't find the layout element inside body tag")
    }
    if(!this.files || this.files.length == 0) {
      throw new Error('Files array is empty or not set')
    }
    this.files.forEach(file /** @type {CFile} */ => {
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