import CApp from "../yggdrasil/CApp.js"
import OsWindow from "./OsWindow.js"
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
      this.input.focus()
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
    let args = command.split(' ')
    let name = args.shift()
    let output
    this.history.push({name: name, args: args})
    try {
      output = OsTerminal.commands[name](args)
    } catch (TypeError) {
      output = `Command '${name}' was not found. Try 'help' to see available commands`
    }
    return output
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

  // ! Do i really need to do this?
  // ! No u idiot, but i'll do it later
  // TODO: just invoke the `showWindow` 
  showTerminal() { this.window.showWindow(); }


  /**
 * Static terminal property containing commands for terminal. Each command is a function that returns a string
 * @type {Object<string, function}
 */
  static commands = {
  /**
   * List files in the directory
   * @param {Array} args - additional options for the ls command
   * @returns {string} - result of running ls command
   */
  ls: function(args) {
    return `[NOT IMPLEMENTED] Running ls with ${args}`
  },


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
    | |      VERSION:  :0.6.7       | |
    | |  LAST UPDATE:  :02.XII.24   | |     CPU: 0.66MHz Apophis
    | |                             | |     RAM: 32MB DDR1 
    | |                             | |    GPU1: MISSING
    | |.............................| |    GPU2: 16MB VRAM
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
> ls [...OPTIONS]
> kbind
  - shows a list of key bindings
> neofetch
  - displays system info
> clear
  - clears terminal
> wpf
  - shows WPF hints
`
  },


  // wpf: function() {
  //   return `Slajd [X] i slajd [Y]`
  // },

  /**
   * Clears the terminal output
   * @returns {string} - empty string
   */
  clear: function() {
    document.getElementById(`terminal-output`).innerHTML = ""
    return ``
  }

}
}