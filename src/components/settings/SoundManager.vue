<template>
  <div class="sound-setting-container">
    <!-- 当前选择的铃声 -->
    <div class="current-sound-display">
      <div class="sound-info">
        <span class="sound-name">当前铃声：{{ getCurrentSoundLabel() }}</span>
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
          :class="{ selected: sound.value === selectedSound }"
        >
          <div class="sound-item-content" @click="handleSelectSound(sound.value)">
            <div class="sound-item-info">
              <span class="sound-item-name">{{ sound.label }}</span>
              <el-icon v-if="sound.value === selectedSound" class="selected-icon">
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
              :disabled="sound.value === selectedSound"
              @click="handleDeleteSound(sound)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Upload, Delete, Check } from '@element-plus/icons-vue'
import { getSoundOptions, uploadAlarmSound, deleteAlarmSound } from '@/api/settings'
import type { SoundOption } from '@/types/settings'
import type { UploadRequestOptions } from 'element-plus'

/**
 * 组件属性
 */
interface Props {
  /** 当前选择的铃声 */
  selectedSound: string
}

/**
 * 组件事件
 */
interface Emits {
  /** 选择铃声 */
  (e: 'select-sound', soundFile: string): void
  /** 铃声列表更新 */
  (e: 'sounds-updated'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * 铃声选项
 */
const soundOptions = ref<SoundOption[]>([])
const uploading = ref(false)

/**
 * 加载铃声选项
 */
const loadSoundOptions = async () => {
  const response = await getSoundOptions()
  soundOptions.value = response.data
}

/**
 * 获取当前选择铃声的标签
 */
const getCurrentSoundLabel = () => {
  const currentSound = soundOptions.value.find((sound) => sound.value === props.selectedSound)
  return currentSound ? currentSound.label : '未选择'
}

/**
 * 选择铃声
 */
const handleSelectSound = (soundFile: string) => {
  emit('select-sound', soundFile)
}

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
  try {
    await uploadAlarmSound(options.file as File)
    ElMessage.success('铃声上传成功')
    await loadSoundOptions()
    emit('sounds-updated')
  } catch (error) {
    ElMessage.error('铃声上传失败')
  } finally {
    uploading.value = false
  }
}

/**
 * 删除铃声
 */
const handleDeleteSound = async (sound: SoundOption) => {
  if (sound.value === props.selectedSound) return

  try {
    await ElMessageBox.confirm(`确定要删除铃声 "${sound.label}" 吗？删除后无法恢复。`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteAlarmSound(sound.value)
    ElMessage.success('铃声删除成功')
    await loadSoundOptions()
    emit('sounds-updated')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除铃声失败')
    }
  }
}

onMounted(() => {
  loadSoundOptions()
})
</script>

<style scoped lang="scss">
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
