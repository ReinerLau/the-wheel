import { ActionResponse } from "@/utils";
import { ElMessage, ElMessageBox, FormInstance, FormRules } from "element-plus";
import { Component, Fragment, Ref, ref } from "vue";

export interface formField {
  prop: string;
  title: string;
  slot?: (form: Ref<any>) => JSX.Element;
}

interface Options {
  updateApi?: (data: any) => Promise<ActionResponse>;
  createApi?: (data: any) => Promise<ActionResponse>;
}

type FormArea = Component<{
  formRules: FormRules;
  formFields: formField[];
  onSubmit?: () => void;
}>;

export const useFormArea = ({ updateApi, createApi }: Options) => {
  const form: Ref<Record<string, any>> = ref({});
  const dialogVisible: Ref<boolean> = ref(false);

  const FormArea: FormArea = ({ formRules, formFields }, { emit }) => {
    const loading: Ref<boolean> = ref(false);
    const formRef: Ref<FormInstance> = ref();

    async function handleSubmit(formRef: FormInstance): Promise<void> {
      await formRef.validate(async (valid: boolean): Promise<void> => {
        if (valid) {
          loading.value = true;
          try {
            if (form.value.id) {
              const { message } = await updateApi(form.value);
              ElMessage({ type: "success", message });
              handleCancel(formRef);
              emit("submit");
            } else {
              const { message } = await createApi(form.value);
              ElMessage({ type: "success", message });
              ElMessageBox.confirm("是否继续添加?", "", {
                confirmButtonText: "是",
                cancelButtonText: "否",
                type: "info",
              })
                .then(() => {
                  formRef.resetFields();
                  form.value = {};
                })
                .catch(() => {
                  handleCancel(formRef);
                  emit("submit");
                });
            }
          } finally {
            loading.value = false;
          }
        }
      });
    }

    function handleCancel(formRef: FormInstance) {
      formRef.resetFields();
      form.value = {};
      dialogVisible.value = false;
    }

    return (
      <el-dialog
        model-value={dialogVisible.value}
        title="添加"
        close-on-click-modal={false}
        close-on-press-escape={false}
        onClose={() => handleCancel(formRef.value)}
      >
        {{
          default: () => (
            <el-form
              ref={formRef}
              model={form}
              rules={formRules}
              label-width="100"
            >
              {formFields.map((item) => (
                <el-form-item label={item.title} prop={item.prop}>
                  {item.slot ? (
                    item.slot(form)
                  ) : (
                    <el-input v-model={form.value[item.prop]} />
                  )}
                </el-form-item>
              ))}
            </el-form>
          ),
          footer: () => (
            <Fragment>
              <el-button
                loading={loading.value}
                type="primary"
                onClick={() => handleSubmit(formRef.value)}
              >
                确定
              </el-button>
              <el-button onClick={() => handleCancel(formRef.value)}>
                取消
              </el-button>
            </Fragment>
          ),
        }}
      </el-dialog>
    );
  };
  return {
    FormArea,
    form,
    dialogVisible,
  };
};
