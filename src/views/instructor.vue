<template>
  <div class="container">
    <div class="columns">
      <div class="column">
        <div class="is-pulled-right">
          <button class="button" @click="startScreenShare" v-if="!instructorSrcStream">
            Share Screen <monitor-dashboard/>
          </button>
          <button class="button" @click="stopScreenShare" v-else>
            Stop Sharing Screen <monitor-off/>
          </button>
        </div>
        <webcam-switch class="is-pulled-right"/>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import MonitorDashboard from 'vue-material-design-icons/MonitorDashboard'
import MonitorOff from 'vue-material-design-icons/MonitorOff'
import UserMediaMixin from '@/components/user-media-mixin'
import WebcamSwitch from '@/components/webcam-switch'

export default {
  name: 'instructor',
  mixins: [UserMediaMixin],
  components: {
    MonitorDashboard,
    MonitorOff,
    WebcamSwitch
  },
  computed: {
    ...mapGetters([
      'peers'
    ]),
    instructorSrcStream: {
      get () {
        return this.$store.getters.instructorSrcStream
      },
      set (v) {
        this.$store.commit('instructorSrcStream', v)
      }
    }
  },
  watch: {
    instructorSrcStream (v, o) {
      this.peers.forEach(entry => {
        if (o) {
          entry.peer.removeStream(o)
        }
        if (v) {
          entry.peer.addStream(v)
          entry.peer.send(JSON.stringify({
            action: 'instructor-stream',
            streamID: v.id
          }))
        }
      })
    }
  },
  methods: {
    async startScreenShare () {
      this.instructorSrcStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor'
        }
      })
    },
    stopScreenShare () {
      this.instructorSrcStream = undefined
    }
  }
}
</script>
