import { robotArchives } from "@/api";
import { Field, useTableArea } from "@/composables";
import { ListReponse } from "@/utils";
import { AxiosResponse } from "axios";
import { Component, Ref, ref } from "vue";

// 机器人相关
export const useRobotSection = () => {
  // 机器人表格字段
  const robotListFields: Field[] = [
    {
      prop: "name",
      title: "名称",
    },
    {
      prop: "status",
      title: "状态",
    },
  ];

  // 机器人数据
  const robotData: Ref<Record<string, any>[]> = ref([]);

  // 通用表格相关
  const { TableArea, loading } = useTableArea();

  // 当前选中的机器人编号
  const currentRobotCode: Ref<string> = ref("");

  // 获取机器人数据
  async function getRobotData(): Promise<void> {
    try {
      loading.value = true;
      const res: AxiosResponse<
        any,
        ListReponse<Record<string, any>>
      > = await robotArchives.queryAll({
        limit: 9999999,
        RType: "DCInspection",
      });
      robotData.value = res.data?.list || [];
    } finally {
      loading.value = false;
    }
  }

  // 点选机器人
  function handleRobotChange(row: { code: string }): void {
    currentRobotCode.value = row.code;
  }

  // 机器人表格组件
  const RobotList: Component = () => (
    <el-card body-style={{ padding: "0px" }} class="mb-6 p-2 select-none">
      <div class="flex mb-2 items-center">
        <div class="rounded-full font-mono bg-[#ff6a6e] text-white border py-2 px-3 mr-2">
          ● 机器人
        </div>
      </div>
      <TableArea
        tableFields={robotListFields}
        tableData={robotData.value}
        onCurrentChange={handleRobotChange}
      />
    </el-card>
  );

  return {
    RobotList,
    getRobotData,
    currentRobotCode,
  };
};
