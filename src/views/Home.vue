<template>
  <div class="home section">
    <router-view/>
    <div class="instructor-screen is-flex">
      <div class="basic-flex">
        <h3 class="title is-3">Instructor</h3>
        <div class="basic-flex">
          <webcam-video class="instructor-video-container basic-flex" v-if="instructorStream"
              :volume="true"
              :video="true"
              :stream="instructorStream"
              :show-resize-arrow="false"/>
        </div>
      </div>
    </div>
    <div class="">
      <h5 class="title is-5"> My Stream </h5>
      <div class="columns" v-if="$route.name !== 'instructor'">
        <div class="column">
          <webcam-switch class="is-pulled-right" enable="Ask a Question" disable="Finish"/>
        </div>
      </div>
      <div class="columns">
        <div class="column is-offset-5">
          <div class="webcam-container">
            <webcam-video v-if="webcamStream" class="webcam-video"
                :mic="true"
                :volume="false"
                :video="true"
                :muted="true"
                :settings="true"
                :stream="webcamStream"
                :stream-opts="selfWebcamStreamOpts"
                :show-resize-arrow="false"/>
          </div>
        </div>
      </div>
    </div>
    <students :self="webcamStream" :streams="streams" :filter="studentFilter"/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import WebcamVideo from '@/components/webcam/webcam-video'
import UserMediaMixin from '@/components/user-media-mixin'
import Students from '@/components/students'
import WebcamSwitch from '@/components/webcam-switch'

export default {
  name: 'home',
  mixins: [UserMediaMixin],
  components: {
    WebcamSwitch,
    WebcamVideo,
    Students
  },
  computed: {
    ...mapGetters([
      'peers',
      'streams',
      'webcamStream',
      'instructorStream',
      'instructorSrcStream'
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
    },
    studentFilter () {
      const { webcamStream, instructorStream } = this
      return (streams) => {
        return streams.filter(s => {
          // return (!webcamStream || s.id !== webcamStream.id) && (!instructorStream || s.id !== instructorStream.id)
          return (!instructorStream || s.id !== instructorStream.id)
        })
      }
      // return streams => streams
    }
  },
  mounted () {
  }
}
</script>

<style lang="scss">
.webcam-video.self {
  border-style: solid;
  border-width: 1px;
  border-color: red;
}

.instructor-video-container {
  height: 20% !important;
}
</style>

<style lang="scss" scoped>
.instructor-screen {
  height: 50vh;
  width: auto;
}
</style>
