import OsDialog from "./OsDialog.js"


export class OsSettingsControl {

  static CONTROL_TYPES = { TOGGLE: 'toggle', SELECT: 'select' }
  static DEFAULT_VALUES = { NULL: null, TOGGLE_ON: true, TOGGLE_OFF: false }

  inputElement;

  constructor(name, type, value,defaultValue, displayText, options = null) {
    this.name = name
    this.type = type
    this.value = value
    this.defaultValue = defaultValue
    this.displayText = displayText
    this.options = options
    
    switch(this.type) {
      case 'toggle':
        this.inputElement = document.createElement('input')
        this.inputElement.type = 'checkbox'
        this.inputElement.id = `${this.name}-chbx`
        this.inputElement.checked = this.defaultValue
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

    this.inputElement.addEventListener('input', () => this.updateValue())
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

  flickering = new OsSettingsControl('flickering', OsSettingsControl.CONTROL_TYPES.TOGGLE, OsSettingsControl.DEFAULT_VALUES.NULL, OsSettingsControl.DEFAULT_VALUES.TOGGLE_ON, "CRT Flicker" )
  darkMode = new OsSettingsControl('dark-mode', OsSettingsControl.CONTROL_TYPES.TOGGLE,OsSettingsControl.DEFAULT_VALUES.NULL, OsSettingsControl.DEFAULT_VALUES.TOGGLE_OFF, "Dark mode" )
  resolution = new OsSettingsControl('resolution', OsSettingsControl.CONTROL_TYPES.SELECT, '800x600', '800x600', "Resolution [px]", ['800x600', '1280x768', '1400x1050'] )
  

  controls

  constructor() {
    // this.loadSettings()
    this.controls = [this.flickering, this.darkMode, this.resolution]
  }

  addControl(c) {
    this.controls.push(c)
  }

  saveSettingsInLocalStorage(constrolsArray) {
    localStorage.setItem('OsSettings', JSON.stringify(constrolsArray))
  }

  saveSettingsForm() {

    const [width, height] = this.controls.resolution.value.split("x")

    var values = {
      width: width,
      height: height,
    }


    this.controls.forEach((c) => {
      values[c.name] = c.value
    })
  }



  SETTINGS_HTML_BODY = `
    <div id="settings" class="dialog dialog-hidden">
      <div class="dialog-head">
        <button id="settings-close-btn">X</button>
      </div>
      <div id="settings-body" class="dialog-body">
        CRT Flicker
        <div class="checkbox-wrapper">
          <input class="toggle-input" type="checkbox" id="flickering-chbx"></input>
          <label for="flickering-chbx" class="toggle-label"></label>
        </div>

        Dark mode
        <div class="checkbox-wrapper">            
          <input class="toggle-input" type="checkbox" id="dark-mode-chbx"></input>
          <label for="dark-mode-chbx" class="toggle-label"></label>
        </div>


        Resolution [px]
        <select id="resolution-select">
          <option value="800x600">800x600</option>
          <option value="1280x768">1280x768</option>
          <option value="1400x1050">1400x1050</option>
        </select>

        <button onclick="saveSettingsForm()">Save</button>
        <button onclick="resetSettings()">Reset</button>
        
      </div>
    </div>
  `

  returnToggleHTML(control) {
    return `
      ${control.displayText}
      <div class="checkbox-wrapper">
        <input class="toggle-input" type="checkbox" id="${control.constructor.name}-chbx"></input>
        <label for="${control.constructor.name}-chbx" class="toggle-label"></label>
      </div>
    `
  }
  returnSelectHTML(control) {
    return `
    ${control.displayText}
    <select id="${control.constructor.name}-select">
      ${(() => {
        let optionsHTML = ''
        control.options.forEach( (o) => {
          optionsHTML += "<option value='" + o + "'>" + o + "</option>" 
        })
        return optionsHTML
      })()}
    </select>
    `
  }

  showSettings() {
    // var HTMLString = ''
    // this.controls.forEach( (c) => {
    //   if(c.type === 'toggle') {
    //     HTMLString += this.returnToggleHTML(c)
    //   }
    //   if(c.type === 'select') {
    //     HTMLString += this.returnSelectHTML(c)
    //   }
    // })

    // let saveBtn  

    // OsDialog.showDialog(HTMLString)
    var controlsElements = []

    this.controls.forEach((c) => {
      controlsElements.push(c.inputElement)
    })

    OsDialog.showDialogViaHTML(controlsElements)
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
    var settings = null

    if(savedSettings) {
      try {
        settings = JSON.parse(savedSettings)
      } catch(e) {
        console.error(e)
      }
    }

    if(!settings || typeof settings !== 'object') {
      this.setDefaultValues()
    }
  }

}