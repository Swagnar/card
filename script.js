// Os parts
import OsContextMenu from "./scripts/classes/os/OsContextMenu.js"
import OsPrompt from "./scripts/classes/os/OsPrompt.js"
import OsAlert from "./scripts/classes/os/OsAlert.js"
import OsDialog from "./scripts/classes/os/OsDialog.js"
import OsSettings from "./scripts/classes/os/OsSettings.js"

// Utils and scripts
import update_clock from "./scripts/utils/clock.js"
import sleep from "./scripts/utils/sleep.js"
import { bootBIOS } from "./scripts/boot.js"
import { initNavbar } from "./scripts/navbar.js"
import { showWIP, removeWIP } from "./scripts/wip.js"

import { OS_CONSTANS } from "./scripts/constans.js"

const OS_SETTINGS = new OsSettings()
const DESKTOP = document.getElementById('desktop')
const CONTEXT_MENU = new OsContextMenu(DESKTOP)
const OS_DIALOG = new OsDialog()

function initDesktopEvents() {
  DESKTOP.addEventListener('contextmenu', (event) => CONTEXT_MENU.showContextMenu(event))
  DESKTOP.addEventListener('click', () => CONTEXT_MENU.hideContextMenu())

  document.getElementById('dialog-close-btn').addEventListener('pointerdown', () => OsDialog.closeDialog())

  document.addEventListener('showDialog', (ev) => {
    // TODO: catch that
    OsDialog.showDialogViaString(OS_DIALOG.DIALOG_CONTENTS[ev.detail])
  })
  document.addEventListener('showSettings', () => OS_SETTINGS.showSettings())

  // listed by the terminal `kbind` command, returning false prevents the browser "save page" dialog
  window.Mousetrap.bind('ctrl+s', () => {
    OS_SETTINGS.showSettings()
    return false
  })
}

function startClock() {
  const dateTag = document.getElementById('date')
  const timeTag = document.getElementById('time')

  setInterval(() => update_clock(dateTag, timeTag), OS_CONSTANS.CLOCK_UPDATE_INTERVAL)
}

window.onload = async function() {
  OS_SETTINGS.loadSettings()
  showWIP()
  await bootBIOS()

  // Overwrite native window methods with custom modal windows
  window.prompt = OsPrompt
  window.alert = OsAlert

  initDesktopEvents()
  initNavbar(OS_DIALOG)
  startClock()

  await sleep(OS_CONSTANS.WIP_DISPLAY_TIME)

  removeWIP()
}
