// import { MUSIC_ALBUMS } from '../../resources/MusicAlbums.js';

import CMusicAlbum from './CMusicAlbum.js';
import CMusicTrack from './CMusicTrack.js';

import { applyDithering } from '../../utils/dithering.js';
import CApp from '../yggdrasil/CApp.js';

const UI_SYMBOLS = {
  unpause: "►",
  nextSong: "⏭",
  prevSong: "⏮",
  pause: "⏸"
}

export default class Choir extends CApp {

  /** @type {CMusicTrack} */
  currentTrack;

  /** @type {HTMLAudioElement} */
  #currentTrackAudio

  /** @type {GainNode} */
  #gainNode
 
  /** @type {CMusicAlbum} */
  currentAlbum;

  /** @type {HTMLCanvasElement} */
  #visualiserCanvas = document.createElement('canvas')

  infoContainer = document.createElement('div')


  #nextTrackButton = document.createElement('button');
  #prevTrackButton = document.createElement('button');
  #pauseUnpauseTrackButton = document.createElement('button');

  #soundRangeInput = document.createElement('input')

  /** @type {AudioContext} */
  #audioCtx = new window.AudioContext()
  #analyser;

  constructor() {
    super('Choir', 'showChoir')
    this.window.addClassToWindowBody('choir-body', 'choir-selection-layout');
    this.initElements();
    this.createAlbumSelectionScreen();

    document.addEventListener('closeWindow', () => {
      if(!this.#currentTrackAudio) {
        return
      }
      this.#currentTrackAudio.pause()
    })
  }

