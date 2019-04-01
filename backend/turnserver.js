import debug from 'debug'
import { createHmac } from 'crypto'
debug('turnserver')

const validTransports = new Set(['tcp', 'udp'])

class TurnServer {
  constructor (config) {
    if (!config.secret) {
      throw new Error('Configuration does not contain turn secret')
    }
    if (!config.username) {
      throw new Error('Configuration does not contain turn username')
    }
    this.config = config
    this.secret = config.secret

    this.transports = config.transports || []
    if (!Array.isArray(this.transports)) {
      this.transports = [this.transports]
    }
    this.transports = this.transports.filter(t => validTransports.has(t))
  }

  getTURNCredentials (username) {
    username = this.sanitizeUsername(username)
    var unixTimeStamp = parseInt(Date.now() / 1000) + 24 * 3600 // this credential would be valid for the next 24 hours
    var uname = [unixTimeStamp, username].join(':')
    var password
    const hmac = createHmac('sha1', this.secret)

    hmac.setEncoding('base64')
    hmac.write(uname)
    hmac.end()
    password = hmac.read()

    return {
      username: uname,
      password
    }
  }

  sanitizeUsername (username) {
    // Doesn't do anything right now
    return username
  }

  getICEServers (username) {
    username = this.sanitizeUsername(username)
    var creds = this.getTURNCredentials(username)

    var result = []
    this.transports.forEach((t) => {
      result.push({
        urls: `${this.config.url}?transport=${t}`,
        username: creds.username,
        credential: creds.password
      })
    })
    return result
  }
}

export default TurnServer
