import { cloneDeep } from 'lodash'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import type { App } from 'vue'
import router, { asyncRoutes } from '../router/index'
import { useUserStore } from '../store/user'
import { getToken } from '../utils/auth'
import type { RouteLocationNormalizedGeneric, RouteRecordRaw } from 'vue-router'

/**
 * 没有 token 时的路由白名单
 */
const whiteList = ['/login']

/**
 * 路由是否已初始化
 */
let routesInitialized = false

/**
 * 检查权限
 */
export default async function checkPermission(app: App) {
  router.beforeEach((to, from) => {
    NProgress.start()
    if (typeof to.meta.title === 'string') {
      document.title = to.meta.title
    } else {
      document.title = '巡检系统'
    }

    // 如果是从登录页跳转而来，重置路由初始化状态
    if (from.path === '/login') {
      routesInitialized = false
    }

    const hasToken = getToken()
    if (hasToken) {
      return handleHasToken(to)
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
 * 检测是否为移动端环境
 */
function isMobileDevice(): boolean {
  const userAgent = navigator.userAgent
  const mobileKeywords = [
    'Mobile',
    'Android',
    'iPhone',
    'iPad',
    'iPod',
    'BlackBerry',
    'Windows Phone',
    'Opera Mini',
  ]
  return mobileKeywords.some((keyword) => userAgent.includes(keyword)) || window.innerWidth <= 768
}

/**
 * 有 token 时的路由检查
 */
async function handleHasToken(to: RouteLocationNormalizedGeneric) {
  // 检查是否为移动端环境，如果是且当前不在移动端页面或登录页，则重定向到移动端首页
  if (isMobileDevice() && to.path !== '/mobile' && to.path !== '/login') {
    return '/mobile'
  }

  if (!routesInitialized) {
    const { getInfo } = useUserStore()
    const { roles, menuList } = await getInfo()
    handleRoutes(roles, menuList)
    routesInitialized = true
  }
  if (to.path === '/login') {
    routesInitialized = false
    // 如果是移动端环境，登录后重定向到移动端首页
    return isMobileDevice() ? '/mobile' : '/'
  }
  if (!to.name || !router.hasRoute(to.name)) {
    const targetRoute = router.getRoutes().find((route) => route.path === to.path)
    if (targetRoute) {
      return to.path
    }
    // 如果是移动端环境，默认重定向到移动端首页
    return isMobileDevice() ? '/mobile' : '/'
  }
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
 * 处理路由
 */
async function handleRoutes(roles: string[], menuList: string) {
  if (roles.includes('超级管理员')) {
    asyncRoutes.forEach((route) => {
      router.addRoute(route)
    })
    return
  }
  let routes: RouteRecordRaw[] = cloneDeep(asyncRoutes)
  const menus = menuList ? menuList.split(',') : []
  routes = setRouteShow(routes, menus)
  routes.forEach((route) => {
    router.addRoute(route)
  })
}

/**
 * 设置路由显示
 */
function setRouteShow(routes: RouteRecordRaw[], menus: string[]) {
  const newRoutes: RouteRecordRaw[] = []
  routes.forEach((route) => {
    if (typeof route.name === 'string' && menus.includes(route.name)) {
      newRoutes.push(route)
    }
  })
  return newRoutes
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
