/**
 * This function is passed to setInterval() with delay of 1000ms to update the clock in the navbar
 * @param {HTMLSpanElement} dateTag  
 * @param {HTMLSpanElement} timeTag 
 */
export default function update_clock(dateTag, timeTag) {
  var now = new Date()
  var month = now.toLocaleString('en-us', {month: 'long'})
  var day = now.getDate()

  var hours = now.getHours()
  var minutes = now.getMinutes()

  hours = hours < 10 ? '0' + hours : hours
  minutes = minutes < 10 ? '0' + minutes : minutes
  
  dateTag.innerText = `\xa0- ${month.slice(0,3)}. ${day}, ${now.getFullYear()}`
  timeTag.innerText = `${hours}:${minutes}`
}