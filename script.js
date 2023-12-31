function isMobile() {
  let userAgent = navigator.userAgent.toLowerCase()
  return /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
}

const DESKTOP = document.getElementById('desktop')
const TERMINAL = new Terminal()

/*---------------------------------------------//
//             terminal DOM bindings           //
//---------------------------------------------*/

function showTerminal() {
  TERMINAL.showTerminal()
}

function handleTerminalInput(input) {
  TERMINAL.handleInput(input)
}

/**
 * 
 * @param {Event} event - triggering event (right click)
 * @param {HTMLElement} menu - the context menu element
 */
function showContextMenu(event, menu) {
  event.preventDefault()
  menu.style.display = 'block'
  menu.style.left = event.layerX + "px"
  menu.style.top = event.layerY + "px"
}

/*---------------------------------------------//
//     directories functions (open/close)      //
//---------------------------------------------*/

/**
 * Function to show a window with given name
 * @param {string} name - window name to open
 */
function showWindow(name) {
  let window = document.getElementById(`window-${name}`)

  setTimeout(() => {
    window.style.transition = 'none'
    window.classList.remove('show')
    window.classList.add('hide')
    window.offsetHeight
    window.style.transition = ''
    window.classList.remove('hide')
    window.classList.add('show')
  }, 50)
}

/**
 * Function closing a window 
 * @param {HTMLElement} btn - button inside window for closing
 */
function closeWindow(btn) {
  let header = btn.parentElement
  let window = header.parentElement

  window.classList.remove('show')
  window.classList.add('hide')
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
function allowDrop(event) { event.preventDefault() }
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
function fileDragStart(event, element) { 
  event.dataTransfer.setData("text/plain", element.id) 
}
function fileDrag(event, element) {}
function fileDragEnd(element) { }

/*---------------------------------------------//
//            adding EventListeners            //
//---------------------------------------------*/

function initEvents() {
  Mousetrap.bind('ctrl+s', function(e) {
    showSettings()
  })
  const folders = Array.from(document.querySelectorAll('.folder'))
  const archives = Array.from(document.querySelectorAll('.archive'))
  const windows = Array.from(document.querySelectorAll('.window'))
  const windowsCloseBtns = document.querySelectorAll('.window>header>button')

  const navbarItems = Array.from(document.querySelectorAll('.item > button'))
  const navbarParentElements = navbarItems.map((item) => item.parentElement)
  const navbarDropLists = navbarItems.map((item) => item.nextElementSibling)
  

  DESKTOP.addEventListener('dragover', function(event) { allowDrop(event) })
  DESKTOP.addEventListener('drop', function(event) { drop(event) })
  DESKTOP.addEventListener('contextmenu', function(event) { showContextMenu(event, document.getElementById('context-menu')) })
  DESKTOP.addEventListener('click', () => { document.getElementById('context-menu').style.display = 'none' })
    
  
  document.getElementById('dialog-close-btn').addEventListener('pointerdown', () => closeDialog())
  document.getElementById('settings-close-btn').addEventListener('pointerdown', () => closeSettings())  

  document.getElementById('about').addEventListener('pointerdown', () => showDialog('about') ) 
  document.getElementById('battery').addEventListener('pointerdown', () => showDialog('battery') )
  
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


  folders.forEach(folder => {
    folder.addEventListener('pointerdown',  () => { folderClicked(folder) })
    folder.addEventListener('pointerup',    () => { resetStyles(folder) })
  })
  archives.forEach(archive => {
    archive.addEventListener('pointerdown', () => { archiveClicked(archive) })
    archive.addEventListener('pointerup',   () => { resetStyles(archive) })
  })

  if(isMobile()) {
    folders.forEach(folder => {
      folder.addEventListener('touchstart', (event) => { fileDragStart(event, folder) })
      folder.addEventListener('touchmove',  (event) => { fileDrag(event, folder) })
      folder.addEventListener('touchend',   () => { fileDragEnd(folder) })
    })

    archives.forEach(archive => {
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
    folders.forEach(folder => {
      folder.addEventListener('dragstart',  (event) => { fileDragStart(event, folder) })
      folder.addEventListener('drag',       (event) => { fileDrag(event, folder) })
      folder.addEventListener('dragend',    () => { fileDragEnd(folder) })
    })

    archives.forEach(archive => {
      archive.addEventListener('dragstart', (event) => { fileDragStart(event, archive) })
      archive.addEventListener('drag',      (event) => { fileDrag(event, archive) })
      archive.addEventListener('dragend',   () => { fileDragEnd(archive) })  
    })

    windows.forEach(window => {
      window.addEventListener('dragstart',  (event) => { fileDragStart(event, window) })
      window.addEventListener('drag',       (event) => { fileDrag(event, window) })
      window.addEventListener('dragend',    () => { fileDragEnd(window) })
    })
  }
  
  folders[0].addEventListener('dblclick', () => { showWindow('dnd') })
  folders[1].addEventListener('dblclick', () => { showWindow('work') })
  
  archives[0].addEventListener('dblclick', () => { showDialog('archive1') })

  

  windowsCloseBtns.forEach(btn => {
    btn.addEventListener('click', function() { closeWindow(this) })
  })

}
function startSystem() {
  var bios = document.getElementById('bios')
  bios.innerHTML = "<p>YEG_OS</p><p>Copyright (c) 2023,2024. All Rights Reserved</p><p>BIOS Version: 202347 Release 1</p><br>"

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
      let navbar = document.querySelector('.navbar')
      let archives = document.querySelectorAll('.archive')
      let folders = document.querySelectorAll('.folder')

      archives.forEach(archive => {
        archive.style.display = 'block'
      })

      folders.forEach(folder => {
        folder.style.display = 'block'
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
  isMobile()
  startSystem()
  initEvents()
  loadSettings()

  setInterval(update_clock, 1000)
  update_clock()
}