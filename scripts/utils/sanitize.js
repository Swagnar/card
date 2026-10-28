const FORBIDDEN_TAGS = 'script, iframe, frame, object, embed, link, meta, style, base, form'
const URL_ATTRIBUTES = ['href', 'src', 'xlink:href', 'action', 'formaction']

/**
 * Removes scripts, event handler attributes and `javascript:` links from the HTML string.
 * Used for the files made by the user, before they are injected into `innerHTML`
 * @param {string} html
 * @returns {string} sanitized HTML
 */
export default function sanitizeHTML(html) {
  // <template> content is inert - scripts don't run and images don't load while it's parsed
  const template = document.createElement('template')
  template.innerHTML = html

  template.content.querySelectorAll(FORBIDDEN_TAGS).forEach(el => el.remove())

  template.content.querySelectorAll('*').forEach(el => {
    for (const attr of [...el.attributes]) {
      const name = attr.name.toLowerCase()
      const value = attr.value.replace(/\s/g, '').toLowerCase()

      const isEventHandler = name.startsWith('on')
      const isScriptUrl = URL_ATTRIBUTES.includes(name) && value.startsWith('javascript:')

      if (isEventHandler || isScriptUrl || name === 'srcdoc') {
        el.removeAttribute(attr.name)
      }
    }
  })

  return template.innerHTML
}
