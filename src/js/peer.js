import EventEmitter from 'events'
import SimpleSignalClient from 'simple-signal-client'

class SimplePeer extends EventEmitter {
  constructor (socket, { webcamStream, iceServers }) {
    super()
    this.socket = socket
    this.webcamStream = webcamStream
    this.iceServers = iceServers
  }

  initialize () {
    const self = this
    const { socket, iceServers } = this
    const signalClient = new SimpleSignalClient(socket)
    signalClient.on('discover', async peerIDs => {
      for (const peerID of peerIDs) {
        const { peer } = await signalClient.connect(peerID, {}, {
          streams: self.webcamStream ? [self.webcamStream] : undefined,
          offerOptions: {
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          },
          answerOptions: {
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          },
          trickle: true,
          iceServers
        })
        console.log(`Found peer: connect`)
        self.setupPeer(peer)
      }
    })
    this.signalClient = signalClient

    signalClient.on('request', async request => {
      const { peer } = await request.accept({
        streams: self.webcamStream ? [self.webcamStream] : undefined
      })
      console.log(`Found peer: request`)
      self.setupPeer(peer)
    })
    signalClient.discover()
  }

  setupPeer (peer) {
    const self = this
    this.emit('new-peer', peer)
    var events = ['connect', 'close', 'signal', 'destroy', 'error', 'stream', 'data', 'track']
    events.forEach(evt => {
      peer.on(evt, data => {
        console.log(`[simple-peer]: ${peer._id}: ${evt}`)
        self.emit(evt, { peer, data })
      })
    })
  }
}

export default SimplePeer
