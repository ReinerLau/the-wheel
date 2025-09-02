import * as echarts from "echarts";
import { FunctionalComponent, Ref, onMounted, onUnmounted, ref } from "vue";

interface LineResData {
  timePeriod: string;
  normalCount: number;
  errorCount: number;
}

export const useLineChart = () => {
  const chartRef: Ref<HTMLElement> = ref();

  let chart: echarts.ECharts;

  function initChart() {
    chart = echarts.init(chartRef.value);
    chart.setOption({
      tooltip: {
        trigger: "axis",
        axisPointer: {
          lineStyle: {
            width: 1,
            color: "#019680",
          },
        },
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: [],
        splitLine: {
          show: true,
          lineStyle: {
            width: 1,
            type: "solid",
            color: "rgba(226,226,226,0.5)",
          },
        },
        axisTick: {
          show: false,
        },
      },
      yAxis: [
        {
          type: "value",
          max: 100,
          splitNumber: 5,
          axisTick: {
            show: false,
          },
          splitArea: {
            show: true,
            areaStyle: {
              color: ["rgba(255,255,255,0.2)", "rgba(226,226,226,0.2)"],
            },
          },
        },
      ],
      grid: {
        left: "3%",
        right: "3%",
        top: "3%",
        bottom: 0,
        containLabel: true,
      },
      series: [
        {
          name: "正常日志",
          smooth: true,
          data: [],
          type: "line",
          areaStyle: {},
          itemStyle: {
            color: "#5ab1ef",
          },
        },
        {
          name: "异常日志",
          smooth: true,
          data: [],
          type: "line",
          areaStyle: {},
          itemStyle: {
            color: "#019680",
          },
        },
      ],
    });
  }

  function handleResize() {
    chart.resize();
  }

  function updateLineData(data: LineResData[]) {
    let lineChartData = {
      normalCounts: [],
      errorCounts: [],
      timePeriods: [],
    };
    lineChartData = data.reduce((acc, item) => {
      acc.normalCounts.push(item.normalCount);
      acc.errorCounts.push(item.errorCount);
      acc.timePeriods.push(item.timePeriod);

      return acc;
    }, lineChartData);
    chart.setOption({
      xAxis: {
        data: lineChartData.timePeriods,
      },
      series: [
        {
          data: lineChartData.normalCounts,
        },
        {
          data: lineChartData.errorCounts,
        },
      ],
    });
  }
  onMounted(() => {
    initChart();
    window.addEventListener("resize", handleResize);
  });
  onUnmounted(() => {
    window.removeEventListener("resize", handleResize);
  });

  const LineChart: FunctionalComponent = () => {
    return <div ref={chartRef} class="h-72 w-full" />;
  };

  return {
    LineChart,
    updateLineData,
  };
};
