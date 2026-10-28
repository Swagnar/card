import CApp from '../yggdrasil/CApp.js';


export default class Snake extends CApp {

  static appName = 'Snake'
  static command = 'showSnake'

  constructor() {
    super()
    this.canvas = this.window.setAsGame(500,500)
  }

}
