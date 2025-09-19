import OsTerminal from "./OsTerminal.js";
import Choir from "../Choir/Choir.js";

class OsContextMenuItem {
  constructor(innerText, id, ev, app=null) {
    this.body = document.createElement('span')
    this.body.classList.add('context-menu-item')
    this.body.id = id
    this.body.innerText = innerText

    if(ev) {
      var event;
      if(ev.includes("showDialogViaString-")) {
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
   * @type {Array[]}
   */
  #elements

  constructor(root) {

    const terminal = new OsTerminal()
    const choir = new Choir()
    
    this.#body = document.createElement('div')
    this.#body.id = "context-menu"

    this.#header = document.createElement('header')
    this.#header.innerText = "[ OS_OS ]"
    this.#elements = [
      new OsContextMenuItem("Reset desktop", "context-menu-item-reset-desktop"),
      new OsContextMenuItem("Properties", "context-menu-item-properties", "showDialogViaString-properties"),
      new OsContextMenuItem("Settings", "context-menu-item-settings", "showSettings"),
      new OsContextMenuItem(
        terminal.name, "context-menu-item-terminal", terminal.command, terminal
      ),
      new OsContextMenuItem(
        choir.name, "context-menu-item-audio-player", choir.command, choir
      ),
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