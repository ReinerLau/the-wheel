import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import physiological from './modules/physiological'
import settings from './modules/settings'

export const constRoutes: RouteRecordRaw[] = [physiological, settings]

const router = createRouter({
  history: createWebHistory(),
  routes: constRoutes
})

export default router
