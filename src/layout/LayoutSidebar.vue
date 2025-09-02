<template>
  <div class="h-full w-1/12 bg-[#304156]">
    <el-scrollbar>
      <el-menu class="border-none" :default-active="activeMenu">
        <SidebarItem v-for="route in routes" :key="route.name" :item="route" />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SidebarItem from './SidebarItem.vue'

const route = useRoute()

const activeMenu = computed(() => {
  const { meta, name } = route
  return (meta.activeMenu as string) || (name as string)
})

const router = useRouter()
const routes = computed(() => {
  return router
    .getRoutes()
    .filter((route) => route.meta.root && !route.meta.hidden)
    .map((route) => {
      return {
        ...route,
        children: route.children.filter((child) => !child.meta?.hidden),
      }
    })
})
</script>

<style scoped lang="scss">
:deep(.el-menu) {
  --el-menu-bg-color: #304156;
  --el-menu-text-color: #b9c5d4;
  --el-menu-hover-bg-color: #2d3d52;
  .el-sub-menu {
    .el-menu-item {
      background-color: #202d3d;
      &:hover {
        background-color: #021635;
      }
    }
  }
}
</style>
