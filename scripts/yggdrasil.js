export class CFile {
  constructor(name, type, content) {
    this.name = name
    this.type = type
    this.content = content
  }
}

export class CDirectory {
  constructor(name) {
    this.name = name
    this.files = []
    this.id = `folder-${this.name}`
  }

  addFile(file) {
    if(file instanceof CFile) {
      this.files.push(file)
    } else {
      throw new Error('addFile only accepts instances of File')
    }
  }

  addFiles(...files) {
    files.forEach(file => {
        this.addFile(file)
    })
  }
}
export class CArchive extends CDirectory {
  constructor(name, content) {
    super(name)
    this.content = content
  }
}


const DND = new CDirectory("D&D");
DND.addFiles(
  new CFile("README.md", 'md-file', "TO ADD"),
  new CFile("Characters.txt", 'txt-file', 'TO ADD')
);

const ASTRONOMY = new CArchive('ASTRONOMY.ZIP', `      
<s>File corrupted! Please download again.</s><br>
I love astronomy. In the future I want to buy a telescope and look into the void. I hope to bear witness, within the span of my existence, to the monumental event of human alighting upon the Martian soil.
`);

export const YGGDRASIL = [DND, ASTRONOMY];