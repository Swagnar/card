import CApp from "../yggdrasil/CApp.js";
import CFile from "../yggdrasil/CFile.js";

export default class Composer extends CApp {

  /** @type {CFile} */
  file

  constructor() {
    super('Composer', 'showComposer')
    this.file = new CFile('New File', 'txt', '')
    this.window.setAsFileViewer(this.file)
  }
}