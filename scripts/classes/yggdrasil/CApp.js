import logWithColors from "../../utils/logs.js"
import OsDesktopIcon from "../os/OsDesktopIcon.js"
import OsWindow from "../os/OsWindow.js"

export default class CApp {

  /** @type {string} */
  command

  /** @type {OsDesktopIcon} */
  desktopIcon

  /** @type {OsWindow} */
  window


  constructor(name, command) {
    this.name = name
    this.desktopIcon = new OsDesktopIcon(name, 'app', command)
    this.command = command
    this.window = new OsWindow(`[ ${this.name.toUpperCase()} ]`, this.name.toLowerCase(), false)
    logWithColors("CApp {} successfully initialized", this.name)
  }

  dispatchEvent() {
    const event = new CustomEvent(this.command)
    document.dispatchEvent(event)
  }
}