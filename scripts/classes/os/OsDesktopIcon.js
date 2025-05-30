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

      
      this.container.addEventListener('pointerdown', () => this.handlePointerDown())
      
      this.container.addEventListener('pointerup', () => this.handlePointerUp())
      
    }

    handlePointerDown() {
      this.container.style.filter = 'invert(100%)'
    }

    handlePointerUp() {
      this.container.style.filter = 'invert(0%)'
    }
}