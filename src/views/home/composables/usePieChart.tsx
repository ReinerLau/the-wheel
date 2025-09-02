import * as echarts from "echarts";
import { FunctionalComponent, Ref, onMounted, onUnmounted, ref } from "vue";

type PieResData = Array<{ type: string; num: number }>;

export const usePieChart = () => {
  const chartRef: Ref<HTMLElement> = ref();

  let chart: echarts.ECharts;

  function initChart() {
    chart = echarts.init(chartRef.value);
    chart.setOption({
      tooltip: {
        trigger: "item",
      },
      series: [
        {
          name: "异常",
          type: "pie",
          radius: "60%",
          center: ["50%", "50%"],
          color: ["#5ab1ef", "#b6a2de", "#67e0e3", "#2ec7c9"],
          data: [],
          roseType: "radius",
          animationType: "scale",
          animationEasing: "exponentialInOut",
        },
      ],
    });
  }

  function updatePieChart(data: PieResData) {
    const pieChartData = data.map((item) => ({
      value: item.num,
      name: item.type,
    }));
    chart.setOption({
      series: [
        {
          data: pieChartData,
        },
      ],
    });
  }

  function handleResize() {
    chart.resize();
  }

  onMounted(() => {
    initChart();
    window.addEventListener("resize", handleResize);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", handleResize);
  });

  const PieChart: FunctionalComponent = () => {
    return <div ref={chartRef} class="h-72 w-full" />;
  };

  return {
    PieChart,
    updatePieChart,
  };
};
