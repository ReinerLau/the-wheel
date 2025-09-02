<template>
  <BasicTable
    :initial-params="initialParams"
    :form-rules="formRules"
    :query-api="fetchList"
    :create-api="createMap"
    :update-api="updateMap"
    :delete-api="deleteMap"
    :query-fields="queryFields"
    :table-fields="tableFields"
    :form-fields="formFields"
  ></BasicTable>
  <el-dialog v-model="dialogVisible" title="充电点" @close="handleClose">
    <KonvaEditor
      v-model:chargePoint="chargePoint"
      :bg-img="mapPath"
      :has-clear="true"
      :has-charge="true"
    ></KonvaEditor>
    <template #footer>
      <el-button :loading="loading" type="primary" @click="handleSubmit">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="tsx">
import { ElMessage } from "element-plus";
import { Fragment, ref } from "vue";
import {
  collectChargePoint,
  createChargePoint,
  createMap,
  deleteMap,
  fetchList,
  getChargePoint,
  updateChargePoint,
  updateMap,
} from "../../api/map";
import { robotArchives } from "../../api/robotArchives";
import BasicTable from "../../components/BasicTable";
import ImgUpload from "../../components/ImgUpload.vue";
import KonvaEditor from "../../components/KonvaEditor.vue";

const initialParams = {
  name: "",
  limit: 99999,
};

const formRules = {
  name: [{ required: true, message: "请输入名称" }],
  path: [{ required: true, message: "请上传地图" }],
};

const queryFields = [
  {
    prop: "name",
    title: "名称",
  },
];

const tableFields = [
  {
    prop: "id",
    title: "编号",
  },
  {
    prop: "name",
    title: "名称",
  },
  {
    prop: "path",
    title: "预览",
    slot: (row) => (
      <el-image
        src={row.path}
        preview-src-list={[row.path]}
        preview-teleported
        hide-on-click-modal
        loading="lazy"
        fit="cover"
        class="h-24 w-64 rounded"
      ></el-image>
    ),
  },
  {
    prop: "height",
    title: "地图高度",
  },
  {
    prop: "width",
    title: "地图宽度",
  },
  {
    prop: "originX",
    title: "原点坐标x",
  },
  {
    prop: "originY",
    title: "原点坐标y",
  },
  {
    title: "操作",
    action: true,
    slot: (row) => (
      <Fragment>
        <el-button link type="success" onClick={() => handleCharge(row)}>
          充电点设置
        </el-button>
        <el-popover
          placement="top"
          width={300}
          trigger="click"
          v-slots={{
            reference: () => (
              <el-button link type="warning" onClick={openChargeCollect}>
                充电点采集
              </el-button>
            ),
            default: () => (
              <Fragment>
                <el-select
                  onChange={(code) => handleChargeCollect(code, row.id)}
                  class="w-full"
                  placeholder="机器人"
                  clearable
                >
                  {robotList.value.map((item) => (
                    <el-option label={item.name} value={item.code}></el-option>
                  ))}
                </el-select>
              </Fragment>
            ),
          }}
        ></el-popover>
      </Fragment>
    ),
  },
];

const formFields = [
  {
    prop: "name",
    title: "名称",
  },
  {
    prop: "path",
    title: "地图",
    slot: (form) => <ImgUpload v-model:src={form.value.path} />,
  },
  {
    prop: "height",
    title: "地图高度",
    slot: (form) => (
      <el-input-number
        class="w-full"
        v-model={form.value.height}
        min={0}
        precision={0}
      />
    ),
  },
  {
    prop: "width",
    title: "地图宽度",
    slot: (form) => (
      <el-input-number
        class="w-full"
        v-model={form.value.width}
        min={0}
        precision={0}
      />
    ),
  },
  {
    prop: "originX",
    title: "原点坐标x",
    slot: (form) => (
      <el-input-number class="w-full" v-model={form.value.originX} />
    ),
  },
  {
    prop: "originY",
    title: "原点坐标y",
    slot: (form) => (
      <el-input-number class="w-full" v-model={form.value.originY} />
    ),
  },
];

const mapPath = ref("");
let mapId;

async function handleCharge(row) {
  const res = await getChargePoint(row.id);
  if (res.data.list.length > 0) {
    chargePoint.value = res.data.list[0];
  }
  mapPath.value = row.path;
  mapId = row.id;
  dialogVisible.value = true;
}

interface ChargePoint {
  id?: number;
  chargeX?: number;
  chargeY?: number;
  tiltAngle?: number;
}
const chargePoint = ref<ChargePoint>({});

const dialogVisible = ref(false);

const loading = ref(false);

async function handleSubmit() {
  loading.value = true;
  try {
    const data = {
      id: chargePoint.value.id,
      mid: mapId,
      chargeX: chargePoint.value.chargeX,
      chargeY: chargePoint.value.chargeY,
      tiltAngle: chargePoint.value.tiltAngle,
      name: "test",
    };
    if (data.id) {
      const res: any = await updateChargePoint(data);
      ElMessage({ type: "success", message: res.message });
    } else {
      const res: any = await createChargePoint(data);
      ElMessage({ type: "success", message: res.message });
    }
    dialogVisible.value = false;
    chargePoint.value = {};
  } finally {
    loading.value = false;
  }
}

function handleClose() {
  chargePoint.value = {};
  mapPath.value = "";
}

const robotList = ref([]);
async function handleChargeCollect(code, mid) {
  await collectChargePoint(code, mid);
  ElMessage({ type: "success", message: "发送成功" });
}

async function openChargeCollect() {
  const res = await robotArchives.queryAll({
    limit: 99999,
    RType: "DCInspection",
  });
  robotList.value = res.data.list;
}
</script>
