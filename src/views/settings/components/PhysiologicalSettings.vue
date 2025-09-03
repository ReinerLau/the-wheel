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
import { reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

/**
 * 生理参数范围接口
 */
interface PhysiologicalRange {
  min: number
  max: number
}

/**
 * 血压范围接口
 */
interface BloodPressureRange {
  systolic: PhysiologicalRange
  diastolic: PhysiologicalRange
}

/**
 * 设置表单接口
 */
interface SettingsForm {
  temperature: PhysiologicalRange
  heartRate: PhysiologicalRange
  bloodPressure: BloodPressureRange
  oxygenSaturation: PhysiologicalRange
}

/**
 * 默认设置值
 */
const defaultSettings: SettingsForm = {
  temperature: { min: 36.0, max: 37.5 },
  heartRate: { min: 60, max: 100 },
  bloodPressure: {
    systolic: { min: 90, max: 140 },
    diastolic: { min: 60, max: 90 }
  },
  oxygenSaturation: { min: 95, max: 100 }
}

const settingsForm = reactive<SettingsForm>({ ...defaultSettings })

/**
 * 加载现有设置
 */
const loadSettings = async () => {
  try {
    // 这里应该调用 API 获取当前设置
    // const settings = await getPhysiologicalSettings()
    // Object.assign(settingsForm, settings)

    // 暂时使用默认设置
    Object.assign(settingsForm, defaultSettings)
  } catch (error) {
    console.error('加载设置失败:', error)
    ElMessage.error('加载设置失败')
  }
}

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
