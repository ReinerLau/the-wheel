import { deviceProfile } from "@/api";
import { ElMessage } from "element-plus";
import { TreeKey } from "element-plus/es/components/tree-v2/src/types";
import TreeStore from "element-plus/es/components/tree/src/model/tree-store";
import {
  ComponentPublicInstance,
  Fragment,
  FunctionalComponent,
  Ref,
  computed,
  nextTick,
  ref,
  watch,
} from "vue";

export const useDeviceDrawer = () => {
  const drawerVisible = ref(false);
  async function pickDevices() {
    drawerVisible.value = true;
    await nextTick();
    deviceTreeHeight.value =
      deviceTreeRef.value.$el.parentElement.clientHeight - 80;
  }

  interface DeviceItem {
    id: string;
    deviceName: string;
  }
  const deviceList: Ref<DeviceItem[]> = ref([]);
  const drawerLoading = ref(false);
  async function getDeviceList() {
    drawerLoading.value = true;
    try {
      const res = await deviceProfile.queryAll({ limit: 99999 });
      deviceList.value = res.data?.list || [];
      checkedIds.value = deviceList.value.map((item) => item.id);
      return res;
    } finally {
      drawerLoading.value = false;
    }
  }
  const deviceTreeRef: Ref<ComponentPublicInstance<TreeStore>> = ref();
  const deviceTreeHeight = ref(0);
  const checkedAll = ref(true);
  const checkedIds: Ref<TreeKey[]> = ref([]);
  watch(checkedAll, (val) => {
    deviceTreeRef.value.setCheckedKeys(
      val ? deviceList.value.map((item) => item.id) : []
    );
    updateCheckedIds();
  });
  const indeterminate = computed(() => {
    return checkedIds.value.length === 0 ||
      checkedIds.value.length === deviceList.value.length
      ? false
      : true;
  });

  function updateCheckedIds() {
    checkedIds.value = deviceTreeRef.value.getCheckedKeys();
  }
  const DeviceDrawer: FunctionalComponent<{ onConfirm: () => void }> = ({
    onConfirm,
  }) => {
    function handleConfirm() {
      if (checkedIds.value.length === 0) {
        ElMessage({ type: "warning", message: "请选择设备" });
        return;
      }
      drawerVisible.value = false;
      onConfirm();
    }
    return (
      <el-drawer v-model={drawerVisible.value} title="选择设备">
        {{
          default: () => (
            <Fragment>
              <el-checkbox
                v-model={checkedAll.value}
                indeterminate={indeterminate.value}
                label="全选"
              ></el-checkbox>
              <el-tree-v2
                ref={deviceTreeRef}
                v-loading={drawerLoading.value}
                data={deviceList.value}
                props={{ label: "deviceName", value: "id" }}
                show-checkbox
                check-on-click-node={true}
                height={deviceTreeHeight.value}
                default-checked-keys={checkedIds.value}
                onCheckChange={updateCheckedIds}
              ></el-tree-v2>
            </Fragment>
          ),
          footer: () => (
            <Fragment>
              <el-button type="primary" onClick={handleConfirm}>
                确定
              </el-button>
            </Fragment>
          ),
        }}
      </el-drawer>
    );
  };
  return {
    DeviceDrawer,
    pickDevices,
    checkedIds,
    getDeviceList,
  };
};
