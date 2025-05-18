import logWithColors from "../../utils/logs.js";

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
      this.id = `window-${this.name}`
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

        if(this.command) {
          this.container.addEventListener('dblclick', () =>  {
            let event = new CustomEvent(this.command)
            logWithColors(`Dispatching event from DesktopIcon {} with command {}`, this.name, this.command)
            document.dispatchEvent(event)
          })
        }
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
      this.label.style.backgroundColor = "#111"
      this.label.style.color = "#fff"
      this.container.style.filter = 'invert(100%)'
    }

    handlePointerUp() {
      this.container.style.filter = 'invert(0%)'
      this.label.style.backgroundColor = "#fff"
      this.label.style.color = "#111"
    }
}