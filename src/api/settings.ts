import request from '@/utils/request'
import type {
  PhysiologicalSettings,
  AlarmSettings,
  SoundOption,
  MedicationSettings,
  Medication,
  SettingsSaveResponse,
  Location,
  Route,
  LocationCoordinates
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

/**
 * 删除铃声文件
 * @param soundFile 铃声文件名
 */
export function deleteAlarmSound(soundFile: string) {
  return request<SettingsSaveResponse>({
    url: '/settings/alarm-sound-delete',
    method: 'DELETE',
    data: { soundFile }
  })
}

// ==================== 地点管理 API ====================

/**
 * 获取地点列表
 */
export function getLocationList() {
  return request<Location[]>({
    url: '/settings/location-list',
    method: 'GET'
  })
}

/**
 * 获取坐标信息
 */
export function getLocationCoordinates() {
  return request<LocationCoordinates>({
    url: '/settings/location-coordinates',
    method: 'GET'
  })
}

/**
 * 添加地点
 * @param data 地点数据
 */
export function addLocation(data: Omit<Location, 'id' | 'createTime'>) {
  return request<Location>({
    url: '/settings/location-add',
    method: 'POST',
    data
  })
}

/**
 * 更新地点
 * @param data 地点数据
 */
export function updateLocation(data: Location) {
  return request<Location>({
    url: '/settings/location-update',
    method: 'PUT',
    data
  })
}

/**
 * 删除地点
 * @param locationId 地点ID
 */
export function deleteLocation(locationId: string) {
  return request<SettingsSaveResponse>({
    url: '/settings/location-delete',
    method: 'DELETE',
    data: { id: locationId }
  })
}

// ==================== 路线管理 API ====================

/**
 * 获取路线列表
 */
export function getRouteList() {
  return request<Route[]>({
    url: '/settings/route-list',
    method: 'GET'
  })
}

/**
 * 添加路线
 * @param data 路线数据
 */
export function addRoute(data: Omit<Route, 'id' | 'createTime' | 'locations'>) {
  return request<Route>({
    url: '/settings/route-add',
    method: 'POST',
    data
  })
}

/**
 * 更新路线
 * @param data 路线数据
 */
export function updateRoute(data: Omit<Route, 'createTime' | 'locations'>) {
  return request<Route>({
    url: '/settings/route-update',
    method: 'PUT',
    data
  })
}

/**
 * 删除路线
 * @param routeId 路线ID
 */
export function deleteRoute(routeId: string) {
  return request<SettingsSaveResponse>({
    url: '/settings/route-delete',
    method: 'DELETE',
    data: { id: routeId }
  })
}
