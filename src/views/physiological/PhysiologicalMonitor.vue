<template>
  <el-scrollbar height="100%">
    <div class="flex flex-col">
      <!-- 实时数据统计 -->
      <RealtimeStats />

      <!-- 趋势图表 - 2x2 网格布局 -->
      <div class="grid grid-cols-2 gap-6 mb-6">
        <ParameterTrendCard parameter="temperature" />
        <ParameterTrendCard parameter="heartRate" />
        <ParameterTrendCard parameter="systolic" />
        <ParameterTrendCard parameter="oxygenSaturation" />
      </div>
    </div>
  </el-scrollbar>
</template>

<script setup lang="ts">
import RealtimeStats from './components/RealtimeStats.vue'
import ParameterTrendCard from './components/ParameterTrendCard.vue'
</script>
