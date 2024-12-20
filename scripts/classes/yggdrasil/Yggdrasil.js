import { CFile } from "./CFile.js"
import { CDirectory } from "./CDirectory.js"
import { CArchive } from "./CDirectory.js";

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
    <h1 style="text-align: center;">I was a teacher</h1>
    <h3 style="text-align: center;">2022 - 2025</h3>
    <img src="static/rolnik.jpg">
    <canvas></canvas>
    <p>My place of work was a beautiful school located in the very old monastery with adjacent church. Because of it's sheer size, numerous stairways and even <strong>hidden passageways</strong>, the school is often called <em>"The Hogwarts of Nysa"</em></p>
  `),
)

const ASTRONOMY = new CArchive('ASTRONOMY.ZIP', `      
<s>File corrupted! Please download again.</s><br>
I love astronomy. In the future I want to buy a telescope and look into the void. I hope to bear witness, within the span of my existence, to the monumental event of human alighting upon the Martian soil.
`);

export const YGGDRASIL = [DND, WORK, ASTRONOMY];