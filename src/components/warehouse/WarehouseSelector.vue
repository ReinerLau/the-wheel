<script setup lang="ts">
import { ref } from 'vue'

const warehouses = [
  { id: 'A', name: '主仓库 A 区', usageRate: 80 },
  { id: 'B', name: '主仓库 B 区', usageRate: 65 },
  { id: 'C', name: '临时仓库', usageRate: 45 },
  { id: '1', name: '备用仓库 1', usageRate: 30 },
  { id: '2', name: '备用仓库 2', usageRate: 90 },
  { id: '3', name: '特殊物品仓', usageRate: 20 },
]

const selectedWarehouse = ref('')

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const handleWarehouseSelect = (id: string) => {
  selectedWarehouse.value = id
  emit('update:modelValue', id)
}
</script>

<template>
  <div class="warehouse-selector">
    <div text="gray-500" mb="2">选择仓库</div>
    <div grid="~ cols-3" gap="4">
      <div
        v-for="warehouse in warehouses"
        :key="warehouse.id"
        class="warehouse-item"
        :class="{ active: selectedWarehouse === warehouse.id }"
        @click="handleWarehouseSelect(warehouse.id)"
      >
        <div text="lg" font="medium" mb="2">{{ warehouse.name }}</div>
        <div flex="~" justify="between" items="center">
          <span text="gray-500">可用容量：</span>
          <span>{{ warehouse.usageRate }}%</span>
        </div>
        <el-progress
          :percentage="warehouse.usageRate"
          :color="warehouse.usageRate > 90 ? '#F56C6C' : '#409EFF'"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.warehouse-selector {
  @apply p-4;
}

.warehouse-item {
  @apply p-4 bg-white rounded-lg shadow-md cursor-pointer transition-all duration-300;

  &:hover {
    @apply shadow-lg transform -translate-y-1;
  }

  &.active {
    @apply ring-2 ring-blue-500;
  }
}
</style>
