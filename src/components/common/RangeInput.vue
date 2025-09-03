<template>
  <div class="range-input-group">
    <el-input-number
      :model-value="min"
      :min="minLimit"
      :max="maxLimit"
      :precision="precision"
      :step="step"
      placeholder="最小值"
      class="range-input"
      controls-position="right"
      @update:model-value="handleMinChange"
    />
    <span class="range-separator">-</span>
    <el-input-number
      :model-value="max"
      :min="minLimit"
      :max="maxLimit"
      :precision="precision"
      :step="step"
      placeholder="最大值"
      class="range-input"
      controls-position="right"
      @update:model-value="handleMaxChange"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * 范围输入组件属性
 */
interface Props {
  /** 最小值 */
  min: number
  /** 最大值 */
  max: number
  /** 最小限制 */
  minLimit: number
  /** 最大限制 */
  maxLimit: number
  /** 精度 */
  precision?: number
  /** 步长 */
  step?: number
}

/**
 * 组件事件
 */
interface Emits {
  /** 最小值变化 */
  (e: 'update:min', value: number): void
  /** 最大值变化 */
  (e: 'update:max', value: number): void
}

const props = withDefaults(defineProps<Props>(), {
  precision: 0,
  step: 1
})

const emit = defineEmits<Emits>()

/**
 * 处理最小值变化
 */
const handleMinChange = (value: number | undefined) => {
  if (value !== undefined) {
    emit('update:min', value)
  }
}

/**
 * 处理最大值变化
 */
const handleMaxChange = (value: number | undefined) => {
  if (value !== undefined) {
    emit('update:max', value)
  }
}
</script>

<style scoped lang="scss">
.range-input-group {
  @apply flex items-center gap-3;
}

.range-input {
  @apply w-28;
}

.range-separator {
  @apply text-gray-500 text-sm whitespace-nowrap;
}
</style>
