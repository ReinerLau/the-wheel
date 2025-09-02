<template>
  <el-card class="mb-5">
    <template #header>折线图</template>
    <LineChart></LineChart>
  </el-card>
  <div class="flex mb-5">
    <el-card class="flex-1">
      <template #header>雷达图</template>
      <RadarChart></RadarChart>
    </el-card>
    <el-card class="flex-1 mx-5">
      <template #header>饼图</template>
      <PieChart></PieChart>
    </el-card>
    <el-card class="flex-1">
      <template #header>柱状图</template>
      <BarChart></BarChart>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import BarChart from "./components/BarChart.vue";
import LineChart from "./components/LineChart.vue";
import PieChart from "./components/PieChart.vue";
import RadarChart from "./components/RadarChart.vue";
</script>
