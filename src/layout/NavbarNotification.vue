<template>
  <div class="hover:bg-[#0000000d] cursor-pointer p-2 h-10 flex items-center text-2xl">
    <el-popover placement="bottom-end" :width="350" @show="handleShow" :hide-after="0">
      <template #reference>
        <el-badge :value="newCount" :hidden="newCount === 0">
          <div class="i-mdi-bell text-[var(--el-color-warning)]"></div>
        </el-badge>
      </template>
      <template #default>
        <el-scrollbar class="h-96">
          <el-timeline v-if="alarms.length > 0" class="mt-5">
            <el-timeline-item
              v-for="(alarm, index) in alarms"
              :key="index"
              color="#f9c23c"
              :timestamp="alarm.displayTime"
              @click="handleAlarmClick(alarm)"
              class="cursor-pointer"
            >
              {{ alarm.message }}
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="暂无消息" />
        </el-scrollbar>
      </template>
    </el-popover>
  </div>

  <!-- 告警详情对话框 -->
  <el-dialog v-model="dialogVisible" title="告警详情" width="500px">
    <el-descriptions :column="1" border direction="vertical">
      <el-descriptions-item label="告警图片">
        <el-image
          v-if="selectedAlarm?.image"
          :src="selectedAlarm.image"
          :preview-src-list="[selectedAlarm.image]"
          fit="cover"
          class="w-full max-h-60 object-cover"
        />
        <el-empty v-else description="无图片" />
      </el-descriptions-item>
      <el-descriptions-item label="告警时间">
        {{ selectedAlarm?.displayTime }}
      </el-descriptions-item>

      <el-descriptions-item label="告警内容">
        {{ selectedAlarm?.message }}
      </el-descriptions-item>
      <el-descriptions-item v-if="selectedAlarm?.point" label="告警地点">
        <div>x: {{ selectedAlarm.point.x }}</div>
        <div>y: {{ selectedAlarm.point.y }}</div>
        <div>θ: {{ selectedAlarm.point.theta }}</div>
      </el-descriptions-item>

      <el-descriptions-item label="机器人编码">
        {{ selectedAlarm?.robotCode }}
      </el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import useAlarmWebsocket, { type AlarmData } from '@/composables/notification/useAlarmWebsocket'

// 告警扩展接口
interface EnhancedAlarm extends AlarmData {
  displayTime: string
  isNew?: boolean
}

const newCount = ref(0)
const alarms = reactive<EnhancedAlarm[]>([])
const dialogVisible = ref(false)
const selectedAlarm = ref<EnhancedAlarm | null>(null)

// 清除消息提示
function handleShow() {
  newCount.value = 0
  alarms.forEach((alarm) => {
    alarm.isNew = false
  })
}

// 点击告警项显示详情
function handleAlarmClick(alarm: EnhancedAlarm) {
  selectedAlarm.value = alarm
  dialogVisible.value = true
}

// 处理新告警消息
function handleAlarm(e: MessageEvent) {
  try {
    const data = JSON.parse(e.data) as AlarmData
    const alarm: EnhancedAlarm = {
      ...data,
      displayTime: data.alertTime || '',
      isNew: true,
    }
    alarms.unshift(alarm)
    newCount.value++
  } catch (error) {
    console.error('解析告警消息失败', error)
  }
}

// 建立websocket连接
onMounted(() => {
  const { connectWebsocket } = useAlarmWebsocket()
  connectWebsocket(handleAlarm)
})
</script>
