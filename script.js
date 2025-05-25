import { OsContextMenu } from "./scripts/classes/os/OsContextMenu.js"

import { SNAKE, CHOIR, OS_TERMINAL, COMPOSER, YGGDRASIL } from "./scripts/classes/yggdrasil/Yggdrasil.js"
import CDirectory from "./scripts/classes/yggdrasil/CDirectory.js"
import CArchive from "./scripts/classes/yggdrasil/CArchive.js"

import steinbergFloydDither from "./scripts/utils/dithering.js";
import update_clock from "./scripts/utils/clock.js"

import { showDialog, closeDialog } from "./scripts/os_dialog.js"

import logWithColors from "./scripts/utils/logs.js"
import CApp from "./scripts/classes/yggdrasil/CApp.js"

export const DESKTOP = document.getElementById('desktop')
const CONTEXT_MENU = new OsContextMenu(DESKTOP)

/*---------------------------------------------//
//            adding EventListeners            //
//---------------------------------------------*/

function initEvents() {
  const navbarItems = Array.from(document.querySelectorAll('.item > button'))
  const navbarParentElements = navbarItems.map((item) => item.parentElement)
  const navbarDropLists = navbarItems.map((item) => item.nextElementSibling)
  

  DESKTOP.addEventListener('contextmenu', function(event) { CONTEXT_MENU.showContextMenu(event) });
  
  DESKTOP.addEventListener('click', () => { document.getElementById('context-menu').style.display = 'none' })
    
  
  document.getElementById('dialog-close-btn').addEventListener('pointerdown', () => closeDialog())
  document.getElementById('settings-close-btn').addEventListener('pointerdown', () => closeSettings())  

  document.getElementById('navbar-submenu-item-about').addEventListener('pointerdown', () => showDialog('about') ) 
  document.getElementById('navbar-submenu-item-battery').addEventListener('pointerdown', () => showDialog('battery') )
  document.getElementById('navbar-submenu-item-properties').addEventListener('pointerdown', () => showDialog('properties'))
  document.getElementById('navbar-submenu-item-restart').addEventListener('pointerdown', () => location.reload() )
  
  document.getElementById('navbar-submenu-item-toggle-fullscreen').addEventListener('pointerdown', () => {
    if(!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    }
  })




  navbarItems.forEach((item, i) => {
    item.addEventListener('click', () => {

      const isActive = navbarParentElements[i].classList.contains('active')
  
      navbarParentElements.forEach((item) => {
        item.classList.remove('active')
      })
      navbarDropLists.forEach((list) => {
        list.style.opacity = '0'
        list.style.visibility = 'hidden'
      })
  
      if (!isActive) {
        navbarParentElements[i].classList.add('active')
        navbarDropLists[i].style.opacity = '1'
        navbarDropLists[i].style.visibility = 'visible'
      }
    })
  })
  
  document.addEventListener('showDialog', function(event) { 
    showDialog(event.detail, steinbergFloydDither) 
  })
  document.addEventListener('showSettings', function() { 
    showSettings() 
  })
  
}

// TODO: Change how the system is booted. What the fuck is `loadDesktop()` inside a function inside a function?
function startSystem() {
  var bios = document.getElementById('bios')
  bios.innerHTML = "<p>OS_OS</p><p>Copyright (c) 2023,2024. All Rights Reserved</p><p>BIOS Version: 202447 Release 1</p><br>"

  function appendToBios(text, lineBreak) {
    let p = document.createElement('p')
    p.textContent = text
    bios.appendChild(p)

    if (lineBreak) {
      let br = document.createElement('br')
      bios.appendChild(br)
    }
  }

  function addClickListener() {
    function loadDesktop() {



      var navbar = document.querySelector('.navbar')
      YGGDRASIL.forEach(element => {
        if(!element instanceof CDirectory || !element instanceof CArchive || !element instanceof CApp) {
          throw new TypeError(`Yggdrasil element does not have OS recognizable type`)
        }
        if(element instanceof CDirectory) {
          logWithColors("Appending CDirectory {} to DESKTOP element", element.name)
        } else if(element instanceof CArchive) {
          logWithColors("Appending CArchive {} to DESKTOP element", element.name)
        } else if(element instanceof CApp) {
          logWithColors("Appending CApp {} to DESKTOP element", element.name)
        } else {
          throw Error('Trying to add a not-OS object to desktop')
        }

        navbar.after(element.desktopIcon.container)        
      })
      
      console.log(DESKTOP)
      navbar.style.display = 'flex'
    }




    document.addEventListener('click', handleUserInteraction)
    document.addEventListener('keydown', handleUserInteraction)

    function handleUserInteraction() {
      bios.style.display = 'none'
      document.body.classList.add('cursor-wait')

      setTimeout(() => {
        document.body.classList.remove('cursor-wait')
        loadDesktop()
        
        document.removeEventListener('click', handleUserInteraction)
        document.removeEventListener('keydown', handleUserInteraction)
      }, 1500)
    }
  }

  let biosContents = [
    "Battery: 95% OK",
    "Memory Test: 32M OK",
    "Initializing USB Controllers ... Done",
    "Press Any Key to boot system"
  ]

  for (let i = 0; i < biosContents.length; i++) {
    setTimeout(() => {
      if (i === 2) {
        appendToBios(biosContents[i], true)
      } else {
        appendToBios(biosContents[i])
      }

      if (i == biosContents.length - 1) {
        addClickListener()
      }
    }, 500 * (i + 1))
  }
}


window.onload = function() {
  startSystem()
  initEvents()
  loadSettings()

  let dateTag = document.getElementById('date')
  let timeTag = document.getElementById('time')

  setInterval(() => {update_clock(dateTag,timeTag)}, 1000)
}

window.prompt = function (msg, defaultValue = '') {
  return new Promise((resolve) => {
    
    const overlay = document.createElement('div')
    overlay.id = 'prompt-overlay'

    // Okienko
    const dialog = document.createElement('div')
    dialog.id = 'prompt-body'


    const label = document.createElement('div')
    label.textContent = msg
    label.style.fontSize = '28px'

    const input = document.createElement('input')
    input.type = 'text'
    input.value = defaultValue
    input.style.padding = '4px'
    input.style.border = '1px solid black'
    input.style.fontFamily = 'monospace'
    input.style.fontSize = '14px'

    const buttons = document.createElement('div')
    buttons.style.display = 'flex'
    buttons.style.justifyContent = 'flex-end'
    buttons.style.gap = '6px'

    const ok = document.createElement('button')
    ok.textContent = 'OK'
    ok.id = 'prompt-ok-btn'
    ok.style.padding = '4px 12px'
    ok.style.border = '1px solid black'
    ok.style.cursor = 'pointer'
    ok.onclick = () => {
      document.body.removeChild(overlay)
      resolve(input.value)
    }

    const cancel = document.createElement('button')
    cancel.textContent = 'Cancel'
    cancel.id = 'prompt-cancel-btn'
    cancel.style.padding = '4px 12px'
    cancel.style.border = '1px solid black'
    cancel.style.cursor = 'pointer'
    cancel.onclick = () => {
      document.body.removeChild(overlay)
      resolve(null)
    }

    buttons.appendChild(cancel)
    buttons.appendChild(ok)

    dialog.appendChild(label)
    dialog.appendChild(input)
    dialog.appendChild(buttons)
    overlay.appendChild(dialog)
    document.body.appendChild(overlay)

    input.focus()
  })
}
