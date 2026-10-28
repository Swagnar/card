const ALERT_TYPES = ['default', 'danger', 'warning', 'easter-egg']

/**
 * 
 * @param {string} msg Alert message to display
 * @param {string} [type='default'] Optional type of alert styling to show the message with. Avaiable options are `"default"`, `"danger"`, `"warning"` and `"easter-egg"`. Defaults to `"default"`
 * @returns Promise that resolves once OK button is clicked and alert window closed. 
 */
export default function OsAlert(msg, type = 'default') {
  return new Promise((resolve) => {
    const overlay = document.createElement('div')
    overlay.id = 'alert-overlay'

    const box = document.createElement('div')
    box.id = 'alert-body'

    // styles of each type are in root.css, unknown types are shown as default
    if (type !== 'default' && ALERT_TYPES.includes(type)) {
      box.classList.add(`alert-${type}`)
    }

    const text = document.createElement('div')
    text.classList.add('alert-text')
    text.textContent = type === 'easter-egg' ? `🧀 ${msg} 🧀` : msg

    const btn = document.createElement('button')
    btn.textContent = type === 'easter-egg' ? 'miau?' : 'OK'
    btn.onclick = () => {
      document.body.removeChild(overlay)
      resolve()
    }

    box.appendChild(text)
    box.appendChild(btn)
    overlay.appendChild(box)
    document.body.appendChild(overlay)
    btn.focus()
  })
}
