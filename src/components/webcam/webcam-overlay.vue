<template>
  <div class="overlay">
    <div class="webcam-options">
      <div class="not-selectable right">
        <span style="display: inline-block" v-if="settings === true">
          <i :id="'settings-trigger-' + id" class="material-icons overlay-icon hover" :data-target="'settings-' + id" @click="toggleSettings">settings</i>
        </span>
        <span style="display: inline-block" v-if="mic === true">
          <i class="material-icons overlay-icon hover mic-toggle"    v-show="!isMicOn"     @click="micOn">mic_off</i>
          <i class="material-icons overlay-icon hover mic-toggle"    v-show="isMicOn"      @click="micOff">mic</i>
        </span>
        <span style="display: inline-block" v-if="volume === true">
          <i class="material-icons overlay-icon hover volume-toggle" v-show="!isVolumeOn"  @click="volumeOn">volume_off</i>
          <i class="material-icons overlay-icon hover volume-toggle" v-show="isVolumeOn"   @click="volumeOff">volume_up</i>
        </span>
        <span style="display: inline-block" v-if="video === true">
          <i class="material-icons overlay-icon hover video-toggle"  v-show="!isVideoOn"   @click="videoOn">videocam_off</i>
          <i class="material-icons overlay-icon hover video-toggle"  v-show="isVideoOn"    @click="videoOff">videocam</i>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import uuidv4 from 'uuid/v4'

export default {
  name: 'webcam-overlay',
  components: {
  },
  props: {
    id: {
      type: String,
      default () { return uuidv4() }
    },
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
    }
  },
  data () {
    return {
      isMicOn: true,
      isVolumeOn: true,
      isVideoOn: true,
      settingsDropdown: undefined
    }
  },
  methods: {
    commonEmitter: function (name, state) {
      this.$emit(`${name}-${state}`)
    },
    micOn () {
      return this.commonEmitter('mic', 'on')
    },
    micOff () {
      return this.commonEmitter('mic', 'off')
    },
    volumeOn () {
      return this.commonEmitter('volume', 'on')
    },
    volumeOff () {
      return this.commonEmitter('volume', 'off')
    },
    videoOn () {
      return this.commonEmitter('video', 'on')
    },
    videoOff () {
      return this.commonEmitter('video', 'off')
    },
    toggleSettings () {
      this.$emit('toggle-settings', this)
    }
  },
  mounted () {
  },
  beforeDestroy () {
    this.settingsDropdown && this.settingsDropdown.destroy()
  }
}
</script>

<style lang="scss" scoped>
.overlay {
    /* Height & width depends on how you want to reveal the overlay (see JS below) */
    height: 30%;
    width: 100%;
    position: absolute; /* Stay in place */
    z-index: 1; /* Sit on top */
    left: 0;
    top: 0;
    background-color: rgb(0,0,0); /* Black fallback color */
    background-color: rgba(0,0,0, 0.6); /* Black w/opacity */
    /*overflow-x: hidden;*/ /* Disable horizontal scroll */
    transition: 0.1s; /* 0.5 second transition effect to slide in or slide down the overlay (height or width, depending on reveal) */
    border-top-left-radius: inherit;
    border-top-right-radius: inherit;
    border-bottom-right-radius: 2px;
    border-bottom-left-radius: 2px;
}
.overlay-icon {
  font-size: 1.1em;
  color: rgba(255, 255, 255, 0.4);
  vertical-align: middle;
  margin-left: 0.4em;
  &:hover {
    cursor: pointer;
    color: rgba(255, 255, 255, 0.8);
  }
}
.webcam-options {
  position: relative;
  width: 100%;
  height: 100%;
  display: inline-block;
  vertical-align: middle;
  font-size: 1.2em;

  & > div {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    /*bottom: 0;*/
    padding: 0 5%;
    @include until($tablet) {
      padding: 1%;
    }
    .overlay-icon {
      @include until($tablet) {
        margin-left: 0.2rem;
      }
    }
  }
}
</style>
