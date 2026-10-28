import CFile from "./CFile.js"
import CDirectory from "./CDirectory.js"
import CArchive from "./CArchive.js"
import Composer from "../Composer/Composer.js";
import Choir from "../Choir/Choir.js";
import OsTerminal from "../os/OsTerminal.js";
import Snake from "../Snake/Snake.js";
import { OS_CONSTANS } from "../../constans.js";

const DND = new CDirectory("D&D");
DND.addFiles(
  new CFile("README", 'md', "TO ADD"),
  new CFile("Characters", 'txt', 'TO ADD')
);

const WORK = new CDirectory("WORK");
WORK.addFiles(
  new CFile("Misc", "bat", "TO ADD"),
  new CFile("Amazon", "bat", "TO ADD"),
  new CFile("Teacher", "txt", `
    <h1>I was a teacher</h1>
    <h3>2022 - 2025</h3>
    <img src="static/rolnik.jpg">
    <canvas class="cfile-fl"></canvas>
    <p>My place of work was a beautiful school located in the very old monastery with adjacent church. Because of it's sheer size, numerous stairways and even <strong>hidden passageways</strong>, the school is often called <em>The Hogwarts of Nysa</em></p>
    <h3>School History</h3>
    <p>The school was founded in 1892 by <a href="https://en.wikipedia.org/wiki/Society_of_the_Divine_Word">Society of the Divine Word</a>, populary called the <strong>Verbites</strong>. Four brothers bought a 125 Morgen farmstead with only one building, a sheephouse.</p>
    <p>Fortunately, the cost of the undertaking has been reduced thanks to adjacent clay pits used to fire the bricks for the building. In 1894, two new wings with characteristic towers have been construced </p>
    <h3>Humble beginnings</h3>
    <img src="static/rolnik2.jpg">
    <canvas class="cfile-fr"></canvas>
    <p>I've also began my joruney with Computer Science in this building. I was a student of a technical class with an IT profile where I was taught in the dark arts of Hardware, Networking and Web Development. This journey laid foundations for my knowlage, and even though the lessons were outdated and sometimes even cruelly tedious, those were one of the best year of my life</p>
    <p>After getting my engineering degree in Computer Science I was given an offer to work there as a teacher and I thought <em>Why not?</em></p>
  `),
  new CFile("Hosting", "txt",`
  <h1>Hosting</h1>
  <h3>Since 2025</h3>
  <img src="static/hosting.jpg">
  <canvas class="cfile-fl"></canvas>
  <p>Right now I'm working as a Support Specialist for a hosting provider group <strong>Domenomania</strong>, that has two large services for domain registration, VPS and shared hosting. My daily work consists of talking with clients, migrating their services from different providers to us and fixing bugs. You can check them out here - <a href='https://domenomania.pl' target='_blank'>domenomania.pl</a> and here - <a href='https://vh.pl' target='_blank'>vh.pl</a>. Our company got accepted as a verified partner of national Research and Academic Computer Network (<em>pl. NASK</em>) and now, when doing <code>whois</code> on some domains you might see <strong>Prociv</strong> as a Registrar.
  `)
)

const ASTRONOMY = new CArchive('ASTRONOMY.ZIP', `      
<s>File corrupted! Please download again.</s><br>
I love astronomy. In the future I want to buy a telescope and look into the void. I hope to bear witness, within the span of my existence, to the monumental event of human alighting upon the Martian soil.
`);


/**
 * Creates the app instance shown on the desktop and opens a new instance of the app
 * every time its event is dispatched
 * @template {CApp} T
 * @param {new () => T} AppClass class extending CApp
 * @returns {T} desktop instance of the app
 */
function registerApp(AppClass) {
  const app = new AppClass()
  document.addEventListener(app.command, () => {
    new AppClass().window.showWindow()
  })
  return app
}

// built-in apps
export const CHOIR = registerApp(Choir)
export const COMPOSER = registerApp(Composer)
export const SNAKE = registerApp(Snake)
export const OS_TERMINAL = registerApp(OsTerminal)

// register your apps here


/**
 * Loads CFiles made by the user in Composer app
 * @returns {CDirectory}
 */
function loadUserFiles() {
  const userFiles = new CDirectory('MY FILES')

  for(let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)

    if(key.startsWith(OS_CONSTANS.USER_FILE_PREFIX)) {
      const fileName = key.slice(OS_CONSTANS.USER_FILE_PREFIX.length)
      userFiles.addFile(new CFile(fileName, 'txt', localStorage.getItem(key)))
    }
  }
  return userFiles
}

// Just for looks
//
// Directories
// Archives
// Apps

export const osFiles = [
  DND, WORK,
  ASTRONOMY,
  CHOIR, COMPOSER, SNAKE, OS_TERMINAL
];

export const YGGDRASIL = osFiles.concat(loadUserFiles())
