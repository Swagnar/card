import { applyDithering } from "../../utils/dithering.js";
import Os from "./Os.js";

/**
 * @returns {string} desktop size in pixels, e.g. `800px X 600px`
 */
function getDesktopSize() {
  const bounds = document.getElementById('desktop').getBoundingClientRect()
  return bounds.width + "px X " + bounds.height + "px"
}

/**
 * @returns {string} name of the OS the browser is running on
 */
function getHostOsName() {
  const platform = navigator.platform

  if (platform.includes('Win')) return 'Windows'
  if (platform.includes('Mac')) return 'Mac OS'
  if (platform.includes('Linux')) return 'Linux'
  if (platform.includes('Iphone') || platform.includes('ipad') || platform.includes('ipod')) return 'iOS'
  if (platform.includes('Android')) return 'Android'
  return 'Unknown'
}

/**
 * Replaces every `<img>` inside the container with its dithered `<canvas>` copy
 * @param {HTMLElement} container
 */
function ditherImages(container) {
  for (const image of container.querySelectorAll('img')) {
    const canvas = document.createElement('canvas');
    image.after(canvas);
    applyDithering(image, canvas);
  }
}

export default class OsDialog {

  DIALOG_CONTENTS = {
    about: `
      <p style='text-align: center;'>Made by <a href='https://github.com/Swagnar'>Swagnar</a></p>
      <br>
      <fieldset>
        <legend>Inspired by</legend>
        > <a href='https://kanye2049.com'>Kanye2049</a><br>
        > the life of <a href='https://templeos.org/'>Terry A. Davis</a>
      </fieldset>
    `,
    battery: `
      <p>Battery power provided by YEG Inc. YEG Inc. is not liable for any burns, explosions or airborne carcinogens caused by this battery pack. Battery pack is single (1) use. <u>Do not</u> attempt to recycle</p>
      <div class='dialog-img-wrapper'><img src="static/battery2.jpg" style="display: none;"></div>
    `,
    get properties() { return `
      <fieldset>
        <legend>OS_OS</legend>
        <p><strong>Screen size</strong>: ${getDesktopSize()}</p>
        <p><strong>Color depth</strong>: 8-bit</p>
      </fieldset>
      <fieldset>
        <legend>Impostor host</legend>
        <p><strong>OS</strong>: ${getHostOsName()}</p>
        <p><strong>AGENT</strong>: ${navigator.userAgent}</p>
        <p><strong>AUTOMATA</strong>: ${navigator.webdriver}</p>
        <p><strong>AVAIABLE CORES</strong>: ${navigator.hardwareConcurrency}</p>
      </fieldset>
    ` },
    archive1: `
      <s>File corrupted! Please download again.</s><br>
      I love astronomy. In the future I want to buy a telescope and look into the void. I hope to bear witness, within the span of my existence, to the monumental event of human alighting upon the Martian soil.
    `,
  }

  addToDialogContents(name, content) { this.DIALOG_CONTENTS[name] = content }

  static getDialogTag() { return document.getElementById('dialog'); }
  static getDialogBodyTag() { return document.getElementById('dialog-body'); }

  static openDialog() {
    const dialog = this.getDialogTag()
    if (!dialog.classList.contains('dialog-open')) {
      dialog.classList.remove('dialog-hidden');
      dialog.classList.add('dialog-open');
    }
  }

  /**
   * Removes the previous dialog contents and its extra CSS classes
   * @returns {HTMLDivElement} the emptied dialog body
   */
  static resetDialogBody() {
    const dialogBody = this.getDialogBodyTag()
    dialogBody.replaceChildren()
    dialogBody.className = 'dialog-body'
    return dialogBody
  }

  static showDialogViaHTML(nodes, cssClass) {
    const dialogBody = this.resetDialogBody()

    this.openDialog()

    dialogBody.append(...nodes)
    dialogBody.classList.add(cssClass)

    ditherImages(dialogBody)
  }

  static showDialogViaString(content) {
    const dialogBody = this.resetDialogBody()

    this.openDialog()

    dialogBody.innerHTML = content

    ditherImages(dialogBody)
  }

  static closeDialog() {
    const dialog = this.getDialogTag()
    dialog.classList.remove('dialog-open')
    dialog.classList.add('dialog-hidden')
    this.resetDialogBody()
    Os.setDefaultDocumentTitle()
  }
}
