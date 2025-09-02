import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import PageLayout from '../layout/PageLayout.vue'
import patrolHistory from './modules/patrolHistory'
import system from './modules/system'

export const constRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: PageLayout,
    redirect: { name: 'monitor-index' },
    meta: {
      title: '首页',
      root: true,
    },
    children: [
      {
        path: 'monitor',
        name: 'monitor-index',
        component: () => import('@/views/monitor/MonitorIndex.vue'),
        meta: {
          title: '首页',
        },
      },
    ],
  },
  {
    path: '/mobile',
    name: 'mobile-monitor',
    component: () => import('@/views/monitor/MobileMonitorIndex.vue'),
    meta: {
      title: '首页',
      hidden: true,
    },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginPage.vue'),
    meta: {
      title: '登录',
      hidden: true,
    },
  },
]

/**
 * 动态路由数组
 */
export const asyncRoutes = [patrolHistory, system]

const router = createRouter({
  history: createWebHistory(),
  routes: constRoutes,
})

export function resetRouter() {
  asyncRoutes.forEach((route) => {
    router.removeRoute(route.name)
  })
}

export default router
