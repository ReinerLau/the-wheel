import request from '../utils/request'
import type {
  LoginParams,
  UserListParams,
  CreateUserParams,
  UpdateUserParams,
  AssignRoleParams
} from '../types/user'

export function login(data: LoginParams) {
  return request({
    url: '/admin/v1/login',
    method: 'post',
    data
  })
}

export function logout() {
  return request({
    url: '/admin/v1/logout',
    method: 'post'
  })
}

export function getInfo(token: string) {
  return request({
    url: '/admin/v1/info',
    method: 'get',
    params: { token }
  })
}

export function fetchList(params: UserListParams) {
  return request({
    url: '/admin/v1/list',
    method: 'get',
    params: params
  })
}

export function createUser(data: CreateUserParams) {
  return request({
    url: '/admin/v1/register',
    method: 'post',
    data: data
  })
}

export function deleteUser(id: string) {
  return request({
    url: `/admin/v1/delete/${id}`,
    method: 'post'
  })
}

export function updateUser(data: UpdateUserParams) {
  return request({
    url: `/admin/v1/update/${data.id}`,
    method: 'post',
    data: data
  })
}

export function getRolesByUser(id: string) {
  return request({
    url: `/admin/v1/role/${id}`,
    method: 'get'
  })
}

export function assignRole(params: AssignRoleParams) {
  return request({
    url: '/admin/v1/role/update',
    method: 'post',
    params
  })
}
