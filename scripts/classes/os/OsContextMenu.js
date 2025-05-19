import { CHOIR, OS_TERMINAL } from "../yggdrasil/Yggdrasil.js";

class OsContextMenuItem {
  constructor(innerText, id, ev, app=null) {
    this.body = document.createElement('span')
    this.body.classList.add('context-menu-item')
    this.body.id = id
    this.body.innerText = innerText

    if(ev) {
      var event;
      if(ev.includes("showDialog-")) {
        let params = ev.split("-");
        event = new CustomEvent('showDialog', { detail: params[1] });
      } else {
        event = new Event(ev)
      }
      if(!event) {
        throw new Error("Couldn't create event for ContextMenuItem with params: ", innerText, id, ev)
      }
      this.body.addEventListener('click', function() {
        if(app) {
          app.dispatchEvent()
        } else {
          document.dispatchEvent(event)
        }
      })
      
    }
  }
}

export class OsContextMenu {
  /**
   * @type {HTMLDivElement}
   */
  #body
  /**
   * @type {HTMLDivElement}
   */
  #header
  /**
   * @type {Array[]}
   */
  #elements

  constructor(root) {
    
    this.#body = document.createElement('div')
    this.#body.id = "context-menu"

    this.#header = document.createElement('header')
    this.#header.innerText = "[ OS_OS ]"
    this.#elements = [
      new OsContextMenuItem("Reset desktop", "context-menu-item-reset-desktop"),
      new OsContextMenuItem("Properties", "context-menu-item-properties", "showDialog-properties"),
      new OsContextMenuItem("Settings", "context-menu-item-settings", "showSettings"),
      new OsContextMenuItem(
        OS_TERMINAL.name, "context-menu-item-terminal", OS_TERMINAL.command, OS_TERMINAL),
      new OsContextMenuItem(
        CHOIR.name, "context-menu-item-audio-player", CHOIR.command, CHOIR)
    ]

    this.#body.append(this.#header)

    this.#elements.forEach(el => {
      this.#body.append(el.body);
    })

    root.append(this.#body)
  }

  showContextMenu(event) {
    event.preventDefault();
    this.#body.style.display = 'block'
    this.#body.style.left = event.layerX + "px"
    this.#body.style.top = event.layerY + "px"
  }
}