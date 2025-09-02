import type { Task } from '@/types/task'
import request from '@/utils/request'
import { TaskType } from '@/constants/task'

export function getTaskList(params: {
  page: number
  limit: number
  robotCode?: string
  schedule?: boolean
}) {
  return request<{ list: Task[]; total: number }>({
    url: '/task/v1/list',
    method: 'get',
    params,
  })
}

export function createTask(data: Omit<Task, 'id'>) {
  return request({
    url: '/task/v1/create',
    method: 'post',
    data,
  })
}

export function deleteTask(id: number) {
  return request({
    url: `/task/v1/delete/${id}`,
    method: 'delete',
  })
}

export function updateTask(data: Task) {
  return request({
    url: `/task/v1/update`,
    method: 'put',
    data,
  })
}

export enum TaskOperation {
  PAUSE = 'PAUSE',
  RESUME = 'RESUME',
  START = 'START',
  STOP = 'STOP',
  CANCEL = 'CANCEL',
}

export function operateTask(data: { operation: TaskOperation; taskId: number }) {
  return request({
    url: '/task/v1/operate',
    method: 'post',
    data,
  })
}

/**
 * 切换任务调度状态
 * @param data 参数对象
 * @param data.taskId 任务ID
 * @param data.enable 是否启用
 * @param data.taskMode 任务类型 (TaskType.NORMAL: 巡检任务, TaskType.GUIDANCE: 引导任务)
 */
export function toggleTaskSchedule(data: { taskId: number; enable: boolean; taskMode?: TaskType }) {
  return request({
    url: '/task/v1/schedule',
    method: 'put',
    data,
  })
}
