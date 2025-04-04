import { CFile } from "./CFile.js"
import logWithColors from "../../utils/logs.js"
import OsWindow from "../os/OsWindow.js"

export default class CDirectory {

  /** @type {HTMLButtonElement} */
  #container

  /** @type {HTMLSpanElement} */
  #icon

  /** @type {HTMLSpanElement} */
  #label


  constructor(name) {
    this.name = name
    this.files = []
    this.id = `window-${this.name}`

    this.#icon = document.createElement('span')
    this.#label = document.createElement('span')
    this.#container = document.createElement('button')
  }

  init() {
    try {
      this.#container.classList.add('file', 'folder')
      this.#container.draggable = true
      this.#container.style.top = "40px"

      this.#icon.classList.add('file-icon', 'folder-icon')
      this.#icon.style.backgroundImage = "url('static/dir.png')"

      this.#label.classList.add('file-label')
      this.#label.innerText = this.name

      this.#container.append(this.#icon)
      this.#container.append(this.#label)

      // When clicked on the directory, change its colors to visualize 'clicked' effect
      this.#container.addEventListener('pointerdown', () => this.handlePointerDown())

      // The reverse happends when user let go mouse button, reverse to default colors
      this.#container.addEventListener('pointerup', () => this.handlePointerUp())

      // When dblclick, create a new OsWindow instance, populate it with this CDirectory and show it on DESKTOP element
      this.#container.addEventListener('dblclick', () => this.open() )

      logWithColors("CDirectory {} successfully initialized", this.name)
    } catch(e) {
      console.error(`Error while initializing CDirectory with name ${this.name}:`, e)
    }
  }

  open() {
    let window = new OsWindow(this.name)
    window.setAsDirectory(this)
    window.showWindow()
  }

  
  /**
   * Adds one single file into the directory `files` array
   * @param {CFile} file 
   * @throws Will throw an error if the file argument is not an instance of CFile
   */
  addFile(file) {
    if(file instanceof CFile) {
      this.files.push(file)
      logWithColors("Adding CFile with name {} to CDirectory {}", file.name, this.name)
    } else {
      throw new Error('Function `addFile()` only accepts an instance of CFile')
    }
  }

  /**
   * Adds a collection of files into the directory `files` array
   * @param  {...CFile} files 
   */
  addFiles(...files) {
    files.forEach(file => {
        if(file instanceof CFile) {
          this.addFile(file)
        } else {
          throw new Error('Function `addFiles()` only accepts instances of CFile')
        }
    })
  }

  handlePointerDown() {
    this.#icon.style.backgroundImage = "url('static/dir-clicked.png')"
    this.#label.style.backgroundColor = "#111"
    this.#label.style.color = "#fff"
  }
  handlePointerUp() {
    this.#icon.style.backgroundImage = "url('static/dir.png')"
    this.#label.style.backgroundColor = "#fff"
    this.#label.style.color = "#111"
  }


  get container() {
    return this.#container
  }
  get icon() {
    return this.#icon
  }

}
