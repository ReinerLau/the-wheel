import request from '@/utils/request'
import type { ListReponse } from '@/utils/request'

/**机房档案 */
export const roomFile = {
  /** 查询 */
  queryAll(params: object) {
    return request<any, ListReponse<any>>({
      url: '/wisdom-machineRoomFile/v1/list',
      method: 'get',
      params,
    })
  },
  /** 根据id获取机房档案 */
  queryById(id: number) {
    return request({
      url: '/wisdom-machineRoomFile/v1/getById/' + id,
      method: 'get',
    })
  },
  /** 创建 */
  create(data: object) {
    return request({
      url: '/wisdom-machineRoomFile/v1/create',
      method: 'post',
      data,
    })
  },
  /** 更新 */
  update(data: object) {
    return request({
      url: '/wisdom-machineRoomFile/v1/update',
      method: 'put',
      data,
    })
  },
  /** 删除 */
  delete(id: number) {
    return request({
      url: '/wisdom-machineRoomFile/v1/delete/' + id,
      method: 'delete',
    })
  },
  /**
   * 批量车站关联机房
   */
  batchBind(data: object) {
    return request({
      url: '/wisdom-machineRoomFile/v1/updateBeath',
      method: 'post',
      data,
    })
  },
}
