import EventEmitter from 'events'
import SimpleSignalClient from 'simple-signal-client'

class SimplePeer extends EventEmitter {
  constructor (socket) {
    super()
    this.socket = socket

    const signalClient = new SimpleSignalClient(socket)
    signalClient.on('discover', async peerIDs => {
      for (const peerID of peerIDs) {
        const { peer } = await signalClient.connect(peerID, null, {
          streams: [self.selfWebcamStream],
          config: {
            iceServers
          },
          offerOptions: {
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          },
          answerOptions: {
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          },
          trickle: true
        })
        self.setupPeer(peer)
      }
    })
    this.signalClient = signalClient

    signalClient.on('request', async request => {
      const { peer } = await request.accept()
      self.setupPeer(peer)
    })
    signalClient.discover()
  }

  setupPeer (peer) {
    const self = this
    var events = ['connect', 'close', 'signal', 'destroy', 'error', 'stream', 'data', 'track']
    events.forEach(evt => {
      peer.on(evt, data => {
        console.log(`[simple-peer]: ${peer._id}: ${evt}`)
        self.emit(evt, { peer, data })
      })
    })
    // If this peer was not an initiator, add the stream manually
    if (!peer.initiator) {
      peer.once('track', () => {
        peer.addStream(self.selfWebcamStream)
      })
    }
  }
}

export default SimplePeer
