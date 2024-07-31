// TODO: CFile.content needs to be able to hold a multiple of HTMLElements, create some functions that would allow to dynamicly append and modify tags inside?

export class CFile {
  constructor(name, type, content) {
    this.name = name
    this.type = type

    // For now this works with innerHTML and string
    //
    this.content = content
  }
}