export default class CArchive {

  /** @type {HTMLButtonElement} */
  #container

  /** @type {HTMLSpanElement} */
  #icon

  /** @type {HTMLSpanElement} */
  #label

  constructor(name, content) {
    this.name = name
    this.content = content

    this.id = `window-${this.name}`

    this.#icon = document.createElement('span')
    this.#label = document.createElement('span')
    this.#container = document.createElement('button')
  }

  init() {
    try {
      this.#container.classList.add('file', 'archive')

      this.#icon.classList.add('file-icon', 'archive-icon')

      this.#label.classList.add('file-label')
      this.#label.innerText = this.name

      this.#container.append(this.#icon)
      this.#container.append(this.#label)

      // When clicked on the directory, change its colors to visualize 'clicked' effect
      this.#container.addEventListener('pointerdown', () => this.handlePointerDown())

      // The reverse happends when user let go mouse button, reverse to default colors
      this.#container.addEventListener('pointerup', () => this.handlePointerUp())

    } catch(e) {
      console.error(`Error while initializing CArchive with name ${this.name}:`, e)
    }
  }


  handlePointerDown() {
    this.#icon.style.backgroundImage = "url('static/archive-clicked.png')"
    this.#label.style.backgroundColor = "#111"
    this.#label.style.color = "#fff"
  }
  handlePointerUp() {
    this.#icon.style.backgroundImage = "url('static/archive.png')"
    this.#label.style.backgroundColor = "#fff"
    this.#label.style.color = "#111"
  }
}