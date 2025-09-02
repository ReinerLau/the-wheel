<template>
  <div class="w-full h-full relative">
    <video ref="video" class="w-full h-full object-fill" autoplay muted />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

// 声明JSWebrtc对象以解决类型问题
declare const JSWebrtc: {
  Player: new (
    url: string,
    options: {
      video: HTMLVideoElement | null
      autoPlay: boolean
      onPlay: () => void
    },
  ) => {
    close: () => void
    destroy: () => void
  }
}

const video = ref<HTMLVideoElement | null>(null)
let player: { close: () => void; destroy: () => void } | null = null

const props = defineProps<{
  url?: string
}>()

function play() {
  if (!video.value || !props.url) {
    return
  }

  // 关闭之前的播放器
  if (player) {
    player.destroy()
    player = null
  }

  // 使用JSWebrtc.Player播放视频
  player = new JSWebrtc.Player(props.url, {
    video: video.value,
    autoPlay: true,
    onPlay: () => {
      console.log('视频已开始播放')
    },
  })
}

onBeforeUnmount(() => {
  if (player) {
    player.destroy()
    player = null
  }
})

defineExpose({
  play,
})
</script>
