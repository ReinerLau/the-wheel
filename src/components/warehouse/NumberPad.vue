<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const currentValue = ref('0')

const handleNumberClick = (num: string) => {
  if (currentValue.value === '0') {
    currentValue.value = num
  } else {
    currentValue.value += num
  }
  emit('update:modelValue', Number(currentValue.value))
}

const handleClear = () => {
  currentValue.value = '0'
  emit('update:modelValue', 0)
}

const handleDelete = () => {
  if (currentValue.value.length > 1) {
    currentValue.value = currentValue.value.slice(0, -1)
    emit('update:modelValue', Number(currentValue.value))
  } else {
    handleClear()
  }
}
</script>

<template>
  <div class="number-pad">
    <div grid="~ cols-3" gap="2">
      <div v-for="n in 9" :key="n" class="number-key" @click="handleNumberClick(String(n))">
        {{ n }}
      </div>
      <div class="number-key" @click="handleClear">C</div>
      <div class="number-key" @click="handleNumberClick('0')">0</div>
      <div class="number-key" @click="handleDelete">
        <div i-ep-delete />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.number-pad {
  @apply p-4;
}

.number-key {
  @apply h-12 flex items-center justify-center bg-white rounded shadow-sm cursor-pointer transition-all duration-300 text-lg font-medium;

  &:hover {
    @apply shadow-md transform -translate-y-0.5;
  }

  &:active {
    @apply transform translate-y-0;
  }
}
</style>
