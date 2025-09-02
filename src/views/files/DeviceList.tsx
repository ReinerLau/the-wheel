import { deviceProfile, robotArchives, wisdomErrors } from "@/api";
import {
  Field,
  QueryField,
  formField,
  useActionArea,
  useFormArea,
  usePagination,
  useQueryArea,
  useTableArea,
} from "@/composables";
import { ElMessage, FormRules } from "element-plus";
import { uniqBy } from "lodash";
import {
  Component,
  Fragment,
  defineComponent,
  onMounted,
  ref,
  toRaw,
} from "vue";
import { useDeviceThreshold } from "./composables/useDeviceThreshold";
import { usePoseCollectDialog } from "./composables/usePoseCollectDialog";

export default defineComponent({
  name: "RoleList",
  setup() {
    const tableData = ref<any[]>([]);
    const testType = {
      3: "混合",
      4: "门窗",
    };
    const tableFields: Field[] = [
      {
        prop: "cname",
        title: "机柜名称",
      },
      {
        prop: "cid",
        title: "机柜编号",
      },
    ];
    const expandTableFields: Field[] = [
      {
        prop: "deviceName",
        title: "设备名称",
      },
      {
        prop: "deviceModel",
        title: "设备型号",
      },
      {
        prop: "detectionType",
        title: "设备类型",
        slot: (row) => testType[row.detectionType],
      },
      {
        prop: "mid",
        title: "地图编号",
      },
      {
        prop: "height",
        title: "设备高度",
      },
      {
        prop: "status",
        title: "状态",
        slot: (row) => (row.status === 1 ? "不正常" : "正常"),
      },
      {
        title: "操作",
        slot: (row) => (
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
            <el-button link type="success" onClick={() => handleCopy(row)}>
              复制
            </el-button>
            {row.status === 1 ? (
              <el-button link type="success">
                已处理
              </el-button>
            ) : null}
            <el-button link type="warning" onClick={() => handleCollect(row)}>
              姿势采集
            </el-button>
            <el-button link type="info" onClick={() => handleNavigate(row)}>
              一键导航
            </el-button>
            <el-button
              link
              type="success"
              onClick={() => handleSetThreshold(row)}
            >
              设置阈值
            </el-button>
          </Fragment>
        ),
      },
    ];
    const statusType = {
      0: "正常",
      1: "不正常",
    };
    const queryFields: QueryField[] = [
      {
        prop: "deviceName",
        title: "设备名称",
      },
      {
        prop: "deviceModel",
        title: "设备型号",
      },
      {
        prop: "status",
        title: "状态",
        slot: (params) => (
          <el-select
            class="w-full"
            v-model={params.value["status"]}
            placeholder="状态"
            clearable
          >
            {Object.entries(statusType).map(([value, label]) => (
              <el-option key={value} label={label} value={value}></el-option>
            ))}
          </el-select>
        ),
      },
    ];
    const initialParams = {
      page: 1,
      limit: 10,
    };

    async function getList() {
      loading.value = true;
      try {
        const res = await deviceProfile.queryAll(params.value);
        tableData.value = res.data?.list || [];
        const cabinets = uniqBy(tableData.value, "cid").map((item) => ({
          cname: item.cname,
          cid: item.cid,
        }));
        tableData.value = cabinets.map((item) => ({
          cname: item.cname,
          cid: item.cid,
          children: tableData.value.filter((device) => device.cid === item.cid),
        }));
        total.value = res.data?.total || 0;
      } finally {
        loading.value = false;
      }
    }
    const actions: Component[] = [
      <el-button type="primary" onClick={handleAdd}>
        添加
      </el-button>,
    ];
    const total = ref(0);
    const { QueryArea, params } = useQueryArea();
    const { ExpandTable, loading } = useTableArea();
    const formRules: FormRules = {
      deviceName: [{ required: true, message: "请输入设备名称" }],
      deviceModel: [{ required: true, message: "请输入设备型号" }],
      detectionType: [{ required: true, message: "请输入设备类型" }],
    };
    const formFields: formField[] = [
      {
        prop: "deviceName",
        title: "设备名称",
      },
      {
        prop: "deviceModel",
        title: "设备型号",
      },
      {
        prop: "height",
        title: "设备高度",
      },
      {
        prop: "detectionType",
        title: "设备类型",
        slot: (form) => (
          <el-select class="w-full" v-model={form.value.detectionType}>
            {Object.keys(testType).map((key) => (
              <el-option label={testType[key]} value={Number(key)} />
            ))}
          </el-select>
        ),
      },
    ];
    const { ActionArea } = useActionArea();
    const { Pagination } = usePagination();
    const { FormArea, form, dialogVisible } = useFormArea({
      updateApi: deviceProfile.update,
      createApi: deviceProfile.create,
    });
    const {
      PoseCollectDialog,
      poseCollectDialogVisible,
      poseCollectDialogForm,
      robotList,
    } = usePoseCollectDialog({ getList });
    const {
      SetThreshold,
      getThresholdData,
      dialogVisible: setThresholdDialogVisible,
    } = useDeviceThreshold();

    function handleAdd() {
      dialogVisible.value = true;
    }

    function handleEdit(data) {
      dialogVisible.value = true;
      form.value = Object.assign({}, toRaw(data));
    }

    async function handleDelete(id: number) {
      loading.value = true;
      try {
        const { message } = await deviceProfile.delete(id);
        ElMessage({ type: "success", message });
        getList();
      } finally {
        loading.value = false;
      }
    }
    async function handleNavigate(row) {
      await wisdomErrors.navigation({
        deviceId: row.id,
        mid: row.mid,
      });
      ElMessage({ type: "success", message: "发送成功" });
    }

    async function handleCopy(row) {
      const data = {
        deviceName: row.deviceName,
        deviceModel: row.deviceModel,
        height: row.height,
        detectionType: row.detectionType,
        arm: row.arm,
      };
      await deviceProfile.create(data);
      getList();
    }
    async function handleCollect(row) {
      poseCollectDialogForm.value.deviceId = row.id;
      poseCollectDialogForm.value.name = row.deviceName;
      const res = await robotArchives.queryAll({
        limit: 99999,
        RType: "DCInspection",
      });
      robotList.value = res.data.list;
      poseCollectDialogVisible.value = true;
    }

    onMounted(() => {
      handleQueryReset();
    });

    function handleQueryReset() {
      params.value = { ...initialParams };
      getList();
    }

    function handleSetThreshold(row) {
      setThresholdDialogVisible.value = true;
      getThresholdData(row.id);
    }

    return () => (
      <Fragment>
        <QueryArea
          queryFields={queryFields}
          onQuery={getList}
          onReset={handleQueryReset}
        />
        <ActionArea actions={actions} />
        <ExpandTable
          tableFields={tableFields}
          tableData={tableData.value}
          expandTableFields={expandTableFields}
        />
        <FormArea
          formRules={formRules}
          formFields={formFields}
          onSubmit={getList}
        />
        <Pagination total={total.value} params={params} onChange={getList} />
        <PoseCollectDialog />
        <SetThreshold />
      </Fragment>
    );
  },
});
