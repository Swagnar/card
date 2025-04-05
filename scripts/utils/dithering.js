/**
 * 
 * @param {Uint8ClampedArray} imageData - `data` property of the ImageData. Returned from `ctx.getImageData()`
 * @param {number} width - image width
 * @param {number} height - image height
 */
export default function steinbergFloydDither(imageData, width, height) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
        let index = (y * width + x) * 4;

        let oldPixel = imageData[index];
        let newPixel = oldPixel < 128 ? 0 : 255;
        let quantError = oldPixel - newPixel;

        imageData[index] = newPixel;
        imageData[index + 1] = newPixel;
        imageData[index + 2] = newPixel;

        if (x + 1 < width) {
            imageData[(y * width + x + 1) * 4] += quantError * 7 / 16;
            imageData[(y * width + x + 1) * 4 + 1] += quantError * 7 / 16;
            imageData[(y * width + x + 1) * 4 + 2] += quantError * 7 / 16;
        }
        if (x - 1 >= 0 && y + 1 < height) {
            imageData[((y + 1) * width + x - 1) * 4] += quantError * 3 / 16;
            imageData[((y + 1) * width + x - 1) * 4 + 1] += quantError * 3 / 16;
            imageData[((y + 1) * width + x - 1) * 4 + 2] += quantError * 3 / 16;
        }
        if (y + 1 < height) {
            imageData[((y + 1) * width + x) * 4] += quantError * 5 / 16;
            imageData[((y + 1) * width + x) * 4 + 1] += quantError * 5 / 16;
            imageData[((y + 1) * width + x) * 4 + 2] += quantError * 5 / 16;
        }
        if (x + 1 < width && y + 1 < height) {
            imageData[((y + 1) * width + x + 1) * 4] += quantError * 1 / 16;
            imageData[((y + 1) * width + x + 1) * 4 + 1] += quantError * 1 / 16;
            imageData[((y + 1) * width + x + 1) * 4 + 2] += quantError * 1 / 16;
        }
    }
}
}
/**
 * 
 * @param {HTMLImageElement} img 
 * @param {HTMLCanvasElement} cnv 
 * @param {steinbergFloydDither} ditheringFunction 
 */
export async function applyDithering(img, cnv, ditheringFunction = steinbergFloydDither) {
    async function loadImage(image) {
        return new Promise((resolve, reject) => {
          if (image.complete) {
            resolve();
          } else {
            image.onload = () => resolve();
            image.onerror = () => reject(new Error('Failed to load image'));
          }
        });
      }

    await loadImage(img)

    /** @type {CanvasRenderingContext2D} */
    let ctx = cnv.getContext('2d');
  
    ctx.canvas.width = img.width;
    ctx.canvas.height = img.height;
  
    ctx.drawImage(img, 0, 0, img.width, img.height);
  
    /** @type {ImageData} */
    let imageData = ctx.getImageData(0, 0, img.width, img.height);
    
    /** @type {Uint8ClampedArray} */
    let data = imageData.data;
  
    await ditheringFunction(data, img.width, img.height);
    ctx.putImageData(imageData, 0, 0);
  }