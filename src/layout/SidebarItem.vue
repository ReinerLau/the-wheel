<template>
  <template v-if="hasChildren">
    <el-sub-menu :index="item.name">
      <template #title>
        {{ item.meta.title }}
      </template>
      <SidebarItem v-for="child in item.children" :key="child.name" :item="child" />
    </el-sub-menu>
  </template>
  <template v-else-if="onlyOneChildren">
    <router-link :to="{ name: item.children[0].name }">
      <el-menu-item :index="item.children[0].name">
        {{ item.children[0].meta.title }}
      </el-menu-item>
    </router-link>
  </template>
  <template v-else>
    <el-menu-item v-if="item.meta.link" :index="item.name" @click="handleLink(item.meta.link)">
      {{ item.meta.title }}
    </el-menu-item>
    <router-link v-else :to="{ name: item.name }">
      <el-menu-item :index="item.name">
        {{ item.meta.title }}
      </el-menu-item>
    </router-link>
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})

const hasChildren = computed(() => {
  return props.item.children && props.item.children.length > 1
})

const onlyOneChildren = computed(() => {
  return props.item.children && props.item.children.length === 1
})

function handleLink(url: string) {
  window.open(url)
}
</script>
