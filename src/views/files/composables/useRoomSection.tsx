import { roomFile } from "@/api";
import { Field, useTableArea } from "@/composables";
import { Component, ref } from "vue";

// 机房相关
export const useRoomSection = () => {
  // 机房表格字段
  const roomListFields: Field[] = [
    {
      prop: "name",
      title: "机房名称",
    },
    {
      prop: "id",
      title: "机房编号",
    },
    {
      prop: "mid",
      title: "地图编号",
    },
  ];

  // 机房数据
  const roomListData = ref([]);

  // 通用表格相关
  const { TableArea, loading } = useTableArea();

  // 获取机房数据
  async function getRoomData() {
    try {
      loading.value = true;
      const res = await roomFile.queryAll({ limit: 999999 });
      roomListData.value = res.data?.list || [];
    } finally {
      loading.value = false;
    }
  }

  // 当前选择的机房 id
  const currentRoomId = ref("");

  // 机房表格组件
  const RoomList: Component = (props, { emit }) => {
    // 点选机房
    function handleRoomChange(row: { id: string }) {
      currentRoomId.value = row.id;
      emit("currentChange");
    }
    return (
      <el-card body-style={{ padding: "0px" }} class="mb-6 p-2 select-none">
        <div class="flex mb-2 items-center">
          <div class="rounded-full font-mono bg-[#3bc64f] text-white border py-2 px-3 mr-2">
            ● 机房
          </div>
        </div>
        <TableArea
          tableFields={roomListFields}
          tableData={roomListData.value}
          onCurrentChange={handleRoomChange}
        />
      </el-card>
    );
  };
  return {
    RoomList,
    getRoomData,
    currentRoomId,
  };
};
