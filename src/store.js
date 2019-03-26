import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    socket: undefined
  },
  mutations: {
    socket: (state, socket) => {
      state.socket = socket
    }
  },
  actions: {

  }
})
