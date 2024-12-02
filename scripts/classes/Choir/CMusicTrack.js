export default class CMusicTrack {

  duration

  /**
   * @param {number} number track number on the album
   * @param {string} name track name
   * @param {string} data a base64 representation of the audio file
   */
  constructor(number, name, data) {
    this.number = number
    this.name = name
    this.data = data
  }

}