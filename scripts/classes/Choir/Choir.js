import { MUSIC_ALBUMS } from '../../resources/MusicAlbums.js';

import CMusicAlbum from './CMusicAlbum.js';
import CMusicTrack from './CMusicTrack.js';
import OsWindow from '../os/OsWindow.js';

import { applyDithering } from '../../utils/dithering.js';

const UI_SYMBOLS = {
  unpause: "►",
  nextSong: "⏭",
  prevSong: "⏮",
  pause: "⏸"
}

/**
 * 
 * @param {CMusicTrack} track 
 * @param {number} index 
 * @returns 
 */
function returnTrackHTML(track, index) {
  const trackContainer = document.createElement('div');
  trackContainer.classList.add('choir-playback-track-container');

  const trackIdElement = document.createElement('span');
  const trackNameElement = document.createElement('span');
  const trackDuration = document.createElement('span')

  trackIdElement.innerHTML = `${track.number}`;
  trackNameElement.innerHTML = track.name;

  let audio = new Audio("data:audio/mpeg;base64," + track.data)
  audio.addEventListener('loadedmetadata', () => {
    let duration = audio.duration
    let minutes = Math.floor(duration / 60)
    let secs = Math.floor(duration % 60)
    trackDuration.innerHTML = `${minutes}:${secs.toString().padStart(2, '0')}`
  })
    

  trackContainer.append(trackIdElement, trackNameElement, trackDuration);

  return trackContainer
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

  /** @type {HTMLCanvasElement} */
  #visualiserCanvas = document.createElement('canvas')


  // #isPlaying = false;

  #nextTrackButton = document.createElement('button');
  #prevTrackButton = document.createElement('button');
  #pauseUnpauseTrackButton = document.createElement('button');

  // TODO: CSS
  #soundRangeInput = document.createElement('input')


  /** @type {AudioContext} */
  #audioCtx = new window.AudioContext()
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
      this.#pauseUnpauseTrackButton.innerHTML = UI_SYMBOLS.unpause

      this.#pauseUnpauseTrackButton.dataset.playing = 'false'
      // this.#pauseUnpauseTrackButton.onclick = this.handlePlayAudio(this.#currentTrackAudio)
      // this.#pauseUnpauseTrackButton.onclick = this.handleResumeAudio
    } else {
      this.#pauseUnpauseTrackButton.innerHTML = UI_SYMBOLS.pause
      this.#pauseUnpauseTrackButton.dataset.playing = 'true'

      // this.#pauseUnpauseTrackButton.onclick = this.handlePauseAudio
    }
  }


  startVisualizer() {
    const ctx = this.#visualiserCanvas.getContext('2d')

    const analyser = this.#analyser; // <-- use the existing one
    if (!analyser) {
      console.warn('Analyser not initialized!');
      return;
    }

    analyser.fftSize = 256
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
  
    const width = this.#visualiserCanvas.width;
    const height = this.#visualiserCanvas.height;
    const barWidth = (width / bufferLength) * 2.5;

    const renderFrame = () => {
      requestAnimationFrame(renderFrame);
  
      analyser.getByteFrequencyData(dataArray);
  
      ctx.clearRect(0, 0, width, height);
  
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] - 50;
        const red = barHeight + 25;
        const green = 250 * ((i / bufferLength) + 25);
        const blue = 50;
  
        ctx.fillStyle = `rgb(${red},${green},${blue})`;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
  
        x += barWidth + 1;
      }
    };
  
    renderFrame();
  }

  createAlbumSelectionScreen() {
    MUSIC_ALBUMS.forEach(album => {
      if(!album instanceof CMusicAlbum) {
        throw new TypeError("Can't read as album")
      } 

      let albumSelection = this.returnAlbumHTML(album)

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

      const trackContainer = returnTrackHTML(track, i)

      // Handle clicking on a listed track and
      // enable control buttons
      trackContainer.addEventListener('click', () => {
        console.log(trackContainer)
        this.handlePlayAudio(track, trackContainer)
        
        
        
        
        // [this.#nextTrackButton, this.#prevTrackButton, this.#pauseUnpauseTrackButton].forEach(btn => btn.disabled=false)
      
      
      
      
      
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
        this.playAudio()
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

    this.#visualiserCanvas.width = this.#window.container.clientWidth

    this.#window.appendToWindowBody(btnWrapper);
  }

  /**
   * Starts playing a new song when selected from numbered list of all music tracks in an album
   * @param {CMusicTrack} track 
   * @param {HTMLDivElement} trackContainer
   */
  handlePlayAudio(track, trackContainer) {
    if(!track || !track instanceof CMusicTrack) {
      throw new TypeError('Error while playing audio track, got:', track)
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


    trackSrc.connect(this.#gainNode)
    trackSrc.connect(this.#analyser)
    trackSrc.connect(this.#audioCtx.destination)
    
    this.setVolume(1)
    this.playAudio()
    this.startVisualizer()
    trackContainer.style.fontWeight = "bold"
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

  returnAlbumHTML(album) {
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



  showPlayer() { this.#window.showWindow() }

}