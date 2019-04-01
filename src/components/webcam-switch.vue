<template>
  <div>
    <button class="button" v-if="!webcamStream" @click="getUserMedia()">
      {{ enable }} <md-video/>
    </button>
    <button class="button" v-else @click="webcamStream = undefined">
      {{ disable }} <md-video-off/>
    </button>
  </div>
</template>

<script>
import MdVideo from 'vue-material-design-icons/Video'
import MdVideoOff from 'vue-material-design-icons/VideoOff'
import UserMediaMixin from '@/components/user-media-mixin'

export default {
  name: 'webcam-switch',
  mixins: [UserMediaMixin],
  props: {
    enable: {
      type: String,
      default: 'Start Webcam'
    },
    disable: {
      type: String,
      default: 'Stop Webcam'
    }
  },
  components: {
    MdVideo,
    MdVideoOff
  },
  computed: {
    webcamStream: {
      get () {
        return this.$store.getters.webcamStream
      },
      set (v) {
        this.$store.commit('webcamStream', v)
      }
    }
  },
  watch: {
    webcamStream (v, o) {
      if (o) {
        o.getTracks().forEach(t => t.stop())
      }
    }
  }
}
</script>
