<template>
  <div class="webcam-container" v-show="hasStream"
      @mouseover="mouseover=true" @mouseout="mouseover=false">
    <div class="webcam-video-div">
      <video class="webcam-video" ref="video"
          :class="webcamVideoClasses"
          :muted="muted"
          autoplay="autoplay"></video>
    </div>
    <webcam-overlay ref="webcamOverlay"
        @mic-on="micOn" @mic-off="micOff"
        @volume-on="volumeOn" @volume-off="volumeOff"
        @video-on="videoOn" @video-off="videoOff"
        :settings="settings"
        :mic="mic"
        :volume="volume"
        :video="video"
        v-show="mouseover === true"/>
    <i v-if="showResizeArrow" class="material-icons resize-arrow"> arrow_drop_down </i>
  </div>
</template>
<script>
import WebcamOverlay from '@/components/webcam/webcam-overlay'
// import Plyr from 'plyr'

export default {
  name: 'webcam-video',
  components: {
    'webcam-overlay': WebcamOverlay
  },
  props: {
    mic: {
      type: Boolean,
      default: false
    },
    volume: {
      type: Boolean,
      default: false
    },
    video: {
      type: Boolean,
      default: false
    },
    settings: {
      type: Boolean,
      default: false
    },
    webcamVideoClasses: {
      type: [Array, String],
      default () {
        return []
      }
    },
    muted: {
      type: Boolean,
      default: false
    },
    stream: {
      type: [MediaStream, Object],
      default () {
        return {}
      }
    },
    streamOpts: {
      type: Object,
      default () {
        return {
          video: true,
          volume: true
        }
      }
    },
    showResizeArrow: {
      type: Boolean,
      default: false
    }
  },
  computed: {
  },
  data () {
    return {
      hasStream: false,
      mouseover: false,
      micEnabled: true,
      videoEnabled: true,
      draggableOpts: {
        inertia: true,
        restrict: {
          restriction: document
        }
      },
      resizableOpts: {
        inertia: true,
        edges: {
          bottom: '.resize-arrow',
          right: '.resize-arrow'
        },
        restrictSize: {
          min: {
            width: 100,
            height: 100
          }
        }
      }
    }
  },
  watch: {
    stream (newVal, oldVal) {
      this.updateStream(newVal)
    }
  },
  methods: {
    forEachTrack (tracks, fn) {
      tracks.forEach((t, idx, arr) => {
        fn(t, idx, arr)
      })
    },
    forEachAudioTrack (fn) {
      var audioTracks = this.stream.getAudioTracks()
      this.forEachTrack(audioTracks, fn)
    },
    forEachVideoTrack (fn) {
      var videoTracks = this.stream.getVideoTracks()
      this.forEachTrack(videoTracks, fn)
    },

    micOn () {
      // Turn on mic
      var self = this
      if (this.stream.getAudioTracks().length === 0) {
        // This stream has no microphone permission
        return this.$emit('no-audio-tracks')
      }
      this.forEachAudioTrack((t, idx, audioTracks) => {
        t.enabled = true
        if (idx === audioTracks.length - 1) {
          self.$refs.webcamOverlay.isMicOn = true
        }
      })
      this.streamOpts.mic = true
    },
    micOff () {
      // Turn off mic
      var self = this
      this.forEachAudioTrack((t, idx, audioTracks) => {
        t.enabled = false
        if (idx === audioTracks.length - 1) {
          self.$refs.webcamOverlay.isMicOn = false
        }
      })
      this.streamOpts.mic = false
    },
    volumeOn () {
      // Turn on volume
      var self = this
      if (this.stream.getAudioTracks().length === 0) {
        // This stream has no microphone permission
        return this.$emit('no-audio-tracks')
      }
      this.forEachAudioTrack((t, idx, audioTracks) => {
        t.enabled = true
        if (idx === audioTracks.length - 1) {
          self.$refs.webcamOverlay.isVolumeOn = true
        }
      })
      this.streamOpts.volume = true
    },
    volumeOff () {
      // Turn off volume
      var self = this
      this.forEachAudioTrack((t, idx, audioTracks) => {
        t.enabled = false
        if (idx === audioTracks.length - 1) {
          self.$refs.webcamOverlay.isVolumeOn = false
        }
      })
      this.streamOpts.volume = false
    },
    videoOn () {
      // Turn on video
      var self = this
      if (this.stream.getVideoTracks().length === 0) {
        // This stream has no microphone permission
        return this.$emit('no-video-tracks')
      }
      this.forEachVideoTrack((t, idx, videoTracks) => {
        t.enabled = true
        if (idx === videoTracks.length - 1) {
          self.$refs.webcamOverlay.isVideoOn = true
        }
      })
      this.streamOpts.video = true
    },
    videoOff () {
      // Turn off video
      var self = this
      this.forEachVideoTrack((t, idx, videoTracks) => {
        t.enabled = false
        if (idx === videoTracks.length - 1) {
          self.$refs.webcamOverlay.isVideoOn = false
        }
      })
      this.streamOpts.video = false
    },
    updateStream (stream) {
      var videoEl = this.$refs.video
      videoEl.srcObject = stream
      if (this.streamOpts && this.streamOpts.muted) {
        videoEl.muted = true
      }
      this.hasStream = !!videoEl.srcObject
      if (this.stream.getAudioTracks().length === 0) {
        // If this stream is our own, then mic permission is not set
        // If remote stream, then the remote client's microphone permission is not set
        if (this.mic) {
          this.$refs.webcamOverlay.isMicOn = false
        }
        if (this.volume) {
          this.$refs.webcamOverlay.isVolumeOn = false
        }
      } else {
        if (!this.streamOpts.volume) {
          this.volumeOff()
        }
        if (this.mic) {
          if (!this.streamOpts.mic) {
            this.micOff()
          }
        }
      }
      if (this.stream.getVideoTracks().length === 0) {
        // If this stream is our own, then webcam permission is not set
        // If remote stream, then the remote client's webcam permission is not set
        this.$refs.webcamOverlay.isVideoOn = false
      } else {
        if (!this.streamOpts.video) {
          this.videoOff()
        }
      }
    }
  },
  mounted () {
    // If stream is already set, call updateStream to render it
    if (this.stream instanceof MediaStream) {
      this.updateStream(this.stream)
    }
  }
}
</script>

<style lang="scss" scoped>

.dark {
  .webcam-video {
    background-color: darken(grey, 10);
  }
}

/* Webcam stuff */
/* Webcam stuff */
.webcam-container {
  position: relative;
  background: #252525;
  margin: auto;
  width: inherit;
  height: inherit;
  border-radius: 3px;
  z-index: 100;
  @media all and (display-mode: fullscreen) {
    z-index: inherit;
  }
}

.webcam-video-div video {
  @media all and (display-mode: fullscreen) {
    z-index: inherit;
  }
}

.webcam-container:after {
  /*display: block;*/
  padding-bottom: 100%;
}
.webcam-video-div {
    /*display: inline-block;*/
    height: 100%;
    width: 100%;
    margin: 0px 0px;
    border: 1px #333 solid;
    border-radius: inherit;
    overflow: hidden;
    @media all and (display-mode: fullscreen) {
      z-index: inherit;
    }
}

.webcam-video {
  height: 100%;
  width: 100%;
  background-color: #252525;
}
</style>
