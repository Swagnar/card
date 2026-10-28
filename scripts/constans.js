export const OS_CONSTANS = {
  BOOT_TIME: 1000,
  BOOT_POST_TIME: 100,
  DESKTOP_LOAD_TIME: 1500,
  CLOCK_UPDATE_INTERVAL: 1000,

  // lower: faster
  TYPEWRITER_IN_SPEED: 150,
  TYPEWRITER_OUT_SPEED: 200,
  WIP_MESSAGE: "WORK IN PROGRESS. BLESS YOU.",
  WIP_DISPLAY_TIME: 3000,

  // localStorage key prefix of files saved in the Composer app
  USER_FILE_PREFIX: 'userFile-',

  BIOS_POST_CODES: [
    'OK',
    'PASS',
    'READY',
    'GOOD',
    'NORMAL',
    'ACTIVE',
    'INIT',
    'BLESSED',
  ],

  CSS_COLORS: {
    green: "#c1ffc1",
    red: "#ffc1c1"
  },


  // logs extra info into the console, see utils/logs.js
  DEBUG: false
}
