import OsDesktopIcon from "../os/OsDesktopIcon.js";
import logWithColors from "../../utils/logs.js";

export default class CArchive {

  // /** @type {HTMLButtonElement} */
  // container = document.createElement('button')

  // /** @type {HTMLSpanElement} */
  // #icon

  // /** @type {HTMLSpanElement} */
  // #label

  desktopIcon;

  /**
   * @type {boolean}
   * A flag used to detect if the window is moving or still in place
   */
  isDragging = false;
  offsetX;
  offsetY;

  constructor(name, content) {
    this.name = name
    this.content = content

    this.id = `window-${this.name}`
    this.desktopIcon = new OsDesktopIcon(name, 'archive')
    logWithColors("CArchive {} successfully initialized", this.name)

    // this.#icon = document.createElement('span')
    // this.#label = document.createElement('span')
  }
}