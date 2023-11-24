const dialogContents = {
  about: "<p>Made by <a href='https://github.com/Swagnar'>Swagnar</a></p><p>Inspired by <a href='https://kanye2049.com'>Kanye2049</a></p>",
  battery: "<p>Battery power provided by YEG Inc. YEG Inc. is not loable for any burns. explosions or airborne carcinogens caused by this battery pack. Battery pack is single use; <u>Do not</u> attempt to recycle</p>"
}

function folderClicked(folder) {
  var icon = folder.firstElementChild
  var label = folder.lastElementChild

  icon.style.backgroundImage = "url('static/dir-clicked.png')"

  label.style.backgroundColor = "#000"
  label.style.color = "#fff"
}
function folderReleased(folder) {
  var icon = folder.firstElementChild
  var label = folder.lastElementChild

  icon.style.backgroundImage = "url('static/dir.png')"

  label.style.backgroundColor = "#fff"
  label.style.color = "#000"
}

function initEvents() {
  document.getElementById('dialog-close-btn').addEventListener('click', () => {
    closeDialog()
  })

  document.getElementById('about').addEventListener('click', () => {
    showDialog(dialogContents.about)
  }) 
  document.getElementById('battery').addEventListener('click', () => {
    showDialog(dialogContents.battery)
  })
  document.getElementById('toggle-fullscreen').addEventListener('click', () => {
    if(!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    }
  })
  document.getElementById('restart').addEventListener('click', () => {
    location.reload()
  })

  const folders = Array.from(document.querySelectorAll('.folder'))

  folders.forEach(folder => {
    folder.addEventListener('mousedown', () => {folderClicked(folder)})
    folder.addEventListener('mouseup', () => {folderReleased(folder)})
  })
}

function startBios() {
  var bios = document.getElementById('bios')
  bios.innerHTML = "<p>YEG_OS</p><p>Copyright (c) 2023,2024. All Rights Reserved</p><p>BIOS Version: 202347 Release 1</p><br>"


  function appendToBios(text, lineBreak) {
    let p = document.createElement('p')
    p.textContent = text
    bios.appendChild(p)

    if(lineBreak) {
      let br = document.createElement('br')
      bios.appendChild(br)
    }
  }

  function addClickListener() {
    function loadDesktop() {
      let navbar = document.querySelector('.navbar')
      let folders = document.querySelectorAll('.folder')

      folders.forEach(folder => {
        folder.style.display = 'block'
      })
      navbar.style.display = 'flex'
    }

    bios.addEventListener('click', () => {
      bios.style.display = 'none'

      document.body.classList.add('cursor-wait')

      setTimeout(() => {
        document.body.classList.remove('cursor-wait')

        loadDesktop()
      }, 1500)
    })
  }

  let biosContents = [
    "Battery: 95% OK",
    "Memory Test: 32M OK",
    "Initializing USB Controllers ... Done",
    "Press Any Key to boot system"
  ]

  for(let i = 0; i < biosContents.length; i++) {
    setTimeout(() => {
      if(i === 2) {
        appendToBios(biosContents[i], true)
      } else {
        appendToBios(biosContents[i])
      }

      if(i == biosContents.length - 1) {
        addClickListener()
      }
    }, 500 * (i + 1))
  }
}

function showDialog(content) {
  var dialog = document.getElementById('dialog')
  var dialogBody = document.getElementById('dialog-body')

  if(!dialog.classList.contains('dialog-open')) {
    dialog.classList.remove('dialog-hidden')
    dialog.classList.add('dialog-open')
  }

  dialogBody.innerHTML = content
}

function closeDialog() {
  var dialog = document.getElementById('dialog')

  dialog.classList.remove('dialog-open')
  dialog.classList.add('dialog-hidden')
}

window.onload = function() {

  startBios()
  initEvents()



  const date = document.getElementById('date')
  const time = document.getElementById('time')

  const navbarItems = Array.from(document.querySelectorAll('.item > button'))
  const navbarParentElements = navbarItems.map((item) => item.parentElement)
  const navbarDropLists = navbarItems.map((item) => item.nextElementSibling)
  
  navbarItems.forEach((item, i) => {
    item.addEventListener('click', () => {

      const isActive = navbarParentElements[i].classList.contains('active');
  
      navbarParentElements.forEach((item) => {
        item.classList.remove('active');
      });
      navbarDropLists.forEach((list) => {
        list.style.opacity = '0';
        list.style.visibility = 'hidden';
      });
  
      if (!isActive) {
        console.log(navbarParentElements[i].classList);
  
        navbarParentElements[i].classList.add('active');
        navbarDropLists[i].style.opacity = '1';
        navbarDropLists[i].style.visibility = 'visible';
      }
    });
  });

  
  function update_clock() {
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

  setInterval(update_clock, 1000)

  update_clock()
}