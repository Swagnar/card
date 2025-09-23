export default function OsPrompt(msg, defaultValue = '') {
  return new Promise((resolve) => {
    
    const overlay = document.createElement('div')
    overlay.id = 'prompt-overlay'

    // Okienko
    const box = document.createElement('div')
    box.id = 'prompt-body'


    const label = document.createElement('label')
    label.id = 'prompt-label'
    label.textContent = msg

    const input = document.createElement('input')
    input.id = 'prompt-input'
    input.type = 'text'
    input.value = defaultValue

    const buttons = document.createElement('div')
    buttons.id = 
    buttons.style.display = 'flex'
    buttons.style.justifyContent = 'flex-end'
    buttons.style.gap = '6px'

    const ok = document.createElement('button')
    ok.textContent = 'OK'
    ok.id = 'prompt-ok-btn'
    ok.style.padding = '4px 12px'
    ok.style.border = '1px solid black'
    ok.style.cursor = 'pointer'
    ok.onclick = () => {
      document.body.removeChild(overlay)
      resolve(input.value)
    }

    const cancel = document.createElement('button')
    cancel.textContent = 'Cancel'
    cancel.id = 'prompt-cancel-btn'
    cancel.style.padding = '4px 12px'
    cancel.style.border = '1px solid black'
    cancel.style.cursor = 'pointer'
    cancel.onclick = () => {
      document.body.removeChild(overlay)
      resolve(null)
    }

    buttons.appendChild(cancel)
    buttons.appendChild(ok)

    box.appendChild(label)
    box.appendChild(input)
    box.appendChild(buttons)
    overlay.appendChild(box)
    document.body.appendChild(overlay)

    input.focus()
  })
}