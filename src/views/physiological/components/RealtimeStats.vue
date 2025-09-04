<template>
  <div class="grid grid-cols-4 gap-4 mb-6">
    <!-- 体温 -->
    <el-card v-loading="loading">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm text-gray-500 mb-1">体温</div>
          <div
            v-if="data?.current"
            class="flex items-baseline text-2xl font-bold"
            :style="getValueStyle('temperature')"
          >
            {{ data.current.temperature.toFixed(1) }}
            <span class="text-xs text-gray-500 ml-1">°C</span>
          </div>
          <div v-else class="text-2xl font-bold text-gray-400">-</div>
        </div>
        <div class="text-2xl" :class="getStatusColor('temperature')">🌡️</div>
      </div>
      <div class="mt-2 text-xs text-gray-400">正常范围: {{ normalRangeText.temperature }}</div>
    </el-card>

    <!-- 心率 -->
    <el-card v-loading="loading">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm text-gray-500 mb-1">心率</div>
          <div
            v-if="data?.current"
            class="flex items-baseline text-2xl font-bold"
            :style="getValueStyle('heartRate')"
          >
            {{ data.current.heartRate }}
            <span class="text-xs text-gray-500 ml-1">次/分</span>
          </div>
          <div v-else class="text-2xl font-bold text-gray-400">-</div>
        </div>
        <div class="text-2xl" :class="getStatusColor('heartRate')">❤️</div>
      </div>
      <div class="mt-2 text-xs text-gray-400">正常范围: {{ normalRangeText.heartRate }}</div>
    </el-card>

    <!-- 血压 -->
    <el-card v-loading="loading">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm text-gray-500 mb-1">血压</div>
          <div
            v-if="data?.current"
            class="flex items-baseline text-2xl font-bold"
            :style="getValueStyle('bloodPressure')"
          >
            {{ data.current.bloodPressure.systolic }}/{{ data.current.bloodPressure.diastolic }}
            <span class="text-xs text-gray-500 ml-1">mmHg</span>
          </div>
          <div v-else class="text-2xl font-bold text-gray-400">-</div>
        </div>
        <div class="text-2xl" :class="getStatusColor('bloodPressure')">🩺</div>
      </div>
      <div class="mt-2 text-xs text-gray-400">正常范围: {{ normalRangeText.bloodPressure }}</div>
    </el-card>

    <!-- 血氧 -->
    <el-card v-loading="loading">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm text-gray-500 mb-1">血氧</div>
          <div
            v-if="data?.current"
            class="flex items-baseline text-2xl font-bold"
            :style="getValueStyle('oxygenSaturation')"
          >
            {{ data.current.oxygenSaturation }}
            <span class="text-xs text-gray-500 ml-1">%</span>
          </div>
          <div v-else class="text-2xl font-bold text-gray-400">-</div>
        </div>
        <div class="text-2xl" :class="getStatusColor('oxygenSaturation')">🫁</div>
      </div>
      <div class="mt-2 text-xs text-gray-400">正常范围: {{ normalRangeText.oxygenSaturation }}</div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import type { RealtimePhysiologicalData } from '@/types/physiological'
import type { PhysiologicalSettings } from '@/types/settings'
import { getRealtimePhysiologicalData } from '@/api/physiological'
import { getPhysiologicalSettings } from '@/api/settings'

const data = ref<RealtimePhysiologicalData>()
const loading = ref(false)
const settings = ref<PhysiologicalSettings>()

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

/**
 * 获取生理体征设置
 */
const loadSettings = async () => {
  const { data: result } = await getPhysiologicalSettings()
  settings.value = result
}

// 定时刷新数据
let refreshInterval: number | null = null

onMounted(async () => {
  await Promise.all([loadRealtimeData(), loadSettings()])

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
 * 计算正常范围显示文本
 */
const normalRangeText = computed(() => {
  if (!settings.value) {
    return {
      temperature: '加载中...',
      heartRate: '加载中...',
      bloodPressure: '加载中...',
      oxygenSaturation: '加载中...'
    }
  }

  const { temperature, heartRate, bloodPressure, oxygenSaturation } = settings.value

  return {
    temperature: `${temperature.min}-${temperature.max}°C`,
    heartRate: `${heartRate.min}-${heartRate.max}次/分`,
    bloodPressure: `${bloodPressure.systolic.min}-${bloodPressure.systolic.max}/${bloodPressure.diastolic.min}-${bloodPressure.diastolic.max}mmHg`,
    oxygenSaturation: `${oxygenSaturation.min}-${oxygenSaturation.max}%`
  }
})

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
  if (!data.value?.current || !settings.value) {
    return 'normal'
  }

  const { current } = data.value
  const { temperature, heartRate, bloodPressure, oxygenSaturation } = settings.value

  switch (param) {
    case 'temperature':
      const tempValue = current.temperature
      if (tempValue < temperature.min || tempValue > temperature.max) {
        // 危险阈值：比正常范围更极端的值
        const dangerMin = temperature.min - 1.0
        const dangerMax = temperature.max + 1.5
        return tempValue < dangerMin || tempValue > dangerMax ? 'danger' : 'warning'
      }
      return 'normal'

    case 'heartRate':
      const hrValue = current.heartRate
      if (hrValue < heartRate.min || hrValue > heartRate.max) {
        // 危险阈值：比正常范围更极端的值
        const dangerMin = heartRate.min - 10
        const dangerMax = heartRate.max + 20
        return hrValue < dangerMin || hrValue > dangerMax ? 'danger' : 'warning'
      }
      return 'normal'

    case 'bloodPressure':
      const { systolic, diastolic } = current.bloodPressure
      const systolicNormal = bloodPressure.systolic
      const diastolicNormal = bloodPressure.diastolic

      if (
        systolic < systolicNormal.min ||
        systolic > systolicNormal.max ||
        diastolic < diastolicNormal.min ||
        diastolic > diastolicNormal.max
      ) {
        // 危险阈值：比正常范围更极端的值
        const systolicDangerMin = systolicNormal.min - 10
        const systolicDangerMax = systolicNormal.max + 20
        const diastolicDangerMin = diastolicNormal.min - 10
        const diastolicDangerMax = diastolicNormal.max + 10

        return systolic < systolicDangerMin ||
          systolic > systolicDangerMax ||
          diastolic < diastolicDangerMin ||
          diastolic > diastolicDangerMax
          ? 'danger'
          : 'warning'
      }
      return 'normal'

    case 'oxygenSaturation':
      const oxyValue = current.oxygenSaturation
      if (oxyValue < oxygenSaturation.min) {
        // 危险阈值：比正常最小值低5%
        const dangerMin = oxygenSaturation.min - 5
        return oxyValue < dangerMin ? 'danger' : 'warning'
      }
      return 'normal'

    default:
      return 'normal'
  }
}
</script>
