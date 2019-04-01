<template>
  <div>
    <p> You need to enable Webcam permissions for twoseven.xyz to use the video-chat functionality. </p>
    <!-- Mobile -->
    <div v-if="isMobile">
      <!-- Android -->
      <div v-if="isAndroid">
        <!-- Chrome -->
        <div v-if="isChrome">
          To enable webcam permission:
          <ul class="browser-default">
            <li> Click the Chrome menu on the browser toolbar </li>
            <li> Select Settings </li>
            <li> Click Show advanced settings </li>
            <li> In the "Privacy" section, click Content settings </li>
            <li> In the "Media" section: </li>
              <ul class="browser-default">
                <li> <b>Ask when a site requires access to your camera and microphone</b>:
                  Select this option if you want Chrome to alert you whenever a site requests access to your camera and microphone
                </li>
                <li> <b>Do not allow sites to access your camera and microphone</b>:
                  Select this option to automatically deny any site requests to access your camera and microphone
                </li>
              </ul>
          </ul>
        </div> <!-- Chrome -->
      </div> <!-- Android -->
    </div> <!-- Mobile -->

    <!-- Desktop -->
    <div v-else>
      <!-- Chrome -->
      <div v-if="isChrome">
        <p> To enable webcam permission: </p>
        <ul class="browser-default">
          <li>
            Click on the <img src="//storage.googleapis.com/support-kms-prod/9IKkC4co6mWlM461wyAF94BiF9nMmvcfaqUl" width="18" height="18" alt="Lock" title="Lock"> icon to the left of
            the web address
          </li>
          <li> On both the <b>Camera</b> and <b>Microphone</b> dropdowns, select <b>Allow</b> </li>
          <li> Refresh the page to apply the selected settings </li>
        </ul>
      </div> <!-- Chrome -->
      <!-- Firefox -->
      <div v-if="isFirefox">
        <p> To enable webcam permission: </p>
        <ul class="browser-default">
          <li>
            Click on the icon that looks similar to <img src="//storage.googleapis.com/support-kms-prod/9IKkC4co6mWlM461wyAF94BiF9nMmvcfaqUl" width="18" height="18" alt="Lock" title="Lock"> to the left of
            the web address
          </li>
          <li> Under permissions, unblock <b>Use the Microphone</b> and <b>Use the Camera</b> permissions </li>
          <li> Refresh the page to apply the selected settings </li>
        </ul>
      </div> <!-- Firefox -->
    </div> <!-- Desktop -->
    <a v-if="showBtn" class="waves waves-effect btn webcam-help-button right primary" @click="$emit('ok')">Got it</a>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'webcam-help',
  props: {
    showBtn: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    ...mapGetters([
      'isMobile',
      'isAndroid',
      'isChrome',
      'isFirefox'
    ])
  }
}
</script>

<style scoped>
ul {
  padding-left: 1.5em;
}

.webcam-help-button {
  margin: 1em 0;
}
</style>
