// Os class files
import { YGGDRASIL } from "./scripts/classes/yggdrasil/Yggdrasil.js"
import CDirectory from "./scripts/classes/yggdrasil/CDirectory.js"
import CArchive from "./scripts/classes/yggdrasil/CArchive.js"
import CApp from "./scripts/classes/yggdrasil/CApp.js"

// Os parts
import OsContextMenu from "./scripts/classes/os/OsContextMenu.js"
import OsPrompt from "./scripts/classes/os/OsPrompt.js";
import OsAlert from "./scripts/classes/os/OsAlert.js";

// Utils and scripts
import logWithColors from "./scripts/utils/logs.js"
import update_clock from "./scripts/utils/clock.js"
import OsDialog from "./scripts/classes/os/OsDialog.js"
import OsSettings from "./scripts/classes/os/OsSettings.js"

import { OS_CONSTANS } from "./scripts/constans.js"

const DESKTOP = document.getElementById('desktop')
const OS_SETTINGS = new OsSettings()
const CONTEXT_MENU = new OsContextMenu(DESKTOP)
const OS_DIALOG = new OsDialog()

function initEvents() {
  const navbarItems = Array.from(document.querySelectorAll('.item > button'))
  const navbarParentElements = navbarItems.map((item) => item.parentElement)
  const navbarDropLists = navbarItems.map((item) => item.nextElementSibling)

  DESKTOP.addEventListener('contextmenu', function(event) { CONTEXT_MENU.showContextMenu(event) });
  
  DESKTOP.addEventListener('click', () => { document.getElementById('context-menu').style.display = 'none' })
  
  document.getElementById('dialog-close-btn').addEventListener('pointerdown', () => OsDialog.closeDialog())

  document.getElementById('navbar-submenu-item-about').addEventListener('pointerdown', () => {OsDialog.showDialogViaString( OS_DIALOG.DIALOG_CONTENTS.about ) } ) 
  document.getElementById('navbar-submenu-item-battery').addEventListener('pointerdown', () => { OsDialog.showDialogViaString( OS_DIALOG.DIALOG_CONTENTS.battery ) } )
  document.getElementById('navbar-submenu-item-properties').addEventListener('pointerdown', () => { OsDialog.showDialogViaString( OS_DIALOG.DIALOG_CONTENTS.properties ) } )
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
  
  document.addEventListener('showDialog', function(ev) { 
    OsDialog.showDialogViaString(
      // TODO: catch that
      OS_DIALOG.DIALOG_CONTENTS[ev.detail]
    ) 

  })
  document.addEventListener('showSettings', function() { 
    OS_SETTINGS.showSettings() 
  })
  
}

