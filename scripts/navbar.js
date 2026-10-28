import OsDialog from "./classes/os/OsDialog.js"
import { COMPOSER } from "./classes/yggdrasil/Yggdrasil.js"

/**
 * Sets up the navbar dropdowns - clicking a button toggles its list and closes all the other ones
 */
function initDropdowns() {
  const menus = Array.from(document.querySelectorAll('.item > button')).map(button => ({
    button,
    item: button.parentElement,
    dropList: button.nextElementSibling,
  }))

  const setOpen = (menu, open) => {
    menu.item.classList.toggle('active', open)
    menu.dropList.style.opacity = open ? '1' : '0'
    menu.dropList.style.visibility = open ? 'visible' : 'hidden'
  }

  menus.forEach(menu => {
    menu.button.addEventListener('click', () => {
      const wasActive = menu.item.classList.contains('active')

      menus.forEach(m => setOpen(m, false))
      if (!wasActive) setOpen(menu, true)
    })
  })
}

/**
 * Copies the link to OS_OS into the clipboard
 */
async function shareLink() {
  try {
    await navigator.clipboard.writeText(location.href)
    window.alert('Link to OS_OS copied to the clipboard')
  } catch(e) {
    console.error(e)
    window.alert(`Could not copy the link, share it by hand: ${location.href}`, 'warning')
  }
}

/**
 * Sets up actions of the items in the navbar submenus
 * @param {OsDialog} osDialog
 */
function initSubmenuItems(osDialog) {
  const showDialog = (name) => () => OsDialog.showDialogViaString(osDialog.DIALOG_CONTENTS[name])

  const actions = {
    'navbar-submenu-item-about': showDialog('about'),
    'navbar-submenu-item-battery': showDialog('battery'),
    'navbar-submenu-item-properties': showDialog('properties'),
    'navbar-submenu-item-restart': () => location.reload(),
    'navbar-submenu-item-new': () => COMPOSER.dispatchEvent(),
    'navbar-submenu-item-share': () => shareLink(),
    'navbar-submenu-item-toggle-fullscreen': () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
      } else {
        document.exitFullscreen()
      }
    },
  }

  for (const [id, action] of Object.entries(actions)) {
    document.getElementById(id).addEventListener('pointerdown', () => action())
  }
}

/**
 * @param {OsDialog} osDialog dialog instance holding the dialog contents
 */
export function initNavbar(osDialog) {
  initSubmenuItems(osDialog)
  initDropdowns()
}
