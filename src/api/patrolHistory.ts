import request from '@/utils/request'
import type { ListReponse } from '@/utils/request'

// 巡检历史列表查询参数
export interface PatrolHistoryQuery {
  limit: number
  page: number
  robotCode?: string
  startTime?: string
  endTime?: string
  robotName?: string
}

// 巡检历史项目类型
export interface TaskItem {
  taskName: string
  robotCode: string
  robotName: string | null
  startTime: string | null
  endTime: string | null
  warehouseName: string[]
  executionMessage: string | null
  videoUrl: string | null
  temperature: {
    max: number | null
    min: number | null
  }
  humidity: {
    max: number | null
    min: number | null
  }
  alterCount: number
  recordId: string
}

// 获取巡检历史列表
export function fetchPatrolHistoryList(params: PatrolHistoryQuery) {
  return request<ListReponse<TaskItem>>({
    url: '/daily-task/v1/list',
    method: 'get',
    params,
  })
}

// 获取告警历史列表
export interface AlertHistoryQuery {
  limit: number
  page: number
  robotCode?: string
  startTime?: string
  endTime?: string
  taskId?: string
  robotName?: string
}

// 告警历史项目类型
export interface AlertItem {
  robotCode: string
  deviceId: string
  robotLocation: {
    x: number
    y: number
    theta: number
  }
  createdTime: string
  picPath: string
  message: string
  /**
   * 地图图片路径
   */
  mapPath: string
}

export function fetchAlertHistoryListByTask(recordId: string) {
  return request<AlertItem[]>({
    url: `/perception-environment/v1/list/${recordId}`,
    method: 'get',
  })
}
