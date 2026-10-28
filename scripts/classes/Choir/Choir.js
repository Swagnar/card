import CMusicAlbum from './CMusicAlbum.js';
import CMusicTrack from './CMusicTrack.js';
import { startVisualizer } from './ChoirVisualizer.js';

import { applyDithering } from '../../utils/dithering.js';
import CApp from '../yggdrasil/CApp.js';

const UI_SYMBOLS = {
  unpause: "►",
  nextSong: "⏭",
  prevSong: "⏮",
  pause: "⏸"
}

const DEFAULT_VOLUME = 0.3

/**
 * @param {CMusicTrack} track
 * @returns {HTMLAudioElement}
 */
function createTrackAudio(track) {
  return new Audio("data:audio/mpeg;base64," + track.data)
}

/**
 * @param {number} duration in seconds
 * @returns {string} duration in `m:ss` format
 */
function formatDuration(duration) {
  const minutes = Math.floor(duration / 60)
  const secs = Math.floor(duration % 60)
  return `${minutes}:${secs.toString().padStart(2, '0')}`
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
      this.#currentTrackAudio?.pause()
    })
  }

  initElements() {
    const btnWrapper = document.createElement('div')
    btnWrapper.classList.add('choir-buttons')

    btnWrapper.append(
      ...this.#createPlaybackButtons(),

      // leaving you here for now
      // TODO: range input CSS
      this.#createVolumeControl()
    )

    this.#visualiserCanvas.width = this.window.container.clientWidth

    this.window.appendToWindowBody(btnWrapper);
  }

  /**
   * @returns {HTMLButtonElement[]} ⏮, ► and ⏭ buttons
   */
  #createPlaybackButtons() {
    this.#nextTrackButton.innerHTML = UI_SYMBOLS.nextSong;
    this.#nextTrackButton.disabled = true;

    this.#prevTrackButton.innerHTML = UI_SYMBOLS.prevSong;
    this.#prevTrackButton.disabled = true;

    this.#pauseUnpauseTrackButton.innerHTML = UI_SYMBOLS.unpause;
    this.#pauseUnpauseTrackButton.dataset.playing = 'false'
    this.#pauseUnpauseTrackButton.role = 'switch'

    this.#pauseUnpauseTrackButton.addEventListener('click', () => {
      if(this.#audioCtx.state === 'suspended') {
        this.#audioCtx.resume()
      }

      if(this.#pauseUnpauseTrackButton.dataset.playing === 'false') {
        this.unpauseAudio()
      } else if(this.#pauseUnpauseTrackButton.dataset.playing === 'true') {
        this.#currentTrackAudio.pause();
      }
      this.#syncPlayButton()
    })

    return [this.#prevTrackButton, this.#pauseUnpauseTrackButton, this.#nextTrackButton]
  }

  /**
   * @returns {HTMLDivElement} 🔈 button that toggles the volume range input
   */
  #createVolumeControl() {
    this.#soundRangeInput.type = "range"
    this.#soundRangeInput.step = "0.1"
    this.#soundRangeInput.min = 0
    this.#soundRangeInput.max = 1
    this.#soundRangeInput.setAttribute('orient', 'vertical')
    this.#soundRangeInput.classList.add("choir-volume-range")

    this.#soundRangeInput.addEventListener('input', () => {
      this.setVolume(this.#soundRangeInput.value)
    })

    const volumeControlInputWrapper = document.createElement('div')
    volumeControlInputWrapper.id = "choir-volume-input-wrapper"
    volumeControlInputWrapper.classList.add('hidden')
    volumeControlInputWrapper.append(this.#soundRangeInput)

    const volumeControlBtn = document.createElement('button')
    volumeControlBtn.id = "choir-volume-btn"
    volumeControlBtn.innerText = "🔈"
    volumeControlBtn.addEventListener('click', () => {
      volumeControlInputWrapper.classList.toggle('hidden')
    })

    const volumeControlWrapper = document.createElement('div')
    volumeControlWrapper.classList.add("choir-volume-wrapper")
    volumeControlWrapper.append(volumeControlBtn, volumeControlInputWrapper)

    return volumeControlWrapper
  }

  /**
   * Updates the play/pause button to match the current audio state
   */
  #syncPlayButton() {
    const paused = this.#currentTrackAudio.paused

    this.#pauseUnpauseTrackButton.innerHTML = paused ? UI_SYMBOLS.unpause : UI_SYMBOLS.pause
    this.#pauseUnpauseTrackButton.dataset.playing = paused ? 'false' : 'true'
  }

  async createAlbumSelectionScreen() {
    const { MUSIC_ALBUMS } = await import('../../resources/MusicAlbums.js')
    MUSIC_ALBUMS.forEach(album => {
      if(!(album instanceof CMusicAlbum)) {
        throw new TypeError("Can't read as album")
      }

      const albumSelection = this.createAlbumElement(album, false)

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

      document.querySelectorAll("div[class='choir-album-cover']").forEach(cover => cover.remove())

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
    const tracksContainer = document.createElement('div')
    tracksContainer.classList.add('choir-playback-tracks-container')

    this.currentAlbum.tracks.forEach(track => {
      if(!track || !(track instanceof CMusicTrack)) {
        throw new TypeError('Error while rendering tracks, got:', track);
      }

      const trackContainer = this.createTrackElement(track)

      trackContainer.addEventListener('click', () => {
        this.handlePlayAudio(track, trackContainer)
      })

      tracksContainer.append(trackContainer);
    })

    const infoImg = this.createAlbumElement(this.currentAlbum, true)
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
   * @returns {undefined} returns early if CMusicTrack data is not defined, this is expected for most tracks
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
    document.querySelectorAll('.choir-playback-track-container').forEach(el => el.style.fontWeight = "")

    this.#analyser = this.#audioCtx.createAnalyser();

    this.#currentTrackAudio = createTrackAudio(track)

    const trackSrc = this.#audioCtx.createMediaElementSource(this.#currentTrackAudio)
    this.#gainNode = this.#audioCtx.createGain()

    trackSrc.connect(this.#gainNode).connect(this.#audioCtx.destination)
    trackSrc.connect(this.#analyser)

    this.setVolume(DEFAULT_VOLUME)
    this.unpauseAudio()
    startVisualizer(this.#visualiserCanvas, this.#analyser)
    trackContainer.style.fontWeight = "bold"
  }

  /**
   * @param {CMusicAlbum} album
   * @param {boolean} onlyImg if false, the cover has a label with the album author and name
   * @returns {HTMLDivElement} dithered album cover
   */
  createAlbumElement(album, onlyImg) {
    const coverContainer = document.createElement('div');
    coverContainer.classList.add('choir-album-cover');

    const coverDitheringCanvas = document.createElement('canvas')

    const cover = document.createElement('img');
    cover.src = `static/${album.cover}`;

    applyDithering(cover, coverDitheringCanvas)

    coverContainer.append(cover, coverDitheringCanvas)

    if(!onlyImg) {
      const label = document.createElement('span');
      label.innerHTML = `${album.author} - ${album.name}`;
      coverContainer.append(label)
    }

    cover.style.display = "none"
    return coverContainer
  }

  /**
   * @param {CMusicTrack} track
   * @returns {HTMLDivElement} track row with its number, name and duration
   */
  createTrackElement(track) {
    const trackContainer = document.createElement('div');
    trackContainer.classList.add('choir-playback-track-container');

    const trackIdElement = document.createElement('span');
    const trackNameElement = document.createElement('span');
    const trackDuration = document.createElement('span')

    trackIdElement.innerHTML = `${track.number}`;
    trackNameElement.innerHTML = track.name;

    if(track.data) {
      trackContainer.addEventListener('mouseenter', () => {
        trackIdElement.innerHTML = UI_SYMBOLS.unpause;
        trackContainer.style.fontWeight = 'bold'
        trackContainer.style.cursor = 'pointer'
      })

      trackContainer.addEventListener('mouseleave', () => {
        trackIdElement.innerHTML = track.number;
        trackContainer.style.fontWeight = 'normal'
      })

      const audio = createTrackAudio(track)
      audio.addEventListener('loadedmetadata', () => {
        trackDuration.innerHTML = formatDuration(audio.duration)
      })
    } else {
      trackContainer.style.color = 'gray'
      trackContainer.style.textDecoration = 'line-through'
    }

    trackContainer.append(trackIdElement, trackNameElement, trackDuration);

    return trackContainer
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
    this.#syncPlayButton()
  }

  showPlayer() { this.window.showWindow() }

}
