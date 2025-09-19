/**
 * Applies the given settings to the desktop
 * @param {Object} settings - settings to be applied
 */
function applySettings(settings) {

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
  
  /**
   * CSS class for flickering animation
   * @type {string}
   */
  const FLICKER_CLASS = 'flicker'

  /**
   * CSS class for dark mode
   */
  const DARK_MODE_CLASS = 'dark-mode'

  /**
   * CSS class for desktop resolution
   * @type {string}
   */
  const RESOLUTION_CLASS = `res${settings.width}x${settings.height}`

  DESKTOP.classList = []


  if (settings.flickering) {
    DESKTOP.classList.add(FLICKER_CLASS)
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

/**
 * Saves the settings from the form to local storage and applies them
 */
function saveSettingsForm() {
  /**
   * Selected resolution from the settings form
   * @type {string}
   */
  const SELECTED_RESOLUTION = document.getElementById('resolution-select').value
  
  /**
   * Checkbox state for flickering animation
   * @type {boolean}
   */
  const FLICKERING = document.getElementById('flickering-chbx').checked

  /**
   * Checkbox state for enabling dark mode
   * @type {boolean}
   */
  const DARK_MODE = document.getElementById('dark-mode-chbx').checked
  /**
   * Parsed width and height from the selected resolution
   * @type {number[]}
   */
  const [WIDTH, HEIGHT] = SELECTED_RESOLUTION.split('x')
  
  /**
   * Object containing the settings
   * @type {object}
   */
  const settings = {
    width: parseInt(WIDTH),
    height: parseInt(HEIGHT),
    flickering: FLICKERING,
    darkMode: DARK_MODE
  }

  saveSettings(settings)
  applySettings(settings)
}

/**
 * Loads the settings from local storage and applies them to the desktop
 */
function loadSettings() {
  /**
   * Saved settings retrieved from local storage
   * @type {string}
   */
  let savedSettings = localStorage.getItem('savedSettings')
  
  /**
   * Empty object that will be populated with settings
   * @type {undefined}
   * @description if there are saved settings, populate with them. If not, use default
   */
  let settings
  if (savedSettings) {
    try {
      settings = JSON.parse(savedSettings)
    } catch (e) {
      console.error(e)
    }
  }

  if (!settings || typeof settings !== 'object') {
    
    /**
     * Default settings in case of an error or missing settings
     * @type {Object}
     */
    settings = {
      flickering: false,
      darkMode: false,
      width: 800,
      height: 600,
    }
    saveSettings(settings)
  }
  applySettings(settings)
}

/**
 * Resets the settings to default values, saves and applies them
 */
function resetSettings() {
  
  /**
   * Default settings object
   * @type {Object}
   */
  settings = {
    flickering: true,
    darkMode: false,
    width: 800,
    height: 600
  }

  saveSettings(settings)
  applySettings(settings)
}

/**
 * Displays the settings dialog
 */
