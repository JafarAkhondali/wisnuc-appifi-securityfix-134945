import fs from 'fs'

class FileService {

  constructor(froot) {
    this.froot = froot
    this.data = data 
  }

  nodeProps(node) {
    if (node instanceof DirectoryNode) {
      return {
        uuid: node.uuid,
        type: 'folder',
        name: node.name,
        mtime: node.mtime
      }
    }
    else if (node instanceof FileNode) {
      return {
        uuid: node.uuid,
        type: 'file',
        name: node.name,
        size: node.size,
        mtime: node.mtime, // FIXME need change mtime definition
        
      }
    }
  }

  // list all items inside a directory
  list(userUUID, dirUUID) {

    let node = this.data.findNodeByUUID(dirUUID)
    if (!node) throw
    if (!(node instanceof DirectoryNode)) throw
    if (!(userCanRead(userUUID, node)) throw

    return node.getChildren().map(n => nodeProps(n))
  }

  // list all items inside a directory, with given 
  navList(userUUID, dirUUID, rootUUID) {

    let node = this.data.findNodeByUUID(dirUUID)
  }

  tree(userUUID, dirUUID) {
  }

  navTree(userUUID, dirUUID, rootUUID) {
  }

  // return abspath of file
  readFile(userUUID, fileUUID) {
  }

  // dump a whole drive
  dumpDrive(userUUID, driveUUID) {
  }

  // create new directory inside given dirUUID
  createDirectory(userUUID, dirUUID, name, callback) {

    // permission check
    let node = this.data.findNodeByUUID(dirUUID)
  }

  // create new file inside given dirUUID, 
  createFile(userUUID, srcpath, dirUUID, name, callback) {
  }

  // overwrite existing file
  overwriteFile(userUUID, srcpath, fileUUID, callback) {
  }

  // rename a directory or file
  rename(userUUID, targetUUID, name, callback) {
  }

  // move a directory or file into given dirUUID
  move(userUUID, srcUUID, dirUUID, callback) {
  }

  // delete a directory or file
  del(userUUID, targetUUID, callback) {
  }
}

export default 
