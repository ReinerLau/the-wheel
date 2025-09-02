<template>
  <div class="h-full flex">
    <LayoutSidebar />
    <div class="flex-1 flex flex-col min-h-0">
      <LayoutNavbar />
      <AppMain class="flex-1 bg-gray-100 p-10 min-h-0" />
    </div>
  </div>
</template>

<script setup lang="ts">
import AppMain from './AppMain.vue'
import LayoutNavbar from './LayoutNavbar.vue'
import LayoutSidebar from './LayoutSidebar.vue'
</script>
