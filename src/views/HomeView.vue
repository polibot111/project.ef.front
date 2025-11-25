<template>
	<div class="home d-flex justify-center align-center">
		<div v-if="videoUrl" class="video-container" style="width: 700px; height: 400px;">
			<!-- <iframe
				width="560"
				height="315"
				:src="getEmbedUrl(videoUrl)"
				frameborder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowfullscreen
				referrerpolicy="strict-origin-when-cross-origin"
			></iframe> -->

			<video ref="videoPlayer" class="video-js"></video>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import $axios from '../composables/axios'
import videojs from 'video.js'
import "videojs-youtube";
import 'video.js/dist/video-js.css';

const videoUrl = ref('')
const videoPlayer:any = ref()

function getEmbedUrl(url: string) {
  // Convert standard YouTube watch URL to embed URL
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1].split('&')[0]
    return `https://www.youtube-nocookie.com/embed/${videoId}`
  }
  return url
}
watch(videoPlayer, (newVal:any) => {
  console.log('newVal is => ', newVal)
  newVal = videojs(newVal, {
    controls: true,
    autoplay: false,
    preload: 'auto',
    responsive: true,
    muted: false,
    width: '700px',
    height: '400px',
    sources: [{
      type: 'video/youtube',
      src: videoUrl.value,
    }],
    playlist: {
      autoadvance: 0,
    },
    "youtube": { 
      ytControls: 0,
      playsinline: 1,
      iv_load_policy: 3,
      
    },
    "techOrder": ["youtube"],
  })
})

onMounted(async () => {
  if(!import.meta.env.SSR) {
    const {data}:any  = await $axios('/EducationVideo', {
      method: 'GET'
  })

  console.log('video is => ', data.value)

  videoUrl.value = data.value.data[0].url

  console.log('videoPlayer is => ', videoPlayer.value)


}
})
</script>

<style scoped>
.home {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100dvh - 100px);
  text-align: center;
}
</style>
