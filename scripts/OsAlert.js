/**
 * 
 * @param {string} msg Alert message to display
 * @param {string} [type='default'] Optional type of alert styling to show the message with. Avaiable options are `"default"`, `"danger"` and `"info"`. Defaults to `"default"`
 * @returns Promise that resolves once OK button is clicked and alert window closed. 
 */
export default function OsAlert(msg, type = 'default') {
  return new Promise((resolve) => {
    const overlay = document.createElement('div')
    overlay.id = 'alert-overlay'

    const box = document.createElement('div')
    box.id = 'alert-body'

    const text = document.createElement('div')
    text.textContent = msg
    text.style.fontSize = '14px'

    const btn = document.createElement('button')
    btn.textContent = 'OK'
    btn.style.padding = '4px 12px'
    btn.style.border = '1px solid black'
    btn.style.background = 'white'
    btn.style.cursor = 'pointer'
    btn.onclick = () => {
      document.body.removeChild(overlay)
      resolve()
    }

    switch (type) {
      case 'danger':
        box.style.background = '#fff0f0'
        text.style.color = '#b00000'
        box.animate([
          { backgroundColor: '#fff0f0' },
          { backgroundColor: '#ff0000' },
          { backgroundColor: '#fff0f0' }
        ], {
          duration: 500,
          iterations: 6
        })
        break
      case 'easter-egg':
        text.textContent = '🧀 ' + msg + ' 🧀'
        text.style.fontSize = '20px'
        box.style.background = 'yellow'
        box.style.border = '3px dotted red'
        btn.textContent = 'miau?'
        break
      case 'default':
      default:
        break
    }

    box.appendChild(text)
    box.appendChild(btn)
    overlay.appendChild(box)
    document.body.appendChild(overlay)
    btn.focus()
  })
}
