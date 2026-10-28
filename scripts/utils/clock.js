/**
 * This function is passed to setInterval() with delay of 1000ms to update the clock in the navbar
 * @param {HTMLSpanElement} dateTag
 * @param {HTMLSpanElement} timeTag
 */
export default function update_clock(dateTag, timeTag) {
  const now = new Date()
  const month = now.toLocaleString('en-us', {month: 'long'})

  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')

  dateTag.innerText = `\xa0- ${month.slice(0,3)}. ${now.getDate()}, ${now.getFullYear()}`
  timeTag.innerText = `${hours}:${minutes}`
}
