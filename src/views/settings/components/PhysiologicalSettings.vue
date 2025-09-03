<template>
  <el-scrollbar class="h-full">
    <el-card>
      <!-- 体温设置 -->
      <SettingItem
        title="体温范围（°C）"
        description="设置正常体温的最小值和最大值范围，超出此范围将触发预警"
      >
        <RangeInput
          :min="settingsForm.temperature.min"
          :max="settingsForm.temperature.max"
          :min-limit="30"
          :max-limit="45"
          :precision="1"
          :step="0.1"
          @update:min="(value) => (settingsForm.temperature.min = value)"
          @update:max="(value) => (settingsForm.temperature.max = value)"
        />
      </SettingItem>

      <!-- 分割线 -->
      <el-divider />

      <!-- 心率设置 -->
      <SettingItem title="心率范围（次/分）" description="设置正常心率的最小值和最大值范围">
        <RangeInput
          :min="settingsForm.heartRate.min"
          :max="settingsForm.heartRate.max"
          :min-limit="30"
          :max-limit="200"
          :step="1"
          @update:min="(value) => (settingsForm.heartRate.min = value)"
          @update:max="(value) => (settingsForm.heartRate.max = value)"
        />
      </SettingItem>

      <!-- 分割线 -->
      <el-divider />

      <!-- 血压设置 -->
      <SettingItem title="血压范围（mmHg）" description="分别设置收缩压和舒张压的正常范围">
        <div class="blood-pressure-group">
          <div class="pressure-item">
            <span class="pressure-label">收缩压</span>
            <RangeInput
              :min="settingsForm.bloodPressure.systolic.min"
              :max="settingsForm.bloodPressure.systolic.max"
              :min-limit="80"
              :max-limit="200"
              :step="1"
              @update:min="(value) => (settingsForm.bloodPressure.systolic.min = value)"
              @update:max="(value) => (settingsForm.bloodPressure.systolic.max = value)"
            />
          </div>

          <div class="pressure-item">
            <span class="pressure-label">舒张压</span>
            <RangeInput
              :min="settingsForm.bloodPressure.diastolic.min"
              :max="settingsForm.bloodPressure.diastolic.max"
              :min-limit="40"
              :max-limit="120"
              :step="1"
              @update:min="(value) => (settingsForm.bloodPressure.diastolic.min = value)"
              @update:max="(value) => (settingsForm.bloodPressure.diastolic.max = value)"
            />
          </div>
        </div>
      </SettingItem>

      <!-- 分割线 -->
      <el-divider />

      <!-- 血氧设置 -->
      <SettingItem title="血氧范围（%）" description="设置血氧饱和度的正常范围">
        <RangeInput
          :min="settingsForm.oxygenSaturation.min"
          :max="settingsForm.oxygenSaturation.max"
          :min-limit="80"
          :max-limit="100"
          :step="1"
          @update:min="(value) => (settingsForm.oxygenSaturation.min = value)"
          @update:max="(value) => (settingsForm.oxygenSaturation.max = value)"
        />
      </SettingItem>
    </el-card>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { reactive, onMounted, watch, ref, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { debounce } from 'lodash'
import { getPhysiologicalSettings, savePhysiologicalSettings } from '@/api/settings'
import type { PhysiologicalSettings } from '@/types/settings'
import SettingItem from '@/components/common/SettingItem.vue'
import RangeInput from '@/components/common/RangeInput.vue'

/**
 * 默认设置值
 */
const defaultSettings: PhysiologicalSettings = {
  temperature: { min: 36.0, max: 37.5 },
  heartRate: { min: 60, max: 100 },
  bloodPressure: {
    systolic: { min: 90, max: 140 },
    diastolic: { min: 60, max: 90 }
  },
  oxygenSaturation: { min: 95, max: 100 }
}

const settingsForm = reactive<PhysiologicalSettings>({ ...defaultSettings })
const isInitialized = ref(false)

/**
 * 加载现有设置
 */
const loadSettings = async () => {
  const settings = await getPhysiologicalSettings()
  Object.assign(settingsForm, settings)
  // 等待所有响应式更新完成后再激活监听器
  await nextTick()
  isInitialized.value = true
}

/**
 * 保存设置
 */
const saveSettings = async () => {
  await savePhysiologicalSettings({ ...settingsForm })
  ElMessage.success('设置保存成功')
}

// 创建防抖保存函数
const debouncedSaveSettings = debounce(saveSettings, 500)

/**
 * 监听表单变化，自动保存
 */
watch(
  () => settingsForm,
  () => {
    if (isInitialized.value) {
      debouncedSaveSettings()
    }
  },
  { deep: true }
)

onMounted(() => {
  loadSettings()
})
</script>

<style scoped lang="scss">
.blood-pressure-group {
  @apply flex flex-col gap-4;
}

.pressure-item {
  @apply flex items-center gap-4;
}

.pressure-label {
  @apply text-gray-600 text-sm;
}
</style>
