<template>
  <div class="hover:bg-[#0000000d] cursor-pointer p-2" @click="handleSettingsClick">
    <!-- 设置图标 -->
    <el-icon class="h-10 w-10 text-2xl">
      <Setting />
    </el-icon>
  </div>
</template>

<script setup lang="ts">
import { Setting } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

/**
 * 处理设置图标点击事件
 * 跳转到设置页面
 */
function handleSettingsClick() {
  router.push({ name: 'settings-index' })
}
</script>
