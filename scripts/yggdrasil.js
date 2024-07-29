import { CFile } from "./classes/CFile.js"
import { CDirectory } from "./classes/CDirectory.js"
import { CArchive } from "./classes/CDirectory.js";

const DND = new CDirectory("D&D");
DND.addFiles(
  new CFile("README.md", 'md-file', "TO ADD"),
  new CFile("Characters.txt", 'txt-file', 'TO ADD')
);

const WORK = new CDirectory("WORK");
WORK.addFiles(
  new CFile("Misc.bat", "bat-file", "TO ADD"),
  new CFile("Amazon.bat", "bat-file", "TO ADD"),
  new CFile("Teacher.txt", "text-file", "TO ADD"),
)

const ASTRONOMY = new CArchive('ASTRONOMY.ZIP', `      
<s>File corrupted! Please download again.</s><br>
I love astronomy. In the future I want to buy a telescope and look into the void. I hope to bear witness, within the span of my existence, to the monumental event of human alighting upon the Martian soil.
`);

export const YGGDRASIL = [DND, WORK, ASTRONOMY];