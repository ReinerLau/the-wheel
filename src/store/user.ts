import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getInfo as getInfoApi, login as loginApi, logout as logoutAPI } from '../api/user'
import { resetRouter } from '../router/index'
import { getToken, removeToken, setToken } from '../utils/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref('')
  // 首次加载先从 cookie 获取 token
  token.value = getToken() || ''
  /**
   * @description: 登录
   * @param {*} userInfo 用户名/密码
   * @return {*}
   */
  async function login(userInfo: { username: string; password: string }) {
    const { username, password } = userInfo
    const { data } = await loginApi({ username: username.trim(), password })
    const tokenStr = data.tokenHead + data.token
    // 存储 token 到 cookie 中
    setToken(tokenStr)
    token.value = tokenStr
  }

  // 用户名
  const name = ref('')
  // 角色身份
  const roles = ref<string[]>([])
  // 有权限的菜单和按钮
  const permissionIds = ref<string[]>([])
  /**
   * @description: 获取用户信息
   * @return {*}
   */
  async function getInfo() {
    const { data } = await getInfoApi(token.value)
    if (!data) return {}
    roles.value = data.roles || []
    name.value = data.username
    permissionIds.value = data.menuList ? data.menuList.split(',') : []
    return data
  }

  /**
   * @description: 退出登录
   * @return {*}
   */
  async function logout() {
    await logoutAPI()
    removeToken()
    resetRouter()
    resetState()
  }

  function resetState() {
    token.value = ''
    name.value = ''
    roles.value = []
  }

  return {
    login,
    token,
    name,
    getInfo,
    roles,
    logout,
    permissionIds,
  }
})
