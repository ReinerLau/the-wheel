import request from '@/utils/request'
import type {
  RealtimePhysiologicalData,
  HistoricalPhysiologicalData,
  PhysiologicalThresholds
} from '@/types/physiological'

/**
 * 获取实时生理体征数据
 */
export function getRealtimePhysiologicalData() {
  return request<RealtimePhysiologicalData>({
    url: '/physiological/realtime',
    method: 'GET'
  })
}

/**
 * 获取历史生理体征数据（当天）
 */
export function getHistoricalPhysiologicalData() {
  return request<HistoricalPhysiologicalData>({
    url: '/physiological/historical',
    method: 'GET'
  })
}

/**
 * 获取生理体征阈值设置
 */
export function getPhysiologicalThresholds() {
  return request<PhysiologicalThresholds>({
    url: '/physiological/thresholds',
    method: 'GET'
  })
}

/**
 * 更新生理体征阈值设置
 */
export function updatePhysiologicalThresholds(data: PhysiologicalThresholds) {
  return request({
    url: '/physiological/thresholds',
    method: 'PUT',
    data
  })
}
