import { deviceProfile, poseApi } from "@/api";
import { UseVirtualListItem, useVirtualList } from "@vueuse/core";
import { ElMessage } from "element-plus";
import { isEqual } from "lodash";
import Sortable from "sortablejs";
import { Ref, computed, ref, watch } from "vue";

// 每条设备数据类
interface DeviceItem {
  id: string;
  deviceName: string;
  arm: string;
}

// 设备相关
export const useDeviceSection = (currentCabinetId: Ref<number>) => {
  // 设备数据加载 loading
  const loading: Ref<boolean> = ref(false);

  // 采集设备姿态数据
  async function handleDeviceCollect(
    data: DeviceItem,
    robotCode: string
  ): Promise<void> {
    if (customPose.value && !robotCode) {
      ElMessage({ type: "warning", message: "请选择机器人" });
      return;
    } else if (!customPose.value && !selectedPose.value) {
      ElMessage({ type: "warning", message: "请选择姿态" });
      return;
    }
    try {
      loading.value = true;
      await deviceProfile.postureAcquisition({
        robot: customPose.value ? robotCode : null,
        deviceId: data.id,
        postureId: customPose.value ? null : selectedPose.value,
      });
      ElMessage({ type: "success", message: "采集成功" });
    } finally {
      loading.value = false;
    }
  }

  // 设备数据
  const deviceData: Ref<DeviceItem[]> = ref([]);

  // 获取设备数据
  async function getDeviceData(): Promise<void> {
    try {
      loading.value = true;
      const res = await deviceProfile.queryAll({ limit: 999999 });
      deviceData.value = res.data?.list || [];
    } finally {
      loading.value = false;
    }
  }

  // 根据机柜 id 获取关联的设备数据
  async function getDeviceRelevantData() {
    try {
      loading.value = true;
      const res = await deviceProfile.queryByCid(currentCabinetId.value);
      deviceRelevantData.value = res.data || [];
      createDeviceSortable();
    } finally {
      loading.value = false;
    }
  }

  // 使已关联设备和未关联设备可拖拽
  function createDeviceSortable(): void {
    Sortable.create(containerProps.ref.value.querySelector("div"), {
      animation: 150,
      group: "device",
      onEnd(): void {
        updateDeviceRelevant();
      },
    });
    Sortable.create(deviceRelevantRef.value, {
      animation: 150,
      group: "device",
      onEnd(): void {
        updateDeviceRelevant();
      },
    });
  }

  // 将设备关联到机柜上
  async function updateDeviceRelevant(): Promise<void> {
    const ids: string[] = Array.from(
      deviceRelevantRef.value.getElementsByClassName("item")
    ).map((item: Element): string => item.textContent);
    const newData: DeviceItem[] = ids.map(
      (id: string): DeviceItem =>
        deviceData.value.find((item: DeviceItem): boolean => item.id === id)
    );
    if (isEqual(deviceRelevantData.value, newData)) return;
    deviceRelevantData.value = newData;
    try {
      loading.value = true;
      await deviceProfile.batchBind({
        ids,
        cid: currentCabinetId.value,
      });
    } finally {
      loading.value = false;
    }
  }

  // 没用
  const deviceRef: Ref<HTMLElement> = ref();

  // 已关联设备 DOM 元素
  const deviceRelevantRef: Ref<HTMLElement> = ref();

  // 已关联设备数据
  const deviceRelevantData: Ref<{ id: string }[]> = ref([]);

  // 未关联设备数据
  const deviceIrrelevantData = computed(() => {
    const relevantIds = deviceRelevantData.value.map((item) => item.id);
    return deviceData.value.filter(
      (item) =>
        !relevantIds.includes(item.id) &&
        item.deviceName.includes(deviceIrrelvantFilter.value)
    );
  });

  // 未关联设备搜索关键字
  const deviceIrrelvantFilter = ref("");

  // 监听到未关联设备搜索关键字变化滚动到顶部
  watch(deviceIrrelvantFilter, () => {
    scrollTo(0);
  });

  // 姿态数据
  const poseData: Ref<{ id: number; name: string }[]> = ref([]);

  // 已选择的姿态数据
  const selectedPose: Ref<number> = ref();

  // 获取姿态数据
  async function getPoseData() {
    const res = await poseApi.getList({ limit: 9999999 });
    poseData.value = res.data?.list || [];
  }

  // 是否采集自定义的姿态数据
  const customPose: Ref<boolean> = ref(false);

  // 虚拟滚动相关
  const { list, containerProps, wrapperProps, scrollTo } = useVirtualList(
    deviceIrrelevantData,
    {
      itemHeight: 100,
    }
  );

  // 未关联设备组件
  const DeviceVirtualList = ({ robotCode }) => {
    return (
      <div
        ref={containerProps.ref}
        style={containerProps.style}
        class="h-[300px]"
        onScroll={containerProps.onScroll}
      >
        <div {...wrapperProps.value}>
          {list.value.map(
            (props: UseVirtualListItem<DeviceItem>): JSX.Element => (
              <DeviceItem
                key={props.data.id}
                data={props.data}
                robotCode={robotCode}
              ></DeviceItem>
            )
          )}
        </div>
      </div>
    );
  };

  // 已关联设备组件
  const DeviceList = ({ data, sortableRef, robotCode }) => (
    <div ref={sortableRef} v-loading={loading.value} class="h-[300px]">
      {data.map(
        (item: DeviceItem): JSX.Element => (
          <DeviceItem
            key={item.id}
            data={item}
            robotCode={robotCode}
          ></DeviceItem>
        )
      )}
    </div>
  );

  const DeviceItem = ({ data, robotCode }) => (
    <div class="mb-2 px-5 bg-slate-100 font-mono font-bold flex justify-between items-center cursor-pointer h-[100px] select-none">
      <div>
        <span>{data.deviceName}</span>
        <span>{data.arm && "✅"}</span>
        <span class="hidden item">{data.id}</span>
      </div>
      <el-popover width={300} trigger="click">
        {{
          default: (): JSX.Element => (
            <div class="flex">
              <el-switch
                v-model={customPose.value}
                size="small"
                class="mr-2"
              ></el-switch>
              <el-select
                v-model={selectedPose.value}
                size="small"
                class="flex-1 mr-2"
                onChange={() => handleDeviceCollect(data, robotCode)}
                disabled={customPose.value}
              >
                {poseData.value.map((item: { id: number; name: string }) => (
                  <el-option label={item.name} value={item.id}></el-option>
                ))}
              </el-select>
              <el-button
                onClick={() => handleDeviceCollect(data, robotCode)}
                type="primary"
                size="small"
              >
                确定
              </el-button>
            </div>
          ),
          reference: () => <div class="text-3xl">🎦</div>,
        }}
      </el-popover>
    </div>
  );
  return {
    DeviceVirtualList,
    DeviceList,
    DeviceItem,
    getDeviceData,
    deviceData,
    getDeviceRelevantData,
    deviceRelevantData,
    deviceIrrelevantData,
    deviceRef,
    deviceRelevantRef,
    deviceIrrelvantFilter,
    getPoseData,
  };
};
