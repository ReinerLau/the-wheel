import request from '../utils/request'
import type { RoleListParams, CreateRoleParams, UpdateRoleParams } from '@/types/user'

export function fetchList(params: RoleListParams) {
  return request({
    url: '/role/v1/list',
    method: 'get',
    params
  })
}

export function createRole(data: CreateRoleParams) {
  return request({
    url: '/role/v1/create',
    method: 'post',
    data
  })
}

export function deleteRole(id: string) {
  return request({
    url: `/role/v1/delete/${id}`,
    method: 'delete'
  })
}

export function updateRole(data: UpdateRoleParams) {
  return request({
    url: `/role/v1/update/${data.id}`,
    method: 'put',
    data
  })
}

export function getOneRole(id: string) {
  return request({
    url: `/role/v1/getOne/${id}`,
    method: 'get'
  })
}
