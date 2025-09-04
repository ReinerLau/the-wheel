<template>
  <el-scrollbar class="h-full">
    <el-card>
      <el-tabs v-model="activeTab" @tab-click="refreshCurrentList">
        <el-tab-pane label="用户管理" name="user">
          <UserList ref="userListRef" />
        </el-tab-pane>
        <el-tab-pane label="角色管理" name="role">
          <RoleList ref="roleListRef" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import UserList from '../../authority/UserList.vue'
import RoleList from '../../authority/RoleList.vue'

/**
 * 默认活跃标签页为用户管理
 */
const activeTab = ref('user')
const userListRef = ref()
const roleListRef = ref()

/**
 * 标签页切换时刷新对应列表数据
 */
const refreshCurrentList = () => {
  if (activeTab.value === 'user' && userListRef.value) {
    userListRef.value.getList?.()
  } else if (activeTab.value === 'role' && roleListRef.value) {
    roleListRef.value.getList?.()
  }
}
</script>
