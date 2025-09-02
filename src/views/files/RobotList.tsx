import { controlStrategy, robotArchives } from "@/api";
import {
  Field,
  QueryField,
  formField,
  useFormArea,
  useQueryArea,
  useTableArea,
} from "@/composables";
import { ElMessage, FormRules } from "element-plus";
import { Fragment, Ref, defineComponent, onMounted, ref, toRaw } from "vue";
import { useCoordCheck } from "./composables/useCoordCheck";
import { useRobotThreshold } from "./composables/useRobotThreshold";

export default defineComponent({
  name: "RobotList",
  setup() {
    const tableData: Ref<any[]> = ref([]);
    const tableFields: Field[] = [
      {
        prop: "name",
        title: "名称",
      },
      {
        prop: "code",
        title: "机器人唯一码",
      },
      {
        prop: "status",
        title: "状态",
      },
      {
        prop: "remark",
        title: "备注",
      },
      {
        title: "巡检策略",
        slot: (row) => (
          <el-select
            v-model={row.strategy}
            class="w-full"
            onChange={(val) => changeStrategy(val, row)}
          >
            <el-option label="全部巡检" value={0}></el-option>
            <el-option label="默认巡检策略" value={1}></el-option>
            <el-option label="TF-IDF策略" value={2}></el-option>
          </el-select>
        ),
      },
      {
        title: "操作",
        slot: (row) => (
          <Fragment>
            <el-button link type="primary" onClick={() => handleEdit(row)}>
              编辑
            </el-button>
            <el-button
              link
              type="success"
              onClick={() => handleSetThreshold(row)}
            >
              设置阈值
            </el-button>
            <el-button
              link
              type="primary"
              onClick={() => handleCoordCheck(row)}
            >
              坐标校对
            </el-button>
            <el-popconfirm
              title="自动巡逻"
              confirm-button-text="开启"
              cancel-button-text="关闭"
              onConfirm={() => handleAutoInspection(row, "open")}
              onCancel={() => handleAutoInspection(row, "close")}
            >
              {{
                reference: () => (
                  <el-button type="warning" loading={loading.value} link>
                    自动巡逻
                  </el-button>
                ),
              }}
            </el-popconfirm>
            <el-popconfirm
              title="确定返回吗？"
              onConfirm={() => handleGoHome(row)}
            >
              {{
                reference: () => (
                  <el-button loading={loading.value} link>
                    返回充电点
                  </el-button>
                ),
              }}
            </el-popconfirm>
          </Fragment>
        ),
      },
    ];
    const queryFields: QueryField[] = [
      {
        prop: "name",
        title: "名称",
      },
      {
        prop: "code",
        title: "机器人唯一码",
      },
    ];
    const initialParams = {
      RType: "DCInspection",
      limit: 99999,
    };

    async function getList() {
      loading.value = true;
      try {
        const res = await robotArchives.queryAll(params.value);
        tableData.value = res.data?.list || [];
      } finally {
        loading.value = false;
      }
    }
    const { QueryArea, params } = useQueryArea();
    const { TableArea, loading } = useTableArea();
    const { FormArea, form, dialogVisible } = useFormArea({
      updateApi: robotArchives.update,
    });
    const {
      dialogVisible: coordCheckDialogVisible,
      CoordCheck,
      getMapList,
    } = useCoordCheck();
    const {
      dialogVisible: setThresholdDialogVisible,
      SetThreshold,
      getThresholdData,
    } = useRobotThreshold();

    onMounted(() => {
      handleQueryReset();
    });

    function handleQueryReset(): void {
      params.value = { ...initialParams };
      getList();
    }

    async function changeStrategy(val: number, row) {
      await controlStrategy(row.code, val);
      ElMessage({ type: "success", message: "切换成功" });
    }

    function handleEdit(data) {
      dialogVisible.value = true;
      form.value = Object.assign({}, toRaw(data));
    }

    const formRules: FormRules = {
      name: [{ required: true, message: "请输入名称" }],
    };

    const formFields: formField[] = [
      {
        prop: "name",
        title: "名称",
      },
    ];

    async function handleAutoInspection(row: any, type: string) {
      loading.value = true;
      try {
        if (type === "open") {
          await robotArchives.autoInspectionOpen(row.code);
          ElMessage({ type: "success", message: "已开启" });
        } else if (type === "close") {
          await robotArchives.autoInspectionClose(row.code);
          ElMessage({ type: "success", message: "已关闭" });
        }
        getList();
      } finally {
        loading.value = false;
      }
    }

    async function handleGoHome(row: any) {
      loading.value = true;
      try {
        const { message } = (await robotArchives.goHome(row.code)) as any;
        ElMessage({ type: "success", message });
        getList();
      } finally {
        loading.value = false;
      }
    }
    const robotCode = ref("");
    function handleCoordCheck(row) {
      robotCode.value = row.code;
      coordCheckDialogVisible.value = true;
      getMapList();
    }

    function handleSetThreshold(row) {
      robotCode.value = row.code;
      setThresholdDialogVisible.value = true;
      getThresholdData(row.code);
    }

    return () => (
      <Fragment>
        <QueryArea
          queryFields={queryFields}
          onQuery={getList}
          onReset={handleQueryReset}
        />
        <TableArea tableFields={tableFields} tableData={tableData.value} />
        <FormArea
          formRules={formRules}
          formFields={formFields}
          onSubmit={getList}
        ></FormArea>
        <CoordCheck robotCode={robotCode.value} />
        <SetThreshold robotCode={robotCode.value} />
      </Fragment>
    );
  },
});
