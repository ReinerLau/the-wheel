<template>
  <div class="grid grid-cols-4 gap-4 mb-6">
    <!-- 体温 -->
    <el-card v-loading="loading">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm text-gray-500 mb-1">体温</div>
          <el-statistic
            v-if="data?.current"
            :value="data.current.temperature"
            :precision="1"
            suffix="°C"
            :value-style="getValueStyle('temperature')"
          />
          <div v-else class="text-2xl font-bold text-gray-400">-</div>
        </div>
        <div class="text-2xl" :class="getStatusColor('temperature')">🌡️</div>
      </div>
      <div class="mt-2 text-xs text-gray-400">正常范围: 36.0-37.5°C</div>
    </el-card>

    <!-- 心率 -->
    <el-card v-loading="loading">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm text-gray-500 mb-1">心率</div>
          <el-statistic
            v-if="data?.current"
            :value="data.current.heartRate"
            suffix="次/分"
            :value-style="getValueStyle('heartRate')"
          />
          <div v-else class="text-2xl font-bold text-gray-400">-</div>
        </div>
        <div class="text-2xl" :class="getStatusColor('heartRate')">❤️</div>
      </div>
      <div class="mt-2 text-xs text-gray-400">正常范围: 60-100次/分</div>
    </el-card>

    <!-- 血压 -->
    <el-card v-loading="loading">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm text-gray-500 mb-1">血压</div>
          <div
            v-if="data?.current"
            class="text-2xl font-bold"
            :style="getValueStyle('bloodPressure')"
          >
            {{ data.current.bloodPressure.systolic }}/{{ data.current.bloodPressure.diastolic }}
          </div>
          <div v-else class="text-2xl font-bold text-gray-400">-</div>
          <div class="text-xs text-gray-500">mmHg</div>
        </div>
        <div class="text-2xl" :class="getStatusColor('bloodPressure')">🩺</div>
      </div>
      <div class="mt-2 text-xs text-gray-400">正常范围: 90-140/60-90mmHg</div>
    </el-card>

    <!-- 血氧 -->
    <el-card v-loading="loading">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm text-gray-500 mb-1">血氧</div>
          <el-statistic
            v-if="data?.current"
            :value="data.current.oxygenSaturation"
            suffix="%"
            :value-style="getValueStyle('oxygenSaturation')"
          />
          <div v-else class="text-2xl font-bold text-gray-400">-</div>
        </div>
        <div class="text-2xl" :class="getStatusColor('oxygenSaturation')">🫁</div>
      </div>
      <div class="mt-2 text-xs text-gray-400">正常范围: 95-100%</div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { RealtimePhysiologicalData } from '@/types/physiological'
import { getRealtimePhysiologicalData } from '@/api/physiological'

const data = ref<RealtimePhysiologicalData>()
const loading = ref(false)

/**
 * 获取实时生理体征数据
 */
const loadRealtimeData = async () => {
  loading.value = true
  try {
    const { data: result } = await getRealtimePhysiologicalData()
    data.value = result
  } catch (error) {
    console.error('获取实时生理体征数据失败:', error)
    // 保持当前数据不变，或设置为 undefined 显示 "-"
  } finally {
    loading.value = false
  }
}

// 定时刷新数据
let refreshInterval: number | null = null

onMounted(async () => {
  await loadRealtimeData()

  // 每30秒刷新一次实时数据
  refreshInterval = window.setInterval(loadRealtimeData, 30000)
})

/**
 * 清理定时器
 */
const cleanup = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

// 组件卸载时清理
onUnmounted(cleanup)

/**
 * 获取参数状态颜色
 */
const getStatusColor = (param: string) => {
  const status = getParamStatus(param)
  return {
    'text-green-500': status === 'normal',
    'text-yellow-500': status === 'warning',
    'text-red-500': status === 'danger'
  }
}

/**
 * 获取数值样式
 */
const getValueStyle = (param: string) => {
  const status = getParamStatus(param)
  return {
    color: status === 'normal' ? '#67c23a' : status === 'warning' ? '#e6a23c' : '#f56c6c'
  }
}

/**
 * 获取参数状态
 */
const getParamStatus = (param: string) => {
  if (!data.value?.current) {
    return 'normal'
  }

  const { current } = data.value

  switch (param) {
    case 'temperature':
      if (current.temperature < 36.0 || current.temperature > 37.5) {
        return current.temperature < 35.0 || current.temperature > 39.0 ? 'danger' : 'warning'
      }
      return 'normal'

    case 'heartRate':
      if (current.heartRate < 60 || current.heartRate > 100) {
        return current.heartRate < 50 || current.heartRate > 120 ? 'danger' : 'warning'
      }
      return 'normal'

    case 'bloodPressure':
      const { systolic, diastolic } = current.bloodPressure
      if (systolic < 90 || systolic > 140 || diastolic < 60 || diastolic > 90) {
        return systolic < 80 || systolic > 160 || diastolic < 50 || diastolic > 100
          ? 'danger'
          : 'warning'
      }
      return 'normal'

    case 'oxygenSaturation':
      if (current.oxygenSaturation < 95) {
        return current.oxygenSaturation < 90 ? 'danger' : 'warning'
      }
      return 'normal'

    default:
      return 'normal'
  }
}
</script>
