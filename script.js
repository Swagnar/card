window.onload = function() {
  var toggledDrop;
  
    const navbarItems = Array.from(document.querySelectorAll('.item > button'))


    const navbarParentElements = navbarItems.map((item) => item.parentElement)
    const navbarDropLists = navbarItems.map((item) => item.nextElementSibling)

    console.log(navbarParentElements)
    console.log(navbarDropLists)

    

    navbarItems.forEach((item, i) => {
      
      item.addEventListener('click', () => {
        navbarDropLists.forEach((list) => {
          list.style.opacity = "0"
          list.style.visibility = "hidden"
        })
        navbarParentElements.forEach((item) => {
          item.classList.remove('active')
        })
        if(!navbarParentElements[i].classList.contains('active')) {
          navbarParentElements[i].classList.add('active')
          navbarDropLists[i].style.opacity = "1"
          navbarDropLists[i].style.visibility = "visible"
        } else {
          navbarParentElements[i].classList.remove('active')
          navbarDropLists[i].style.opacity = "0"
          navbarDropLists[i].style.visibility = "hidden"
        }
      })
      
    })

    

    // // tux logo
    // const logoParentElement = logo.parentElement
    
    // // ul .drop list
    // const logoNextElementSibling = logo.nextElementSibling
    
    // if(toggledDrop === undefined) {
    //   toggledDrop = logoNextElementSibling
    // }

    // logo.addEventListener('click', () => {
    //   if(!logoParentElement.classList.contains('active')) {
    //     logoParentElement.classList.toggle('active')
    //     logoNextElementSibling.style.opacity = "1"
    //     logoNextElementSibling.style.visibility = "visible"
    //   } else {
    //     logoParentElement.classList.toggle('active')
    //     logoNextElementSibling.style.opacity = "0"
    //     logoNextElementSibling.style.visibility = "hidden"
    //   }
    // })
  

}