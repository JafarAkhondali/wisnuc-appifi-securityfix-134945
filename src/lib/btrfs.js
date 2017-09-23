const fs = require('fs')
const ioctl = require('ioctl')

const BTRFS_IOC_CLONE_RANGE = 0x4020940D


//  struct btrfs_ioctl_clone_range_args {
//    __s64 src_fd;
//    __u64 src_offset, src_length;
//    __u64 dest_offset;
//  };

/*
 * BTRFS_IOC_CLONE_RANGE only supports 'sectorsize' aligned
 * cloning. Which is 4096 by default, therefore fall back to
 * manual read/write on failure.
 */

//  BTRFS_IOCTL_MAGIC  0x94
//  BTRFS_IOCTL_CLONE_RANGE  0x0D (13)
//  #define BTRFS_IOC_CLONE_RANGE _IOW(BTRFS_IOCTL_MAGIC, 13, \
//          struct btrfs_ioctl_clone_range_args)
//  dir 0x40 for write
//  size 0x20 sizeof btrfs_ioctl_clone_range_args

// src_offset: always 0
// src_length: always 0
// dst_offset: increment from 0
const btrfsClone = (target, files, callback) => {
  fs.open(target, 'w', (err, wfd) => {
    if (err) return callback(err)

    let dst_offset = 0
    try {

      files.forEach((file, index, arr) => {
        if (dst_offset % 4096 !== 0)
          throw new Error("size not 'sectorsize (4096 by default)' aligned")

        let rfd = fs.openSync(file, 'r')
        try {
          let stat = fs.fstatSync(rfd)
          let size = stat.size
          if (size === 0) return

          let remainder = size % 4096
          let round = size - remainder

          // clone round
          if (round) {
            let buffer = Buffer.alloc(4 * 8)

            // src_fd
            buffer.writeInt32LE(rfd, 0)
            // src_offset: always 0
            buffer.writeUInt32LE(0, 8)
            // src_length: always 0
            buffer.writeUInt32LE(round, 16)
            // dst_offset: increment from 0
            buffer.writeUInt32LE(dst_offset, 24)

            ioctl(wfd, BTRFS_IOC_CLONE_RANGE, buffer) 
            dst_offset += round
          }

          // copy remainder
          if (remainder) {
            let block = Buffer.alloc(remainder)
            let bytesRead = fs.readSync(rfd, block, 0, remainder, round)
            if (bytesRead !== remainder) 
              throw new Error('failed to read remainder')
            let bytesWritten = fs.writeSync(wfd, block, 0, remainder, dst_offset)
            if (bytesWritten !== remainder)
              throw new Error('failed to write remainder')
            dst_offset += remainder
          }
        } catch (e) {
          throw e
        } finally {
          fs.close(rfd, () => {})
        }
      }) 

      callback()
    } catch (e) {
      callback(e)
    } finally {
      fs.close(wfd, () => {})
    }
  })
}

module.exports = { btrfsClone }


