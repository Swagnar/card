import CFile from "./CFile.js"
import logWithColors from "../../utils/logs.js"
import OsWindow from "../os/OsWindow.js"
import OsDesktopIcon from "../os/OsDesktopIcon.js"

export default class CDirectory {

  /** @type {OsDesktopIcon} */
  desktopIcon;

  /**
   * @type {boolean}
   * A flag used to detect if the window is moving or still in place
   */
  isDragging = false;
  offsetX;
  offsetY;


  constructor(name) {
    this.name = name
    this.files = []
    this.desktopIcon = new OsDesktopIcon(name, 'dir')
    this.desktopIcon.container.addEventListener('dblclick', () => this.open() )
    logWithColors("CDirectory {} successfully initialized", this.name)
  }

  open() {
    let window = new OsWindow(this.name, null, true)
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
    this.desktopIcon.icon.style.backgroundImage = "url('static/dir-clicked.png')"
    this.desktopIcon.label.style.backgroundColor = "#111"
    this.desktopIcon.label.style.color = "#fff"
  }
  handlePointerUp() {
    this.desktopIcon.icon.style.backgroundImage = "url('static/dir.png')"
    this.desktopIcon.label.style.backgroundColor = "#fff"
    this.desktopIcon.label.style.color = "#111"
  }

  /*---------------------------------------------//
  //             Moving the Window               //
  //---------------------------------------------*/

  /**
   * @param {PointerEvent} e
   * 
   */
  startMovingDirectory(e) {
    this.isDragging = true
    this.offsetX = e.clientX - this.desktopIcon.container.offsetLeft
    this.offsetY = e.clientY - this.desktopIcon.container.offsetTop
    this.desktopIcon.container.style.cursor = 'grabbing'
  }
  /**
   * @param {PointerEvent} e 
   */
  moveDirectory(e) {
    if(!this.isDragging) return;
    this.desktopIcon.container.style.left = (e.clientX - this.offsetX) + 'px'
    this.desktopIcon.container.style.top = (e.clientY - this.offsetY) + 'px'
  }
  /**
   * @param {PointerEvent} e 
   */
  stopMovingDirectory(e) {
    this.isDragging = false;
    this.desktopIcon.container.style.cursor = 'grab'
  }


  get icon() {
    return this.desktopIcon.icon
  }

}
