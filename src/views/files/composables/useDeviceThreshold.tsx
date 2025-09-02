import { threshold } from "@/api";
import { ElMessage, FormInstance } from "element-plus";
import { Fragment, FunctionalComponent, Ref, ref, watch } from "vue";

export const useDeviceThreshold = () => {
  const dialogVisible = ref(false);
  const form: Ref<Record<string, any>> = ref({});

  const loading = ref(false);
  async function handleSubmit() {
    try {
      loading.value = true;
      const res = await threshold.update(form.value);
      ElMessage({ type: "success", message: res.message });
      dialogVisible.value = false;
    } finally {
      loading.value = false;
    }
  }

  const formRef: Ref<FormInstance> = ref();
  watch(dialogVisible, (val) => {
    if (!val) {
      formRef.value.resetFields();
      form.value = {};
    }
  });

  async function getThresholdData(deviceId: number) {
    const res = await threshold.queryByDeviceId(deviceId);
    form.value = res.data || {};
  }

  function handleChangeSwitch(val: string) {
    const value =
      (isJson(form.value.value) && JSON.parse(form.value.value)) || {};
    value.value2 = val;
    form.value.value = JSON.stringify(value);
  }

  function handleChangeNumber(val: number, type: string) {
    const value: Record<string, string> =
      (isJson(form.value.value) && JSON.parse(form.value.value)) || {};
    const min: string = value.value1?.split(",")[0] || "0";
    const max: string = value.value1?.split(",")[1] || "0";
    if (type === "min") {
      value.value1 = `${val},${max}`;
    } else if (type === "max") {
      value.value1 = `${min},${val}`;
    }
    form.value.value = JSON.stringify(value);
  }

  function handleChangeSelect(val: string) {
    const value =
      (isJson(form.value.value) && JSON.parse(form.value.value)) || {};
    value.value3 = val;
    form.value.value = JSON.stringify(value);
  }

  function isJson(val: string) {
    return /^\{.*\}$/.test(val);
  }

  const formFields = [
    {
      prop: "value1",
      label: "读表",
      slot: () => {
        const value =
          (isJson(form.value.value) &&
            JSON.parse(form.value.value || "{}").value1) ||
          "";
        const min = Number(value.split(",")[0]) || 0;
        const max = Number(value.split(",")[1]) || 0;
        return (
          <Fragment>
            <el-input-number
              onChange={(val: number) => handleChangeNumber(val, "min")}
              modelValue={min}
              controls-position="right"
              min={0}
              placeholder="请输入值"
            />
            <span class="mx-2">~</span>
            <el-input-number
              onChange={(val: number) => handleChangeNumber(val, "max")}
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
      label: "开关",
      slot: () => {
        const value: string =
          (isJson(form.value.value) &&
            JSON.parse(form.value.value || "{}").value2) ||
          "0";
        return (
          <el-switch
            modelValue={value}
            active-value="1"
            inactive-value="0"
            onChange={(val: string) => handleChangeSwitch(val)}
          ></el-switch>
        );
      },
    },
    {
      prop: "value3",
      label: "指示灯",
      slot: () => {
        const value =
          (isJson(form.value.value) &&
            JSON.parse(form.value.value || "{}").value3) ||
          "";
        return (
          <el-select
            modelValue={value}
            class="w-full"
            onChange={(val: string) => handleChangeSelect(val)}
          >
            <el-option label="红" value="红" />
            <el-option label="绿" value="绿" />
          </el-select>
        );
      },
    },
  ];

  const SetThreshold: FunctionalComponent = () => (
    <el-dialog v-model={dialogVisible.value} title="设置阈值">
      {{
        default: () => (
          <el-form ref={formRef} model={form.value} labelWidth={100}>
            {formFields.map((item) => (
              <el-form-item label={item.label} prop={item.prop}>
                {item.slot()}
              </el-form-item>
            ))}
          </el-form>
        ),
        footer: () => (
          <el-button
            loading={loading.value}
            type="primary"
            onClick={handleSubmit}
          >
            确定
          </el-button>
        ),
      }}
    </el-dialog>
  );
  return {
    SetThreshold,
    dialogVisible,
    getThresholdData,
  };
};
