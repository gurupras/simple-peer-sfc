process.env.DEBUG = 'simple-peer*'
require = require('esm')(module)
const url = require('url')
const express = require('express')
const compression = require('compression')
const cors = require('cors')
const bodyParser = require('body-parser')
const httpRewrite = require('http-rewrite-middleware')
const http = require('http')
const https = require('https')

const config = require('../config')
const Io = require('socket.io')
const IoClient = require('socket.io-client')
const SignalServer = require('simple-signal-server')
const SignalClient = require('simple-signal-client')
const wrtc = require('wrtc')

const RTCConfig = require('./rtcconfig').default

const app = express()
app.use(compression())
app.use(cors({
  origin: true
}))
app.use(bodyParser.json())

app.use(httpRewrite.getMiddleware([
  // Strip '/api' from any incoming request
  {
    from: '^/api/(.*)$',
    to: '/$1'
  }
], {
  silent: true
}))

const httpServer = http.createServer(app, (req, res) => {
  res.writeHead(301, { 'Location': 'https://' + req.headers['host'] + req.url })
  res.end()
}
)

const httpsServer = https.createServer(config.server.https, app)

httpServer.listen(config.server.http_port, () => { console.log(`HTTP server listening on port ${config.server.http_port}`) })
httpsServer.listen(config.server.https_port, () => { console.log(`HTTPS server listening on port ${config.server.https_port}`) })

const rtcConfig = new RTCConfig(config.rtc_config)

const io = Io(httpsServer, {
  pingInterval: 30000,
  pingTimeout: 100000
})

let serverSocket
const socketRoomMap = {}
const streams = {}
const peers = {}
let instructorStreamID

global.streams = streams
global.peers = peers

const signalServer = SignalServer(io)
signalServer.on('discover', request => {
  const socketID = request.socket.id
  let peers = []
  // const room = socketRoomMap[socketID]
  // if (room) {
  //   peers = Object.keys(io.sockets.adapter.rooms[room].sockets)
  // }
  peers.push(serverSocket.id)
  if (peers.indexOf(socketID) >= 0) {
    peers.splice(peers.indexOf(socketID), 1)
  }
  request.discover(socketID, peers)
  console.log(`Sending discovery to: ${socketID} with peers=${JSON.stringify(peers)}`)
})
signalServer.on('disconnect', socket => {
  delete socketRoomMap[socket.id]
})
signalServer.on('request', request => request.forward())

io.on('connection', socket => {
  console.log(`Received connection`)
  const { join } = socket
  socket.join = function (room) {
    console.log(`[${socket.id}] joining room: [${room}]`)
    socketRoomMap[socket.id] = room
    join.apply(socket, arguments)
  }

  socket.on('join-room', (room, cb) => {
    socket.join(room)
    cb && cb()
  })

  socket.on('get-rtc-config', function (cb) {
    cb && cb(rtcConfig.getICEServers())
  })
  socket.emit('ready')
})

function removePeer (peer) {
  delete peers[peer._id]
  removeStream(peer)
}
function removeStream (peer) {
  const stream = streams[peer._id]
  if (stream) {
    stream.getTracks().forEach(t => {
      try {
        const idx = peer._remoteTracks.map(e => e.track.id).indexOf(t.id)
        const entry = peer._remoteTracks[idx]
        entry.track.stop()
        entry.stream.removeTrack(t)
        peer._remoteTracks.splice(idx, 1)
      } catch (e) {
      }
      try {
        const idx = peer._remoteStreams.indexOf(stream)
        if (idx >= 0) {
          peer._remoteStreams.splice(idx, 1)
        }
      } catch (e) {
        console.error(`Failed to remove stream from peer's remoteStreams: ${e.message}`)
      }
    })
    console.log(`Informing all peers to remove stream`)
    Object.values(peers).forEach(peer => {
      try {
        console.log(`NumTracks: ${stream.getTracks().length}`)
        peer.removeStream(stream)
        peer.send(JSON.stringify({
          action: 'remove-stream',
          streamID: stream.id
        }))
      } catch (e) {
        console.error(e)
      }
    })
  }
  delete streams[peer._id]
}

function setupPeer (peer) {
  var events = ['connect', 'close', 'destroy', 'error', 'stream', 'data', 'track']
  events.forEach(evt => {
    peer.on(evt, data => {
      console.log(`[simple-peer]: ${peer._id}: ${evt}`)
    })
  })

  peer.on('stream', (stream) => {
    streams[peer._id] = stream
    Object.values(peers).forEach(peer => {
      try {
        console.log(`Adding stream to peer: ${peer._id}`)
        peer.addStream(stream)
      } catch (e) {
      }
    })
  })

  peer.on('data', msg => {
    msg = JSON.parse(msg.toString('utf-8'))
    switch (msg.action) {
      case 'instructor-stream':
        console.log(`Updating instructor stream ID`)
        instructorStreamID = msg.streamID
        Object.values(peers).forEach(peer => {
          try {
            peer.send(JSON.stringify({
              action: 'instructor-stream',
              streamID: instructorStreamID
            }))
          } catch (e) {
          }
        })
        break
      case 'remove-stream':
        removeStream(peer)
        break
      case 'removed-all-tracks':
        removeStream(peer)
        break
    }
  })

  peer.on('close', () => removePeer(peer))

  peers[peer._id] = peer
  Object.values(streams).forEach(stream => {
    try {
      peer.addStream(stream)
    } catch (e) {
    }
  })

  if (instructorStreamID) {
    try {
      peer.send(JSON.stringify({
        action: 'instructor-stream',
        streamID: instructorStreamID
      }))
    } catch (e) {
    }
  }
}

serverSocket = IoClient(`wss://misc.twoseven.xyz:${config.server.https_port}`)
serverSocket.on('ready', () => {
  console.log(`Setting up server's signalClient`)
  const signalClient = new SignalClient(serverSocket)
  signalClient.on('discover', async peerIDs => {
    console.log(`PeerIDs: ${JSON.stringify(peerIDs)}`)
    for (const peerID of peerIDs) {
      const { peer } = await signalClient.connect(peerID, {}, {
        offerOptions: {
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        },
        answerOptions: {
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        },
        trickle: false,
        wrtc
      })
      setupPeer(peer)
    }
  })

  signalClient.on('request', async request => {
    const { peer } = await request.accept(undefined, {
      wrtc
    })
    setupPeer(peer)
  })
  signalClient.discover()
})
