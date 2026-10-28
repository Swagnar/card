import OsDesktopIcon from "../os/OsDesktopIcon.js"
import logWithColors from "../../utils/logs.js"

/**
 * Desktop icon of an app. Opens a new app instance every time the app event is dispatched,
 * so the app itself is not created until the user opens it
 */
export default class CAppShortcut {

  /** @type {OsDesktopIcon} */
  desktopIcon

  /**
   * @param {typeof import("./CApp.js").default} AppClass class extending CApp
   */
  constructor(AppClass) {
    this.AppClass = AppClass
    this.name = AppClass.appName
    this.command = AppClass.command

    this.desktopIcon = new OsDesktopIcon(this.name, 'app', this.command)
    this.desktopIcon.icon.addEventListener('dblclick', () => this.dispatchEvent())

    document.addEventListener(this.command, () => this.open())
    logWithColors("CApp {} successfully registered", this.name)
  }

  /**
   * @returns {import("./CApp.js").default} new instance of the app, shown on the desktop
   */
  open() {
    const app = new this.AppClass()
    app.window.showWindow()
    return app
  }

  dispatchEvent() {
    document.dispatchEvent(new CustomEvent(this.command))
  }
}
