<template>
  <div
    class="bg-white flex shadow h-12 items-center px-4"
    :class="showBackButton ? 'justify-between' : 'justify-end'"
  >
    <!-- 左侧后退按钮 - 只在非生理特征路由下显示 -->
    <div v-if="showBackButton" class="flex items-center">
      <el-button link @click="goBack" class="text-gray-600 hover:text-blue-600 p-1">
        <el-icon size="18">
          <ArrowLeft />
        </el-icon>
        <span class="ml-1">返回</span>
      </el-button>
    </div>

    <!-- 右侧用户头像 -->
    <NavbarAvator />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import NavbarAvator from './NavbarAvator.vue'

const router = useRouter()
const route = useRoute()

/**
 * 判断是否显示返回按钮
 * 只有在非生理特征路由下才显示
 */
const showBackButton = computed(() => {
  return route.path.startsWith('/settings')
})

/**
 * 返回生理特征页面
 */
const goBack = () => {
  router.push('/')
}
</script>
