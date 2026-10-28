/**
 * @param {string} text
 * @param {string} id
 * @param {function} onClick
 * @returns {HTMLButtonElement}
 */
function createButton(text, id, onClick) {
  const button = document.createElement('button')
  button.textContent = text
  button.id = id
  button.style.padding = '4px 12px'
  button.style.border = '1px solid black'
  button.style.cursor = 'pointer'
  button.onclick = onClick
  return button
}

/**
 * @param {string} msg Prompt message to display
 * @param {string} [defaultValue=''] Initial value of the input
 * @returns Promise that resolves with the input value once OK is clicked, or with `null` once Cancel is clicked
 */
export default function OsPrompt(msg, defaultValue = '') {
  return new Promise((resolve) => {

    const overlay = document.createElement('div')
    overlay.id = 'prompt-overlay'

    const box = document.createElement('div')
    box.id = 'prompt-body'

    const label = document.createElement('label')
    label.id = 'prompt-label'
    label.textContent = msg

    const input = document.createElement('input')
    input.id = 'prompt-input'
    input.type = 'text'
    input.value = defaultValue

    const close = (value) => {
      document.body.removeChild(overlay)
      resolve(value)
    }

    const buttons = document.createElement('div')
    buttons.style.display = 'flex'
    buttons.style.justifyContent = 'flex-end'
    buttons.style.gap = '6px'
    buttons.append(
      createButton('Cancel', 'prompt-cancel-btn', () => close(null)),
      createButton('OK', 'prompt-ok-btn', () => close(input.value)),
    )

    box.append(label, input, buttons)
    overlay.appendChild(box)
    document.body.appendChild(overlay)

    input.focus()
  })
}
