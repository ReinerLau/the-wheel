<template>
  <div class="p-4 h-full">
    <el-card class="mb-4 h-full overflow-y-auto">
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold">权限管理</h2>
        </div>
      </template>

      <el-tabs v-model="activeTab" class="flex-1" @tab-click="refreshCurrentList">
        <el-tab-pane label="用户管理" name="user">
          <UserList ref="userListRef" />
        </el-tab-pane>
        <el-tab-pane label="角色管理" name="role">
          <RoleList ref="roleListRef" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import UserList from './UserList.vue'
import RoleList from './RoleList.vue'

// 默认活跃标签页为用户管理
const activeTab = ref('user')
const userListRef = ref()
const roleListRef = ref()

// 标签页切换时刷新对应列表数据
const refreshCurrentList = () => {
  if (activeTab.value === 'user' && userListRef.value) {
    userListRef.value.getList?.()
  } else if (activeTab.value === 'role' && roleListRef.value) {
    roleListRef.value.getList?.()
  }
}

onMounted(() => {
  refreshCurrentList()
})
</script>

<style lang="scss" scoped>
:deep(.el-tabs__content) {
  @apply flex-1 overflow-auto;
}
</style>
