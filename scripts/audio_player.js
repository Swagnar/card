const KANYE_2049 = [
  new Audio("./static/audio/kanye2049/01_INTRO_(CHARLIE_HEAT_VERSION).mp3"),
]

const VULTURES_2049 = [
  new Audio("./static/audio/kanye2049/02_POWER.mp3")
]


export class AudioPlayer {

  #currentPlaylist
  constructor(playlist) {
    switch(playlist) {
      case 0:
      case "Kanye":
        this.#currentPlaylist = KANYE_2049;
        break;
      case 1:
      case "Vultures":
        this.#currentPlaylist = VULTURES_2049;
        break;
      default:
        throw new Error("No playlist found, expected values: 0, 1, 'Kanye' or 'Vultures', got: ", playlist)
    }
  }

  playAudio(track_id) {
    if(!track_id || track_id <= 0) {
      track_id = 0
    }
    if(!this.#currentPlaylist[track_id] instanceof Audio) {
      throw new Error(`Element with track id [${track_id}] on playlist ${this.#currentPlaylist} is not an Audio object`);
    }

    this.#currentPlaylist[track_id].play()
  }

  
}