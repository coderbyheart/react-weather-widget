/* global process */

import {parseString} from 'xml2js'

process.stdin.setEncoding('utf8')

let data = ''
process.stdin.on('readable', () => {
  data = data + process.stdin.read()
})

process.stdin.on('end', () => {
  parseString(data, (err, result) => {
    if (err) {
      process.stderr.write(err.toString())
      return
    }
    process.stdout.write(JSON.stringify(result))
  })
})
