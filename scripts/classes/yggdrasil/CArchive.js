import OsDesktopIcon from "../os/OsDesktopIcon.js";
import logWithColors from "../../utils/logs.js";

export default class CArchive {

  /** @type {OsDesktopIcon} */
  desktopIcon;

  constructor(name, content) {
    this.name = name
    this.content = content

    this.id = `window-${this.name}`
    this.desktopIcon = new OsDesktopIcon(name, 'archive')
    logWithColors("CArchive {} successfully initialized", this.name)
  }
}
