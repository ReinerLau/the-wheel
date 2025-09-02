<script setup lang="ts">
import type { Warehouse } from '@/types/warehouse'
import { useRouter } from 'vue-router'
const router = useRouter()
const props = defineProps<{
  warehouse: Warehouse
}>()

const emit = defineEmits<{
  edit: [warehouse: Warehouse]
  delete: [warehouse: Warehouse]
}>()

function toWarehouseDetail() {
  router.push({
    name: 'warehouse-detail',
    params: {
      id: props.warehouse.id,
      name: props.warehouse.name,
    },
  })
}
</script>

<template>
  <div class="warehouse-card" bg="white" rounded-lg p="4">
    <div flex="~" justify="between" items="center" mb="4">
      <h3 text="lg" font="medium">{{ warehouse.name }}</h3>
      <div flex="~" gap="2">
        <el-button-group>
          <el-button data-test="edit" type="primary" link @click="emit('edit', warehouse)">
            <div class="i-mdi:account-box-edit-outline" />
          </el-button>
          <el-button data-test="delete" type="primary" link @click="emit('delete', warehouse)">
            <div class="i-mdi:delete-forever-outline" />
          </el-button>
        </el-button-group>
        <el-button data-test="view" type="primary" link @click="toWarehouseDetail()">
          查看详情
        </el-button>
      </div>
    </div>
    <!-- 仓库信息 -->
    <div grid="~ cols-3" gap="4">
      <div>
        <div text="gray-500" mb="1">库房建设时间</div>
        <div data-test="constructionTime">{{ warehouse.constructionTime }}</div>
      </div>
      <div>
        <div text="gray-500" mb="1">建筑面积</div>
        <div data-test="buildingArea">{{ warehouse.buildingArea }}㎡</div>
      </div>
      <div>
        <div text="gray-500" mb="1">举架高度</div>
        <div data-test="ceilingHeight">{{ warehouse.ceilingHeight }}m</div>
      </div>
      <div>
        <div text="gray-500" mb="1">引洞长度</div>
        <div data-test="tunnelLength">{{ warehouse.tunnelLength }}m</div>
      </div>
      <div>
        <div text="gray-500" mb="1">货架数量</div>
        <div data-test="shelveCount">{{ warehouse.shelveCount }}</div>
      </div>
      <div>
        <div text="gray-500" mb="1">物资数量</div>
        <div data-test="materialCount">{{ warehouse.materialCount }}</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.warehouse-card {
  @apply transition-all duration-300 border border-gray-200 border-solid;
}
</style>
