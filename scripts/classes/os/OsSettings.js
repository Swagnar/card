import OsDialog from "./OsDialog.js"


export class OsSettingsControl {

  static CONTROL_TYPES = { TOGGLE: 'toggle', SELECT: 'select' }
  static DEFAULT_VALUES = { NULL: null, TOGGLE_ON: true, TOGGLE_OFF: false }

  inputElement;
  label;

  constructor(name, type, value,defaultValue, displayText, options = null, onInput= null) {
    this.name = name
    this.type = type
    this.value = value
    this.defaultValue = defaultValue
    this.displayText = displayText
    this.options = options

    
    switch(this.type) {
      case 'toggle':
        
        this.inputWrapper = document.createElement('div')
        this.inputWrapper.classList.add('checkbox-wrapper')

        this.inputLabel = document.createElement('label')
        this.inputLabel.classList.add('toggle-label')
        this.inputLabel.setAttribute('for', `${this.name}-chbx`)
        
        this.inputElement = document.createElement('input')
        this.inputElement.type = 'checkbox'
        this.inputElement.id = `${this.name}-chbx`
        this.inputElement.checked = this.defaultValue
        this.inputElement.classList.add('toggle-input')
        
        this.inputWrapper.append(this.inputElement, this.inputLabel)

        break
      case 'select':
        this.inputElement = document.createElement('select')
        this.inputElement.id = `${this.name}-select`
        if (this.options) {
          this.options.forEach(opt => {
            const option = document.createElement('option')
            option.value = opt
            option.textContent = opt
            if (opt === this.defaultValue) option.selected = true
            this.inputElement.appendChild(option)
          })
        }
        break
      default:
        this.inputElement = document.createElement('input')
        this.inputElement.type = 'text'
        this.inputElement.value = this.defaultValue
        this.inputElement.id = `${this.name}-input`

    }
    
    this.label = document.createElement('p')
    this.label.textContent = displayText

    this.inputElement.addEventListener('input', () => {this.updateValue(); onInput()} )
    
    this.updateValue()
  }

  updateValue() {
    if (this.type === 'toggle') {
      this.value = this.inputElement.checked
    } else {
      this.value = this.inputElement.value
    }
  }
}


export default class OsSettings {

  flickering = new OsSettingsControl('flickering', OsSettingsControl.CONTROL_TYPES.TOGGLE, OsSettingsControl.DEFAULT_VALUES.NULL, OsSettingsControl.DEFAULT_VALUES.TOGGLE_ON, "CRT Flicker", )
  darkMode = new OsSettingsControl('dark-mode', OsSettingsControl.CONTROL_TYPES.TOGGLE,OsSettingsControl.DEFAULT_VALUES.NULL, OsSettingsControl.DEFAULT_VALUES.TOGGLE_OFF, "Dark mode", null, DarkMode )
  resolution = new OsSettingsControl('resolution', OsSettingsControl.CONTROL_TYPES.SELECT, '800x600', '800x600', "Resolution [px]", ['800x600', '1280x768', '1400x1050'] )
  
  saveSettingsButton = document.createElement('button')
  resetSettingsButton = document.createElement('button')

  controls = [this.flickering, this.darkMode, this.resolution]
  settings;

  constructor() {
    this.loadSettings()
    this.saveSettingsButton.innerText = "SAVE"
    this.saveSettingsButton.onclick = () => this.saveSettingsForm()

    this.resetSettingsButton.innerText = "RESET"
    this.resetSettingsButton.onclick = () => this.setDefaultValues()
    console.log('loaded settings:', this.settings)
  }

  addControl(c) {
    this.controls.push(c)
  }

  saveSettingsInLocalStorage(constrolsArray) {
    localStorage.setItem('OsSettings', JSON.stringify(constrolsArray))
  }

  saveSettingsForm() {

    var values = {}

    this.controls.forEach((c) => {
      if(c.type === 'toggle') values[c.name] = c.inputElement.checked
      if(c.type === 'select') values[c.name] = c.inputElement.value
    })

    console.log('values from form: ', values)

  }

  showSettings() {
    let htmlTags = []
    this.controls.forEach( (c) => {
      if(c.type === 'toggle') htmlTags.push(c.label, c.inputWrapper)
      if(c.type === 'select') htmlTags.push(c.label, c.inputElement)
    })
    htmlTags.push(this.saveSettingsButton, this.resetSettingsButton)
    OsDialog.showDialogViaHTML(htmlTags, 'settings-body')
  }

