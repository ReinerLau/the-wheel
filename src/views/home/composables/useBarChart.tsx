import * as echarts from "echarts";
import { FunctionalComponent, Ref, onMounted, onUnmounted, ref } from "vue";

type BarResData = Array<{ name: string; num: number }>;

export const useBarChart = () => {
  const chartRef: Ref<HTMLElement> = ref();

  let chart: echarts.ECharts;

  function initChart() {
    chart = echarts.init(chartRef.value);
    chart.setOption({
      xAxis: {
        max: "dataMax",
      },
      yAxis: {
        type: "category",
        data: [],
        inverse: true,
        animationDuration: 200,
        animationDurationUpdate: 100,
        max: 4,
      },
      grid: {
        left: "8%",
        right: "8%",
        top: "8%",
        bottom: "8%",
        containLabel: true,
      },
      series: [
        {
          color: ["#67e0e3"],
          realtimeSort: true,
          type: "bar",
          data: [],
          label: {
            show: true,
            position: "right",
            valueAnimation: true,
          },
        },
      ],
      legend: {
        show: true,
      },
      animationDuration: 0,
      animationDurationUpdate: 1000,
      animationEasing: "linear",
      animationEasingUpdate: "linear",
    });
  }

  function updateBarChart(data: BarResData) {
    let barChartData = {
      barDataNames: [],
      barDataNums: [],
    };
    barChartData = data.reduce((acc, item) => {
      acc.barDataNames.push(item.name);
      acc.barDataNums.push(item.num);
      return acc;
    }, barChartData);
    chart.setOption({
      yAxis: {
        data: barChartData.barDataNames,
      },
      series: [
        {
          data: barChartData.barDataNums,
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

  const BarChart: FunctionalComponent = () => {
    return <div ref={chartRef} class="h-72 w-full" />;
  };

  return {
    BarChart,
    updateBarChart,
  };
};
