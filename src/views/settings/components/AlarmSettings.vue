<template>
  <el-scrollbar class="h-full">
    <el-card>
      <!-- 警报开关设置 -->
      <SettingItem title="警报开关" description="开启后，当生理体征超出正常范围时将触发警报提醒">
        <el-switch
          v-model="settingsForm.enabled"
          size="large"
          active-text="开启"
          inactive-text="关闭"
        />
      </SettingItem>

      <!-- 分割线 -->
      <el-divider />

      <!-- 警报铃声设置 -->
      <SettingItem
        title="警报铃声"
        description="选择警报提醒时播放的铃声，支持上传自定义MP3音频文件"
      >
        <SoundManager
          :selected-sound="settingsForm.soundFile"
          @select-sound="handleSelectSound"
          @sounds-updated="handleSoundsUpdated"
        />
      </SettingItem>
    </el-card>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { reactive, onMounted, watch, ref, nextTick } from 'vue'
import { debounce } from 'lodash'
import { getAlarmSettings, saveAlarmSettings } from '@/api/settings'
import type { AlarmSettings } from '@/types/settings'
import SettingItem from '@/components/common/SettingItem.vue'
import SoundManager from '@/components/settings/SoundManager.vue'

/**
 * 默认设置值
 */
const defaultSettings: AlarmSettings = {
  enabled: true,
  soundFile: 'default.mp3'
}

const settingsForm = reactive<AlarmSettings>({ ...defaultSettings })
const isInitialized = ref(false)

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
 * 处理选择铃声
 */
const handleSelectSound = (soundFile: string) => {
  settingsForm.soundFile = soundFile
}

/**
 * 处理铃声更新
 */
const handleSoundsUpdated = () => {
  // 铃声列表更新后的处理逻辑（如果需要的话）
}

onMounted(() => {
  loadSettings()
})
</script>
