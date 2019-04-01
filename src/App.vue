<template>
  <div id="app">
    <router-view class="container"/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import io from 'socket.io-client'
import SimplePeer from '@/js/peer'
import UserMediaMixin from '@/components/user-media-mixin'

export default {
  name: 'app',
  mixins: [UserMediaMixin],
  components: {
  },
  computed: {
    ...mapGetters([
      'peers',
      'streams'
    ]),
    socket: {
      get () {
        return this.$store.getters.socket
      },
      set (v) {
        this.$store.commit('socket', v)
      }
    },
    simplePeer: {
      get () {
        return this.$store.getters.simplePeer
      },
      set (v) {
        this.$store.commit('simplePeer', v)
      }
    },
    webcamStream: {
      get () {
        return this.$store.getters.webcamStream
      },
      set (v) {
        this.$store.commit('webcamStream', v)
      }
    },
    instructorStream: {
      get () {
        return this.$store.getters.instructorStream
      },
      set (v) {
        this.$store.commit('instructorStream', v)
      }
    },
    rtcConfig: {
      get () {
        return this.$store.getters.rtcConfig
      },
      set (v) {
        this.$store.commit('rtcConfig', v)
      }
    },
    selfWebcamStreamOpts () {
      return {
        mic: true,
        video: true,
        volume: true,
        muted: true
      }
    }
  },
  watch: {
    webcamStream (v, o) {
      this.peers.forEach(entry => {
        if (o) {
          entry.peer.removeStream(o)
        }
        if (v) {
          entry.peer.addStream(v)
        } else {
          this.peers.forEach(entry => {
            try {
              entry.peer.send(JSON.stringify({
                action: 'remove-stream',
                streamID: o.id
              }))
            } catch (e) {
            }
          })
        }
      })
    }
  },
  methods: {
    initializeSimplePeer () {
      const self = this
      this.simplePeer = new SimplePeer(this.socket, { iceServers: this.rtcConfig.iceServers })
      this.simplePeer.on('new-peer', peer => {
        self.peers.push({ peer })
        peer.on('data', msg => {
          msg = JSON.parse(msg.toString('utf-8'))
          switch (msg.action) {
            case 'instructor-stream':
              const { streamID: instructorStreamID } = msg
              self.instructorStreamID = instructorStreamID
              self.peers.forEach(entry => {
                const { peer: { _remoteStreams: streams } } = entry
                const idx = streams.map(s => s.id).indexOf(instructorStreamID)
                if (idx >= 0) {
                  self.instructorStream = streams[idx]
                }
              })
              break
            case 'remove-stream':
              const remoteStreams = peer._remoteStreams
              let idx = remoteStreams.map(s => s.id).indexOf(msg.streamID)
              if (idx >= 0) {
                const stream = remoteStreams[idx]
                stream.getTracks().forEach(t => {
                  stream.removeTrack(t)
                  const idx = peer._remoteTracks.map(entry => entry.track.id).indexOf(t.id)
                  if (idx >= 0) {
                    peer._remoteTracks[idx].track.stop()
                    peer._remoteTracks.splice(idx, 1)
                  }
                })
                remoteStreams.splice(idx, 1)
              }
              if (msg.streamID === self.instructorStreamID) {
                self.instructorStream = undefined
              }
              break
          }
        })
        this.simplePeer.on('stream', ({ peer, data: stream }) => {
          if (stream.id === self.instructorStreamID) {
            self.instructorStream = stream
          }
        })
      })
      this.simplePeer.on('close', ({ peer }) => {
        const idx = self.peers.map(entry => entry.peer).indexOf(peer)
        if (idx >= 0) {
          self.peers.splice(idx, 1)
        }
      })
      this.simplePeer.initialize()
    }
  },
  mounted () {
    const socket = io()
    this.socket = socket
    const self = this
    socket.on('ready', () => {
      socket.emit('get-rtc-config', rtcConfig => {
        self.rtcConfig = rtcConfig
        socket.emit('join-room', 'test', self.initializeSimplePeer)
      })
    })
    window.app = this
  }
}
</script>
<style lang="scss">
@import '~@/style/style';

.basic-flex {
  display: flex;
  flex-direction: column;
  flex: 1;
}

#app {
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

.webcam-container {
  width: 120px;
  height: auto;
  margin: 0 12px;
}
</style>
