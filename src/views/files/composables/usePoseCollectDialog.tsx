import { deviceProfile } from "@/api";
import { ElMessage } from "element-plus";
import { Fragment, Ref, ref } from "vue";
interface Options {
  getList: () => void;
}

export const usePoseCollectDialog = ({ getList }: Options) => {
  const poseCollectDialogVisible = ref(false);
  const loading = ref(false);
  const poseCollectDialogForm: Ref<{
    robot?: string;
    deviceId?: string;
    name?: string;
  }> = ref({});
  const robotList = ref([]);
  function handleCancelCollect() {
    poseCollectDialogVisible.value = false;
  }
  const rules = {
    robot: [{ required: true, message: "请选择机器人" }],
  };
  async function handleConfirmCollect() {
    loading.value = true;
    try {
      const { message } = (await deviceProfile.postureAcquisition(
        poseCollectDialogForm.value
      )) as any;
      poseCollectDialogVisible.value = false;
      ElMessage({ type: "success", message });
      getList();
    } finally {
      loading.value = false;
    }
  }
  const PoseCollectDialog = () => (
    <el-dialog
      v-model={poseCollectDialogVisible.value}
      title="姿势采集"
      close-on-click-modal={false}
      close-on-press-escape={false}
      onClose={handleCancelCollect}
    >
      {{
        default: () => (
          <el-form
            ref="formRef"
            model={poseCollectDialogForm.value}
            rules={rules}
            label-width={100}
          >
            <el-form-item label="设备名称" prop="name">
              <el-input
                v-model={poseCollectDialogForm.value.name}
                disabled={true}
              ></el-input>
            </el-form-item>
            <el-form-item label="机器人" prop="robot">
              <el-select
                v-model={poseCollectDialogForm.value.robot}
                class="w-full"
                placeholder="机器人"
                clearable
              >
                {robotList.value.map((item) => (
                  <el-option
                    key={item.id}
                    label={item.name}
                    value={item.code}
                  ></el-option>
                ))}
              </el-select>
            </el-form-item>
          </el-form>
        ),
        footer: () => (
          <Fragment>
            <el-button
              loading={loading.value}
              type="primary"
              onClick={handleConfirmCollect}
            >
              确定
            </el-button>
            <el-button onClick={handleCancelCollect}>取消</el-button>
          </Fragment>
        ),
      }}
    </el-dialog>
  );
  return {
    PoseCollectDialog,
    poseCollectDialogVisible,
    poseCollectDialogForm,
    robotList,
  };
};
