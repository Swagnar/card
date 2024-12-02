export default class CMusicAlbum {
  /**
   * 
   * @param {string} name name of the album
   * @param {string} author author of the album
   * @param {CMusicTrack[]} tracks a list of CMusicTrack objects 
   * @param {string} cover file name of the album cover
   */
  constructor(name, author, cover, tracks) {
    this.name = name
    this.author = author
    this.tracks = tracks ?? []
    this.cover = cover
  }

  
}