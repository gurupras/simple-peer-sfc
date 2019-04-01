<template>
  <div>
    <h3 class="title is-3"> Students </h3>
    <div class="columns is-multiline is-flex is-desktop">
      <div class="columns">
        <div class="column webcam-container" v-for="stream in filter(streams)" :key="stream.id">
          <webcam-video class="webcam-video"
              :class="{self: (self && stream.id === self.id)}"
              :volume="true"
              :video="true"
              :stream="stream"
              :stream-id="stream.id"
              :self-id="self && self.id"
              :show-resize-arrow="false"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import WebcamVideo from '@/components/webcam/webcam-video'

export default {
  name: 'students',
  props: {
    self: {
      type: MediaStream
    },
    streams: {
      type: Array,
      required: true
    },
    filter: {
      type: Function,
      default () {
        return (streams) => streams.filter(s => s !== this.self)
      }
    }
  },
  components: {
    WebcamVideo
  }
}
</script>
