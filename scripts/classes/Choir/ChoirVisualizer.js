// Classic Mac settings
const FFT_SIZE = 256
const SMOOTHING_TIME_CONSTANT = 0.3 // Less smooth for that digital feel

// Oscilloscope takes the top part of the canvas, the bars are drawn below it
const WAVEFORM_HEIGHT_RATIO = 0.4
const WAVEFORM_BARS_GAP = 20

const NUM_BARS = 128
const BAR_NEIGHBOURHOOD = 6
const BAR_MIN_HEIGHT = 8
const BAR_HEIGHT_STEP = 4
const DITHER_CAP_HEIGHT = 4
const MIN_DITHER_DENSITY = 0.05

const VOLUME_BLOCKS = 10
const VOLUME_BLOCK_SIZE = 8
const VOLUME_BLOCK_SPACING = 12

/**
 * Draws a block filled with a classic Mac dither pattern, the denser the darker
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {number} density value between 0 and 1
 */
function drawDitherBlock(ctx, x, y, width, height, density) {
  if (density <= MIN_DITHER_DENSITY) return

  ctx.fillStyle = 'black'

  if (density > 0.75) {
    // Solid black
    ctx.fillRect(x, y, width, height)
  } else if (density > 0.5) {
    // Checkerboard, offset from the 50% one
    fillPixels(ctx, x, y, width, height, 1, (dx, dy) => (dx + dy) % 2 !== 0)
  } else if (density > 0.25) {
    // 50% checkerboard pattern
    fillPixels(ctx, x, y, width, height, 1, (dx, dy) => (dx + dy) % 2 === 0)
  } else {
    // 25% sparse pattern
    fillPixels(ctx, x, y, width, height, 4, () => true)
  }
}

/**
 * Fills single pixels of the block, every `step` pixels, for which `shouldFill` returns true
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {number} step
 * @param {function(number, number): boolean} shouldFill
 */
function fillPixels(ctx, x, y, width, height, step, shouldFill) {
  for (let dy = 0; dy < height; dy += step) {
    for (let dx = 0; dx < width; dx += step) {
      if (shouldFill(dx, dy)) {
        ctx.fillRect(x + dx, y + dy, 1, 1)
      }
    }
  }
}

/**
 * Oscilloscope-style waveform
 * @param {CanvasRenderingContext2D} ctx
 * @param {Uint8Array} waveArray time domain data
 * @param {number} width
 * @param {number} waveHeight
 */
