import { fetchMapList, robotArchives } from "@/api";
import KonvaEditor from "@/components/KonvaEditor.vue";
import { ElMessage, FormInstance } from "element-plus";
import { FunctionalComponent, Ref, ref, watch } from "vue";

interface CheckPoint {
  x: number;
  y: number;
  theta: number;
}
export const useCoordCheck = () => {
  const dialogVisible = ref(false);
  const form: Ref<{ map?: number; checkpoint?: CheckPoint }> = ref({});
  const formRules = {
    map: [{ required: true, message: "请选择地图" }],
    checkpoint: [{ required: true, message: "请选择坐标" }],
  };
  const mapList = ref([]);
  async function getMapList() {
    const res = await fetchMapList({ limit: 99999 });
    mapList.value = res.data?.list || [];
  }
  const mapPath = ref("");

  function handleMapChange(id) {
    mapPath.value = mapList.value.find((item) => item.id === id).path;
  }

  const loading = ref(false);
  function handleSubmit(robotCode: string) {
    formRef.value.validate(async (valid) => {
      if (valid) {
        loading.value = true;
        try {
          const data = {
            map: form.value.map,
            robot: robotCode,
            theta: form.value.checkpoint.theta,
            type: "DCInspection",
            x: form.value.checkpoint.x,
            y: form.value.checkpoint.y,
          };
          const res: any = await robotArchives.coordCheck(data);
          ElMessage({ type: "success", message: res.message });
          dialogVisible.value = false;
        } finally {
          loading.value = false;
        }
      }
    });
  }
  const formRef: Ref<FormInstance> = ref();
  watch(dialogVisible, (val) => {
    if (!val) {
      formRef.value.resetFields();
      form.value = {};
      mapPath.value = "";
    }
  });
  const CoordCheck: FunctionalComponent<{ robotCode: string }> = ({
    robotCode,
  }) => (
    <el-dialog v-model={dialogVisible.value} title="坐标校对">
      {{
        default: () => (
          <el-form ref={formRef} model={form.value} rules={formRules}>
            <el-form-item label="地图" prop="map">
              <el-select
                v-model={form.value.map}
                class="w-full"
                placeholder="地图"
                onChange={handleMapChange}
              >
                {mapList.value.map((item) => (
                  <el-option
                    key={item.id}
                    label={item.name}
                    value={item.id}
                  ></el-option>
                ))}
              </el-select>
            </el-form-item>
            <el-form-item label="坐标" prop="checkpoint">
              <KonvaEditor
                v-model:checkpoint={form.value.checkpoint}
                bg-img={mapPath.value}
                has-add={false}
                has-clear={false}
                has-delete={false}
                has-check={true}
              ></KonvaEditor>
            </el-form-item>
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
    CoordCheck,
    dialogVisible,
    getMapList,
  };
};
