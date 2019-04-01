import fs from 'fs'
import yaml from 'js-yaml'
import TurnServer from './turnserver'

class STUNConfig {
  constructor (config) {
    // This is an array of STUN servers
    // TODO: At the moment we don't support anything but URLs
    this.config = config
  }

  getICEServers () {
    return {
      iceServers: this.config.map(v => ({ urls: v.url }))
    }
  }
}

class TURNConfig {
  constructor (config) {
    this.config = config
    this.servers = config.map((tc) => {
      return new TurnServer(tc)
    })
  }

  getICEServers () {
    const result = []
    this.servers.forEach((server) => {
      result.push(...server.getICEServers())
    })
    return {
      iceServers: result
    }
  }
}

class RTCConfig {
  constructor (configFile) {
    const config = yaml.safeLoad(fs.readFileSync(configFile))
    this.config = config
    this.stun = new STUNConfig(config.stun)
    this.turn = new TURNConfig(config.turn)
  }

  getICEServers () {
    const result = []
    result.push(...this.stun.getICEServers().iceServers)
    result.push(...this.turn.getICEServers().iceServers)
    return {
      iceServers: result
    }
  }
}

export default RTCConfig
