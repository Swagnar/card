// TODO: CFile.content needs to be able to hold a multiple of HTMLElements, create some functions that would allow to dynamicly append and modify tags inside?

import OsWindow from "../os/OsWindow.js"

/**
 * Class representing a single file that can be contained inside a folder. 
 * The file icon is created via `::before` pseudoelement, based on the `type` property of the file
 */
export default class CFile {
  fileContainer = document.createElement('button')
  nameElement = document.createElement('span')

  /**
   * 
   * @param {string} name file name, shown below the icon
   * @param {string} type type of file, currently avaiable options are: `md` for a markdown file, `txt` for a text file and `bat` for a batch file (*does not run per se*)
   * @param {string} content string containing the file contents, can contain HTML elements inside the string
   */
  constructor(name, type, content) {
    this.name = name
    this.nameElement.innerText = this.name
    this.type = type

    // For now this works with innerHTML and string
    //
    this.content = content

    this.initContainer()
  }

  initContainer() {
    this.fileContainer.classList.add('file', `${this.type}-file`)
    this.fileContainer.draggable = true
    this.fileContainer.id = `file-${this.name}`
    this.fileContainer.append(this.nameElement)

    // When double clicked, create a new OsWindow and show the file contents inside
    //
    this.fileContainer.addEventListener('dblclick', () => {
      const viewer = new OsWindow(this.name)
      viewer.setAsFileViewer(this.content)
      viewer.showWindow()
    })

    // Change the icon color to invert when single clicked
    //
    this.fileContainer.addEventListener('pointerdown', () => {
      this.fileContainer.style.filter = 'invert(100%)'
      this.nameElement.style.backgroundColor = 'white'
    })

    // Revert the inverted colors when click is released
    //
    this.fileContainer.addEventListener('pointerup', () => {
      this.fileContainer.style.filter = ''
      this.fileContainer.style.color = ''
    })
  }


}