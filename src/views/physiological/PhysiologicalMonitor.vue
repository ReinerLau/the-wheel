<template>
  <el-scrollbar height="100%">
    <div class="physiological-monitor p-4">
      <!-- 实时数据统计 -->
      <div v-if="physiologicalData">
        <RealtimeStats :data="physiologicalData" />
      </div>

      <!-- 趋势图表 - 2x2 网格布局 -->
      <div v-if="physiologicalData" class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <ParameterTrendCard parameter="temperature" />
        <ParameterTrendCard parameter="heartRate" />
        <ParameterTrendCard parameter="systolic" />
        <ParameterTrendCard parameter="oxygenSaturation" />
      </div>

      <!-- 空状态 -->
      <el-empty v-else-if="!loading" description="暂无生理体征数据" />

      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center justify-center h-64">
        <el-loading-icon class="mr-2" />
        <span>加载中...</span>
      </div>
    </div>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

import RealtimeStats from './components/RealtimeStats.vue'
import ParameterTrendCard from './components/ParameterTrendCard.vue'
import type { RealtimePhysiologicalData } from '@/types/physiological'
import { getRealtimePhysiologicalData } from '@/api/physiological'

const loading = ref(false)
const physiologicalData = ref<RealtimePhysiologicalData>()

/**
 * 获取生理体征数据
 */
const loadPhysiologicalData = async () => {
  loading.value = true
  const { data } = await getRealtimePhysiologicalData()
  physiologicalData.value = data
  loading.value = false
}

// 定时刷新数据
let refreshInterval: number | null = null

onMounted(async () => {
  await loadPhysiologicalData()

  // 每30秒刷新一次实时数据
  refreshInterval = window.setInterval(loadPhysiologicalData, 30000)
})

// 清理定时器
const cleanup = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

// 组件卸载时清理
import { onUnmounted } from 'vue'
onUnmounted(cleanup)
</script>

<style scoped>
.physiological-monitor {
  min-height: 100vh;
  background-color: #f5f7fa;
}
</style>
