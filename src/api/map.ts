import request from '../utils/request'
import type {
  MapListParams,
  MapListResponse,
  MapAddParams,
  MapUpdateParams,
  MapUploadResponse,
} from '@/types/map'

export function fetchList(params: MapListParams) {
  return request<MapListResponse>({
    url: '/robot-map/v1/list',
    method: 'get',
    params,
  })
}

export function uploadMap(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  return request<MapUploadResponse>({
    url: '/robot-map/v1/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export function createMap(data: MapAddParams) {
  return request({
    url: '/robot-map/v1/add',
    method: 'post',
    data,
  })
}

export function deleteMap(id: number) {
  return request({
    url: `/robot-map/v1/${id}`,
    method: 'delete',
  })
}

export function updateMap(data: MapUpdateParams) {
  return request({
    url: `/robot-map/v1/update`,
    method: 'put',
    data,
  })
}
