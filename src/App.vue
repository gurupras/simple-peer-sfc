<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import io from 'socket.io-client'
import SimplePeer from '@/js/peer'

export default {
  name: 'app',
  computed: {
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
    }
  },
  methods: {
    initializeSimplePeer () {
      this.simplePeer = new SimplePeer(this.socket)
    }
  },
  mounted () {
    const socket = io()
    this.socket = socket
    socket.on('ready', this.setupSimplePeer)
  }
}
</script>
<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
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
</style>
