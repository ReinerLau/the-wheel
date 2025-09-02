import request from '../utils/request'
import type { ActionResponse, ListReponse } from '../utils/request'
/**设备档案 */
export const deviceProfile = {
  /** 查询 */
  queryAll(params: object) {
    return request<any, ListReponse<any>>({
      url: '/deviceProfile/v1/list',
      method: 'get',
      params,
    })
  },
  /** 根据机柜id查询档案数据列表 */
  queryById(cid: number) {
    return request({
      url: '/deviceProfile/v1/getByCid/' + cid,
      method: 'get',
    })
  },
  /** 创建 */
  create(data: object) {
    return request<any, ActionResponse>({
      url: '/deviceProfile/v1/creat',
      method: 'post',
      data,
    })
  },
  /** 更新 */
  update(data: object) {
    return request<any, ActionResponse>({
      url: '/deviceProfile/v1/modify',
      method: 'put',
      data,
    })
  },
  /** 删除 */
  delete(id: number) {
    return request<any, ActionResponse>({
      url: '/deviceProfile/v1/delete/' + id,
      method: 'delete',
    })
  },
  /**
   * 批量机柜关联设备
   */
  batchBind(data) {
    return request({
      url: '/deviceProfile/v1/updateBatch',
      method: 'post',
      data,
    })
  },
  /**
   * 获取机柜关联的设备
   * @param cid 机柜id
   */
  queryByCid(cid) {
    return request({
      url: `/deviceProfile/v1/getByCid/${cid}`,
      method: 'get',
    })
  },
  /**
   * 姿势采集
   */
  postureAcquisition(data): Promise<ActionResponse> {
    return request({
      url: `/deviceProfile/v1/devicePostureAcquisition`,
      method: 'put',
      data,
    })
  },
}
