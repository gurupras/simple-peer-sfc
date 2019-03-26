import SignalServer from 'simple-signal-server'
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

const io = Io(httpsServer, {
  pingInterval: 30000,
  pingTimeout: 100000
})

const socketRoomMap = {}
const signalServer = SignalServer(io)
signalServer.on('discover', request => {
  const socketID = request.socket.id
  const room = socketRoomMap[socketID]
  const peers = Object.keys(io.sockets.adapter.rooms[room].sockets)
  peers.splice(peers.indexOf(socketID), 1)
  request.discover(socketID, peers)
  console.log(`Sending discovery to: ${socketID} with peers=${JSON.stringify(peers)}`)
})
signalServer.on('disconnect', socket => {
  delete socketRoomMap[socket.id]
})
signalServer.on('request', request => request.forward())

io.on('connection', socket => {
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
  socket.emit('ready')
})
