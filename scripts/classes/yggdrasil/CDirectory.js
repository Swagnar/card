import { CFile } from "./CFile.js"

export class CDirectory {

  #icon

  constructor(name) {
    this.name = name
    this.files = []
    this.id = `window-${this.name}`

    this.#icon = document.createElement('span')

  }

  addFile(file) {
    if(file instanceof CFile) {
      this.files.push(file)
    } else {
      throw new Error('addFile only accepts instances of File')
    }
  }

  addFiles(...files) {
    files.forEach(file => {
        this.addFile(file)
    })
  }
}
export class CArchive extends CDirectory {
  constructor(name, content) {
    super(name)
    this.content = content
  }
}