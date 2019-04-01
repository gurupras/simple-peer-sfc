<template>
  <div>
    <div class="row">
      <div class="col s12 input-field">
        <select @change="onChange('videoInput', $event)">
          <option v-for="entry in videoInput" :key="entry.deviceId" :value="entry.deviceId">{{entry.label}}</option>
        </select>
        <label>Video Input</label>
      </div>
    </div>
    <div class="row">
      <div class="col s12 input-field">
        <select @change="onChange('audioInput', $event)">
          <option v-for="entry in audioInput" :key="entry.deviceId" :value="entry.deviceId">{{entry.label}}</option>
        </select>
        <label>Audio Input</label>
      </div>
    </div>
    <!-- <div class="row">
      <div class="col s12 input-field">
        <select @change="$emit('audio-output-changed')">
          <option v-for="entry in audioOutput" :key="entry.deviceId" :value="entry.deviceId">{{entry.label}}</option>
        </select>
        <label>Audio Output</label>
      </div>
    </div> -->
  </div>
</template>

<script>
export default {
  name: 'webcam-settings',
  props: {
  },
  computed: {
    audioInput () {
      return this.streams.filter(stream => stream.kind === 'audioinput')
    },
    videoInput () {
      return this.streams.filter(stream => stream.kind === 'videoinput')
    },
    audioOutput () {
      return this.streams.filter(stream => stream.kind === 'audiooutput')
    },
    selfWebcamStream: {
      get () {
        return this.$store.getters.selfWebcamStream
      },
      set (v) {
        this.$store.commit('selfWebcamStream', v)
      }
    }
  },
  data () {
    return {
      streams: []
    }
  },
  watch: {
    streams () {
      this.$nextTick(() => {
        this.selects = window.M.FormSelect.init(this.$el.querySelectorAll('select'), {
          dropdownOptions: {
            coverTrigger: false
          }
        })
        this.$emit('ready')
      })
    }
  },
  methods: {
    async onChange (type, { target: { value } }) {
      const constraints = {
        audio: {
          deviceId: undefined
        },
        video: {
          deviceId: undefined
        }
      }
      switch (type) {
        case 'videoInput':
          constraints.video.deviceId = {
            exact: value
          }
          this.selfWebcamStream.getVideoTracks().forEach(track => track.stop())
          break
        case 'audioInput':
          constraints.audio.deviceId = {
            exact: value
          }
          this.selfWebcamStream.getAudioTracks().forEach(track => track.stop())
          break
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      this.selfWebcamStream = stream
    }
  },
  async beforeMount () {
    this.streams = await navigator.mediaDevices.enumerateDevices()
  },
  mounted () {
    window.webcamSettings = this
  }
}
</script>

<style lang="scss" scoped>
.row {
  margin-top: 12px;
  margin-bottom: 12px;
}

/deep/ .dropdown-content {
  li {
    min-height: 40px;
    span {
      padding-top: 8px;
      padding-bottom: 8px;
    }
  }
}
</style>
