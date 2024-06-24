class ContextMenuItem {
  constructor(innerText, id, ev) {
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
        document.dispatchEvent(event)
      })
      
    }
  }
}

export class ContextMenu {
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
      new ContextMenuItem("Reset desktop", "context-menu-item-reset-desktop"),
      new ContextMenuItem("Properties", "context-menu-item-properties", "showDialog-properties"),
      new ContextMenuItem("Settings", "context-menu-item-settings", "showSettings"),
      new ContextMenuItem("Terminal", "context-menu-item-terminal", "showTerminal"),
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