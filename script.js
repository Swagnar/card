const dialogContents = {
  about: "<p>Made by <a href='https://github.com/Swagnar'>Swagnar</a></p><p>Inspired by <a href='https://kanye2049.com'>Kanye2049</a></p>"
}




window.onload = function() {
  const dialog = document.getElementById('dialog')
  const dialogBody = document.getElementById('dialog-body')

  const datetime = document.getElementById('datetime')

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

  document.getElementById('dialog-close-btn').addEventListener('click', () => {
    dialog.classList.remove('dialog-open')
    dialog.classList.add('dialog-hidden')
  })

  document.getElementById('about').addEventListener('click', () => {
    if(!dialog.classList.contains('dialog-open')) {
      dialog.classList.remove('dialog-hidden')
      dialog.classList.add('dialog-open')
    }
    dialogBody.innerHTML = dialogContents.about
  }) 





  function update_clock() {
    var now = new Date()
    var month = now.toLocaleString('en-us', {month: 'long'})
    
    var hours = now.getHours()
    var minutes = now.getMinutes()

    hours = hours < 10 ? '0' + hours : hours
    minutes = minutes < 10 ? '0' + minutes : minutes
    
    datetime.innerText = `${hours}:${minutes} - ${month.slice(0,3)}. ${now.getDay()}, ${now.getFullYear()}`
  
    
  }

  setInterval(update_clock, 1000)

  update_clock()
}