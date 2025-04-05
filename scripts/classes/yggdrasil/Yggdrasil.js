import CFile from "./CFile.js"
import CDirectory from "./CDirectory.js"
import CArchive from "./CArchive.js"

const DND = new CDirectory("D&D");
DND.addFiles(
  new CFile("README.md", 'md', "TO ADD"),
  new CFile("Characters.txt", 'txt', 'TO ADD')
);

const WORK = new CDirectory("WORK");
WORK.addFiles(
  new CFile("Misc.bat", "bat", "TO ADD"),
  new CFile("Amazon.bat", "bat", "TO ADD"),
  new CFile("Teacher.txt", "txt", `
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
)

const ASTRONOMY = new CArchive('ASTRONOMY.ZIP', `      
<s>File corrupted! Please download again.</s><br>
I love astronomy. In the future I want to buy a telescope and look into the void. I hope to bear witness, within the span of my existence, to the monumental event of human alighting upon the Martian soil.
`);

export const YGGDRASIL = [DND, WORK, ASTRONOMY];