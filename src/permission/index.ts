import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import type { App } from 'vue'
import router from '../router/index'
import { useUserStore } from '../store/user'
import { getToken } from '../utils/auth'

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
    } else {
      if (to.name === 'settings') {
        return true
      }
      router.push({ name: 'settings' })
    }

    return true
  })

  app.directive('has', checkButtonPermission)

  router.afterEach(() => {
    NProgress.done()
  })
}

/**
 * 检查按钮权限
 */
function checkButtonPermission(el: HTMLElement, { value }: { value: string }) {
  if (hasPermission(value)) {
    return true
  } else {
    el.remove()
  }
}

export function hasPermission(permissionId: string) {
  const { permissionIds, roles } = useUserStore()
  if (roles.includes('超级管理员')) return true
  return permissionIds.includes(permissionId)
}
