<template>
  <el-scrollbar height="100%">
    <div class="flex flex-col">
      <!-- 实时数据统计 -->
      <RealtimeStats />

      <!-- 趋势图表容器 -->
      <ParameterTrendContainer />
    </div>
  </el-scrollbar>
</template>

<script setup lang="ts">
import RealtimeStats from './components/RealtimeStats.vue'
import ParameterTrendContainer from './components/ParameterTrendContainer.vue'
</script>
