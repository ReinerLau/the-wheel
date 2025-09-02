import { threshold } from "@/api";
import { ElMessage, FormInstance } from "element-plus";
import { Fragment, FunctionalComponent, Ref, ref, watch } from "vue";

export const useRobotThreshold = () => {
  const dialogVisible = ref(false);
  const form: Ref<Record<string, any>> = ref({});

  const loading = ref(false);
  async function handleSubmit(robotCode: string) {
    loading.value = true;
    const res = await threshold.updateRobot({
      code: robotCode,
      ...form.value,
    });
    loading.value = false;
    ElMessage({ type: "success", message: res.message });
    dialogVisible.value = false;
  }
  const formRef: Ref<FormInstance> = ref();
  watch(dialogVisible, (val) => {
    if (!val) {
      formRef.value.resetFields();
      form.value = {};
    }
  });

  function handleChangeNumber(val: number, prop: string, type: "min" | "max") {
    const value: [string, string] = form.value[prop]?.split(",") || ["0", "0"];
    const min: string = value[0] || "0";
    const max: string = value[1] || "0";
    if (type === "min") {
      form.value[prop] = `${val},${max}`;
    } else if (type === "max") {
      form.value[prop] = `${min},${val}`;
    }
  }

  async function getThresholdData(robotCode: string) {
    const res = await threshold.queryByRobotCode(robotCode);
    form.value = res.data || {};
  }

  const formFields = [
    {
      prop: "c3hf7",
      label: "七氟丙烷浓度",
    },
    {
      prop: "co2",
      label: "二氧化碳",
    },
    {
      prop: "humidity",
      label: "湿度",
    },
    {
      prop: "light",
      label: "亮度",
    },
    {
      prop: "nTemperature",
      label: "非接触式测温",
    },
    {
      prop: "noise",
      label: "噪音",
    },
    {
      prop: "pm",
      label: "PM",
    },
    {
      prop: "pm10",
      label: "PM10",
    },
    {
      prop: "pm25",
      label: "PM2.5",
    },
    {
      prop: "pressure",
      label: "气压",
    },
    {
      prop: "temperature",
      label: "温度",
    },
  ];

  const SetThreshold: FunctionalComponent<{ robotCode: string }> = ({
    robotCode,
  }) => (
    <el-dialog v-model={dialogVisible.value} title="设置阈值">
      {{
        default: () => (
          <el-form ref={formRef} model={form.value} labelWidth={150}>
            {formFields.map((item) => (
              <el-form-item label={item.label} prop={item.prop}>
                {{
                  default: () => {
                    const min =
                      Number(form.value[item.prop]?.split(",")[0]) || 0;
                    const max =
                      Number(form.value[item.prop]?.split(",")[1]) || 0;
                    return (
                      <Fragment>
                        <el-input-number
                          onChange={(val: number) =>
                            handleChangeNumber(val, item.prop, "min")
                          }
                          controls-position="right"
                          modelValue={min}
                          min={0}
                          placeholder="请输入值"
                        />
                        <span class="mx-2">~</span>
                        <el-input-number
                          onChange={(val: number) =>
                            handleChangeNumber(val, item.prop, "max")
                          }
                          controls-position="right"
                          modelValue={max}
                          min={0}
                          placeholder="请输入值"
                        />
                      </Fragment>
                    );
                  },
                }}
              </el-form-item>
            ))}
          </el-form>
        ),
        footer: () => (
          <el-button
            loading={loading.value}
            type="primary"
            onClick={() => handleSubmit(robotCode)}
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
