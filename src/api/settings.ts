import request from '@/utils/request'
import type {
  PhysiologicalSettings,
  AlarmSettings,
  SoundOption,
  MedicationSettings,
  Medication,
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

/**
 * 获取用药设置
 */
export function getMedicationSettings() {
  return request<MedicationSettings>({
    url: '/settings/medication',
    method: 'GET'
  })
}

/**
 * 保存用药设置
 * @param data 设置数据
 */
export function saveMedicationSettings(data: MedicationSettings) {
  return request<SettingsSaveResponse>({
    url: '/settings/medication-save',
    method: 'POST',
    data
  })
}

/**
 * 获取药物选项
 */
export function getMedicationOptions() {
  return request<Medication[]>({
    url: '/settings/medication-options',
    method: 'GET'
  })
}

/**
 * 添加药物
 * @param data 药物数据
 */
export function addMedication(data: Omit<Medication, 'id'>) {
  return request<Medication>({
    url: '/settings/medication-add',
    method: 'POST',
    data
  })
}

/**
 * 编辑药物
 * @param data 药物数据
 */
export function updateMedication(data: Medication) {
  return request<Medication>({
    url: '/settings/medication-update',
    method: 'PUT',
    data
  })
}

/**
 * 删除药物
 * @param medicationId 药物ID
 */
export function deleteMedication(medicationId: string) {
  return request<SettingsSaveResponse>({
    url: '/settings/medication-delete',
    method: 'DELETE',
    data: { id: medicationId }
  })
}
