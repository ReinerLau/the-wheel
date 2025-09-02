import request from '@/utils/request'
import type { ActionResponse } from '@/utils/request'

/**机器人档案 */
export const robotArchives = {
  /** 查询 */
  queryAll(params: object) {
    return request({
      url: '/robot-archives/v1/getRobotAndCompany',
      method: 'get',
      params,
    })
  },
  /** 创建 */
  create(data: object) {
    return request<any, ActionResponse>({
      url: '/robot-archives/v1/create',
      method: 'post',
      data,
    })
  },
  /** 更新 */
  update(data: object) {
    return request<any, ActionResponse>({
      url: '/robot-archives/v1/update',
      method: 'put',
      data,
    })
  },
  /** 删除 */
  delete(id: number) {
    return request({
      url: '/robot-archives/v1/delete/' + id,
      method: 'delete',
    })
  },
  /**
   * 坐标校准
   */
  coordCheck(data) {
    return request({
      url: '/dcInspectionControl/calibrationV2',
      method: 'post',
      data,
    })
  },
  /**
   * 开启自动巡逻
   */
  autoInspectionOpen(rid) {
    return request({
      url: `/wisdom-auto-inspection/v1/open/${rid}`,
      method: 'get',
    })
  },
  /**
   * 关闭自动巡逻
   */
  autoInspectionClose(rid: number) {
    return request({
      url: '/wisdom-auto-inspection/v1/close/' + rid,
      method: 'get',
    })
  },
  /**
   * 一键返回充电点
   */
  goHome(rid: number) {
    return request({
      url: '/wisdom-auto-inspection/v1/goHome/' + rid,
      method: 'get',
    })
  },
  /**
   * 同步阈值
   */
  handleThreshold(data) {
    return request({
      url: '/thresholdFile/v1/robotThreshold',
      method: 'post',
      data,
    })
  },
}
