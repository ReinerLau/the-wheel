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
          <div class="sound-setting-container">
            <!-- 当前选择的铃声 -->
            <div class="current-sound-display">
              <div class="sound-info">
                <span class="sound-name"> 当前铃声：{{ getCurrentSoundLabel() }} </span>
              </div>
              <!-- 文件上传 -->
              <el-upload
                ref="uploadRef"
                :show-file-list="false"
                :before-upload="beforeUpload"
                :http-request="handleUpload"
                accept=".mp3"
                class="sound-upload"
              >
                <el-button type="default" :icon="Upload" :loading="uploading" size="small">
                  {{ uploading ? '上传中...' : '上传铃声' }}
                </el-button>
              </el-upload>
            </div>

            <!-- 铃声列表 -->
            <div class="sound-options-list">
              <div class="sound-list-header">
                <span class="list-title">可选铃声</span>
              </div>
              <div class="sound-items">
                <div
                  v-for="sound in soundOptions"
                  :key="sound.value"
                  class="sound-item"
                  :class="{ selected: sound.value === settingsForm.soundFile }"
                >
                  <div class="sound-item-content" @click="selectSound(sound.value)">
                    <div class="sound-item-info">
                      <span class="sound-item-name">{{ sound.label }}</span>
                      <el-icon v-if="sound.value === settingsForm.soundFile" class="selected-icon">
                        <Check />
                      </el-icon>
                    </div>
                  </div>
                  <div class="sound-item-actions">
                    <el-button
                      :icon="Delete"
                      size="small"
                      type="danger"
                      text
                      :disabled="sound.value === settingsForm.soundFile"
                      @click="handleDeleteSound(sound)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { reactive, onMounted, watch, ref, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Upload, Delete, Check } from '@element-plus/icons-vue'
import { debounce } from 'lodash'
import {
  getSoundOptions,
  getAlarmSettings,
  saveAlarmSettings,
  uploadAlarmSound,
  deleteAlarmSound
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
  // 重新加载铃声选项
  await loadSoundOptions()
}

/**
 * 获取当前选择铃声的标签
 */
const getCurrentSoundLabel = () => {
  const currentSound = soundOptions.value.find((sound) => sound.value === settingsForm.soundFile)
  return currentSound ? currentSound.label : '未选择'
}

/**
 * 选择铃声
 * @param soundFile 铃声文件名
 */
const selectSound = (soundFile: string) => {
  settingsForm.soundFile = soundFile
}

/**
 * 删除铃声
 * @param sound 要删除的铃声选项
 */
const handleDeleteSound = async (sound: SoundOption) => {
  if (sound.value === settingsForm.soundFile) return

  try {
    await ElMessageBox.confirm(`确定要删除铃声 "${sound.label}" 吗？删除后无法恢复。`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteAlarmSound(sound.value)
    ElMessage.success('铃声删除成功')

    // 重新加载铃声选项
    await loadSoundOptions()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除铃声失败')
    }
  }
}

onMounted(() => {
  loadSoundOptions()
  loadSettings()
})
</script>

<style scoped lang="scss">
.setting-item {
  @apply flex items-start justify-between gap-8 py-6;
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

.sound-setting-container {
  @apply w-96;
}

.current-sound-display {
  @apply flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg border;
}

.sound-info {
  @apply flex-1;
}

.sound-name {
  @apply text-sm font-medium text-gray-700;
}

.sound-upload {
  @apply inline-block;
}

.sound-options-list {
  @apply border rounded-lg bg-white;
}

.sound-list-header {
  @apply px-4 py-3 border-b bg-gray-50 rounded-t-lg;
}

.list-title {
  @apply text-sm font-medium text-gray-700;
}

.sound-items {
  @apply max-h-64 overflow-y-auto;
}

.sound-item {
  @apply flex items-center justify-between px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors;

  &.selected {
    @apply bg-blue-50 border-blue-200;
  }
}

.sound-item-content {
  @apply flex-1 cursor-pointer;
}

.sound-item-info {
  @apply flex items-center justify-between;
}

.sound-item-name {
  @apply text-sm text-gray-900;

  .sound-item.selected & {
    @apply text-blue-700 font-medium;
  }
}

.selected-icon {
  @apply text-blue-500;
}

.sound-item-actions {
  @apply flex items-center gap-2 ml-4;
}
</style>
