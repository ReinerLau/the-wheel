<template>
  <el-row :gutter="8">
    <el-col :xs="24" :span="8" class="mb-1">
      <el-card>
        <div class="flex-1 flex flex-col overflow-hidden h-[120px]">
          <div class="text-sm font-medium mb-2">环境监测</div>
          <div class="flex-1 flex flex-col justify-center gap-2">
            <div class="flex items-center">
              <span class="w-16 text-center text-sm">温度</span>
              <span class="text-lg font-bold" :style="{ color: temperatureColor }">
                {{ environmentData.temperature }} °C
              </span>
            </div>
            <div class="flex items-center">
              <span class="w-16 text-center text-sm">湿度</span>
              <span class="text-lg font-bold" :style="{ color: humidityColor }">
                {{ environmentData.humidity }} %
              </span>
            </div>
          </div>
        </div>
      </el-card>
    </el-col>
    <el-col :xs="24" :span="8" class="mb-1">
      <el-card>
        <div class="flex-1 flex flex-col overflow-hidden h-[120px]">
          <div class="text-sm font-medium mb-2">电量</div>
          <div class="flex-1 flex items-center justify-center">
            <el-progress type="circle" :percentage="batteryLevel" :color="batteryColor" :width="80">
              <template #default="{ percentage }">
                <div class="flex flex-col items-center gap-2">
                  <span>{{ percentage }}%</span>
                  <div v-if="isCharging" class="i-mdi:thunder text-amber text-sm"></div>
                </div>
              </template>
            </el-progress>
          </div>
        </div>
      </el-card>
    </el-col>
    <el-col :xs="24" :span="8">
      <el-card>
        <div class="flex-1 flex flex-col overflow-hidden h-[120px]">
          <div class="text-sm font-medium mb-2">坐标</div>
          <div class="flex-1 flex flex-col justify-center gap-2">
            <div class="flex items-center gap-2">
              <span class="w-16 text-right text-sm">X</span>
              <el-input-number
                v-model="coordinates.x"
                size="small"
                class="flex-1"
                :controls="false"
                disabled
              />
            </div>
            <div class="flex items-center gap-2">
              <span class="w-16 text-right text-sm">Y</span>
              <el-input-number
                v-model="coordinates.y"
                size="small"
                class="flex-1"
                :controls="false"
                disabled
              />
            </div>
            <div class="flex items-center gap-2">
              <span class="w-16 text-right text-sm">角度</span>
              <el-input-number
                v-model="coordinates.theta"
                size="small"
                class="flex-1"
                :controls="false"
                disabled
              />
            </div>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { RobotStatusData } from '../../../composables/useRobotStatusWebsocket'

const props = defineProps<{
  robotCode: string
  robotData: RobotStatusData | null
}>()

// 环境监测数据
const environmentData = ref({
  temperature: 0,
  humidity: 0,
})

// 电量
const batteryLevel = ref(0)

// 充电状态
const isCharging = ref(false)

// 坐标
const coordinates = ref({
  x: 0,
  y: 0,
  theta: 0,
})

// 温度警告颜色
const temperatureColor = computed(() => {
  return '#67C23A'
})

// 湿度警告颜色
const humidityColor = computed(() => {
  return '#67C23A'
})

// 电量颜色
const batteryColor = computed(() => {
  if (batteryLevel.value < 20) return '#F56C6C'
  if (batteryLevel.value < 50) return '#E6A23C'
  return '#67C23A'
})

// 监听机器人数据变化，更新UI
watch(
  () => props.robotData,
  (newData) => {
    if (newData) {
      // 更新电量和充电状态
      if (newData.agvState?.battery) {
        batteryLevel.value = newData.agvState.battery.level
        isCharging.value = newData.agvState.battery.chargeState
      }

      // 更新环境数据
      if (newData.environment) {
        environmentData.value = {
          temperature: Number(newData.environment.temperature) || 0,
          humidity: Number(newData.environment.humidity) || 0,
        }
      }

      // 更新坐标，使用 position 而不是 displayPosition
      if (newData.agvState?.position) {
        coordinates.value = {
          x: Number(newData.agvState.position.x),
          y: Number(newData.agvState.position.y),
          theta: Number(newData.agvState.position.theta),
        }
      }
    } else {
      // 重置数据
      batteryLevel.value = 0
      isCharging.value = false
      environmentData.value = { temperature: 0, humidity: 0 }
      coordinates.value = { x: 0, y: 0, theta: 0 }
    }
  },
  { immediate: true },
)
</script>
