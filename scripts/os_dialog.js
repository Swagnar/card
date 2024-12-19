import { applyDithering } from "./utils/dithering.js";

export async function showDialog(keyword) {
  var clientWidth = 800;
  var clientHeight = 600;

  if (keyword === 'properties') {
    var bounds = document.getElementById('desktop').getBoundingClientRect();
    clientWidth = bounds.width;
    clientHeight = bounds.height;
  }

  let dialogContents = {
    about: `
      <p>Made by <a href='https://github.com/Swagnar'>Swagnar</a></p>
      <p>Inspired by <a href='https://kanye2049.com'>Kanye2049</a></p>
    `,
    battery: `
      <p>Battery power provided by YEG Inc. YEG Inc. is not liable for any burns, explosions or airborne carcinogens caused by this battery pack. Battery pack is single (1) use. <u>Do not</u> attempt to recycle</p>
      <div class='dialog-img-wrapper'><img src="static/battery2.jpg" style="display: none;"></div>
    `,
    properties: `
      <fieldset>
        <legend>OS_OS</legend>
        <p><strong>Screen size</strong>: ${clientWidth}px X ${clientHeight}px</p>
        <p><strong>Color depth</strong>: 8-bit</p>
      </fieldset>
      <fieldset>
        <legend>Impostor host</legend>
        <p><strong>OS</strong>: ${navigator.platform.includes('Win') ? 'Windows' :
        navigator.platform.includes('Mac') ? 'Mac OS' :
        navigator.platform.includes('Linux') ? 'Linux' :
        navigator.platform.includes('Iphone') || navigator.platform.includes('ipad') || navigator.platform.includes('ipod') ? 'iOS' :
        navigator.platform.includes('Android') ? 'Android' :
        'Unknown'}</p>
        <p><strong>AGENT</strong>: ${navigator.userAgent}</p>
        <p><strong>AUTOMATA</strong>: ${navigator.webdriver}</p>
        <p><strong>AVAIABLE CORES</strong>: ${navigator.hardwareConcurrency}</p>
      </fieldset>
    `,
    archive1: `
      <s>File corrupted! Please download again.</s><br>
      I love astronomy. In the future I want to buy a telescope and look into the void. I hope to bear witness, within the span of my existence, to the monumental event of human alighting upon the Martian soil.
    `,
  };

  let dialog = document.getElementById('dialog');
  let dialogBody = document.getElementById('dialog-body');

  if (!dialog.classList.contains('dialog-open')) {
    dialog.classList.remove('dialog-hidden');
    dialog.classList.add('dialog-open');
  }

  dialogBody.innerHTML = dialogContents[keyword];

  if (dialogContents[keyword].includes("<img")) {
    try {
      let images = dialogBody.querySelectorAll('img');
      if (images.length === 0) {
        throw new Error('Images not found');
      }
      for (let image of images) {
        let canvas = document.createElement('canvas');
        image.after(canvas);
        applyDithering(image, canvas);
      }
    } catch (er) {
      console.error(er);
    }
  }
}

export function closeDialog() {
  let dialog = document.getElementById('dialog')

  dialog.classList.remove('dialog-open')
  dialog.classList.add('dialog-hidden')
}