import request from '@/utils/request'
import type {
  PhysiologicalSettings,
  AlarmSettings,
  SoundOption,
  SettingsSaveResponse
} from '@/types/settings'

/**
 * 获取生理体征设置
 */
export function getPhysiologicalSettings() {
  return request<PhysiologicalSettings>({
    url: '/settings/physiological',
    method: 'GET'
  })
}

/**
 * 保存生理体征设置
 * @param data 设置数据
 */
export function savePhysiologicalSettings(data: PhysiologicalSettings) {
  return request<SettingsSaveResponse>({
    url: '/settings/physiological-save',
    method: 'POST',
    data
  })
}

/**
 * 获取铃声选项
 */
export function getSoundOptions() {
  return request<SoundOption[]>({
    url: '/settings/sound-options',
    method: 'GET'
  })
}

/**
 * 获取警报设置
 */
export function getAlarmSettings() {
  return request<AlarmSettings>({
    url: '/settings/alarm',
    method: 'GET'
  })
}

/**
 * 保存警报设置
 * @param data 设置数据
 */
export function saveAlarmSettings(data: AlarmSettings) {
  return request<SettingsSaveResponse>({
    url: '/settings/alarm-save',
    method: 'POST',
    data
  })
}

/**
 * 上传警报铃声文件
 * @param file MP3音频文件
 */
export function uploadAlarmSound(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  return request<{ url: string; filename: string }>({
    url: '/settings/alarm-sound-upload',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
