export default class OsDesktopIcon {
  /** @type {HTMLButtonElement} */
  container = document.createElement('button')

  /** @type {HTMLSpanElement} */
  icon = document.createElement('span')

  /** @type {HTMLSpanElement} */
  label = document.createElement('span')

  /**
   * @type {boolean}
   * A flag used to detect if the icon is moving or still in place
   */
  isDragging = false;
  offsetX;
  offsetY;

  /**
   * @param {string} name label shown below the icon
   * @param {'dir'|'archive'|'app'} fileType
   * @param {string|null} command
   */
  constructor(name, fileType, command=null) {
    this.name = name
    this.fileType = fileType
    this.command = command
    this.init()
  }

  init() {
    switch(this.fileType) {
      case 'dir':
        this.container.classList.add('folder')
        this.container.style.top = "40px"
        this.icon.classList.add('folder-icon')
        break
      case 'archive':
        this.container.classList.add('archive')
        this.container.style.top = "40px"
        this.icon.classList.add('archive-icon')
        break
      case 'app':
        this.container.classList.add('app')
        this.icon.classList.add(`${this.name.toLowerCase()}-icon`)
        break
    }

    this.container.classList.add('file')
    this.icon.classList.add('file-icon')
    this.label.classList.add('file-label')
    this.label.innerText = this.name

    this.container.append(this.icon, this.label)

    this.container.addEventListener('pointerdown', (ev) => this.startMovingIcon(ev))
    document.addEventListener('pointermove', (ev) => this.moveIcon(ev))
    document.addEventListener('pointerup', () => this.stopMovingIcon())
  }

  /**
   * @param {PointerEvent} ev
   */
  startMovingIcon(ev) {
    this.container.style.filter = 'invert(100%)'

    this.isDragging = true
    this.offsetX = ev.clientX - this.container.offsetLeft
    this.offsetY = ev.clientY - this.container.offsetTop

    document.body.style.userSelect = 'none'
  }

  /**
   * @param {PointerEvent} ev
   */
  moveIcon(ev) {
    if(!this.isDragging) return;
    this.container.style.left = (ev.clientX - this.offsetX) + 'px';
    this.container.style.top  = (ev.clientY - this.offsetY) + 'px';

    this.container.style.cursor = 'grabbing'
    this.container.style.position = "absolute"
  }

  stopMovingIcon() {
    this.container.style.filter = 'invert(0%)'

    this.isDragging = false
    this.container.style.cursor = 'pointer'
  }
}
