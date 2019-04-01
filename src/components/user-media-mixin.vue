<script>
export default {
  methods: {
    async getUserMedia (opts = { video: true, audio: true }) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(opts)
        this.$store.commit('webcamStream', stream)
      } catch (e) {
        console.error(e)
      }
    }
  }
}
</script>
