<template>
  <el-card class="h-full flex flex-col" :body-style="{ flex: 1 }">
    <template #header>
      <span>{{ paramConfig.name }} ({{ paramConfig.unit }})</span>
    </template>

    <div ref="chartRef" class="h-full"></div>

    <div v-if="props.loading" class="flex items-center justify-center flex-1">
      <el-loading-icon class="mr-2" />
      <span>加载中...</span>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import type { HistoricalPhysiologicalData } from '@/types/physiological'

interface Props {
  parameter: 'temperature' | 'heartRate' | 'systolic' | 'diastolic' | 'oxygenSaturation'
  historicalData?: HistoricalPhysiologicalData
  loading?: boolean
}

const props = defineProps<Props>()

const chartRef = ref<HTMLDivElement>()
const chart = ref<ECharts>()

// 参数配置
const paramConfigs = {
  temperature: {
    name: '体温',
    unit: '°C',
    color: '#ff6b6b',
    normalRange: [36.0, 37.5],
    warningRange: [35.0, 39.0],
    dataKey: 'temperature' as const
  },
  heartRate: {
    name: '心率',
    unit: '次/分',
    color: '#4ecdc4',
    normalRange: [60, 100],
    warningRange: [50, 120],
    dataKey: 'heartRate' as const
  },
  systolic: {
    name: '收缩压',
    unit: 'mmHg',
    color: '#45b7d1',
    normalRange: [90, 140],
    warningRange: [80, 160],
    dataKey: 'systolic' as const
  },
  diastolic: {
    name: '舒张压',
    unit: 'mmHg',
    color: '#96ceb4',
    normalRange: [60, 90],
    warningRange: [50, 100],
    dataKey: 'diastolic' as const
  },
  oxygenSaturation: {
    name: '血氧',
    unit: '%',
    color: '#ffeaa7',
    normalRange: [95, 100],
    warningRange: [90, 100],
    dataKey: 'oxygenSaturation' as const
  }
}

const paramConfig = paramConfigs[props.parameter]

/**
 * 初始化图表
 */
const initChart = async () => {
  if (!chartRef.value) return

  chart.value = echarts.init(chartRef.value)
  updateChart()
}

/**
 * 更新图表
 */
const updateChart = () => {
  if (!chart.value || !props.historicalData) return

  const data = props.historicalData.hourlyData
  const xAxisData = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)
  const seriesData = data.map((item) => item[paramConfig.dataKey] || null)

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: unknown) => {
        if (!Array.isArray(params) || params.length === 0) return '暂无数据'
        const point = params[0]
        if (point && typeof point === 'object' && 'name' in point && 'value' in point) {
          return `${point.name}<br/>${paramConfig.name}: ${point.value}${paramConfig.unit}`
        }
        return '暂无数据'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xAxisData,
      axisLabel: {
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 12
      }
    },
    series: [
      {
        name: paramConfig.name,
        type: 'line',
        data: seriesData,
        smooth: true,
        lineStyle: {
          color: paramConfig.color,
          width: 3
        },
        itemStyle: {
          color: paramConfig.color
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: paramConfig.color + '40'
            },
            {
              offset: 1,
              color: paramConfig.color + '10'
            }
          ])
        },
        markLine: {
          silent: true,
          lineStyle: {
            color: '#67c23a',
            type: 'dashed'
          },
          data: [
            {
              name: '正常上限',
              yAxis: paramConfig.normalRange[1]
            },
            {
              name: '正常下限',
              yAxis: paramConfig.normalRange[0]
            }
          ]
        },
        markArea: {
          silent: true,
          itemStyle: {
            color: '#67c23a',
            opacity: 0.1
          },
          data: [
            [
              {
                name: '正常范围',
                yAxis: paramConfig.normalRange[0]
              },
              {
                yAxis: paramConfig.normalRange[1]
              }
            ]
          ]
        }
      }
    ]
  }

  chart.value.setOption(option)
}

/**
 * 监听窗口大小变化
 */
const handleResize = () => {
  chart.value?.resize()
}

// 监听数据变化，重新渲染图表
watch(
  () => props.historicalData,
  () => {
    if (chart.value && props.historicalData) {
      updateChart()
    }
  },
  { deep: true }
)

onMounted(async () => {
  await nextTick()
  await initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  chart.value?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>
