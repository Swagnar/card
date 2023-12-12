/**
 * Shows the dialog window with specific content
 * @param {string} content - type of content to populate the dialog with 
 */
function showDialog(content) {

  /**
   * Object containing predefined dialog contents
   * @type {Object.<string, string>}
   */

  let dialogContents = {
    'about': "<p>Made by <a href='https://github.com/Swagnar'>Swagnar</a></p><p>Inspired by <a href='https://kanye2049.com'>Kanye2049</a></p>",
    'battery': "<p>Battery power provided by YEG Inc. YEG Inc. is not liable for any burns, explosions or airborne carcinogens caused by this battery pack. Battery pack is single use <u>Do not</u> attempt to recycle</p>",
    'properties': `
      <p>Screen size: 800px X 600px</p>
      <p>Color depth: 8-bit</p>
      <p style='text-align: center border-bottom: 1px solid black'>Impostor host info</p>
      <ul>
        <li>OS: ${navigator.platform.includes('Win') ? 'Windows' :
        navigator.platform.includes('Mac') ? 'Mac OS' :
        navigator.platform.includes('Linux') ? 'Linux' :
        navigator.platform.includes('Iphone') || navigator.platform.includes('ipad') || navigator.platform.includes('ipod') ? 'iOS' :
        navigator.platform.includes('Android') ? 'Android' :
        'Unknown'}</li>
        <li>AGENT: ${navigator.userAgent}</li>
        <li>AUTOMATA: ${navigator.webdriver}</li>
        <li>AVAIABLE CORES: ${navigator.hardwareConcurrency}</li>
      </ul>`,
    'archive1': "<s>File corrupted! Please download again.</s><br>I love astronomy. In the future I want to buy a telescope and look into the void. I hope to bear witness, within the span of my existence, to the monumental event of human alighting upon the Martian soil."
  }

  let dialog = document.getElementById('dialog')
  let dialogBody = document.getElementById('dialog-body')

  if(!dialog.classList.contains('dialog-open')) {
    dialog.classList.remove('dialog-hidden')
    dialog.classList.add('dialog-open')
  }

  dialogBody.innerHTML = dialogContents[content]
}

function closeDialog() {
  let dialog = document.getElementById('dialog')

  dialog.classList.remove('dialog-open')
  dialog.classList.add('dialog-hidden')
}