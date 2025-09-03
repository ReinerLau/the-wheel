import request from '@/utils/request'
import type { PhysiologicalSettings, SettingsSaveResponse } from '@/types/settings'

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
