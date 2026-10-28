import OsWindow from "../os/OsWindow.js"
import logWithColors from "../../utils/logs.js"

export default class CApp {

  /** @type {string} app name, shown below its desktop icon. Set by the child class */
  static appName

  /** @type {string} name of the document event that opens the app. Set by the child class */
  static command

  /** @type {OsWindow} */
  window

  constructor() {
    this.name = this.constructor.appName
    this.command = this.constructor.command
    this.window = new OsWindow(this.name.toUpperCase(), true)
    logWithColors("CApp {} successfully initialized", this.name)
  }
}
