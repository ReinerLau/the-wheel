<template>
  <div class="h-full flex flex-col">
    <!-- 实时数据统计 -->
    <div class="flex-shrink-0">
      <RealtimeStats />
    </div>

    <!-- 趋势图表容器 -->
    <div class="flex-1 min-h-0">
      <ParameterTrendContainer />
    </div>
  </div>
</template>

<script setup lang="ts">
import RealtimeStats from './components/RealtimeStats.vue'
import ParameterTrendContainer from './components/ParameterTrendContainer.vue'
</script>
