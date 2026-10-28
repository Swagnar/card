import CApp from "../yggdrasil/CApp.js";
import CFile from "../yggdrasil/CFile.js";
import sanitizeHTML from "../../utils/sanitize.js";
import { OS_CONSTANS } from "../../constans.js";

export default class Composer extends CApp {

  static appName = 'Composer'
  static command = 'showComposer'

  /** @type {CFile} */
  file

  constructor() {
    super()
    this.file = new CFile('New File', 'txt', '')
    this.window.setAsFileViewer(this.file.content)
    this.window.bodyTag.setAttribute('contenteditable', 'true')
    this.createToolbox()
  }

  createToolbox() {
    const toolbox = document.createElement('div')

    const saveFileIcon = document.createElement('button')
    saveFileIcon.innerText = '💾'
    saveFileIcon.addEventListener('click', () => this.saveFile() )

    toolbox.append(saveFileIcon)

    this.window.headerTag.after(toolbox)
  }

  /**
   * Asks for the file name and saves the file in the `localStorage`.
   * Dispatches `userFileSaved` event, so the file shows up in the user files directory
   */
  async saveFile() {
    const name = (await window.prompt("Name your file"))?.trim()

    // cancelled or no name given
    if(!name) return

    const content = sanitizeHTML(this.window.bodyTag.innerHTML)
    localStorage.setItem(`${OS_CONSTANS.USER_FILE_PREFIX}${name}`, content)

    document.dispatchEvent(new CustomEvent('userFileSaved', { detail: { name, content } }))
  }
}
