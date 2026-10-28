import { CHOIR, OS_TERMINAL } from "../yggdrasil/Yggdrasil.js"

class OsContextMenuItem {
  /**
   * @param {string} innerText
   * @param {string} id
   * @param {function|null} onClick
   */
  constructor(innerText, id, onClick = null) {
    this.body = document.createElement('span')
    this.body.classList.add('context-menu-item')
    this.body.id = id
    this.body.innerText = innerText

    if(onClick) {
      this.body.addEventListener('click', onClick)
    }
  }
}

export default class OsContextMenu {
  /**
   * @type {HTMLDivElement}
   */
  #body
  /**
   * @type {HTMLDivElement}
   */
  #header
  /**
   * @type {OsContextMenuItem[]}
   */
  #elements

  constructor(root) {
    this.#body = document.createElement('div')
    this.#body.id = "context-menu"

    this.#header = document.createElement('header')
    this.#header.innerText = "[ OS_OS ]"
    this.#elements = [
      new OsContextMenuItem("Reset desktop", "context-menu-item-reset-desktop"),
      new OsContextMenuItem("Properties", "context-menu-item-properties",
        () => document.dispatchEvent(new CustomEvent('showDialog', { detail: 'properties' }))
      ),
      new OsContextMenuItem("Settings", "context-menu-item-settings",
        () => document.dispatchEvent(new Event('showSettings'))
      ),
      new OsContextMenuItem(OS_TERMINAL.name, "context-menu-item-terminal", () => OS_TERMINAL.dispatchEvent()),
      new OsContextMenuItem(CHOIR.name, "context-menu-item-audio-player", () => CHOIR.dispatchEvent()),
    ]

    this.#body.append(this.#header, ...this.#elements.map(el => el.body))

    root.append(this.#body)
  }

  showContextMenu(event) {
    event.preventDefault();
    this.#body.style.display = 'block'
    this.#body.style.left = event.layerX + "px"
    this.#body.style.top = event.layerY + "px"
  }

  hideContextMenu() {
    this.#body.style.display = 'none'
  }
}
