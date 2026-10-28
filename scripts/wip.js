import { typeText, typeAway } from "./utils/typewriter.js"
import { OS_CONSTANS } from "./constans.js"

/** @type {HTMLParagraphElement} */
let wipMessage

/**
 * Types the "work in progress" message at the bottom of the page
 */
export async function showWIP() {
  wipMessage = document.createElement('p')
  wipMessage.classList.add('typewriter', 'glitchy')
  wipMessage.style.letterSpacing = '.25rem'
  document.body.append(wipMessage)

  await typeText(wipMessage, OS_CONSTANS.WIP_MESSAGE)
}

// TODO: actually delete the html tag
export async function removeWIP() {
  await typeAway(wipMessage)
}
