import { EventEmitter } from 'events'
import Buffer from 'buffer'

export default class Serialport extends EventEmitter {
  constructor(webPort) {
    super()
    this.isOpen = false
    this.webPort = webPort
    this.writer = null
    this.reader = null
  }

  async open(options) {
    await this.webPort.open(options)
    this.writer = this.webPort.writable.getWriter()
    this.startReading()
    setTimeout(() => {
      this.isOpen = true
      this.emit('open')
    }, 1000)
  }

  async write(dataToWrite) {
    await this.writer.write(dataToWrite.buffer)
  }

  async startReading() {
    const reader = this.webPort.readable.getReader()
    this.reader = reader
    try {
      for (;;) {
        const { value, done } = await reader.read()
        if (done) break
        const buffer = Buffer.from(value.buffer)
        this.emit('data', buffer)
      }
    } catch (error) {
      console.error('read error')
    } finally {
      reader.releaseLock()
    }
  }

  async close() {
    this.writer.releaseLock()
    await this.reader.cancel()
    await this.webPort.close()
    this.isOpen = false
    this.writer = null
    this.reader = null
    this.emit('close')
  }
}
