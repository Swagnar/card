import { OsTerminal } from "./scripts/classes/os_terminal.js"
import { OsContextMenu } from "./scripts/classes/os_context_menu.js"
import { OsWindow } from "./scripts/classes/os_window.js"
import { AudioPlayer } from "./scripts/audio_player.js"

import { CDirectory, CArchive } from "./scripts/classes/CDirectory.js"
import { YGGDRASIL } from "./scripts/yggdrasil.js"

import { steinbergFloydDither } from "./scripts/utils/dithering.js";
import { showDialog, closeDialog } from "./scripts/os_dialog.js"

function isMobile() {
  let userAgent = navigator.userAgent.toLowerCase()
  return /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
}

const DESKTOP = document.getElementById('desktop')
// const TERMINAL = new OsTerminal(DESKTOP)
const CONTEXT_MENU = new OsContextMenu(DESKTOP)

const AUDIO_PLAYER = new AudioPlayer(0);

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
    
    // element /** @type {CDirectory} */, index => {
    
    // Create a container for visual representation of the direcotry for the desktop
    var container = document.createElement('button')
    container.classList.add('file')
    container.draggable = true
    container.id = `file-${element.name}`
    
    // Create the icon element
    var icon = document.createElement('span')
    icon.classList.add('file-icon')
    
    // Create label element
    var label = document.createElement('span')
    label.classList.add('file-label')
    label.innerHTML = element.name

    // Add icon and label to the container
    container.append(icon)
    container.append(label)

    // Adding listeners for drag & drop events
    // This allows users to move files on the desktop
    container.addEventListener('dragstart', (event) => { fileDragStart(event, container)})
    container.addEventListener('drag',      (event) => { fileDrag(event, container)})
    container.addEventListener('dragend',   ()      => { fileDragEnd(container)})
    
    container.style.top = "40px";
    
    if(element instanceof CDirectory) {

      // When clicked on the directory, change its colors to visualize 'clicked' effect
      container.addEventListener('pointerdown',  () => { folderClicked(container) })

      // The reverse happends when user let go mouse button, reverse to default colors
      container.addEventListener('pointerup',    () => { resetStyles(container) })

      container.classList.add('folder')
      icon.classList.add('folder-icon')
      FOLDERS.push(container)

      // When dblclick, create a new OsWindow instance, append it to the Desktop and show it
      // Add event listeners for drag & drop
      container.addEventListener('dblclick', () => {
        try {
          let windowClass = new OsWindow(element.name)
          windowClass.setAsDirectory(element)

          DESKTOP.append(windowClass.container)
          windowClass.showWindow()
          if(isMobile()) {
            windowClass.container.addEventListener('touchstart', (event) => { fileDragStart(event, windowClass.container) })
            windowClass.container.addEventListener('touchmove',  (event) => { fileDrag(event, windowClass.container) })
            windowClass.container.addEventListener('touchend',   () => { fileDragEnd(windowClass.container) })
          } else {
            windowClass.container.addEventListener('dragstart', (event) => { fileDragStart(event, windowClass.container)})
            windowClass.container.addEventListener('drag',      (event) => { fileDrag(event, windowClass.container) })
            windowClass.container.addEventListener('dragend',   () => { fileDragEnd(windowClass.container) })
          }
        } catch(er) {
          console.error("Error while dblclick:", er)
        }
      })
    }
    if(element instanceof CArchive) {
      container.classList.add('archive')
      icon.classList.add('archive-icon')
      ARCHIVES.push(container)
    }

  })
}

/*---------------------------------------------//
//     changing icons for desktop elements     //
//---------------------------------------------*/

/**
 * Resets the styles of a desktop icon element to default values 
 * @param {HTMLElement} element - the element to reset styles for
 */
function resetStyles(element) {
  var icon = element.firstElementChild
  var label = element.lastElementChild

  if (element.classList.contains('folder')) {
    icon.style.backgroundImage = "url('static/dir.png')"
  } else if (element.classList.contains('archive')) {
    icon.style.backgroundImage = "url('static/archive.png')"
  }

  label.style.backgroundColor = "#fff"
  label.style.color = "#000"
}

