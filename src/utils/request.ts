/*
 * @Author: ReinerLau lk850593913@gmail.com
 * @Date: 2022-08-23 10:45:57
 * @LastEditors: reiner850593913 lk850593913@gmail.com
 * @LastEditTime: 2022-08-31 18:04:36
 * @FilePath: \robot\src\utils\request.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import qs from 'qs'
import { useUserStore } from '../store/user'
import { getToken, removeToken } from './auth'
import _ from 'lodash'

const service = axios.create({
  baseURL: '/api',
  timeout: 5000,
})

/**
 * 参数序列化函数
 * 过滤掉值为 null、undefined、空字符串的属性，并序列化数组参数
 */
export const paramSerializer = function (params: Record<string, unknown>) {
  // 过滤掉值为 null、undefined、空字符串的属性
  const filteredParams = _.pickBy(
    params,
    (value) => value !== null && value !== undefined && value !== '',
  )
  return qs.stringify(filteredParams, { arrayFormat: 'repeat' })
}

/**
 * 请求拦截器回调函数
 */
export const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  const token = getToken()
  if (token) {
    // 让每个请求携带token
    config.headers['Authorization'] = token
  }

  // 只针对get方式进行序列化,序列化数组参数
  if (config.method === 'get') {
    config.paramsSerializer = paramSerializer
  }
  return config
}

// 拦截请求
service.interceptors.request.use(requestInterceptor, (error) => {
  return Promise.reject(error)
})

// 拦截响应
service.interceptors.response.use(
  (response) => {
    // code为非200是抛错
    const res = response.data
    if (res.code !== 200) {
      ElMessage({
        message: res.message,
        type: 'error',
        duration: 3 * 1000,
      })

      // 401:未登录;
      if (res.code === 401) {
        ElMessageBox.confirm('你已被登出，可以取消继续留在该页面，或者重新登录', '确定登出', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          const userStore = useUserStore()
          userStore.token = ''
          removeToken()
          // 为了重新实例化vue-router对象 避免bug
          location.reload()
        })
      }
      return Promise.reject('error')
    } else {
      return response.data
    }
  },
  (error) => {
    ElMessage({
      message: error.message,
      type: 'error',
      duration: 3 * 1000,
    })
    return Promise.reject(error)
  },
)

export default service

export interface ListReponse<T> {
  list: T[]
  total: number
}

export interface ActionResponse {
  message: string
  code: number
}
