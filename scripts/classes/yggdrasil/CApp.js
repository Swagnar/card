import OsWindow from "../os/OsWindow.js"
import logWithColors from "../../utils/logs.js"
import OsDesktopIcon from "../os/OsDesktopIcon.js"

export default class CApp {

  /** @type {string} */
  command

  /** @type {OsDesktopIcon} */
  desktopIcon

  /** @type {OsWindow} */
  window

  /**
   * @param {string} name app name, shown below its desktop icon
   * @param {string} command name of the document event that opens the app
   */
  constructor(name, command) {
    this.name = name
    this.command = command
    this.desktopIcon = new OsDesktopIcon(name, 'app', command)
    this.window = new OsWindow(this.name.toUpperCase(), true)
    logWithColors("CApp {} successfully initialized", this.name)

    this.desktopIcon.icon.addEventListener('dblclick', () => this.dispatchEvent())
  }

  dispatchEvent() {
    document.dispatchEvent(new CustomEvent(this.command))
  }
}
