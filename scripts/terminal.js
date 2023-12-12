/**
 * Object containing commands for terminal
 * @type {Object}
 */
const commands = {
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
    | |  LAST UPDATE:  :10.XII.23   | |     CPU: 0.66MHz Apophis
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
    return `
Avaiable commands:
> ls [...OPTIONS]
> kbind
  - shows a list of key bindings
> neofetch
  - displays system info
> clear
  - clears terminal`
  },

  /**
   * Clears the terminal output
   * @returns {string} - empty string
   */
  clear: function() {
    document.getElementById(`terminal-output`).innerHTML = ""
    return ``
  }

/**
 * Class representing a terminal
 */
}
class Terminal {
  #prefix
  constructor() {
    this.container = document.getElementById(`window-terminal`)
    this.outputContainer = document.getElementById(`terminal-output`)
    this.prefixElement = document.getElementById('terminal-input-prefix')
    this.inputContainer = document.getElementById(`terminal-input-wrapper`)
    this.input = document.getElementById('terminal-input')
    this.history = []
    this.#prefix = ":~#"
    this.initListeners()
    this.displayMOTD("Welcome to OS_SHELL. Type `help` to get list of avaiable commands")
  }

  /**
   * Sets the terminal instance prefix
   * @param {string} prefix - prefix to set
   */
  set prefix(prefix) {
    this.#prefix = prefix
    this.prefixElement.innerText = prefix
  }

  /**
   * Gets the current terminal instance prefix
   * @returns {string} - the current prefix
   */
  get prefix() { return this.#prefix }

  /**
   * Display the terminal MOTD
   * @param {string} motd - the message to display
   */
  displayMOTD(motd) {
    this.appendToLog(motd, '', false)
  }

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
      logElementPrefixSpan.innerText = this.#prefix
      logElement.append(logElementPrefixSpan)
    }
    
    
    logElementCommandSpan.innerText = commandName
    logElementText.innerText = `\n${content}`

    logElement.append(logElementCommandSpan)
    logElement.append(logElementText)

    this.outputContainer.append(logElement)
  }

  /**
   * Runs a command and handle the output
   * @param {string} command - the command to run
   * @returns {string} - command result
   */
  runCommand(command) {
    let args = command.split(' ')
    let name = args.shift()
    this.history.push({name: name, args: args})
    let output = commands[name](args)
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

    this.input.value = ''
    this.input.focus()
  }

  showTerminal() {


    setTimeout(() => {
      this.container.style.transition = 'none'
      this.container.classList.remove('show')
      this.container.classList.add('hide')
      this.container.offsetHeight // Trigger reflow
      this.container.style.transition = '' // Re-enable transitions
      this.container.classList.remove('hide')
      this.container.classList.add('show')
    }, 50)
  }

  /**
   * Initializes the listener for terminal input
   */
  initListeners() {
    this.input.addEventListener('keypress', (event) => {
      if(event.key == 'Enter') {
        this.handleInput(event.target.value)
      }
    })
  }
}