function drawWaveform(ctx, waveArray, width, waveHeight) {
  const waveY = waveHeight / 2

  ctx.strokeStyle = 'black'
  ctx.lineWidth = 1
  ctx.beginPath()

  for (let i = 0; i < waveArray.length; i++) {
    const x = (i / waveArray.length) * width
    const y = waveY + ((waveArray[i] - 128) / 128) * (waveHeight / 2)

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  ctx.stroke()
}

/**
 * @param {Uint8Array} dataArray frequency data
 * @param {number} barIndex
 * @returns {number} averaged and boosted bar value
 */
function getBarValue(dataArray, barIndex) {
  const bufferLength = dataArray.length

  // Stronger log scaling - cube instead of square
  const logIndex = Math.pow(barIndex / (NUM_BARS - 1), 3.0) * (bufferLength - 1)
  const idx = Math.floor(logIndex)

  // Average small neighborhood
  let sum = 0
  let count = 0
  for (let j = -BAR_NEIGHBOURHOOD; j <= BAR_NEIGHBOURHOOD; j++) {
    const k = idx + j
    if (k >= 0 && k < bufferLength) {
      sum += dataArray[k]
      count++
    }
  }

  // Boost highs so they don’t look dead, up to 2.5x
  const highBoost = 1 + (barIndex / NUM_BARS) * 1.5
  return (sum / count) * highBoost
}

/**
 * Frequency bars with a dithered cap on top
 * @param {CanvasRenderingContext2D} ctx
 * @param {Uint8Array} dataArray frequency data
 * @param {number} width
 * @param {number} areaY top of the bars area
 * @param {number} areaHeight
 */
function drawBars(ctx, dataArray, width, areaY, areaHeight) {
  const barWidth = width / NUM_BARS
  const barWidthActual = Math.ceil(barWidth) // Use an integer width for sharp pixels

  for (let i = 0; i < NUM_BARS; i++) {
    const value = getBarValue(dataArray, i)
    const barLeft = Math.floor(i * barWidth)

    const barHeight = Math.max(BAR_MIN_HEIGHT, Math.floor((value / 255) * areaHeight))
    const quantizedHeight = Math.floor(barHeight / BAR_HEIGHT_STEP) * BAR_HEIGHT_STEP
    const y = areaY + areaHeight - quantizedHeight

    const solidHeight = quantizedHeight - DITHER_CAP_HEIGHT
    if (solidHeight > 0) {
      ctx.fillStyle = 'black'
      ctx.fillRect(barLeft, y + DITHER_CAP_HEIGHT, barWidthActual, solidHeight)
    }

    const density = Math.max(MIN_DITHER_DENSITY, value / 255)
    drawDitherBlock(ctx, barLeft, y, barWidthActual, DITHER_CAP_HEIGHT, density)
  }
}

/**
 * Volume level indicator (classic Mac style) - top right
 * @param {CanvasRenderingContext2D} ctx
 * @param {Uint8Array} dataArray frequency data
 * @param {number} width
 */
function drawVolumeMeter(ctx, dataArray, width) {
  const avgVolume = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
  const volumeBlocks = Math.floor((avgVolume / 255) * VOLUME_BLOCKS)

  for (let i = 0; i < VOLUME_BLOCKS; i++) {
    const blockX = width - 130 + i * VOLUME_BLOCK_SPACING
    const blockY = 5

    if (i < volumeBlocks) {
      ctx.fillStyle = 'black'
      ctx.fillRect(blockX, blockY, VOLUME_BLOCK_SIZE, VOLUME_BLOCK_SIZE)
    } else {
      ctx.strokeStyle = 'black'
      ctx.strokeRect(blockX, blockY, VOLUME_BLOCK_SIZE, VOLUME_BLOCK_SIZE)
    }
  }
}

/**
 * Starts drawing the retro audio visualizer on the canvas
 * @param {HTMLCanvasElement} canvas
 * @param {AnalyserNode} analyser
 */
export function startVisualizer(canvas, analyser) {
  const ctx = canvas.getContext('2d')

  if (!analyser) {
    console.warn('Analyser not initialized!')
    return
  }

  analyser.fftSize = FFT_SIZE
  analyser.smoothingTimeConstant = SMOOTHING_TIME_CONSTANT

  const dataArray = new Uint8Array(analyser.frequencyBinCount)
  const waveArray = new Uint8Array(analyser.fftSize)

  // Use actual canvas client dimensions instead of fixed size
  canvas.width = canvas.clientWidth
  canvas.height = canvas.clientHeight

  const width = canvas.width
  const height = canvas.height

  console.log('Using canvas dimensions:', width, 'x', height)

  // Disable anti-aliasing for crisp pixels
  ctx.imageSmoothingEnabled = false

  const waveHeight = height * WAVEFORM_HEIGHT_RATIO
  const barAreaY = waveHeight + WAVEFORM_BARS_GAP
  const barAreaHeight = height - waveHeight - WAVEFORM_BARS_GAP

  let frameCount = 0

  const renderFrame = () => {
    requestAnimationFrame(renderFrame)
    frameCount++

    analyser.getByteFrequencyData(dataArray)
    analyser.getByteTimeDomainData(waveArray)

    // Classic white background
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, width, height)

    drawWaveform(ctx, waveArray, width, waveHeight)
    drawBars(ctx, dataArray, width, barAreaY, barAreaHeight)
    drawVolumeMeter(ctx, dataArray, width)

    // Classic Mac "breathing" indicator - top left, blinks every second
    if (frameCount % 60 < 30) {
      ctx.fillStyle = 'black'
      ctx.fillRect(5, 5, 8, 8)
    }
  }

  renderFrame()
}
