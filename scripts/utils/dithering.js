/**
 * Floyd-Steinberg error diffusion kernel - neighbour offsets and the part of the error they receive
 */
const FLOYD_STEINBERG_KERNEL = [
  { dx:  1, dy: 0, weight: 7 / 16 },
  { dx: -1, dy: 1, weight: 3 / 16 },
  { dx:  0, dy: 1, weight: 5 / 16 },
  { dx:  1, dy: 1, weight: 1 / 16 },
]

/**
 *
 * @param {Uint8ClampedArray} imageData - `data` property of the ImageData. Returned from `ctx.getImageData()`
 * @param {number} width - image width
 * @param {number} height - image height
 */
export default function steinbergFloydDither(imageData, width, height) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4

      const oldPixel = imageData[index]
      const newPixel = oldPixel < 128 ? 0 : 255
      const quantError = oldPixel - newPixel

      imageData[index] = newPixel
      imageData[index + 1] = newPixel
      imageData[index + 2] = newPixel

      for (const { dx, dy, weight } of FLOYD_STEINBERG_KERNEL) {
        const nx = x + dx
        const ny = y + dy
        if (nx < 0 || nx >= width || ny >= height) continue

        const neighbourIndex = (ny * width + nx) * 4
        imageData[neighbourIndex] += quantError * weight
        imageData[neighbourIndex + 1] += quantError * weight
        imageData[neighbourIndex + 2] += quantError * weight
      }
    }
  }
}

/**
 * Resolves once the image is loaded
 * @param {HTMLImageElement} image
 */
function loadImage(image) {
  return new Promise((resolve, reject) => {
    if (image.complete) {
      resolve()
    } else {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('Failed to load image'))
    }
  })
}

/**
 *
 * @param {HTMLImageElement} img
 * @param {HTMLCanvasElement} cnv
 * @param {function} ditheringFunction
 */
export async function applyDithering(img, cnv, ditheringFunction = steinbergFloydDither) {
  await loadImage(img)

  /** @type {CanvasRenderingContext2D} */
  const ctx = cnv.getContext('2d')

  ctx.canvas.width = img.width
  ctx.canvas.height = img.height

  ctx.drawImage(img, 0, 0, img.width, img.height)

  /** @type {ImageData} */
  const imageData = ctx.getImageData(0, 0, img.width, img.height)

  await ditheringFunction(imageData.data, img.width, img.height)
  ctx.putImageData(imageData, 0, 0)
}
