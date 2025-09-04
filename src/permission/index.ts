import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import type { App } from 'vue'
import router from '../router/index'
import { useUserStore } from '../store/user'
import { getToken } from '../utils/auth'
import type { RouteLocationNormalizedGeneric } from 'vue-router'

/**
 * 没有 token 时的路由白名单
 */
const whiteList = ['/login']

/**
 * 检查权限
 */
export default async function checkPermission(app: App) {
  router.beforeEach(async (to) => {
    NProgress.start()
    if (typeof to.meta.title === 'string') {
      document.title = to.meta.title
    }

    const hasToken = getToken()
    if (hasToken) {
      const { getInfo } = useUserStore()
      await getInfo()
      return true
    } else {
      return handleNoToken(to)
    }
  })

  app.directive('has', checkButtonPermission)

  router.afterEach(() => {
    NProgress.done()
  })
}

/**
 * 没有 token 时的路由检查
 */
function handleNoToken(to: RouteLocationNormalizedGeneric) {
  if (!whiteList.includes(to.path)) {
    return '/login'
  }
  return true
}

/**
 * 检查按钮权限
 */
function checkButtonPermission(el: HTMLElement, { value }: { value: string }) {
  const { permissionIds, roles } = useUserStore()
  if (roles.includes('超级管理员')) return
  if (!permissionIds.includes(value)) {
    el.remove()
  }
}
