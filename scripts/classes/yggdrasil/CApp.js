import logWithColors from "../../utils/logs.js"
import OsDesktopIcon from "../os/OsDesktopIcon.js"

export default class CApp {

  /** @type {string} */
  command

  /** @type {OsDesktopIcon} */
  desktopIcon


  constructor(name, command) {
    this.name = name
    this.desktopIcon = new OsDesktopIcon(name, 'app', command)
    this.command = command
    logWithColors("CApp {} successfully initialized", this.name)
  }

  run() {
    const event = new CustomEvent(this.command)
    document.dispatchEvent(event)
  }
}