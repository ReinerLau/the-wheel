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
    legend: {
      bottom: 0,
      data: ["A", "B"],
    },
    tooltip: {},
    radar: {
      radius: "60%",
      splitNumber: 8,
      indicator: [
        {
          name: "电量",
        },
        {
          name: "速度",
        },
        {
          name: "温度",
        },
        {
          name: "湿度",
        },
        {
          name: "高度",
        },
        {
          name: "数量",
        },
      ],
    },
    series: [
      {
        type: "radar",
        symbolSize: 0,
        areaStyle: {
          shadowBlur: 0,
          shadowColor: "rgba(0,0,0,.2)",
          shadowOffsetX: 0,
          shadowOffsetY: 10,
          opacity: 1,
        },
        data: [
          {
            value: [90, 50, 86, 40, 50, 20],
            name: "A",
            itemStyle: {
              color: "#b6a2de",
            },
          },
          {
            value: [70, 75, 70, 76, 20, 85],
            name: "B",
            itemStyle: {
              color: "#5ab1ef",
            },
          },
        ],
      },
    ],
  });
}
</script>
