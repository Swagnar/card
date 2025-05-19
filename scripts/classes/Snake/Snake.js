import CApp from '../yggdrasil/CApp.js';


export default class Snake extends CApp {
  constructor() {
    super('Snake', 'showSnake')
    this.window.setAsGame(500,500)
  }
}