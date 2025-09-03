<template>
  <el-scrollbar class="h-full">
    <el-card>
      <!-- 体温设置 -->
      <div class="setting-item">
        <div class="setting-label">
          <div class="label-title">体温范围（°C）</div>
          <div class="label-description">
            设置正常体温的最小值和最大值范围，超出此范围将触发预警
          </div>
        </div>
        <div class="setting-control">
          <div class="range-input-group">
            <el-input-number
              v-model="settingsForm.temperature.min"
              :min="30"
              :max="45"
              :precision="1"
              :step="0.1"
              placeholder="最小值"
              class="range-input"
              controls-position="right"
            />
            <span class="range-separator">-</span>
            <el-input-number
              v-model="settingsForm.temperature.max"
              :min="30"
              :max="45"
              :precision="1"
              :step="0.1"
              placeholder="最大值"
              class="range-input"
              controls-position="right"
            />
          </div>
        </div>
      </div>

      <!-- 分割线 -->
      <el-divider />

      <!-- 心率设置 -->
      <div class="setting-item">
        <div class="setting-label">
          <div class="label-title">心率范围（次/分）</div>
          <div class="label-description">设置正常心率的最小值和最大值范围</div>
        </div>
        <div class="setting-control">
          <div class="range-input-group">
            <el-input-number
              v-model="settingsForm.heartRate.min"
              :min="30"
              :max="200"
              :step="1"
              placeholder="最小值"
              class="range-input"
              controls-position="right"
            />
            <span class="range-separator">-</span>
            <el-input-number
              v-model="settingsForm.heartRate.max"
              :min="30"
              :max="200"
              :step="1"
              placeholder="最大值"
              class="range-input"
              controls-position="right"
            />
          </div>
        </div>
      </div>

      <!-- 分割线 -->
      <el-divider />

      <!-- 血压设置 -->
      <div class="setting-item">
        <div class="setting-label">
          <div class="label-title">血压范围（mmHg）</div>
          <div class="label-description">分别设置收缩压和舒张压的正常范围</div>
        </div>
        <div class="setting-control">
          <div class="blood-pressure-group">
            <div class="pressure-item">
              <span class="pressure-label">收缩压</span>
              <div class="range-input-group">
                <el-input-number
                  v-model="settingsForm.bloodPressure.systolic.min"
                  :min="80"
                  :max="200"
                  :step="1"
                  placeholder="最小值"
                  class="range-input"
                  controls-position="right"
                />
                <span class="range-separator">-</span>
                <el-input-number
                  v-model="settingsForm.bloodPressure.systolic.max"
                  :min="80"
                  :max="200"
                  :step="1"
                  placeholder="最大值"
                  class="range-input"
                  controls-position="right"
                />
              </div>
            </div>

            <div class="pressure-item">
              <span class="pressure-label">舒张压</span>
              <div class="range-input-group">
                <el-input-number
                  v-model="settingsForm.bloodPressure.diastolic.min"
                  :min="40"
                  :max="120"
                  :step="1"
                  placeholder="最小值"
                  class="range-input"
                  controls-position="right"
                />
                <span class="range-separator">-</span>
                <el-input-number
                  v-model="settingsForm.bloodPressure.diastolic.max"
                  :min="40"
                  :max="120"
                  :step="1"
                  placeholder="最大值"
                  class="range-input"
                  controls-position="right"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分割线 -->
      <el-divider />

      <!-- 血氧设置 -->
      <div class="setting-item">
        <div class="setting-label">
          <div class="label-title">血氧范围（%）</div>
          <div class="label-description">设置血氧饱和度的正常范围</div>
        </div>
        <div class="setting-control">
          <div class="range-input-group">
            <el-input-number
              v-model="settingsForm.oxygenSaturation.min"
              :min="80"
              :max="100"
              :step="1"
              placeholder="最小值"
              class="range-input"
              controls-position="right"
            />
            <span class="range-separator">-</span>
            <el-input-number
              v-model="settingsForm.oxygenSaturation.max"
              :min="80"
              :max="100"
              :step="1"
              placeholder="最大值"
              class="range-input"
              controls-position="right"
            />
          </div>
        </div>
      </div>
    </el-card>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { reactive, onMounted, watch, ref, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { debounce } from 'lodash'
import { getPhysiologicalSettings, savePhysiologicalSettings } from '@/api/settings'
import type { PhysiologicalSettings } from '@/types/settings'

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
.setting-item {
  @apply flex items-center justify-between gap-8 py-6;
}

.setting-label {
  @apply flex-1;
}

.label-title {
  @apply text-base font-medium text-gray-900 mb-2;
}

.label-description {
  @apply text-sm text-gray-500 leading-relaxed;
}

.range-input-group {
  @apply flex items-center gap-3;
}

.range-input {
  @apply w-28;
}

.range-separator {
  @apply text-gray-500 text-sm whitespace-nowrap;
}

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
