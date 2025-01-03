import { MUSIC_ALBUMS } from '../../resources/MusicAlbums.js';

import CMusicAlbum from './CMusicAlbum.js';
import CMusicTrack from './CMusicTrack.js';
import OsWindow from '../os/OsWindow.js';

import { applyDithering } from '../../utils/dithering.js';

const UI_SYMBOLS = {
  play: "►",
  nextSong: "⏭",
  prevSong: "⏮",
  pause: "⏸"
}


function returnTrackHTML(track, index) {
  let trackContainer = document.createElement('div');
  trackContainer.classList.add('choir-playback-track-container');

  let trackIdElement = document.createElement('span');
  let trackNameElement = document.createElement('span');

  trackIdElement.innerHTML = `${track.number}`;
  trackNameElement.innerHTML = track.name;

  trackContainer.append(trackIdElement, trackNameElement);

  return trackContainer
}

function returnAlbumHTML(album) {
  let coverContainer = document.createElement('div');
  coverContainer.classList.add('choir-album-cover');

  let coverDitheringCanvas = document.createElement('canvas')

  let cover = document.createElement('img');
  cover.src = `static/${album.cover}`;

  applyDithering(cover, coverDitheringCanvas)

  let label = document.createElement('span');
  label.innerHTML = `${album.author} - ${album.name}`;

  coverContainer.append(cover, coverDitheringCanvas, label)

  cover.style.display = "none"
  return coverContainer
}

export default class Choir {

  /** @type {OsWindow} */
  #window

  /** @type {CMusicTrack} */
  currentTrack;

  /** @type {HTMLAudioElement} */
  #currentTrackAudio

  /** @type {GainNode} */
  #gainNode
 
  /** @type {CMusicAlbum} */
  currentAlbum;


  // #isPlaying = false;

  #nextTrackButton = document.createElement('button');
  #prevTrackButton = document.createElement('button');
  #playTrackButton = document.createElement('button');

  // TODO: CSS
  #soundRangeInput = document.createElement('input')

  #visualiserCanvas = document.createElement('canvas');
  #visualiserCtx = this.#visualiserCanvas.getContext('2d');

  /** @type {AudioContext} */
  #audioCtx;
  #analyser;

  constructor(root) {

    this.#window = new OsWindow('[ CHOIR ]', 'choir');
    this.#window.addClassToWindowBody('choir-body', 'choir-selection-layout');

    root.append(this.#window.container);
    
    this.initElements();
    this.createAlbumSelectionScreen();

  }

  #stateChanged() {
    if(this.#currentTrackAudio.paused) {
      this.#playTrackButton.innerHTML = UI_SYMBOLS.play
      this.#playTrackButton.dataset.playing = 'false'
      // this.#playTrackButton.onclick = this.handlePlayAudio(this.#currentTrackAudio)
      // this.#playTrackButton.onclick = this.handleResumeAudio
    } else {
      this.#playTrackButton.innerHTML = UI_SYMBOLS.pause
      this.#playTrackButton.dataset.playing = 'true'

      // this.#playTrackButton.onclick = this.handlePauseAudio
    }
  }


  createAlbumSelectionScreen() {
    MUSIC_ALBUMS.forEach(album => {
      if(!album instanceof CMusicAlbum) {
        throw new TypeError("Can't read as album")
      } 

      let albumSelection = returnAlbumHTML(album)

      this.#window.appendToWindowBody(albumSelection);

      albumSelection.addEventListener('click', () => {
        this.selectAlbum(album);
      })
    })
  }

  selectAlbum(album) {
    if(!album instanceof CMusicAlbum) {
      throw new TypeError("Selected album index is not an album");
    }
    try {
      this.currentAlbum = album;
      
      let covers = document.querySelectorAll("div[class='choir-album-cover']");
      covers.forEach(cover => { cover.remove() })
      
      this.#window.removeClassFromWindowBody('choir-selection-layout');
      this.#window.addClassToWindowBody('choir-playback-layout');
      
      this.createPlaybackLayout()
    } catch(er) {
      console.error(er);
    }
  }