/**
 * Handles the click event for a folder element, updating its styles
 * @param {HTMLElement} folder - the folder element that was clicked
 */
function folderClicked(folder) {
  resetStyles(folder)
  var icon = folder.firstElementChild
  var label = folder.lastElementChild

  icon.style.backgroundImage = "url('static/dir-clicked.png')"
  label.style.backgroundColor = "#000"
  label.style.color = "#fff"
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
//        drag and drop functionality          //
//---------------------------------------------*/
function allowDrop(event) { 
  event.preventDefault() 
}
function drop(event) {
  event.preventDefault()

  var data = event.dataTransfer.getData("text/plain")
  var draggedElement = document.getElementById(data)

  var desktopRect = DESKTOP.getBoundingClientRect()

  var elementWidth = draggedElement.offsetWidth
  var elementHeight = draggedElement.offsetHeight

  var x = event.clientX - desktopRect.left - elementWidth / 2
  var y = event.clientY - desktopRect.top - elementHeight / 2

  draggedElement.style.left = x + "px"
  draggedElement.style.top = y + "px"
}
function fileDragStart(event, element) { event.dataTransfer.setData("text/plain", element.id) }
function fileDrag(event, element) {}
function fileDragEnd(element) { 
  resetStyles(element); 
}

/*---------------------------------------------//
//            adding EventListeners            //
//---------------------------------------------*/

function initEvents() {
  Mousetrap.bind('ctrl+s', function(e) {
    showSettings()
  })
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

  document.getElementById('about').addEventListener('pointerdown', () => showDialog('about', steinbergFloydDither) ) 
  document.getElementById('battery').addEventListener('pointerdown', () => showDialog('battery', steinbergFloydDither) )
  
  document.getElementById('restart').addEventListener('pointerdown', () => location.reload() )
  
  document.getElementById('toggle-fullscreen').addEventListener('pointerdown', () => {
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



  ARCHIVES.forEach(archive => {
    archive.addEventListener('pointerdown', () => { archiveClicked(archive) })
    archive.addEventListener('pointerup',   () => { resetStyles(archive) })
  })

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


    ARCHIVES.forEach(archive => {
      archive.addEventListener('dragstart', (event) => { fileDragStart(event, archive) })
      archive.addEventListener('drag',      (event) => { fileDrag(event, archive) })
      archive.addEventListener('dragend',   () => { fileDragEnd(archive) })  
    })
  }
  

  document.addEventListener('showTerminal', function() { 
    let terminal = new OsTerminal(DESKTOP) 
    terminal.showTerminal();
  })
  document.addEventListener('showDialog', function(event) { showDialog(event.detail, steinbergFloydDither) })
  document.addEventListener('showSettings', function() { showSettings() })
  document.addEventListener('windowClosed', function(event) { event.detail.remove() })
  // document.addEventListener('showAudioPlayer', function() { AUDIO_PLAYER.showPlayer(DESKTOP)})
  document.addEventListener('showAudioPlayer', function() { AUDIO_PLAYER.playAudio(0)})
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

      desktopElements.forEach(element => {
        navbar.after(element)

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
function update_clock() {

  const date = document.getElementById('date')
  const time = document.getElementById('time')

  var now = new Date()
  var month = now.toLocaleString('en-us', {month: 'long'})
  var day = now.getDate()

  var hours = now.getHours()
  var minutes = now.getMinutes()

  hours = hours < 10 ? '0' + hours : hours
  minutes = minutes < 10 ? '0' + minutes : minutes
  
  date.innerText = `\xa0- ${month.slice(0,3)}. ${day}, ${now.getFullYear()}`
  time.innerText = `${hours}:${minutes}`
}

window.onload = function() {
  loadYggdrasil()
  isMobile()
  startSystem()
  initEvents()
  loadSettings()

  setInterval(update_clock, 1000)
  update_clock()
}