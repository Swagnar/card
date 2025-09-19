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
    const ctx = this.#visualiserCanvas.getContext('2d')

    const analyser = this.#analyser; // <-- use the existing one
    if (!analyser) {
      console.warn('Analyser not initialized!');
      return;
    }

    analyser.fftSize = 128; // MASSIVELY reduced fidelity
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.#visualiserCanvas.width = 500
    const width = this.#visualiserCanvas.width;
    const height = this.#visualiserCanvas.height;
    const barWidth = Math.floor(width / bufferLength);

    ctx.imageSmoothingEnabled = false; // no anti-aliasing allowed

    let glitchOffset = 0;

    const renderFrame = () => {
      setTimeout(() => requestAnimationFrame(renderFrame), 24); // 10 FPS MAX, like it's running on a toaster

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = 'black';

      let x = glitchOffset; // make the whole thing jitter for "glitch" feel

      for (let i = 0; i < bufferLength; i++) {
        let value = dataArray[i];

        if (Math.random() < 0.1) {
          value = value * 0.3; // simulate shitty signal by randomly weakening bars
        }

        const barHeight = Math.floor((value / 255) * height / 8) * 8; // big chunky pixel blocks
        ctx.fillRect(x, height - barHeight, barWidth + 10, barHeight);
        x += barWidth + 10;
      }

      glitchOffset = (glitchOffset + (Math.random() > 0.9 ? 1 : 0)) % 3; // slight horizontal jitter
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