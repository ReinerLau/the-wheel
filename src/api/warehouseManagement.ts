/**
 * 仓库管理 API
 */
import type { Warehouse } from '@/types/warehouse'
import request from '@/utils/request'

/**
 * 获取仓库列表
 */
export function getWarehouseList(params) {
  return request({
    url: '/warehouse/v1/list',
    method: 'get',
    params,
  })
}

/**
 * 删除仓库信息
 * @param id 仓库 ID
 */
export const deleteWarehouse = (id: number) => {
  return request.delete(`/warehouse/v1/delete/${id}`)
}

/**
 * 添加仓库信息
 */
export const createWarehouse = (data: Omit<Warehouse, 'id'>) => {
  return request.post('/warehouse/v1/create', data)
}

/**
 * 修改仓库信息
 */
export const updateWarehouse = (data: Warehouse) => {
  return request.put('/warehouse/v1/update', data)
}
