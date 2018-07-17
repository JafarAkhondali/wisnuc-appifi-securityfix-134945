const child = require('child_process')
const readline = require('readline')

class ExifTool {

  constructor() {
    this.reqs = []
    this.restart()
  }

  restart () {
    if (this.spawn) {
      this.rl.removeAllListeners() 
      this.spawn.removeAllListeners()
      this.spawn.on('error', () => {})
    }

    this.lines = []

    this.spawn = child.spawn('exiftool', ['-stay_open', 'true', '-@', '-'])
    this.rl = readline.createInterface({ input: this.spawn.stdout })
    this.rl.on('line', line => {
      if (line.trim() === '{ready}') {
        this.callback(null, this.lines.join('\n'))
        this.callback = null
        this.lines = []
        this.sched()
      } else {
        this.lines.push(line)
      }
    })

    this.spawn.on('error', err => {
      console.log('exiftool error', err.message)
      this.restart()
    })

    this.spawn.on('exit', (code, signal) => {
      console.log(`exiftool exit with code ${code} and signal ${signal}`, )
      this.restart()
    })
  }

  request (file, args, callback) {
    this.reqs.push({ file, args, callback })
    this.sched()
  } 

  sched () {
    if (this.callback || !this.reqs.length) return   

    let { file, args, callback } = this.reqs.shift()

    this.spawn.stdin.write('-S\n')
    args.forEach(arg => this.spawn.stdin.write(`-${arg}\n`))
    this.spawn.stdin.write(`${file}\n`)
    this.spawn.stdin.write('-execute\n')

    this.callback = callback
  }

} 

module.exports = ExifTool