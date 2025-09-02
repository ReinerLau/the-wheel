/*
 * @Author: ReinerLau lk850593913@gmail.com
 * @Date: 2022-08-23 10:45:57
 * @LastEditors: ReinerLau lk850593913@gmail.com
 * @LastEditTime: 2022-08-29 12:00:59
 * @FilePath: \robot\src\utils\auth.js
 * @Description: 身份认证相关工具函数
 */
import Cookies from 'js-cookie'

const TokenKey = 'robot_management_web_token'

/**
 * 获取认证令牌
 * @returns {string | undefined} 认证令牌字符串，如未设置则返回 undefined
 */
export function getToken(): string | undefined {
  return Cookies.get(TokenKey)
}

/**
 * 设置认证令牌
 * @param {string} token 认证令牌字符串
 * @returns {string | undefined} 设置后的值
 */
export function setToken(token: string): string | undefined {
  return Cookies.set(TokenKey, token)
}

/**
 * 移除认证令牌
 * @returns {void}
 */
export function removeToken(): void {
  Cookies.remove(TokenKey)
}
