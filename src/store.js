import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    socket: undefined,
    simplePeer: undefined,
    peers: [],
    webcamStream: undefined,
    instructorStream: undefined,
    instructorSrcStream: undefined,
    instructorStreamID: undefined,
    rtcConfig: undefined
  },
  getters: {
    socket: state => state.socket,
    simplePeer: state => state.simplePeer,
    peers: state => state.peers,
    streams: state => {
      const streams = []
      state.peers.forEach(entry => streams.push(...entry.peer._remoteStreams))
      return streams
    },
    webcamStream: state => state.webcamStream,
    instructorStream: state => state.instructorStream,
    instructorSrcStream: state => state.instructorSrcStream,
    instructorStreamID: state => state.instructorStreamID,
    rtcConfig: state => state.rtcConfig
  },
  mutations: {
    socket (state, socket) {
      state.socket = socket
    },
    simplePeer (state, simplePeer) {
      state.simplePeer = simplePeer
    },
    webcamStream (state, webcamStream) {
      state.webcamStream = webcamStream
    },
    instructorStream (state, instructorStream) {
      state.instructorStream = instructorStream
    },
    instructorSrcStream (state, instructorSrcStream) {
      state.instructorSrcStream = instructorSrcStream
    },
    instructorStreamID (state, instructorStreamID) {
      state.instructorStreamID = instructorStreamID
    },
    rtcConfig (state, rtcConfig) {
      state.rtcConfig = rtcConfig
    }
  },
  actions: {

  }
})
