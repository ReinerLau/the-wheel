import { poseApi, poseGroupApi } from "@/api";
import {
  Field,
  QueryField,
  formField,
  useActionArea,
  useFormArea,
  useQueryArea,
  useTableArea,
} from "@/composables";
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
}

interface poseItem {
  id: number;
  name: string;
}

export default defineComponent({
  name: "PoseList",
  setup() {
    const tableData: Ref<tableItem[]> = ref([]);
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
            <el-button
              link
              type="success"
              onClick={() => handlePoseRelated(row.id)}
            >
              关联姿态
            </el-button>
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
        const res = await poseGroupApi.getList(params.value);
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
      updateApi: poseGroupApi.update,
      createApi: poseGroupApi.create,
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
        const { message } = await poseGroupApi.delete(id);
        ElMessage({ type: "success", message });
        getList();
      } finally {
        loading.value = false;
      }
    }

    const poseData: Ref<poseItem[]> = ref([]);
    const selectedPoseId: Ref<number[]> = ref([]);
    async function getPoseData(): Promise<void> {
      const res = await poseApi.getList({
        limit: 9999999,
      });
      poseData.value = res.data?.list || [];
    }

    onMounted(() => {
      handleQueryReset();
      getPoseData();
    });

    function handleQueryReset(): void {
      params.value = { ...initialParams };
      getList();
    }

    const poseRelatedDialogVisible = ref(false);
    let curPoseGroupId: string;
    async function handlePoseRelated(id: number) {
      poseRelatedDialogVisible.value = true;
      curPoseGroupId = id.toString();
      const res = await poseApi.getPoseByPoseGroupId(curPoseGroupId);
      selectedPoseId.value = res.data?.map((item) => item.id) || [];
    }
    async function handleConfirmPoseRelated() {
      poseRelatedDialogVisible.value = false;
      const { message } = await poseGroupApi.bindSubPose({
        parentId: curPoseGroupId,
        subsetIdList: selectedPoseId.value,
      });
      ElMessage({ type: "success", message });
    }

    const PoseRelated = () => (
      <el-dialog
        v-model={poseRelatedDialogVisible.value}
        title="关联姿态"
        close-on-click-modal={false}
        close-on-press-escape={false}
      >
        {{
          default: () => (
            <el-select v-model={selectedPoseId.value} multiple class="w-full">
              {poseData.value.map((item: poseItem) => (
                <el-option label={item.name} value={item.id}></el-option>
              ))}
            </el-select>
          ),
          footer: () => (
            <el-button type="primary" onClick={handleConfirmPoseRelated}>
              确定
            </el-button>
          ),
        }}
      </el-dialog>
    );

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
        <PoseRelated />
      </Fragment>
    );
  },
});
