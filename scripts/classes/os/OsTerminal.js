import Choir from "../Choir/Choir.js"
import CApp from "../yggdrasil/CApp.js"
/**
 * Class representing a terminal
 * 
 */
export default class OsTerminal extends CApp {

  /** @type {HTMLDivElement} */
  #terminalOutputContainer

  /** @type {HTMLDivElement} */
  #terminalInputContainer

  /** @type {HTMLSpanElement} */
  #terminalInputPrefixElement

  /** @type {HTMLInputElement} with `type="text"` */
  #terminalInputElement
  
  prefix = "~:";
  
  /**
   * Creates new `OsTerminal` window and shows it on the screen. Window frame is created via `OsWindow` class 
   * @param {HTMLElement} root Application root HTML element
   */
  constructor() {
    super('Terminal', 'showTerminal')

    this.#terminalOutputContainer = document.createElement('div');
    this.#terminalOutputContainer.classList.add('terminal-output');

    this.#terminalOutputContainer.addEventListener('click', () => {
      this.#terminalInputElement.focus()
    })
    

    this.#terminalInputContainer = document.createElement('div');
    this.#terminalInputContainer.classList.add('terminal-input-wrapper');


    this.#terminalInputElement = document.createElement('input')
    this.#terminalInputElement.type = "text";
    this.#terminalInputElement.classList.add('terminal-input')
    this.#terminalInputElement.value = "neofetch";

    this.#terminalInputElement.addEventListener('keypress', (event) => {
      if(event.key == 'Enter') {
        this.handleInput(event.target.value)
      }
    })

    this.#terminalInputPrefixElement = document.createElement('span')
    this.#terminalInputPrefixElement.innerText = this.prefix
    
    this.#terminalInputContainer.append(this.#terminalInputPrefixElement, this.#terminalInputElement)
    
    this.window.setAsTerminal(this.#terminalOutputContainer, this.#terminalInputContainer)

    this.history = [];
    this.displayMOTD("Welcome to OS_OSHELL. Type `help` to get the list of avaiable commands")
  }

  /**
   * Display the terminal MOTD, invokes `appendToLog`
   * @param {string} motd - message string to display
   */
  displayMOTD(motd) { this.appendToLog(motd, '', false) }

  /**
   * Append content to the terminal log
   * @param {string} content - command result to append to terminal output
   * @param {string} commandName - command name to append to terminal output
   * @param {boolean} isPrefix - whether to show command prefix
   */
  appendToLog(content, commandName, isPrefix) {

    const logElement = document.createElement('div')
    logElement.classList.add('terminal-log-element')

    const logElementText = document.createElement('pre')
    const logElementCommandSpan = document.createElement('span')
    
    if(isPrefix) {
      const logElementPrefixSpan = document.createElement('span')
      logElementPrefixSpan.innerText = this.prefix
      logElement.append(logElementPrefixSpan)
    }
    
    
    logElementCommandSpan.innerText = commandName
    logElementText.innerText = `\n${content}`

    logElement.append(logElementCommandSpan)
    logElement.append(logElementText)

    this.#terminalOutputContainer.append(logElement)
  }

  /**
   * Runs a command and handle the output
   * @param {string} command - the command to run
   * @returns {string} - command result
   */
  runCommand(command) {
    let args = command.trim().split(/\s+/)
    let name = args.shift()
    let output
  
    this.history.push({ name: name, rawArgs: args })
  
    const parsedArgs = this.parseArgs(args)
  
    if (!OsTerminal.commands[name]) {
      return `Command '${name}' was not found. Try 'help' to see available commands`
    }
  
    output = OsTerminal.commands[name](parsedArgs)
    return output
  }

  /**
 * Parses command arguments into flags and positional args
 * @param {string[]} args 
 * @returns {{ flags: Object<string, boolean>, positional: string[] }}
 */
  parseArgs(args) {
    const flags = {}
    const positional = []

    for (const arg of args) {
      if (arg.startsWith('--')) {
        const key = arg.slice(2)
        flags[key] = true
      } else if (arg.startsWith('-')) {
        const letters = arg.slice(1)
        for (const letter of letters) {
          flags[letter] = true
        }
      } else {
        positional.push(arg)
      }
    }

    return { flags, positional }
  }

  /**
   * Handle user input in the terminal
   * @param {string} input - value from terminal
   */
  handleInput(input) {
    const command = input
    const output = this.runCommand(command)

    this.appendToLog(output, command, true)

    this.#terminalInputElement.value = ''
    this.#terminalInputElement.focus()
    this.#terminalOutputContainer.scrollTop = this.#terminalOutputContainer.scrollHeight
  }


  


  /**
 * Static terminal property containing commands for terminal. Each command is a function that returns a string
 * @type {Object<string, function}
 */
  static commands = {

  kbind: function() {
    return `CTRL + S :  : SETTINGS`
  },

  neofetch: function() {
    return `
    ,--------------------------===---.
    | YEG Inc.                        |
    | ,----------------------------.  |
    | |                             | |
    | |            OS_OS            | |
    | |  VERSION    :  :    0.7.1   | |
    | |  LAST UPDATE:  :  12 IX 25  | |     CPU: 0.66MHz Apophis MN99942
    | |                             | |     RAM: 31923 B DDR UNDEFINED
    | |                             | |    GPU1: MISSING
    | |.............................| |    GPU2: 16777216 B VRAM
    | |  _  :          '      :  _  | |
    | | |_| :                 : |_| | |
    | |  _  :_               _:  _  | |
    | | |_| :.)        .    (.: |_| | |
    | '-----....._________.....-----' |
    '---------------------------------'
    `
  },

  /**
   * Display help information for avaiable commands
   * @returns {string} - help information
   */
  help: function() {
    return `Avaiable commands:
> kbind
  - shows a list of key bindings
> neofetch
  - displays system info
> clear
  - clears terminal
> alert [MSG] [OPTIONS]
  - shows OS_OS alert window with message

  OPTIONS:
    -d | danger - shows a danger-styled OS_OS alert window
    -i | info   - shows a info-styled OS_OS alert window

> choir
  - runs and shows Choir app
`
  },


  /**
   * Clears the terminal output
   * @returns {string} - empty string
   */
  clear: function() {
    document.getElementById(`terminal-output`).innerHTML = ""
    return ``
  },

  choir: function() {
    const tux = new Choir()    
    tux.dispatchEvent()
    return ``
  },

  /**
 * Displays an alert window with a message and an optional style based on flags.
 *
 * Recognized flags:
 * - `-d` or `--danger`: Shows the alert as a danger message.
 * - `-w` or `--warning`: Shows the alert as a warning message.
 *
 * If no flags are provided, a default alert is shown.
 *
 * @param {Object} param0 - Parsed command arguments.
 * @param {Object<string, boolean>} param0.flags - Flags parsed from the command line (e.g., -d, --danger).
 * @param {string[]} param0.positional - Positional arguments used as the alert message.
 */
  alert: function({ flags, positional }) {
    const msg = positional.join(" ") || "No message"
    let type = "default"
  
    if (flags.d || flags.danger) {
      type = "danger"
    } else if (flags.w || flags.warning) {
      type = "warning"
    }
  
    window.alert(msg, type)
  }

}
}