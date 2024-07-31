export function steinbergFloydDither(imageData, width, height) {
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