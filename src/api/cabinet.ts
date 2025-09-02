import request from '../utils/request'
import type { ListReponse } from '../utils/request'

/**机柜档案 */
export const cabinet = {
  /** 查询 */
  queryAll(params: object) {
    return request<any, ListReponse<any>>({
      url: '/CabinetProfile/v1/list',
      method: 'get',
      params,
    })
  },
  /** 根据机房ID获取机柜列表 */
  queryByRid(rid: string) {
    return request({
      url: `/CabinetProfile/v1/getByRid/${rid}`,
      method: 'get',
    })
  },
  /** 创建 */
  create(data: object) {
    return request({
      url: '/CabinetProfile/v1/creat',
      method: 'post',
      data,
    })
  },
  /** 更新 */
  update(data: object) {
    return request({
      url: '/CabinetProfile/v1/modify',
      method: 'put',
      data,
    })
  },
  /** 删除 */
  delete(id: number) {
    return request({
      url: '/CabinetProfile/v1/delete/' + id,
      method: 'delete',
    })
  },
  /**
   * 批量机房关联机柜
   */
  batchBind(data) {
    return request({
      url: '/CabinetProfile/v1/updateBeath',
      method: 'post',
      data,
    })
  },
  /**
   * 采集机柜坐标
   */
  collectCoordinate(params) {
    return request({
      url: '/CabinetProfile/v1/getCoordinate',
      method: 'get',
      params,
    })
  },
}
