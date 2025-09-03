<template>
  <el-scrollbar class="h-full">
    <el-card>
      <!-- 警报开关设置 -->
      <div class="setting-item">
        <div class="setting-label">
          <div class="label-title">警报开关</div>
          <div class="label-description">开启后，当生理体征超出正常范围时将触发警报提醒</div>
        </div>
        <div class="setting-control">
          <el-switch
            v-model="settingsForm.enabled"
            size="large"
            active-text="开启"
            inactive-text="关闭"
          />
        </div>
      </div>

      <!-- 分割线 -->
      <el-divider />

      <!-- 警报铃声设置 -->
      <div class="setting-item">
        <div class="setting-label">
          <div class="label-title">警报铃声</div>
          <div class="label-description">选择警报提醒时播放的铃声，支持上传自定义MP3音频文件</div>
        </div>
        <div class="setting-control">
          <div class="sound-setting-group">
            <!-- 铃声选择下拉框 -->
            <el-select
              v-model="settingsForm.soundFile"
              placeholder="请选择铃声"
              class="sound-select"
              :disabled="!settingsForm.enabled"
            >
              <el-option
                v-for="sound in soundOptions"
                :key="sound.value"
                :label="sound.label"
                :value="sound.value"
              />
            </el-select>

            <!-- 文件上传 -->
            <el-upload
              ref="uploadRef"
              :show-file-list="false"
              :before-upload="beforeUpload"
              :http-request="handleUpload"
              accept=".mp3"
              class="sound-upload"
            >
              <el-button
                type="default"
                :icon="Upload"
                :disabled="!settingsForm.enabled"
                :loading="uploading"
              >
                {{ uploading ? '上传中...' : '上传铃声' }}
              </el-button>
            </el-upload>
          </div>
        </div>
      </div>
    </el-card>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { reactive, onMounted, watch, ref, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import { debounce } from 'lodash'
import {
  getSoundOptions,
  getAlarmSettings,
  saveAlarmSettings,
  uploadAlarmSound
} from '@/api/settings'
import type { AlarmSettings, SoundOption } from '@/types/settings'
import type { UploadRequestOptions } from 'element-plus'

/**
 * 铃声选项
 */
const soundOptions = ref<SoundOption[]>([])

/**
 * 默认设置值
 */
const defaultSettings: AlarmSettings = {
  enabled: true,
  soundFile: 'default.mp3'
}

const settingsForm = reactive<AlarmSettings>({ ...defaultSettings })
const isInitialized = ref(false)
const uploading = ref(false)

/**
 * 加载铃声选项
 */
const loadSoundOptions = async () => {
  const response = await getSoundOptions()
  soundOptions.value = response.data
}

/**
 * 加载现有设置
 */
const loadSettings = async () => {
  const response = await getAlarmSettings()
  Object.assign(settingsForm, response.data)
  // 等待所有响应式更新完成后再激活监听器
  await nextTick()
  isInitialized.value = true
}

/**
 * 保存设置
 */
const saveSettings = async () => {
  await saveAlarmSettings({ ...settingsForm })
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

/**
 * 文件上传前检查
 */
const beforeUpload = (file: File) => {
  const isMp3 = file.type === 'audio/mpeg' || file.name.toLowerCase().endsWith('.mp3')
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isMp3) {
    ElMessage.error('只能上传MP3格式的音频文件!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('音频文件大小不能超过 10MB!')
    return false
  }
  return true
}

/**
 * 处理文件上传
 */
const handleUpload = async (options: UploadRequestOptions) => {
  uploading.value = true
  await uploadAlarmSound(options.file as File)

  ElMessage.success('铃声上传成功')
  uploading.value = false
}

onMounted(() => {
  loadSoundOptions()
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

.setting-control {
  @apply flex-shrink-0;
}

.sound-setting-group {
  @apply flex items-center gap-3;
}

.sound-select {
  @apply w-48;
}

.sound-upload {
  @apply inline-block;
}
</style>
