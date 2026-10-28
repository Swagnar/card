import CApp from "../yggdrasil/CApp.js";
import CFile from "../yggdrasil/CFile.js";
import { OS_CONSTANS } from "../../constans.js";

export default class Composer extends CApp {

  /** @type {CFile} */
  file

  constructor() {
    super('Composer', 'showComposer')
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

  saveFile() {
    window.prompt("Name your file").then(result => {
      console.log('returned:', result)

      localStorage.setItem(`${OS_CONSTANS.USER_FILE_PREFIX}${result}`, this.window.bodyTag.innerHTML)
    })
  }
}
