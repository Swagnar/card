// TODO: CFile.content needs to be able to hold a multiple of HTMLElements,
// create some functions that would allow to dynamicly append and modify tags inside?

import OsWindow from "../os/OsWindow.js"


const MIMETYPES = {
  md: "/static/md-file.png",
  txt: "/static/text-file.png",
  bat: "/static/bat-file.png"
}


/**
 * Class representing a single file that can be contained inside a folder.
 * The file icon is created via `::before` pseudoelement, based on the `type` property of the file
 */
export default class CFile {
  /**
   *
   * @param {string} name file name, shown below the icon
   * @param {string} type type of file, currently avaiable options are: `md` for a markdown file, `txt` for a text file and `bat` for a batch file (*does not run per se*)
   * @param {string} content string containing the file contents, can contain HTML elements inside the string
   */
  constructor(name, type, content) {
    this.name = name
    this.type = type
    this.content = content
  }

  /** @returns {string} file name with its extension */
  get fullName() {
    return `${this.name}.${this.type}`
  }

  /**
   * Creates a new file icon, that opens the file in a new window when double clicked
   * @returns {HTMLButtonElement}
   */
  get fileContainer() {
    const btn = document.createElement('button')
    const img = document.createElement('img')
    const span = document.createElement('span')

    btn.classList.add('file', `${this.type}-file`)
    btn.draggable = true
    btn.id = `file-${this.name}`

    img.src = MIMETYPES[this.type]
    img.classList.add('file-icon')
    img.style.height = '43px'

    span.innerText = this.fullName
    btn.append(img, span)

    btn.addEventListener('dblclick', () => this.open())
    btn.addEventListener('pointerdown', () => { btn.style.filter = 'invert(100%)' })
    btn.addEventListener('pointerup', () => { btn.style.filter = 'invert(0%)' })

    return btn
  }

  open() {
    const viewer = new OsWindow(this.name)
    viewer.setAsFileViewer(this.content)
    viewer.showWindow()
  }
}
