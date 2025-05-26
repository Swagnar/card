// Os class files
import { YGGDRASIL } from "./scripts/classes/yggdrasil/Yggdrasil.js"
import CDirectory from "./scripts/classes/yggdrasil/CDirectory.js"
import CArchive from "./scripts/classes/yggdrasil/CArchive.js"
import CApp from "./scripts/classes/yggdrasil/CApp.js"

// Os parts
import OsContextMenu from "./scripts/classes/os/OsContextMenu.js"
import OsPrompt from "./scripts/OsPrompt.js";
import OsAlert from "./scripts/OsAlert.js";

// Utils and scripts
import { showDialog, closeDialog } from "./scripts/os_dialog.js"
import logWithColors from "./scripts/utils/logs.js"
import update_clock from "./scripts/utils/clock.js"
import steinbergFloydDither from "./scripts/utils/dithering.js";



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

  // Overwrite native window methods with custom modal windows
  window.prompt = OsPrompt
  window.alert = OsAlert
  
  startSystem()
  initEvents()
  loadSettings()

  const dateTag = document.getElementById('date')
  const timeTag = document.getElementById('time')

  setInterval(() => {update_clock(dateTag,timeTag)}, 1000)
}

