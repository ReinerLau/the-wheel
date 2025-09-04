<template>
  <div v-if="medicationTimes.length > 0" class="time-list">
    <div class="list-header">
      <span class="header-title">用药时间安排</span>
    </div>
    <div class="time-items">
      <div v-for="time in medicationTimes" :key="time.id" class="time-item">
        <div class="time-info">
          <div class="medication-name">{{ getMedicationName(time.medicationId) }}</div>
          <div class="time-datetime">{{ formatMedicationTime(time) }}</div>
          <div v-if="time.type === 'repeat'" class="repeat-info">
            <el-tag size="small" type="info">{{ getRepeatDescription(time) }}</el-tag>
          </div>
        </div>
        <div class="time-actions">
          <el-switch
            :model-value="time.enabled"
            size="small"
            @change="
              (value: string | number | boolean) => handleToggleEnabled(time.id, Boolean(value))
            "
          />
          <el-button size="small" type="danger" :icon="Delete" @click="handleRemoveTime(time.id)">
            删除
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Delete } from '@element-plus/icons-vue'
import type { Medication, MedicationTime } from '@/types/settings'

/**
 * 组件属性
 */
interface Props {
  /** 用药时间列表 */
  medicationTimes: MedicationTime[]
  /** 药物列表 */
  medications: Medication[]
}

/**
 * 组件事件
 */
interface Emits {
  /** 切换启用状态 */
  (e: 'toggle-enabled', timeId: string, enabled: boolean): void
  /** 删除用药时间 */
  (e: 'remove-time', timeId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * 根据药物ID获取药物名称
 */
const getMedicationName = (medicationId: string): string => {
  const medication = props.medications.find((m) => m.id === medicationId)
  return medication?.name || '未知药物'
}

/**
 * 格式化日期时间
 */
const formatDateTime = (datetime: string): string => {
  const date = new Date(datetime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 格式化用药时间显示
 */
const formatMedicationTime = (time: MedicationTime): string => {
  if (time.type === 'once') {
    return formatDateTime(time.datetime)
  } else {
    // 重复用药只显示时间
    const [hours, minutes] = time.datetime.split(':')
    return `${hours}:${minutes}`
  }
}

/**
 * 获取重复描述文本
 */
const getRepeatDescription = (time: MedicationTime): string => {
  if (!time.repeatConfig || time.type !== 'repeat') return ''

  const { frequency, interval, endDate, weekDays, monthDay } = time.repeatConfig

  let description = ''

  // 基础频率描述
  if (frequency === 'daily') {
    description = interval === 1 ? '每天' : `每${interval}天`
  } else if (frequency === 'weekly') {
    if (interval === 1) {
      if (weekDays && weekDays.length > 0) {
        const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
        const selectedDays = weekDays.map((day) => dayNames[day]).join('、')
        description = `每周${selectedDays}`
      } else {
        description = '每周'
      }
    } else {
      description = `每${interval}周`
    }
  } else if (frequency === 'monthly') {
    if (interval === 1) {
      description = monthDay ? `每月${monthDay}日` : '每月'
    } else {
      description = `每${interval}月`
    }
  }

  // 添加结束日期描述
  if (endDate) {
    description += `，至${endDate}`
  }

  return description
}

/**
 * 处理切换启用状态
 */
const handleToggleEnabled = (timeId: string, enabled: boolean) => {
  emit('toggle-enabled', timeId, enabled)
}

/**
 * 处理删除用药时间
 */
const handleRemoveTime = (timeId: string) => {
  emit('remove-time', timeId)
}
</script>

<style scoped lang="scss">
.time-list {
  @apply mt-6;
}

.list-header {
  @apply mb-4;
}

.header-title {
  @apply text-sm font-medium text-gray-700;
}

.time-items {
  @apply space-y-3;
}

.time-item {
  @apply flex items-center justify-between p-4 bg-gray-50 rounded-lg;
}

.time-info {
  @apply flex-1;
}

.medication-name {
  @apply text-base font-medium text-gray-900 mb-1;
}

.time-datetime {
  @apply text-sm text-gray-600 mb-1;
}

.repeat-info {
  @apply mt-1;
}

.time-actions {
  @apply flex items-center gap-2;
}
</style>
