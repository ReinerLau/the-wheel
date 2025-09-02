<template>
  <div ref="chartRef" class="h-80 w-full"></div>
</template>

<script setup lang="ts">
import * as echarts from "echarts";
import { onMounted, ref } from "vue";

const chartRef = ref(null);

onMounted(() => {
  initChart();
});

function initChart() {
  const chart = echarts.init(chartRef.value);

  chart.setOption({
    tooltip: {
      trigger: "item",
    },

    series: [
      {
        name: "异常",
        type: "pie",
        radius: "80%",
        center: ["50%", "50%"],
        color: ["#5ab1ef", "#b6a2de", "#67e0e3", "#2ec7c9"],
        data: [
          { value: 500, name: "任务异常" },
          { value: 310, name: "设备异常" },
          { value: 274, name: "监控异常" },
          { value: 400, name: "温度异常" },
        ].sort(function (a, b) {
          return a.value - b.value;
        }),
        roseType: "radius",
        animationType: "scale",
        animationEasing: "exponentialInOut",
        animationDelay: function () {
          return Math.random() * 400;
        },
      },
    ],
  });
}
</script>
