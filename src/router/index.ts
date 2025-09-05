import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import PageLayout from '../layout/PageLayout.vue'

export const constRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: PageLayout,
    children: [
      {
        path: '',
        name: 'physiological',
        component: () => import('../views/physiological/PhysiologicalMonitor.vue'),
        meta: {
          title: '生理体征监测'
        }
      },
      {
        path: '/settings',
        name: 'settings',
        component: () => import('../views/settings/SettingsIndex.vue'),
        meta: {
          title: '系统设置'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: constRoutes
})

export default router
