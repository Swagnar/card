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

/**
 * @typedef {Object} PlaylistEntry
 * @property {CMusicTrack} track
 * @property {HTMLDivElement} element track row in the tracks list
 * @property {HTMLAudioElement} audio
 * @property {MediaElementAudioSourceNode|null} source created when the track is played for the first time
 */

export default class Choir extends CApp {

  static appName = 'Choir'
  static command = 'showChoir'

  /** @type {CMusicAlbum} */
  currentAlbum;

  /** @type {PlaylistEntry[]} playable tracks of the current album, in the album order */
  #playlist = []

  /** @type {number} index of the current track in the playlist, -1 until a track is played */
  #currentIndex = -1

  /** @type {HTMLCanvasElement} */
  #visualiserCanvas = document.createElement('canvas')

  /** @type {function(): void|null} stops the visualizer, `null` until it's started with the first track */
  #stopVisualizer = null

  infoContainer = document.createElement('div')


  #nextTrackButton = document.createElement('button');
  #prevTrackButton = document.createElement('button');
  #pauseUnpauseTrackButton = document.createElement('button');

  #soundRangeInput = document.createElement('input')

  /** @type {AudioContext} */
  #audioCtx = new window.AudioContext()
  #analyser = this.#audioCtx.createAnalyser()
  #gainNode = this.#audioCtx.createGain()

  constructor() {
    super()
    this.#gainNode.connect(this.#audioCtx.destination)
    this.setVolume(DEFAULT_VOLUME)

    this.window.addClassToWindowBody('choir-body', 'choir-selection-layout');
    this.initElements();
    this.createAlbumSelectionScreen();

    this.window.container.addEventListener('closeWindow', () => this.close())
  }

  /** @returns {PlaylistEntry|undefined} */
  get #currentEntry() {
    return this.#playlist[this.#currentIndex]
  }

  /**
   * Stops the music and releases the audio resources, once the window is closed
   */
  close() {
    this.#currentEntry?.audio.pause()
    this.#stopVisualizer?.()
    this.#audioCtx.close()
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
    this.#nextTrackButton.addEventListener('click', () => this.playTrack(this.#currentIndex + 1))

    this.#prevTrackButton.innerHTML = UI_SYMBOLS.prevSong;
    this.#prevTrackButton.disabled = true;
    this.#prevTrackButton.addEventListener('click', () => this.playTrack(this.#currentIndex - 1))

    this.#pauseUnpauseTrackButton.innerHTML = UI_SYMBOLS.unpause;
    this.#pauseUnpauseTrackButton.dataset.playing = 'false'
    this.#pauseUnpauseTrackButton.role = 'switch'

    this.#pauseUnpauseTrackButton.addEventListener('click', () => {
      const audio = this.#currentEntry?.audio

      // nothing to play until a track is selected
      if(!audio) return

      if(audio.paused) {
        this.#resumeAudioContext()
        audio.play()
      } else {
        audio.pause()
      }
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
    this.#soundRangeInput.value = DEFAULT_VOLUME
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
   * Updates the playback buttons to match the current track and its audio state
   */
  #syncButtons() {
    const audio = this.#currentEntry?.audio
    const playing = Boolean(audio && !audio.paused)

    this.#pauseUnpauseTrackButton.innerHTML = playing ? UI_SYMBOLS.pause : UI_SYMBOLS.unpause
    this.#pauseUnpauseTrackButton.dataset.playing = playing ? 'true' : 'false'

    this.#prevTrackButton.disabled = this.#currentIndex <= 0
    this.#nextTrackButton.disabled = this.#currentIndex < 0 || this.#currentIndex >= this.#playlist.length - 1
  }

  #resumeAudioContext() {
    if(this.#audioCtx.state === 'suspended') {
      this.#audioCtx.resume()
    }
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

      this.window.bodyTag.querySelectorAll('.choir-album-cover').forEach(cover => cover.remove())

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

      // most of the tracks have only metadata and can't be played
      const audio = track.data ? createTrackAudio(track) : null
      const trackContainer = this.createTrackElement(track, audio)

      if(audio) {
        this.#addToPlaylist({ track, element: trackContainer, audio, source: null })
      }

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
   * @param {PlaylistEntry} entry
   */
  #addToPlaylist(entry) {
    const index = this.#playlist.push(entry) - 1

    entry.element.addEventListener('click', () => this.playTrack(index))

    entry.audio.addEventListener('play', () => this.#syncButtons())
    entry.audio.addEventListener('pause', () => this.#syncButtons())
    entry.audio.addEventListener('ended', () => {
      if(index < this.#playlist.length - 1) {
        this.playTrack(index + 1)
      }
    })
  }

  /**
   * Starts playing the track from the beginning, stops the previous one
   * @param {number} index index of the track in the playlist, does nothing if there is no such track
   */
  playTrack(index) {
    const entry = this.#playlist[index]
    if(!entry) return

    const previous = this.#currentEntry
    if(previous) {
      previous.audio.pause()
      previous.element.classList.remove('playing')
    }

    // a media element can be connected to the audio graph only once
    if(!entry.source) {
      entry.source = this.#audioCtx.createMediaElementSource(entry.audio)
      entry.source.connect(this.#gainNode)
      entry.source.connect(this.#analyser)
    }

    this.#currentIndex = index
    entry.element.classList.add('playing')

    this.#resumeAudioContext()
    entry.audio.currentTime = 0
    entry.audio.play()

    this.#stopVisualizer ??= startVisualizer(this.#visualiserCanvas, this.#analyser)
    this.#syncButtons()
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
   * @param {HTMLAudioElement|null} audio audio of the track, `null` if the track can't be played
   * @returns {HTMLDivElement} track row with its number, name and duration
   */
  createTrackElement(track, audio) {
    const trackContainer = document.createElement('div');
    trackContainer.classList.add('choir-playback-track-container');

    const trackIdElement = document.createElement('span');
    const trackNameElement = document.createElement('span');
    const trackDuration = document.createElement('span')

    trackIdElement.innerHTML = `${track.number}`;
    trackNameElement.innerHTML = track.name;

    if(audio) {
      trackContainer.classList.add('playable')

      trackContainer.addEventListener('mouseenter', () => {
        trackIdElement.innerHTML = UI_SYMBOLS.unpause;
      })

      trackContainer.addEventListener('mouseleave', () => {
        trackIdElement.innerHTML = track.number;
      })

      audio.addEventListener('loadedmetadata', () => {
        trackDuration.innerHTML = formatDuration(audio.duration)
      })
    } else {
      trackContainer.classList.add('unavailable')
    }

    trackContainer.append(trackIdElement, trackNameElement, trackDuration);

    return trackContainer
  }

  setVolume(volume) {
    this.#gainNode.gain.value = Math.max(0, Math.min(1, volume)); // Clamp value between 0 and 1
  }
}