  initElements() {

    /*---------------------------------------------//
    //          Creating HTML Buttons              //
    //---------------------------------------------*/

    // ⏭
    this.#nextTrackButton.innerHTML = UI_SYMBOLS.nextSong;
    this.#nextTrackButton.disabled = true;
    
    // ⏮
    this.#prevTrackButton.innerHTML = UI_SYMBOLS.prevSong;
    this.#prevTrackButton.disabled = true;
    
    // ► & ⏸
    this.#pauseUnpauseTrackButton.innerHTML = UI_SYMBOLS.unpause;
    this.#pauseUnpauseTrackButton.dataset.playing = 'false'
    this.#pauseUnpauseTrackButton.role = 'switch'

    // 🔈
    this.#soundRangeInput.type = "range"
    this.#soundRangeInput.step = "0.1"
    this.#soundRangeInput.min = 0
    this.#soundRangeInput.max = 1
    this.#soundRangeInput.setAttribute('orient', 'vertical')
    this.#soundRangeInput.classList.add("choir-volume-range")


    /*---------------------------------------------//
    //          Handle Play/Pause click            //
    //---------------------------------------------*/


    this.#pauseUnpauseTrackButton.addEventListener('click', () => {
      if(this.#audioCtx.state === 'suspended') {
        this.#audioCtx.resume()
      }

      if(this.#pauseUnpauseTrackButton.dataset.playing === 'false') {
        this.unpauseAudio()
      } else if(this.#pauseUnpauseTrackButton.dataset.playing === 'true') {
        this.#currentTrackAudio.pause();
      }
      this.#stateChanged()
    })

    this.#soundRangeInput.addEventListener('input', () => {
      this.setVolume(this.#soundRangeInput.value)
    })

    let btnWrapper = document.createElement('div')
    btnWrapper.classList.add('choir-buttons')

    let volumeControlWrapper = document.createElement('div')
    volumeControlWrapper.classList.add("choir-volume-wrapper")

    const volumeControlBtn = document.createElement('button')
    volumeControlBtn.id = "choir-volume-btn"
    volumeControlBtn.innerText = "🔈"
    volumeControlBtn.addEventListener('click', () => {
      volumeControlInputWrapper.classList.toggle('hidden')
    })

    const volumeControlInputWrapper = document.createElement('div')
    volumeControlInputWrapper.id = "choir-volume-input-wrapper"
    volumeControlInputWrapper.classList.add('hidden')


    volumeControlInputWrapper.append(this.#soundRangeInput)
    volumeControlWrapper.append(volumeControlBtn, volumeControlInputWrapper)

    btnWrapper.append(
      this.#prevTrackButton,
      this.#pauseUnpauseTrackButton,
      this.#nextTrackButton,

      // leaving you here for now
      // TODO: range input CSS
      volumeControlWrapper
    )

    this.#visualiserCanvas.width = this.window.container.clientWidth

    this.window.appendToWindowBody(btnWrapper);
  }

  #stateChanged() {
    if(this.#currentTrackAudio.paused) {
      this.#pauseUnpauseTrackButton.innerHTML = UI_SYMBOLS.unpause

      this.#pauseUnpauseTrackButton.dataset.playing = 'false'
    } else {
      this.#pauseUnpauseTrackButton.innerHTML = UI_SYMBOLS.pause
      this.#pauseUnpauseTrackButton.dataset.playing = 'true'

    }
  }

  async createAlbumSelectionScreen() {
    const { MUSIC_ALBUMS } = await import('../../resources/MusicAlbums.js')
    MUSIC_ALBUMS.forEach(album => {
      if(!(album instanceof CMusicAlbum)) {
        throw new TypeError("Can't read as album")
      } 

      let albumSelection = this.returnAlbumHTML(album, false)

      this.window.appendToWindowBody(albumSelection);

      albumSelection.addEventListener('click', () => {
        this.selectAlbum(album);
      })
    })
  }

  selectAlbum(album) {
    if(!(album instanceof CMusicAlbum)) {
      throw new TypeError("Selected album index is not an album");
    }
    try {
      this.currentAlbum = album;
      
      let covers = document.querySelectorAll("div[class='choir-album-cover']");
      covers.forEach(cover => { cover.remove() })
      
      this.window.removeClassFromWindowBody('choir-selection-layout');
      this.window.addClassToWindowBody('choir-playback-layout');
      
      this.createPlaybackLayout()
    } catch(er) {
      console.error(er);
    }
  }

  createPlaybackLayout() {
    if(!this.currentAlbum || !(this.currentAlbum instanceof CMusicAlbum)) {
      throw new TypeError('Selected album is undefined or not MusicAlbum, got:', this.currentAlbum)
    }
    var tracksContainer = document.createElement('div')
    tracksContainer.classList.add('choir-playback-tracks-container')
    this.currentAlbum.tracks.forEach((track,i) => {

      if(!track || !(track instanceof CMusicTrack)) {
        throw new TypeError('Error while rendering tracks, got:', track);
      }

      const trackContainer = this.returnTrackHTML(track, i)

      // Handle clicking on a listed track and
      // enable control buttons
      trackContainer.addEventListener('click', () => {
        this.handlePlayAudio(track, trackContainer)
      })
      
      
      tracksContainer.append(trackContainer);
    })

    const infoImg = this.returnAlbumHTML(this.currentAlbum, true)
    const infoTitle = document.createElement('h2')
    const infoAuthor = document.createElement('h3')

    infoTitle.innerText = this.currentAlbum.name
    infoAuthor.innerText = this.currentAlbum.author

    infoAuthor.style.margin = 0

    this.infoContainer.append(infoImg, infoTitle, infoAuthor)

    this.window.appendToWindowBody(this.#visualiserCanvas, tracksContainer, this.infoContainer);
  }


  /**
   * Starts playing a new song when selected from numbered list of all music tracks in an album
   * @param {CMusicTrack} track 
   * @param {HTMLDivElement} trackContainer
   * @returns {null} returns null if CMusicTrack data is not defined, this is expected for most tracks
   */
  handlePlayAudio(track, trackContainer) {
    if(!track || !(track instanceof CMusicTrack)) {
      throw new TypeError('Error while playing audio track, got:', track)
    }
    if(!track.data) {
      return
    }
    if(this.#currentTrackAudio) {
      this.#currentTrackAudio.pause()
      this.#currentTrackAudio = null
    }

    // TODO: do it in another way
    // clear all bolded tracks
    Array.from(document.querySelectorAll('.choir-playback-track-container')).map(chptc => chptc.style.fontWeight = "")

    this.#analyser = this.#audioCtx.createAnalyser();
    
    this.#currentTrackAudio = new Audio("data:audio/mpeg;base64," + track.data)
    
    const trackSrc = this.#audioCtx.createMediaElementSource(this.#currentTrackAudio)
    this.#gainNode = this.#audioCtx.createGain()


    trackSrc.connect(this.#gainNode).connect(this.#audioCtx.destination)
    trackSrc.connect(this.#analyser)
    
    this.setVolume(0.3)
    this.unpauseAudio()
    this.startVisualizer()
    trackContainer.style.fontWeight = "bold"

  }

  returnAlbumHTML(album, onlyImg) {
    let coverContainer = document.createElement('div');
    coverContainer.classList.add('choir-album-cover');
  
    let coverDitheringCanvas = document.createElement('canvas')
  
    let cover = document.createElement('img');
    cover.src = `static/${album.cover}`;
  
    applyDithering(cover, coverDitheringCanvas)
  
    if(!onlyImg) {
      let label = document.createElement('span');
      label.innerHTML = `${album.author} - ${album.name}`;
      coverContainer.append(cover, coverDitheringCanvas, label)
    } else {
      coverContainer.append(cover, coverDitheringCanvas)
    }
  
  
    cover.style.display = "none"
    return coverContainer
  }

  /**
 * 
 * @param {CMusicTrack} track 
 * @param {number} index 
 * @returns 
 */
  returnTrackHTML(track) {
    const trackContainer = document.createElement('div');
    trackContainer.classList.add('choir-playback-track-container');

    const trackIdElement = document.createElement('span');
    const trackNameElement = document.createElement('span');
    const trackDuration = document.createElement('span')

    trackIdElement.innerHTML = `${track.number}`;
    trackNameElement.innerHTML = track.name;

    if(track.data) {
      const audio = new Audio("data:audio/mpeg;base64," + track.data)

      trackContainer.addEventListener('mouseenter', () => {
        trackContainer.children[0].innerHTML = "►";
        trackContainer.style.fontWeight = 'bold'
        trackContainer.style.cursor = 'pointer'
      })

      trackContainer.addEventListener('mouseleave', () => {
        trackContainer.children[0].innerHTML = track.number;
        trackContainer.style.fontWeight = 'normal'
      })

      audio.addEventListener('loadedmetadata', () => {
        let duration = audio.duration
        let minutes = Math.floor(duration / 60)
        let secs = Math.floor(duration % 60)
        trackDuration.innerHTML = `${minutes}:${secs.toString().padStart(2, '0')}`
      })
    } else {
      trackContainer.style.color = 'gray'
      trackContainer.style.textDecoration = 'line-through'

    }

    trackContainer.append(trackIdElement, trackNameElement, trackDuration);

    return trackContainer
  }

  startVisualizer() {
    const ctx = this.#visualiserCanvas.getContext('2d');
    const analyser = this.#analyser;
    
    if (!analyser) {
      console.warn('Analyser not initialized!');
      return;
    }
  
    // Classic Mac settings
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.3; // Less smooth for that digital feel
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    // Use actual canvas client dimensions instead of fixed size
    const clientWidth = this.#visualiserCanvas.clientWidth;
    const clientHeight = this.#visualiserCanvas.clientHeight;
    
    this.#visualiserCanvas.width = clientWidth;
    this.#visualiserCanvas.height = clientHeight;
    
    const width = this.#visualiserCanvas.width;
    const height = this.#visualiserCanvas.height;
    
    console.log('Using canvas dimensions:', width, 'x', height);
    
    // Disable anti-aliasing for crisp pixels
    ctx.imageSmoothingEnabled = false;
    
    // Classic Mac dither patterns using simple shapes
    const drawDitherBar = (x, y, barWidth, barHeight, density) => {
      // Always draw something, even for low density
      if (density > 0.75) {
        // Solid black
        ctx.fillStyle = 'black';
        ctx.fillRect(x, y, barWidth, barHeight);
      } else if (density > 0.5) {
        // 75% pattern - mostly filled
        ctx.fillStyle = 'black';
        for (let dy = 0; dy < barHeight; dy++) {
          for (let dx = 0; dx < barWidth; dx++) {
            // Draw all pixels except for every 4th/sparse pattern to leave 25% white
            if ((dx % 2 === 0 && dy % 2 === 0) || (dx % 2 !== 0 && dy % 2 !== 0)) {
               // Draw the checkerboard pattern (50%)
            } else {
               ctx.fillRect(x + dx, y + dy, 1, 1);
            }
          }
        }
      } else if (density > 0.25) {
        // 50% checkerboard pattern
        ctx.fillStyle = 'black';
        for (let dy = 0; dy < barHeight; dy++) {
          for (let dx = 0; dx < barWidth; dx++) {
            // Simple checkerboard: (x+y) % 2 determines the color
            if ((dx + dy) % 2 === 0) {
              ctx.fillRect(x + dx, y + dy, 1, 1);
            }
          }
        }
      } else if (density > 0.05) { // Lower threshold
        // 25% sparse pattern
        ctx.fillStyle = 'black';
        for (let dy = 0; dy < barHeight; dy += 4) {
          for (let dx = 0; dx < barWidth; dx += 4) {
            ctx.fillRect(x + dx, y + dy, 1, 1);
          }
        }
      }
    };
    
    let frameCount = 0;
    
    const renderFrame = () => {
      requestAnimationFrame(renderFrame);
      frameCount++;
      
      analyser.getByteFrequencyData(dataArray);
      
      // Classic white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);
      
      // Oscilloscope-style waveform (top half)
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1;
      
      // Get time domain data for waveform
      const waveArray = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(waveArray);
      
      ctx.beginPath();
      const waveHeight = height * 0.4;
      const waveY = waveHeight / 2;
      
      for (let i = 0; i < waveArray.length; i++) {
        const x = (i / waveArray.length) * width;
        const y = waveY + ((waveArray[i] - 128) / 128) * (waveHeight / 2);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      
      const barAreaY = waveHeight + 20;
      const barAreaHeight = height - waveHeight - 20;

      const numBars = 128;
      const barWidth = width / numBars; // Use a constant bar width

      for (let i = 0; i < numBars; i++) {
        
        // Stronger log scaling - cube instead of square
        const logIndex = Math.pow(i / (numBars - 1), 3.0) * (bufferLength - 1);
        const idx = Math.floor(logIndex);

        // Average small neighborhood
        const windowSize = 6;
        let sum = 0;
        let count = 0;
        for (let j = -windowSize; j <= windowSize; j++) {
          const k = idx + j;
          if (k >= 0 && k < bufferLength) {
            sum += dataArray[k];
            count++;
          }
        }
        let value = sum / count;

        // Boost highs so they don’t look dead
        const highBoost = 1 + (i / numBars) * 1.5; // up to 2.5x
        value *= highBoost;

        const barLeft = i * barWidth;
        const barWidthActual = Math.ceil(barWidth); // Use an integer width for sharp pixels

        const barHeight = Math.max(8, Math.floor((value / 255) * barAreaHeight));
        const quantizedHeight = Math.floor(barHeight / 4) * 4;
        const y = barAreaY + barAreaHeight - quantizedHeight;

        
        // --- FIX: Apply dither to the top 'cap' of the bar ---
        const ditherCapHeight = 4; // Height of the dithered section at the top
        const ditherY = y;
        const solidY = y + ditherCapHeight;
        const solidHeight = quantizedHeight - ditherCapHeight;
        const density = Math.max(0.05, value / 255); // Use the calculated density

        // 1. Draw the solid black base (only if there is space after the cap)
        if (solidHeight > 0) {
          ctx.fillStyle = 'black';
          ctx.fillRect(Math.floor(barLeft), solidY, barWidthActual, solidHeight);
        }

        // 2. Draw the dithered cap on top
        drawDitherBar(
            Math.floor(barLeft), 
            ditherY, 
            barWidthActual, 
            ditherCapHeight, 
            density // Pass density for the pattern
        );

        // --- End Fix ---
      }
      
      // Volume level indicator (classic Mac style) - top right
      const avgVolume = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      const volumeBlocks = Math.floor((avgVolume / 255) * 10);
      
      for (let i = 0; i < 10; i++) {
        const blockX = width - 130 + i * 12;
        const blockY = 5;
        
        if (i < volumeBlocks) {
          ctx.fillStyle = 'black';
          ctx.fillRect(blockX, blockY, 8, 8);
        } else {
          ctx.strokeStyle = 'black';
          ctx.strokeRect(blockX, blockY, 8, 8);
        }
      }
      
      // Classic Mac "breathing" indicator - top left
      if (frameCount % 60 < 30) { // Blinks every second
        ctx.fillStyle = 'black';
        ctx.fillRect(5, 5, 8, 8);
      }
    };
    
    renderFrame();
  }

  setVolume(volume) {
    if (this.#gainNode) {
      this.#gainNode.gain.value = Math.max(0, Math.min(1, volume)); // Clamp value between 0 and 1
    } else {
      console.warn('Gain node is not initialized.');
    }
  }

  unpauseAudio() {
    this.#currentTrackAudio.play()
    this.#stateChanged()
  }

  showPlayer() { this.window.showWindow() }

}