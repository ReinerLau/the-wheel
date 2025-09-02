import request from '@/utils/request'

/**
 * 获取货架信息表列表请求参数
 */
interface ShelfListParams {
  warehouseId?: number | string // 仓库ID
  limit?: number // 每页数量
}

/**
 * 货架信息创建/更新参数
 */
interface ShelfData {
  id?: number | string // 货架ID，更新时必填
  warehouseId: number | string // 仓库ID
  shelfName: string // 货架名称
  shelfCode?: string // 货架编码
  location?: string // 位置信息
  description?: string // 描述
  status?: number // 状态
}

// 获取货架信息表列表
export function getShelfList(params: ShelfListParams) {
  return request({
    url: '/warehouse/shelf/v1/list',
    method: 'get',
    params,
  })
}
// 添加货架信息表
export function createShelf(data: ShelfData) {
  return request({
    url: '/warehouse/shelf/v1/create',
    method: 'post',
    data,
  })
}
// 批量删除
export function deleteShelfs(data: { ids: string; warehouseId: number }) {
  return request({
    url: `/mock/warehouse/shelves`,
    method: 'delete',
    data,
  })
}

// 删除货架信息表
export function deleteShelfById(id: number) {
  return request({
    url: `/warehouse/shelf/v1/delete/${id}`,
    method: 'delete',
  })
}

// 修改货架信息表
export function updateShelf(data: ShelfData) {
  return request({
    url: `/warehouse/shelf/v1/update`,
    method: 'put',
    data,
  })
}

/**
 *
 * @param data
 * 货架id
 * 机器人id
 * 位置类型;常用类型有:0(一般点位)，1(前台点)，7(闸机),3(电梯外),4(电梯内),11(充电桩)等等
 * @returns
 */
export function locateShelf(data: { id: string | number; robotId: string | number; type: number }) {
  return request({
    url: '/warehouse/shelf/v1/locate',
    method: 'post',
    data,
  })
}
