import logWithColors from "../../utils/logs.js"

export default class CApp {
  /** @type {HTMLButtonElement} */
  container

  /** @type {HTMLSpanElement} */
  #icon

  /** @type {HTMLSpanElement} */
  #label

  /** @type {string} */
  command


  constructor(name, command) {
    this.name = name

    this.#icon = document.createElement('span')
    this.#label = document.createElement('span')
    this.container = document.createElement('button')

    this.command = command
  }

  init() {
    try {
      this.container.classList.add('file', 'app')

      this.#icon.classList.add('file-icon', 'choir-icon')

      this.#label.classList.add('file-label')
      this.#label.innerText = this.name

      this.container.append(this.#icon)
      this.container.append(this.#label)

      // When clicked on the directory, change its colors to visualize 'clicked' effect
      // this.#container.addEventListener('pointerdown', () => this.handlePointerDown())

      // The reverse happends when user let go mouse button, reverse to default colors
      // this.#container.addEventListener('pointerup', () => this.handlePointerUp())

      this.container.addEventListener('dblclick', () =>  {
        let event = new CustomEvent('showAudioPlayer')
        document.dispatchEvent(event)
      })

      logWithColors("CApp {} successfully initialized", this.name)
    } catch(e) {
      console.error(`Error while initializing CApp with name ${this.name}:`, e)
    }
  }
}