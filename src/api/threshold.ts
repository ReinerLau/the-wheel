import request from '@/utils/request'
import type { ActionResponse } from '@/utils/request'
/**阀值档案 */
export const threshold = {
  /** 查询 */
  queryAll(params: object) {
    return request({
      url: '/thresholdFile/v1/list',
      method: 'get',
      params,
    })
  },
  /** 根据ID获取阀值档案 */
  queryByRid(id: number) {
    return request({
      url: `/thresholdFile/v1/getById/${id}`,
      method: 'get',
    })
  },
  /** 创建 */
  create(data: object) {
    return request<any, ActionResponse>({
      url: '/thresholdFile/v1/create',
      method: 'post',
      data,
    })
  },
  /** 更新 */
  update(data: object) {
    return request<any, ActionResponse>({
      url: '/thresholdFile/v1/update',
      method: 'put',
      data,
    })
  },
  /** 删除 */
  delete(id: number) {
    return request<any, ActionResponse>({
      url: '/thresholdFile/v1/delete/' + id,
      method: 'delete',
    })
  },
  queryByRobotCode(code: string): Promise<{ data: Record<string, string> }> {
    return request({
      url: '/thresholdFile/v2/robotThreshold',
      method: 'get',
      params: { robot: code },
    })
  },
  updateRobot(data: Record<string, string>) {
    return request<any, ActionResponse>({
      url: '/thresholdFile/v2/syncRobotThreshold',
      method: 'put',
      data,
    })
  },
  queryByDeviceId(id: number): Promise<{ data: Record<string, unknown> }> {
    return request({
      url: `/thresholdFile/v1/getByDid/${id}`,
      method: 'get',
    })
  },
}
