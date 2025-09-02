import {
  getDeviceAlarmRanking,
  getDeviceNormalList,
  getDeviceRecords,
  getDeviceTypeError,
  getDeviceWisdomErrors,
} from "@/api";
import { DateModelType, DateOrDates, dayjs } from "element-plus";
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { useBarChart } from "./composables/useBarChart";
import { useDeviceDrawer } from "./composables/useDeviceDrawer";
import { useLineChart } from "./composables/useLineChart";
import { useLogTable } from "./composables/useLogTable";
import { usePieChart } from "./composables/usePieChart";
import { useTimePicker } from "./composables/useTimePicker";

export default defineComponent({
  name: "DeviceStatistic",
  setup() {
    const { TimePicker, queryTime, queryTimeType } = useTimePicker();
    const { DeviceDrawer, pickDevices, checkedIds, getDeviceList } =
      useDeviceDrawer();
    const { LineChart, updateLineData } = useLineChart();
    const { PieChart, updatePieChart } = usePieChart();
    const { BarChart, updateBarChart } = useBarChart();
    const { normalLogTableFields, LogTable, errorLogTableFields } =
      useLogTable();
    const loading = ref(false);

    const params = computed(() => ({
      limit: 9999999,
      bids: checkedIds.value.join(","),
      ...handleQueryTimeChange(queryTime.value),
    }));

    watch(queryTime, () => {
      getChartData();
    });

    function handleQueryTimeChange(val: DateModelType | DateOrDates): {
      startTime: string | null;
      endTime: string | null;
    } {
      let startTime: string | null;
      let endTime: string | null;
      if (!val) {
        startTime = null;
        endTime = null;
      } else if (Array.isArray(val)) {
        startTime = dayjs(val[0]).startOf("date").format("YYYY-MM-DD HH:mm:ss");
        endTime = dayjs(val[1]).endOf("date").format("YYYY-MM-DD HH:mm:ss");
      } else {
        startTime = dayjs(val).startOf("date").format("YYYY-MM-DD HH:mm:ss");
        endTime = dayjs(val)
          .endOf(queryTimeType.value)
          .format("YYYY-MM-DD HH:mm:ss");
      }
      return { startTime, endTime };
    }

    const logList = ref([]);
    const errLogList = ref([]);
    async function getChartData() {
      const [
        lineResponse,
        pieResponse,
        barResponse,
        logResponse,
        errorResponse,
      ] = await Promise.all([
        getDeviceRecords(params.value),
        getDeviceTypeError(params.value),
        getDeviceAlarmRanking(params.value),
        getDeviceNormalList(params.value),
        getDeviceWisdomErrors(params.value),
      ]);
      updateLineData(lineResponse.data || []);
      updatePieChart(pieResponse.data || []);
      updateBarChart(barResponse.data.slice(0, 5) || []);
      logList.value = logResponse.data?.list || [];
      errLogList.value = errorResponse.data?.list || [];
    }

    onMounted(async () => {
      await getDeviceList();
      getChartData();
    });

    return () => (
      <div class="grid gap-5">
        <div class="flex gap-x-5">
          <TimePicker
            v-model:type={queryTimeType.value}
            v-model={queryTime.value}
          ></TimePicker>
          <el-button type="primary" onClick={pickDevices}>
            选择设备
          </el-button>
        </div>
        <el-card header="日志数统计">
          <LineChart v-loading={loading.value} />
        </el-card>
        <el-row gutter={20}>
          <el-col span={6}>
            <el-card header="异常类型统计">
              <PieChart v-loading={loading.value} />
            </el-card>
          </el-col>
          <el-col span={6}>
            <el-card header="普通日志">
              <LogTable
                data={logList.value}
                tableFields={normalLogTableFields}
              ></LogTable>
            </el-card>
          </el-col>
          <el-col span={6}>
            <el-card header="异常日志">
              <LogTable
                data={errLogList.value}
                tableFields={errorLogTableFields}
              ></LogTable>
            </el-card>
          </el-col>
          <el-col span={6}>
            <el-card header="设备告警排名">
              <BarChart v-loading={loading.value} />
            </el-card>
          </el-col>
        </el-row>
        <DeviceDrawer onConfirm={getChartData} />
      </div>
    );
  },
});
