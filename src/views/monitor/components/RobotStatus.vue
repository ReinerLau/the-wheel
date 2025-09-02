<template>
  <el-card style="max-width: 480px">
    <template #header>定位</template>
    <el-image
      :src="props.data?.mapUrl"
      fit="contain"
      class="w-full h-full"
      :preview-src-list="props.data?.mapUrl ? [props.data.mapUrl] : []"
      preview-teleported
      hide-on-click-modal
    />
  </el-card>
</template>

<script setup lang="ts">
interface Data {
  mapUrl?: string
}

const props = defineProps<{ data?: Data }>()
</script>
