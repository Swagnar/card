export default class OsDesktopIcon {
    /** @type {HTMLButtonElement} */
    container = document.createElement('button')

    /** @type {HTMLSpanElement} */
    icon = document.createElement('span')
  
    /** @type {HTMLSpanElement} */
    label = document.createElement('span')
  
    /**
     * @type {boolean}
     * A flag used to detect if the window is moving or still in place
     */
    isDragging = false;
    offsetX;
    offsetY;



    constructor(name, fileType, command=null) {
      this.name = name
      this.files = []
      this.fileType = fileType
      this.command = command
      this.init()
    }

    init() {

      if(this.fileType === 'dir') {

        this.container.classList.add('folder')
        this.container.style.top = "40px"
        this.icon.classList.add('folder-icon')

      } else if(this.fileType === 'archive') {

        this.container.classList.add('archive')
        this.container.style.top = "40px"
        this.icon.classList.add('archive-icon')

      } else if(this.fileType === 'app') {

        this.container.classList.add('app')
       
        this.icon.classList.add(`${this.name.toLowerCase()}-icon`)
      }

      this.container.classList.add('file')
      this.icon.classList.add('file-icon')
      this.label.classList.add('file-label')
      this.label.innerText = this.name

      this.container.append(this.icon)
      this.container.append(this.label)

      
      this.container.addEventListener('pointerdown', (ev) => this.handlePointerDown(ev))
      document.addEventListener('pointermove', (ev) => this.handlePointerMove(ev))
      document.addEventListener('pointerup', (ev) => this.handlePointerUp(ev))
      
    }

    handlePointerDown(ev) {
      this.container.style.filter = 'invert(100%)'
      this.startMovingIcon(ev)
    }

    handlePointerMove(ev) {
      this.moveIcon(ev)
    }

    handlePointerUp(ev) {
      this.container.style.filter = 'invert(0%)'
      this.stopMovingIcon(ev)
    }

    startMovingIcon(ev) {
      this.isDragging = true
      this.offsetX = ev.clientX - this.container.offsetLeft
      this.offsetY = ev.clientY - this.container.offsetTop

      document.body.style.userSelect = 'none'

    }
    moveIcon(ev) {
      if(!this.isDragging) return;
      this.container.style.left = (ev.clientX - this.offsetX) + 'px';
      this.container.style.top  = (ev.clientY - this.offsetY) + 'px';
      
      console.log("clientY", ev.clientY, "offsetY", this.offsetY)

      this.container.style.cursor = 'grabbing'
      this.container.style.position = "absolute"
    }
    stopMovingIcon() {
      this.isDragging = false
      this.container.style.cursor = 'pointer'
    }
}