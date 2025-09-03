<template>
  <div class="h-full grid grid-cols-2 grid-rows-2 gap-6">
    <ParameterTrendCard
      v-for="parameter in parameters"
      :key="parameter"
      :parameter="parameter"
      :historical-data="historicalData"
      :loading="loading"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ParameterTrendCard from './ParameterTrendCard.vue'
import type { HistoricalPhysiologicalData } from '@/types/physiological'
import { getHistoricalPhysiologicalData } from '@/api/physiological'

const loading = ref(false)
const historicalData = ref<HistoricalPhysiologicalData>()

/**
 * 需要显示的参数列表
 */
const parameters = ['temperature', 'heartRate', 'systolic', 'oxygenSaturation'] as const

/**
 * 加载当天历史数据
 */
const loadHistoricalData = async () => {
  loading.value = true
  try {
    const { data } = await getHistoricalPhysiologicalData()
    historicalData.value = data
  } catch (error) {
    console.error('获取历史生理体征数据失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadHistoricalData()
})
</script>
