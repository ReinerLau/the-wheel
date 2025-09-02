import { deviceProfile, threshold } from "@/api";
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
  defineComponent,
  onMounted,
  ref,
  toRaw,
} from "vue";

export default defineComponent({
  name: "ThresholdList",
  setup() {
    const tableData = ref<any[]>([]);
    const testType = {
      0: "读表",
      1: "开关",
      2: "指示灯",
      3: "混合",
      4: "门窗",
    };
    const tableFields: Field[] = [
      {
        prop: "id",
        title: "编号",
      },
      {
        prop: "name",
        title: "设备名称",
      },
      {
        prop: "did",
        title: "设备编号",
      },
      {
        prop: "mid",
        title: "地图编号",
      },
      {
        prop: "project",
        title: "检测项目",
      },
      {
        prop: "detectionType",
        title: "检测类型",
        slot: (row) => <span>{testType[row.detectionType]}</span>,
      },
      {
        prop: "value",
        title: "阈值",
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
          </Fragment>
        ),
      },
    ];
    const queryFields: QueryField[] = [
      {
        prop: "name",
        title: "设备名称",
      },
    ];
    const initialParams = {
      page: 1,
      limit: 99999,
    };

    async function getList() {
      loading.value = true;
      try {
        const res = await threshold.queryAll(params.value);
        tableData.value = res.data?.list || [];
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
    const { TableArea, loading } = useTableArea();
    const formRules: FormRules = {
      did: [{ required: true, message: "请选择设备" }],
    };
    const formFields: formField[] = [
      {
        prop: "did",
        title: "设备",
        slot: (form: any) => (
          <el-select
            class="w-full"
            v-model={form.value.did}
            placeholder="请选择设备"
            filterable
            onChange={(id) => handleChangeDeivice(id, form)}
          >
            {deviceList.value.map((item) => (
              <el-option label={item.deviceName} value={item.id} />
            ))}
          </el-select>
        ),
      },
      {
        prop: "project",
        title: "检测项目",
      },
      {
        prop: "detectionType",
        title: "检测类型",
        slot: (form) => (
          <el-input
            disabled
            model-value={testType[form.value.detectionType]}
          ></el-input>
        ),
      },
      {
        prop: "value1",
        title: "读表",
        slot: (form) => {
          const value1 = JSON.parse(form.value.value || "{}").value1 || "";
          const min = Number(value1.split(",")[0]) || 0;
          const max = Number(value1.split(",")[1]) || 0;
          return (
            <Fragment>
              <el-input-number
                onChange={(val) => handleChangeNumber(val, form, "min")}
                modelValue={min}
                controls-position="right"
                min={0}
                placeholder="请输入值"
              />
              <span class="mx-2">~</span>
              <el-input-number
                onChange={(val) => handleChangeNumber(val, form, "max")}
                modelValue={max}
                controls-position="right"
                min={0}
                placeholder="请输入值"
              />
            </Fragment>
          );
        },
      },
      {
        prop: "value2",
        title: "开关",
        slot: (form) => {
          const value2 = JSON.parse(form.value.value || "{}").value2 || "0";
          return (
            <el-switch
              modelValue={value2}
              active-value="1"
              inactive-value="0"
              onChange={(val) => handleChangeSwitch(val, form)}
            ></el-switch>
          );
        },
      },
      {
        prop: "value3",
        title: "指示灯",
        slot: (form) => {
          const value3 = JSON.parse(form.value.value || "{}").value3 || "";
          return (
            <el-select
              modelValue={value3}
              class="w-full"
              onChange={(val) => handleChangeSelect(val, form)}
            >
              <el-option label="红" value="红" />
              <el-option label="绿" value="绿" />
            </el-select>
          );
        },
      },
    ];
    const { ActionArea } = useActionArea();
    const { FormArea, form, dialogVisible } = useFormArea({
      updateApi: threshold.update,
      createApi: threshold.create,
    });

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
        const { message } = await threshold.delete(id);
        ElMessage({ type: "success", message });
        getList();
      } finally {
        loading.value = false;
      }
    }

    const deviceList = ref([]);
    function handleChangeDeivice(id, form) {
      const { detectionType, deviceName } = deviceList.value.find(
        (item) => item.id === id
      );
      form.value.detectionType = detectionType;
      form.value.name = deviceName;
    }

    async function getDeviceList() {
      const res = await deviceProfile.queryAll({
        limit: 99999,
      });
      deviceList.value = res.data.list;
    }

    onMounted(() => {
      handleQueryReset();
      getDeviceList();
    });

    function handleChangeSwitch(val, form) {
      const value = JSON.parse(form.value.value || "{}");
      value.value2 = val;
      form.value.value = JSON.stringify(value);
    }

    function handleChangeNumber(val, form, type) {
      const value: Record<string, string> = JSON.parse(
        form.value.value || "{}"
      );
      const min: string = value.value1?.split(",")[0] || "0";
      const max: string = value.value1?.split(",")[1] || "0";
      if (type === "min") {
        value.value1 = `${val},${max}`;
      } else if (type === "max") {
        value.value1 = `${min},${val}`;
      }
      form.value.value = JSON.stringify(value);
    }

    function handleChangeSelect(val, form) {
      const value = JSON.parse(form.value.value || "{}");
      value.value3 = val;
      form.value.value = JSON.stringify(value);
    }

    function handleQueryReset(): void {
      params.value = { ...initialParams };
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