// TODO: create Os class
function bootOS() {
  function loadDesktop() {
    var currentRight = 10
    var appDesktopIconOffset = 70
    var navbar = document.querySelector('.navbar')
    console.log(YGGDRASIL)
    YGGDRASIL.forEach(element => {
      if(!(element instanceof CDirectory) && 
         !(element instanceof CArchive) && 
         !(element instanceof CApp)) {
        throw new TypeError(`Yggdrasil element does not have OS recognizable type, got:`, element)
      }
      if(element instanceof CDirectory) {
        logWithColors("Appending CDirectory {} to DESKTOP element", element.name)
      } else if(element instanceof CArchive) {
        logWithColors("Appending CArchive {} to DESKTOP element", element.name)
      } else if(element instanceof CApp) {
        element.desktopIcon.container.style.right = `${currentRight}px`
        currentRight += appDesktopIconOffset
        logWithColors("Appending CApp {} to DESKTOP element", element.name)
      } else {
        throw Error('Trying to add a not-OS object to desktop')
      }

      navbar.after(element.desktopIcon.container)        
    })
    navbar.style.display = 'flex'
  }

  const bios = document.getElementById('bios')
  bios.style.display = 'none'

  document.body.classList.add('cursor-wait')

  setTimeout(() => {
    document.body.classList.remove('cursor-wait')
    loadDesktop()
  }, 1500)
}
async function bootBIOS() {
  const bios = document.getElementById('bios')
  
  const asciiLogo = String.raw`
_______/\\\\\__________/\\\\\\\\\\\___________________________/\\\\\__________/\\\\\\\\\\\___        
 _____/\\\///\\\______/\\\/////////\\\_______________________/\\\///\\\______/\\\/////////\\\_       
  ___/\\\/__\///\\\___\//\\\______\///______________________/\\\/__\///\\\___\//\\\______\///__      
   __/\\\______\//\\\___\////\\\____________________________/\\\______\//\\\___\////\\\_________     
    _\/\\\_______\/\\\______\////\\\________________________\/\\\_______\/\\\______\////\\\______    
     _\//\\\______/\\\__________\////\\\_____________________\//\\\______/\\\__________\////\\\___   
      __\///\\\__/\\\_____/\\\______\//\\\_____________________\///\\\__/\\\_____/\\\______\//\\\__  
       ____\///\\\\\/_____\///\\\\\\\\\\\/____/\\\\\\\\\\\\\\\____\///\\\\\/_____\///\\\\\\\\\\\/___ 
        ______\/////_________\///////////_____\///////////////_______\/////_________\///////////_____
`

  const asciiInfo = `
#   Copyright (c) 2023-2025. All Rights   #
#           OS_OS BIOS v202547            #
`

  const logo = document.createElement('pre')
  const info = document.createElement('pre')

  logo.id = 'bios-logo'
  info.id = 'bios-info'

  logo.textContent = asciiLogo
  info.textContent = asciiInfo

  bios.append(logo)
  bios.append(info)

  await sleep(OS_CONSTANS.BOOT_TIME)

  const biosContents = [
    {name: "[CPU] ", value: "Apophis® MN99942 0.66 MHz", status: "[ PASS ]", color: "#fff" },
    {name: "[Battery] ", value: "YEG P2 @ 95%", status: "[ PASS ]", color: "#fff" },
    {name: "[Memory 1 Test] ", value: "UNDEFINED DDR 31923B", status: "[ PASS ]", color: "#fff" },
    {name: "[Memory 2 Test] ", value: "UNDEFINED 0B", status: "[ MISSING ]", color: "#fff", sleep: true },
    {name: "Initializing Holy USB Controllers ... ", value: " ", status: "[ BLESSED ]", color: "#fff", sleep: true },
    {name: "Connecting the Vulture ...", value: " ", status: "[ ACTIVE ] ", color: "#fff"},
    {name: "Press Any Key to boot system", value:"", status:"", color:"#fff" },
  ]

  for (let i = 0; i < biosContents.length; i++) {
    let p = document.createElement('p')
    let {name, value, status, color} = biosContents[i] 

    let s1 = document.createElement('span')
    let s2 = document.createElement('span')
    let s3 = document.createElement('span')
    
    s1.innerHTML = name
    s1.style.color = color || '#00ff00'
    s1.style.fontWeight = name.includes('[') && name.includes(']') ? 'bold' : 'normal'

    if (value) {
      s2.innerHTML = ` ${value}`
      s2.style.color = '#ffffff'
    }

    if (status) {
      s3.innerHTML = ` ${status}`
      const match = OS_CONSTANS.BIOS_POST_CODES.find(code => status.includes(code));
      s3.style.color = match ? OS_CONSTANS.CSS_COLORS.green : OS_CONSTANS.CSS_COLORS.red;
      s3.style.fontWeight = 'bold'
    }
    
    p.append(s1)
    if(status) p.append(s2)
    
    bios.append(p)
    
    if (i == biosContents.length - 1) {
      bios.addEventListener('click', () => { bootOS() })
      p.id = 'any-key'
    }
    await sleep(OS_CONSTANS.BOOT_POST_TIME)

    if(value) p.append(s3)

    await sleep(OS_CONSTANS.BOOT_POST_TIME)
    if(biosContents[i].sleep) await sleep(2 * OS_CONSTANS.BOOT_POST_TIME)

  }
}

async function showWIP() {
  let p = document.createElement('p')
  p.classList.add('typewriter', 'glitchy')
  p.style.letterSpacing = '.25rem'
  document.body.append(p)
  p.textContent = ""
  for(let i = 0; i < OS_CONSTANS.WIP_MESSAGE.length; i++) {
    await typeText(p, OS_CONSTANS.WIP_MESSAGE[i])
  }
  await sleep(3_000)
}
// TODO: actually delete the html tag
async function removeWIP() {
  const p = document.querySelector("body > p")
  for(let i = 0; i < OS_CONSTANS.WIP_MESSAGE.length; i++) {
    await typeAway(p, OS_CONSTANS.WIP_MESSAGE[i])
  }
}

window.onload = async function() {
  
  showWIP()
  await bootBIOS()

  // Overwrite native window methods with custom modal windows
  window.prompt = OsPrompt
  window.alert = OsAlert

  initEvents()
  // loadSettings()

  const dateTag = document.getElementById('date')
  const timeTag = document.getElementById('time')

  setInterval(() => {update_clock(dateTag,timeTag)}, 1000)

  await sleep(3_000)

  removeWIP()

}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
async function typeText(el, text, speed = 45) {
  el.setAttribute('data-text', text);
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    el.textContent += ch;
    el.setAttribute('data-text', el.textContent);
    await sleep(speed + Math.random() * 20);
  }
  await sleep(OS_CONSTANS.TYPEWRITER_IN_SPEED);
}
async function typeAway(el) {
  let text = el.textContent; // start with current text

  for (let i = text.length; i >= 0; i--) {
    el.textContent = text.slice(0, i);
    el.setAttribute('data-text', el.textContent); // keep glitch pseudo-elements synced
    await new Promise(r => setTimeout(r, OS_CONSTANS.TYPEWRITER_OUT_SPEED));
  }

}