import OsWindow from "./scripts/classes/os/OsWindow.js"
import OsTerminal from "./scripts/classes/os/OsTerminal.js"
import { OsContextMenu } from "./scripts/classes/os/OsContextMenu.js"


import { YGGDRASIL } from "./scripts/classes/yggdrasil/Yggdrasil.js"
import CDirectory from "./scripts/classes/yggdrasil/CDirectory.js"
import CArchive from "./scripts/classes/yggdrasil/CArchive.js"

import steinbergFloydDither from "./scripts/utils/dithering.js";
import update_clock from "./scripts/utils/clock.js"

import { showDialog, closeDialog } from "./scripts/os_dialog.js"
import Choir from "./scripts/classes/Choir/Choir.js"

import logWithColors from "./scripts/utils/logs.js"

function isMobile() {
  let userAgent = navigator.userAgent.toLowerCase()
  return /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
}

export const DESKTOP = document.getElementById('desktop')
const CONTEXT_MENU = new OsContextMenu(DESKTOP)

// const AUDIO_PLAYER = new OsAudioPlayer(DESKTOP);

const FOLDERS = []
const ARCHIVES = []

/**
 * Yggdrasil is a array that contains all objects representing directories and archives found on the application desktop.
 * Im not crazy enough to add a propper file explorer, come on.
 * 
 * This functions loops through the array and creates DOM elements.
 * If the iterable element is a CDirectory instance, the DOM elements (the `container` and the `icon`) has different class values than for example the CArchive class
 * 
 * Then, the ready-to-go DOM elements are added to their corresponding arrays, FOLDERS or ARCHIVES.
 * 
 */

function loadYggdrasil() {
  YGGDRASIL.forEach(function(element, index) {    
    if(element instanceof CDirectory) {
      element.init()
      FOLDERS.push(element)
    }
    // TODO: fix populate CArchive class
    if(element instanceof CArchive) {
      element.init()
      ARCHIVES.push(element)
    }
  })
}


/**
 * Handles the click event for an archive element, updating its styles
 * @param {HTMLElement} archive - the archive element that was clicked
 */
function archiveClicked(archive) {
  resetStyles(archive)
  var icon = archive.firstElementChild
  var label = archive.lastElementChild

  icon.style.backgroundImage = "url('static/archive-clicked.png')"
  label.style.backgroundColor = "#000"
  label.style.color = "#fff"
}

/*---------------------------------------------//
//            adding EventListeners            //
//---------------------------------------------*/

function initEvents() {
  const windows = Array.from(document.querySelectorAll('.window'))

  const navbarItems = Array.from(document.querySelectorAll('.item > button'))
  const navbarParentElements = navbarItems.map((item) => item.parentElement)
  const navbarDropLists = navbarItems.map((item) => item.nextElementSibling)
  

  DESKTOP.addEventListener('dragover', function(event) { allowDrop(event) })
  DESKTOP.addEventListener('drop', function(event) { drop(event) })
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



  // ARCHIVES.forEach(archive => {
  //   archive.addEventListener('pointerdown', () => { archiveClicked(archive) })
  //   archive.addEventListener('pointerup',   () => { resetStyles(archive) })
  // })

  if(isMobile()) {


    ARCHIVES.forEach(archive => {
      archive.addEventListener('touchstart', (event) => { fileDragStart(event, archive) })
      archive.addEventListener('touchmove',  (event) => { fileDrag(event, archive) })
      archive.addEventListener('touchend',   () => { fileDragEnd(archive) })  
    })

    windows.forEach(window => {
      window.addEventListener('touchstart',  (event) => { fileDragStart(event, window) })
      window.addEventListener('touchmove',   (event) => { fileDrag(event, window) })
      window.addEventListener('touchend',    () => { fileDragEnd(window) })
    })
  } else {


    // ARCHIVES.forEach(archive => {
    //   archive.addEventListener('dragstart', (event) => { fileDragStart(event, archive) })
    //   archive.addEventListener('drag',      (event) => { fileDrag(event, archive) })
    //   archive.addEventListener('dragend',   () => { fileDragEnd(archive) })  
    // })
  }
  

  document.addEventListener('showTerminal', function() { 
    let terminal = new OsTerminal(DESKTOP) 
    terminal.showTerminal();
  })
  document.addEventListener('showDialog', function(event) { showDialog(event.detail, steinbergFloydDither) })
  document.addEventListener('showSettings', function() { showSettings() })
  document.addEventListener('windowClosed', function(event) { event.detail.remove() })
  document.addEventListener('showAudioPlayer', function() { 
    var newAudioPlayer = new Choir(DESKTOP);
    newAudioPlayer.showPlayer(DESKTOP);
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
      
      if(!FOLDERS || !Array.isArray(FOLDERS)) {
        throw new Error('Folders array is empty, undefined or not an Array')
      }
      if(!ARCHIVES || !Array.isArray(ARCHIVES)) {
        throw new Error('Archives array is empty, undefined or not an Array')
      }

      let desktopElements = FOLDERS.concat(ARCHIVES)

      //
      // ! PUSHING OBJECT TO RENDER ON SCREEN
      //
      desktopElements.forEach(element => {
        if(element instanceof CDirectory) {
          navbar.after(element.container)
          logWithColors("Appending CDirectory {} to DESKTOP element", element.name)
        } else if(element instanceof CArchive) {
          navbar.after(element)
          logWithColors("Appending CArchive {} to DESKTOP element", typeof element, element.name)
        } else {
          throw Error('Trying to add a not-OS object to a desktop')
        }

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
  loadYggdrasil()
  isMobile()
  startSystem()
  initEvents()
  loadSettings()

  let dateTag = document.getElementById('date')
  let timeTag = document.getElementById('time')

  setInterval(() => {update_clock(dateTag,timeTag)}, 1000)
}