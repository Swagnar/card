import OsDialog from "./OsDialog.js"

const FLICKER_CSS_CLASS = 'flicker'
const DARK_MODE_CSS_CLASS = 'dark-mode'
const SETTINGS_STORAGE_KEY = 'OsSettings'

export class OsSettingsControl {

  static CONTROL_TYPES = { TOGGLE: 'toggle', SELECT: 'select' }
  static DEFAULT_VALUES = { NULL: null, TOGGLE_ON: true, TOGGLE_OFF: false }

  inputElement;
  label;

  /**
   * @param {string} name
   * @param {string} type one of `OsSettingsControl.CONTROL_TYPES`, any other value creates a text input
   * @param {*} value
   * @param {*} defaultValue
   * @param {string} displayText label shown above the input
   * @param {function(OsSettingsControl)|null} onInput called with the control every time its input changes
   * @param {string[]|null} options options of a select control
   */
  constructor(name, type, value, defaultValue, displayText, onInput = null, options = null) {
    this.name = name
    this.type = type
    this.value = value
    this.defaultValue = defaultValue
    this.displayText = displayText
    this.options = options
    this.onInput = onInput

    switch(this.type) {
      case OsSettingsControl.CONTROL_TYPES.TOGGLE:
        this.#createToggle()
        break
      case OsSettingsControl.CONTROL_TYPES.SELECT:
        this.#createSelect()
        break
      default:
        this.#createTextInput()
    }

    this.label = document.createElement('p')
    this.label.textContent = displayText

    this.inputElement.addEventListener('input', () => {
      this.updateValue()
      if(this.onInput !== null) {
        this.onInput(this)
      }
    })

    this.updateValue()
  }

  #createToggle() {
    this.inputElement = document.createElement('input')
    this.inputElement.type = 'checkbox'
    this.inputElement.id = `${this.name}-chbx`
    this.inputElement.checked = this.defaultValue
    this.inputElement.classList.add('toggle-input')

    const inputLabel = document.createElement('label')
    inputLabel.classList.add('toggle-label')
    inputLabel.setAttribute('for', this.inputElement.id)

    this.inputWrapper = document.createElement('div')
    this.inputWrapper.classList.add('checkbox-wrapper')
    this.inputWrapper.append(this.inputElement, inputLabel)
  }

  #createSelect() {
    this.inputElement = document.createElement('select')
    this.inputElement.id = `${this.name}-select`

    if (!this.options) return

    this.options.forEach(opt => {
      const option = document.createElement('option')
      option.value = opt
      option.textContent = opt
      if (opt === this.defaultValue) option.selected = true
      this.inputElement.appendChild(option)
    })
    this.inputElement.children[0].setAttribute('selected', '')
  }

  #createTextInput() {
    this.inputElement = document.createElement('input')
    this.inputElement.type = 'text'
    this.inputElement.value = this.defaultValue
    this.inputElement.id = `${this.name}-input`
  }

  /**
   * HTML nodes that represent this control inside the settings dialog
   * @returns {HTMLElement[]}
   */
  get formNodes() {
    const input = this.type === OsSettingsControl.CONTROL_TYPES.TOGGLE ? this.inputWrapper : this.inputElement
    return [this.label, input]
  }

  /**
   * @returns {boolean|string} current value of the HTML input
   */
  readInputValue() {
    return this.type === OsSettingsControl.CONTROL_TYPES.TOGGLE ? this.inputElement.checked : this.inputElement.value
  }

  updateValue() {
    this.value = this.readInputValue()
  }
}


export default class OsSettings {

  flickering = new OsSettingsControl(
    'flickering', OsSettingsControl.CONTROL_TYPES.TOGGLE,
    OsSettingsControl.DEFAULT_VALUES.NULL, OsSettingsControl.DEFAULT_VALUES.TOGGLE_ON,
    "CRT Flicker"
  )
  darkMode = new OsSettingsControl(
    'dark-mode', OsSettingsControl.CONTROL_TYPES.TOGGLE,
    OsSettingsControl.DEFAULT_VALUES.NULL, OsSettingsControl.DEFAULT_VALUES.TOGGLE_OFF,
    "Dark mode", (control) => setDarkMode(control.inputElement.checked)
  )
  resolution = new OsSettingsControl(
    'resolution', OsSettingsControl.CONTROL_TYPES.SELECT,
    '800x600', '800x600',
    "Resolution [px]", null, ['800x600', '1280x768', '1400x1050']
  )

  saveSettingsButton = document.createElement('button')
  resetSettingsButton = document.createElement('button')

  controls = [this.flickering, this.darkMode, this.resolution]
  settings;

  constructor() {
    // this.loadSettings()
    this.saveSettingsButton.innerText = "SAVE"
    this.saveSettingsButton.onclick = () => this.saveSettingsForm()

    this.resetSettingsButton.innerText = "RESET"
    this.resetSettingsButton.onclick = () => this.setDefaultValues()
    console.log('loaded settings:', this.settings)
  }

  addControl(c) {
    this.controls.push(c)
  }

  saveSettingsInLocalStorage(settings) {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  }

  saveSettingsForm() {
    const values = {}
    this.controls.forEach((c) => values[c.name] = c.readInputValue())

    console.log('values from form: ', values)

    this.saveSettingsInLocalStorage(values)
    this.applySettings(values)
  }

  showSettings() {
    const htmlTags = this.controls.flatMap((c) => c.formNodes)
    htmlTags.push(this.saveSettingsButton, this.resetSettingsButton)
    OsDialog.showDialogViaHTML(htmlTags, 'settings-body')
  }

  applySettings(settings) {
    const desktop = document.getElementById('desktop')

    desktop.className = ''

    if (settings.flickering) {
      desktop.classList.add(FLICKER_CSS_CLASS)
    }
    if (settings.darkMode) {
      setDarkMode(settings.darkMode)
    }

    desktop.classList.add(`res${settings.resolution}`)

    this.flickering.inputElement.checked = settings.flickering
    this.darkMode.inputElement.checked = settings.darkMode
    this.resolution.inputElement.value = `${settings.resolution}`
  }

  setDefaultValues() {
    this.controls.forEach((c) => c.value = c.defaultValue)
  }

  loadSettings() {
    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY)
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

    this.applySettings(this.settings)
  }
}

/**
 * Adds or removes the dark mode CSS class on all of the themed OS elements
 * @param {boolean} enabled
 */
function setDarkMode(enabled) {
  const elements = [
    document.getElementById('desktop'),
    document.querySelector('.navbar'),
    ...document.querySelectorAll('.drop'),
    ...document.querySelectorAll('.dialog'),
    document.getElementById('context-menu'),
    ...document.querySelectorAll('.checkbox-wrapper'),
  ]

  elements.forEach(el => el.classList.toggle(DARK_MODE_CSS_CLASS, Boolean(enabled)))
}
