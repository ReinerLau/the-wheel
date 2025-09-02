import { poseApi, robotArchives } from "@/api";
import {
  Field,
  QueryField,
  formField,
  useActionArea,
  useFormArea,
  useQueryArea,
  useTableArea,
} from "@/composables";
import { ListReponse } from "@/utils";
import { AxiosResponse } from "axios";
import { ElMessage, FormRules } from "element-plus";
import {
  Component,
  Fragment,
  Ref,
  defineComponent,
  onMounted,
  ref,
  toRaw,
} from "vue";

interface tableItem {
  id: number;
  name: string;
  arm: string;
}

interface robotItem {
  code: string;
  name: string;
}

export default defineComponent({
  name: "PoseList",
  setup() {
    const tableData: Ref<Record<string, any>[]> = ref([]);
    const tableFields: Field[] = [
      {
        prop: "id",
        title: "编号",
      },
      {
        prop: "name",
        title: "名称",
      },
      {
        prop: "arm",
        title: "姿态",
      },
      {
        title: "操作",
        slot: (row: tableItem) => (
          <Fragment>
            <el-button link type="primary" onClick={() => handleEdit(row)}>
              编辑
            </el-button>
            <el-popconfirm
              title="确定删除？"
              onConfirm={() => handleDelete(row.id)}
            >
              {{
                reference: () => (
                  <el-button loading={loading.value} link type="danger">
                    删除
                  </el-button>
                ),
              }}
            </el-popconfirm>
            <el-popover width={300} trigger="click">
              {{
                default: () => (
                  <div class="flex">
                    <el-select
                      v-model={selectedRobotCode.value}
                      size="small"
                      class="flex-1 mr-2"
                      onChange={() => handlePostureAcquisition(row)}
                    >
                      {robotData.value.map((item: robotItem) => (
                        <el-option
                          label={item.name}
                          value={item.code}
                        ></el-option>
                      ))}
                    </el-select>
                    <el-button
                      onClick={() => handlePostureAcquisition(row)}
                      type="primary"
                      size="small"
                    >
                      确定
                    </el-button>
                  </div>
                ),
                reference: () => (
                  <el-button link type="success">
                    姿势采集
                  </el-button>
                ),
              }}
            </el-popover>
          </Fragment>
        ),
      },
    ];
    const queryFields: QueryField[] = [
      {
        prop: "name",
        title: "名称",
      },
    ];
    const initialParams = {
      page: 1,
      limit: 99999,
    };

    async function getList(): Promise<void> {
      loading.value = true;
      try {
        const res = await poseApi.getList(params.value);
        tableData.value = res.data?.list || [];
      } finally {
        loading.value = false;
      }
    }
    const actions: Component[] = [
      <el-button type="primary" onClick={handleAdd}>
        添加
      </el-button>,
    ];
    const { QueryArea, params } = useQueryArea();
    const { TableArea, loading } = useTableArea();
    const formRules: FormRules = {
      name: [{ required: true, message: "请输入名称" }],
    };
    const formFields: formField[] = [
      {
        prop: "name",
        title: "名称",
      },
    ];
    const { ActionArea } = useActionArea();
    const { FormArea, form, dialogVisible } = useFormArea({
      updateApi: poseApi.update,
      createApi: poseApi.create,
    });

    function handleAdd(): void {
      dialogVisible.value = true;
    }

    function handleEdit(data: tableItem): void {
      dialogVisible.value = true;
      form.value = Object.assign({}, toRaw(data));
    }

    async function handleDelete(id: number): Promise<void> {
      loading.value = true;
      try {
        const { message } = await poseApi.delete(id);
        ElMessage({ type: "success", message });
        getList();
      } finally {
        loading.value = false;
      }
    }

    const robotData: Ref<robotItem[]> = ref([]);
    const selectedRobotCode: Ref<string> = ref("");
    async function getRobotData(): Promise<void> {
      const res: AxiosResponse<
        any,
        ListReponse<robotItem>
      > = await robotArchives.queryAll({
        limit: 9999999,
        RType: "DCInspection",
      });
      robotData.value = res.data?.list || [];
    }

    onMounted(() => {
      handleQueryReset();
      getRobotData();
    });

    function handleQueryReset(): void {
      params.value = { ...initialParams };
      getList();
    }

    async function handlePostureAcquisition(row: tableItem): Promise<void> {
      await poseApi.postureAcquisition({
        postureId: row.id,
        robot: selectedRobotCode.value,
      });
      getList();
    }

    return () => (
      <Fragment>
        <QueryArea
          queryFields={queryFields}
          onQuery={getList}
          onReset={handleQueryReset}
        />
        <ActionArea actions={actions} />
        <TableArea tableFields={tableFields} tableData={tableData.value} />
        <FormArea
          formRules={formRules}
          formFields={formFields}
          onSubmit={getList}
        />
      </Fragment>
    );
  },
});
