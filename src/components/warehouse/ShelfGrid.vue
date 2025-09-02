<script setup lang="ts">
import { ref } from 'vue'

const selectedShelf = ref('')

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const handleShelfSelect = (id: string) => {
  selectedShelf.value = id
  emit('update:modelValue', id)
}
</script>

<template>
  <div p="4" flex="~ col" min-h-0>
    <div text="gray-500" mb="2" flex="~" items="center" justify="between" gap="2">
      <span>货架定位</span>
      <el-input placeholder="输入货架编号" class="w-48" />
    </div>
    <div flex-1 p="4" bg="gray-50" rounded="lg" min-h-0>
      <el-scrollbar :view-style="{ height: '100%' }">
        <el-row :gutter="10">
          <el-col :span="3" v-for="i in 100" :key="i" @click="handleShelfSelect(`A${i}`)">
            <div class="grid-item" :class="{ active: selectedShelf === `A${i}` }">A{{ i }}</div>
          </el-col>
        </el-row>
      </el-scrollbar>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.grid-item {
  @apply flex justify-center items-center bg-white rounded shadow-sm cursor-pointer mb-2;

  &.active {
    @apply ring-2 ring-blue-500;
  }
}
</style>
