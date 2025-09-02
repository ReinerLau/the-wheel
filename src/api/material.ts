import request from '@/utils/request'
import type { Material } from '@/types/material'

interface MaterialListParams {
  page?: number
  pageSize?: number
  materialName?: string
  materialCode?: string
  warehouseName?: string
}

export function getMaterialList(params: MaterialListParams) {
  return request({
    url: '/material/v1/list',
    method: 'get',
    params,
  })
}

export function deleteMaterial(id: number) {
  return request({
    url: `/material/v1/delete/${id}`,
    method: 'delete',
  })
}

export function createMaterial(data: Material) {
  return request({
    url: '/material/v1/create',
    method: 'post',
    data,
  })
}

export function updateMaterial(data: Material) {
  return request({
    url: `/material/v1/update`,
    method: 'put',
    data,
  })
}

export function getMaterialDemo() {
  return request({
    url: '/material/v1/demo',
    method: 'get',
  })
}

export function importMaterial(data: FormData) {
  return request({
    url: '/material/v1/import',
    method: 'post',
    data,
  })
}
