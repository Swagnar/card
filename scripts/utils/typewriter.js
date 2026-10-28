import sleep from "./sleep.js"
import { OS_CONSTANS } from "../constans.js"

/**
 * Keeps the `data-text` attribute in sync with the element text, it's used by the glitch pseudo-elements
 * @param {HTMLElement} el
 */
function syncGlitchText(el) {
  el.setAttribute('data-text', el.textContent)
}

/**
 * Types the text into the element character by character
 * @param {HTMLElement} el
 * @param {string} text
 * @param {number} [speed=45] base delay between characters, lower is faster
 */
export async function typeText(el, text, speed = 45) {
  for (const ch of text) {
    el.textContent += ch
    syncGlitchText(el)
    await sleep(speed + Math.random() * 20)
    await sleep(OS_CONSTANS.TYPEWRITER_IN_SPEED)
  }
}

/**
 * Erases the element text character by character, starting from the end
 * @param {HTMLElement} el
 */
export async function typeAway(el) {
  const text = el.textContent

  for (let i = text.length; i >= 0; i--) {
    el.textContent = text.slice(0, i)
    syncGlitchText(el)
    await sleep(OS_CONSTANS.TYPEWRITER_OUT_SPEED)
  }
}
