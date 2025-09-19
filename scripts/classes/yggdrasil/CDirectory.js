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
    const window = new OsWindow(this.name, null, true)
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
}
