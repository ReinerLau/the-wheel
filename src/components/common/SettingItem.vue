<template>
  <div class="setting-item">
    <div class="setting-label">
      <div class="label-title">{{ title }}</div>
      <div class="label-description">{{ description }}</div>
    </div>
    <div class="setting-control">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 设置项组件属性
 */
interface Props {
  /** 设置项标题 */
  title: string
  /** 设置项描述 */
  description: string
}

defineProps<Props>()
</script>

<style scoped lang="scss">
.setting-item {
  @apply flex items-start justify-between gap-8 py-6;
}

.setting-label {
  @apply flex-1;
}

.label-title {
  @apply text-base font-medium text-gray-900 mb-2;
}

.label-description {
  @apply text-sm text-gray-500 leading-relaxed;
}

.setting-control {
  @apply flex-shrink-0;
}
</style>
