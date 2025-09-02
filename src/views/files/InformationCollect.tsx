import { defineComponent, onMounted, watch } from "vue";
import { useCabinetSection } from "./composables/useCabinetSection";
import { useDeviceSection } from "./composables/useDeviceSection";
import { useRobotSection } from "./composables/useRobotSection";
import { useRoomSection } from "./composables/useRoomSection";
import { useSortableList } from "./composables/useSortableList";

export default defineComponent({
  name: "InformationCollect",
  setup() {
    // 机房相关
    const { RoomList, getRoomData, currentRoomId } = useRoomSection();

    // 机器人相关
    const { RobotList, getRobotData, currentRobotCode } = useRobotSection();

    // 机柜相关
    const {
      CabinetList,
      CabinetVirtualList,
      currentCabinetId,
      getCabinetData,
      cabinetRelevantData,
      getCabinetRelevantData,
      cabinetIrrelevantData,
      cabinetIrrelevantFilter,
      createCabinetSortable,
      cabinetRelevantRef,
    } = useCabinetSection(currentRoomId);

    // 设备相关
    const {
      DeviceList,
      DeviceVirtualList,
      getDeviceData,
      getDeviceRelevantData,
      deviceIrrelevantData,
      deviceRelevantData,
      deviceRelevantRef,
      deviceIrrelvantFilter,
      getPoseData,
    } = useDeviceSection(currentCabinetId);

    // 拖拽相关
    const { SortableList } = useSortableList();

    // 点选机房后
    async function handleRoomChange() {
      await getCabinetRelevantData();
      createCabinetSortable();
    }

    // 监听到选择的机柜切换后
    watch(currentCabinetId, () => {
      getDeviceRelevantData();
    });

    onMounted(async () => {
      getRoomData();
      getRobotData();
      getCabinetData();
      getDeviceData();
      getPoseData();
      fixFireFoxProblem();
    });

    // 修改 firefox 浏览器的兼容性问题
    function fixFireFoxProblem() {
      document.body.ondrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
      };
    }

    return () => (
      <el-row gutter={18}>
        <el-col span={20}>
          <RoomList onCurrentChange={handleRoomChange} />
          <el-row gutter={18} class="mb-6">
            <el-col span={12}>
              <SortableList
                title="● 已关联机柜"
                dataLength={cabinetRelevantData.value.length}
              >
                <CabinetList
                  data={cabinetRelevantData.value}
                  sortableRef={cabinetRelevantRef}
                  robotCode={currentRobotCode.value}
                ></CabinetList>
              </SortableList>
            </el-col>
            <el-col span={12}>
              <SortableList
                title="● 未关联机柜"
                type="info"
                dataLength={cabinetIrrelevantData.value.length}
                v-model={cabinetIrrelevantFilter.value}
                searchable={true}
              >
                <CabinetVirtualList
                  robotCode={currentRobotCode.value}
                ></CabinetVirtualList>
              </SortableList>
            </el-col>
          </el-row>
          <el-row gutter={18}>
            <el-col span={12}>
              <SortableList
                title="● 已关联设备"
                dataLength={deviceRelevantData.value.length}
              >
                <DeviceList
                  sortableRef={deviceRelevantRef}
                  data={deviceRelevantData.value}
                  robotCode={currentRobotCode.value}
                ></DeviceList>
              </SortableList>
            </el-col>
            <el-col span={12}>
              <SortableList
                title="● 未关联设备"
                type="info"
                dataLength={deviceIrrelevantData.value.length}
                v-model={deviceIrrelvantFilter.value}
                searchable={true}
              >
                <DeviceVirtualList
                  robotCode={currentRobotCode.value}
                ></DeviceVirtualList>
              </SortableList>
            </el-col>
          </el-row>
        </el-col>
        <el-col span={4}>
          <RobotList />
        </el-col>
      </el-row>
    );
  },
});
