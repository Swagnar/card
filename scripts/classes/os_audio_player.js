import { KANYE_2049 } from '../resources/Kanye2049.js';
import { VULTURES_2049 } from '../resources/Vultures2049.js';

import { OsWindow } from './os_window.js';



export class OsAudioPlayer {

  /** @type {OsWindow} */
  #window
  
  /**
   * @type {Object[]}
  */
 #albums = [KANYE_2049, VULTURES_2049];
 
  #currentAlbum;


  #nextTrackButton = document.createElement('button');
  #prevTrackButton = document.createElement('button');
  #playTrackButton = document.createElement('button');

  #visualiserCanvas = document.createElement('canvas');
  #visualiserCtx = this.#visualiserCanvas.getContext('2d');

  #audioCtx;
  #analyser;

  constructor(root) {

    this.#window = new OsWindow('[ CHOIR ]');
    this.#window.setWindowID('window-choir');
    this.#window.addClassToWindowBody('choir-body', 'choir-selection-layout');

    root.append(this.#window.container);
    
    this.initElements();
    this.createSelectionScreen();

  }

  createSelectionScreen() {
    var index = 0;
    this.#albums.forEach(album => {
      let coverContainer = document.createElement('div');
      coverContainer.classList.add('choir-album-cover');
      coverContainer.id = `${index}`;
      let cover = document.createElement('img');
      cover.src = `static/${album.cover}`;
      
      let label = document.createElement('span');
      label.innerHTML = `${album.author} - ${album.name}`;


      coverContainer.append(cover, label)
      this.#window.appendToWindowBody(coverContainer);

      coverContainer.addEventListener('click', () => {
        this.selectAlbum(coverContainer.id);
      })

      index++;
    })
  }

  selectAlbum(albumIndex) {
    if(!albumIndex) {
      throw new TypeError("Selected album index is undefined");
    }
    try {
      this.#currentAlbum = this.#albums[albumIndex];
      
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
    
    if(!this.#currentAlbum) {
      throw new TypeError('Selected album is undefined')
    }
    var tracksContainer = document.createElement('div')
    tracksContainer.classList.add('choir-playback-tracks-container')
    this.#currentAlbum.tracks.forEach(track => {
      if(!track.data) {
        throw new TypeError(`No data for song ${track.name}`);
      }
      let trackContainer = document.createElement('div');
      trackContainer.classList.add('choir-playback-track-container');

      let trackIdElement = document.createElement('span');
      let trackNameElement = document.createElement('span');

      trackIdElement.innerHTML = `${track.id + 1}`;
      trackNameElement.innerHTML = track.name;

      trackContainer.addEventListener('click', () => {
        console.log(`Play song ${track.name} with id ${track.id}`);
      })
      trackContainer.addEventListener('mouseenter', () => {
        trackIdElement.innerHTML = "►";
      })
      trackContainer.addEventListener('mouseleave', () => {
        trackIdElement.innerHTML = `${track.id + 1}`;
      })

      trackContainer.append(trackIdElement, trackNameElement);
      tracksContainer.append(trackContainer);
    })

    this.#window.appendToWindowBody(this.#visualiserCanvas, tracksContainer);
  }

  initElements() {
    this.#nextTrackButton.innerHTML = "->";
    this.#nextTrackButton.disabled = true;
    
    this.#prevTrackButton.innerHTML = "<-";
    this.#prevTrackButton.disabled = true;

    this.#playTrackButton.innerHTML = "►";
    this.#playTrackButton.disabled = true;

    let btnWrapper = document.createElement('div')
    btnWrapper.classList.add('choir-buttons')

    btnWrapper.append(
      this.#prevTrackButton,
      this.#playTrackButton,
      this.#nextTrackButton,
    )

    this.#window.appendToWindowBody(btnWrapper);
  }

  playAudio(track_id) {

    // this.#audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    // this.#analyser = this.#audioCtx.createAnalyser();

    // if(!track_id || track_id <= 0) {
    //   track_id = 0
    // }
    // if(!this.#currentAlbum.tracks[track_id] instanceof Audio) {
    //   throw new Error(`Element with track id [${track_id}] on playlist ${this.#currentAlbum.name} is not an Audio object`);
    // }

    // this.#currentAlbum.tracks[track_id].play()
  }

  showPlayer() { this.#window.showWindow() }

}