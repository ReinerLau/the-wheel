<template>
  <el-scrollbar class="h-full">
    <el-card>
      <el-tabs v-model="activeTab" @tab-click="refreshCurrentList">
        <el-tab-pane label="路线管理" name="route">
          <RouteManagement ref="routeManagementRef" />
        </el-tab-pane>
        <el-tab-pane label="地点管理" name="location">
          <LocationManagement ref="locationManagementRef" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LocationManagement from './LocationManagement.vue'
import RouteManagement from './RouteManagement.vue'

/**
 * 默认活跃标签页为地点管理
 */
const activeTab = ref('route')
const locationManagementRef = ref()
const routeManagementRef = ref()

/**
 * 标签页切换时刷新对应列表数据
 */
const refreshCurrentList = () => {
  if (activeTab.value === 'location' && locationManagementRef.value) {
    locationManagementRef.value.getList?.()
  } else if (activeTab.value === 'route' && routeManagementRef.value) {
    routeManagementRef.value.getList?.()
  }
}
</script>