  applySettings(settings) {

    /**
   * Reference to the desktop element
    * @type {HTMLElement}
    */
    const DESKTOP = document.getElementById('desktop')
  
  
    /**
     * Object containing references to HTML elements to add or remove dark mode class
     * @type {Object<string, HTMLElement|NodeList}
     */
    const elements = {
      desktop: DESKTOP,
      navbar: document.querySelectorAll('.navbar')[0],
      dropDowns: document.querySelectorAll('.drop'),
      dialogs: document.querySelectorAll('.dialog'),
      contextMenu: document.getElementById('context-menu'),
      checkboxes: document.querySelectorAll('.checkbox-wrapper'),
    }
    
    const FLICKER_CSS_CLASS = 'flicker'
    /**
     * CSS class for desktop resolution
     * @type {string}
     */
    const RESOLUTION_CLASS = `res${settings.width}x${settings.height}`
  
    DESKTOP.classList = []
  
  
    if (settings.flickering) {
      DESKTOP.classList.add(FLICKER_CSS_CLASS)
    }
  
    /**
     * Applies or removes the 'dark-mode' class to a given element or NodeList.
     *
     * @param {HTMLElement|NodeList} element - The element or NodeList to apply the class to.
     * @param {boolean} addClass - If true, adds the 'dark-mode' class; if false, removes it.
     */
    const applyDarkMode = (element, addClass) => {
      if (element instanceof NodeList) {
  
        /**
         * If the element is a NodeList, iterates over each element and adds or removes the 'dark-mode' class.
         * @param {HTMLElement} el - The individual element in the NodeList.
         */
        element.forEach((el) => el.classList[addClass ? 'add' : 'remove']('dark-mode'));
      } else {
  
        /**
         * If the element is a single HTMLElement, adds or removes the 'dark-mode' class.
         * @type {HTMLElement}
         */
        element.classList[addClass ? 'add' : 'remove']('dark-mode');
      }
    };
    
    /**
     * Checks the value of the darkMode property in the settings and applies or removes the 'dark-mode' class accordingly.
     * @param {Object<string, HTMLElement|NodeList>} elements - Object containing HTML elements to add or remove the 'dark-mode' class.
     */
    if (settings.darkMode) {
      for (const el of Object.values(elements)) {
        applyDarkMode(el, true);
      }
    } else {
      for (const el of Object.values(elements)) {
        applyDarkMode(el, false);
      }
    }
  
  
    DESKTOP.classList.add(RESOLUTION_CLASS)
  
    document.getElementById('flickering-chbx').checked = settings.flickering
    document.getElementById('dark-mode-chbx').checked = settings.darkMode
    document.getElementById('resolution-select').value = `${settings.width}x${settings.height}`
  
  }

  setDefaultValues() {
    this.controls.forEach((c) => c.value = c.defaultValue)
  }

  loadSettings() {

    const savedSettings = localStorage.getItem('savedSettings')
    this.settings = null

    if(savedSettings) {
      try {
        this.settings = JSON.parse(savedSettings)
      } catch(e) {
        console.error(e)
      }
    }

    if(!this.settings || typeof this.settings !== 'object') {
      this.setDefaultValues()
    }
  }

}

function DarkMode() {
  const elements = {
    desktop: document.getElementById('desktop'),
    navbar: document.querySelectorAll('.navbar')[0],
    dropDowns: document.querySelectorAll('.drop'),
    dialogs: document.querySelectorAll('.dialog'),
    contextMenu: document.getElementById('context-menu'),
    checkboxes: document.querySelectorAll('.checkbox-wrapper'),
  }

  const toggleDarkMode = (element, addClass) => {
    if (element instanceof NodeList) {
      element.forEach((el) => el.classList[addClass ? 'add' : 'remove']('dark-mode'));
    } else {
      element.classList[addClass ? 'add' : 'remove']('dark-mode');
    }

  };

  if (this.darkMode.inputElement.checked) {
    for (const el of Object.values(elements)) {
      toggleDarkMode(el, true);
    }
  } else {
    for (const el of Object.values(elements)) {
      toggleDarkMode(el, false);
    }
  }


}