  createPlaybackLayout() {
    
    if(!this.currentAlbum || !this.currentAlbum instanceof CMusicAlbum) {
      throw new TypeError('Selected album is undefined or not MusicAlbum, got:', this.currentAlbum)
    }
    var tracksContainer = document.createElement('div')
    tracksContainer.classList.add('choir-playback-tracks-container')
    console.log(this.currentAlbum)
    this.currentAlbum.tracks.forEach((track,i) => {

      if(!track || !track instanceof CMusicTrack ) {
        throw new TypeError('Error while rendering tracks, got:', track);
      }

      let trackContainer = returnTrackHTML(track, i)

      // Handle clicking on a listed track and
      // enable control buttons
      trackContainer.addEventListener('click', () => {
        this.handlePlayAudio(track)
        [this.#nextTrackButton, this.#prevTrackButton, this.#playTrackButton].forEach(btn => btn.disabled=false)
      })

      trackContainer.addEventListener('mouseenter', () => {
        trackContainer.children[0].innerHTML = "►";
      })

      trackContainer.addEventListener('mouseleave', () => {
        trackContainer.children[0].innerHTML = track.number;
      })
      
      tracksContainer.append(trackContainer);
    })

    this.#window.appendToWindowBody(this.#visualiserCanvas, tracksContainer);
  }

  initElements() {
    this.#nextTrackButton.innerHTML = UI_SYMBOLS.nextSong;
    this.#nextTrackButton.disabled = true;
    
    this.#prevTrackButton.innerHTML = UI_SYMBOLS.prevSong;
    this.#prevTrackButton.disabled = true;

    this.#playTrackButton.innerHTML = UI_SYMBOLS.play;
    this.#playTrackButton.disabled = true;
    this.#playTrackButton.dataset.playing = 'false'
    this.#playTrackButton.role = 'switch'

    this.#soundRangeInput.type = "range"
    this.#soundRangeInput.step = "0.1"
    this.#soundRangeInput.min = 0
    this.#soundRangeInput.max = 1
    this.#soundRangeInput.setAttribute('orient', 'vertical')
    this.#soundRangeInput.classList.add("choir-volume-range")

    this.#playTrackButton.addEventListener('click', () => {
      if(this.#audioCtx.state === 'suspended') {
        this.#audioCtx.resume()
      }

      if(this.#playTrackButton.dataset.playing === 'false') {
        this.#currentTrackAudio.play();
      } else if(this.#playTrackButton.dataset.playing === 'true') {
        this.#currentTrackAudio.pause();
      }
      this.#stateChanged()
    })

    // the debt has started to call from the void
    //
    // if i dont implicitly say to turn off the 
    // draggable on the OsWindow, the whole window
    // drags with the slider input
    this.#soundRangeInput.addEventListener('mousedown', (ev) => {
      this.#window.container.draggable = false
    })  

    // duh, you have to turn it on again
    this.#soundRangeInput.addEventListener('mouseup', (ev) => {
      this.#window.container.draggable = true
    })  

    // just set the fucking volume
    this.#soundRangeInput.addEventListener('input', () => {
      this.setVolume(this.#soundRangeInput.value)
    })

    let btnWrapper = document.createElement('div')
    btnWrapper.classList.add('choir-buttons')

    let volumeControlWrapper = document.createElement('div')
    volumeControlWrapper.classList.add("choir-volume-wrapper")

    let volumeControlBtn = document.createElement('button')
    volumeControlBtn.id = "choir-volume-btn"
    volumeControlBtn.innerText = "🔈"
    volumeControlBtn.addEventListener('click', () => {
      volumeControlInputWrapper.classList.toggle('hidden')
    })

    let volumeControlInputWrapper = document.createElement('div')
    volumeControlInputWrapper.id = "choir-volume-input-wrapper"
    volumeControlInputWrapper.classList.add('hidden')

    volumeControlInputWrapper.append(this.#soundRangeInput)
    volumeControlWrapper.append(volumeControlBtn, volumeControlInputWrapper)

    btnWrapper.append(
      this.#prevTrackButton,
      this.#playTrackButton,
      this.#nextTrackButton,

      // leaving you here for now
      // TODO: range input CSS
      volumeControlWrapper
    )

    this.#window.appendToWindowBody(btnWrapper);
  }

  handlePlayAudio(track) {
    if(!track || !track instanceof CMusicTrack) {
      throw new TypeError('Error while playing audio track, got:', track)
    }

    // TODO: visualizer stuff
    /** @type {AudioContext} */
    this.#audioCtx = new window.AudioContext();
    this.#analyser = this.#audioCtx.createAnalyser();

    this.#currentTrackAudio = new Audio("data:audio/mpeg;base64," + track.data)
    
    const trackSrc = this.#audioCtx.createMediaElementSource(this.#currentTrackAudio)
    this.#gainNode = this.#audioCtx.createGain()
    trackSrc.connect(this.#gainNode).connect(this.#audioCtx.destination)

    this.setVolume(0.5)

    this.playAudio()
  }

  playAudio() {
    this.#currentTrackAudio.play()
    this.#stateChanged()
  }


  setVolume(volume) {
    if (this.#gainNode) {
      this.#gainNode.gain.value = Math.max(0, Math.min(1, volume)); // Clamp value between 0 and 1
    } else {
      console.warn('Gain node is not initialized.');
    }
  }

  showPlayer() { this.#window.showWindow() }

}