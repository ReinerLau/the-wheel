<template>
  <div class="hover:bg-[#0000000d] cursor-pointer p-2">
    <el-dropdown class="h-full" trigger="click">
      <!-- 图标 -->
      <el-icon class="h-10 w-10 text-2xl">
        <Setting />
      </el-icon>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { Setting } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'

const { logout } = useUserStore()
const router = useRouter()

async function handleLogout() {
  await logout()
  router.push('/login')
}
</script>
