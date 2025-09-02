<template>
  <BasicTable
    :initial-params="initialParams"
    :form-rules="formRules"
    :query-api="roomFile.queryAll"
    :create-api="roomFile.create"
    :update-api="roomFile.update"
    :delete-api="roomFile.delete"
    :query-fields="queryFields"
    :table-fields="tableFields"
    :form-fields="formFields"
  ></BasicTable>
  <el-drawer v-model="drawerVisible" title="关联机柜">
    <el-checkbox-group v-model="selected" v-loading="loading" class="block">
      <el-checkbox
        v-for="item in data"
        :key="item.id"
        class="block"
        :label="item.id"
        size="large"
        >{{ item.cabinetName }}</el-checkbox
      >
    </el-checkbox-group>
    <template #footer>
      <el-button :loading="loading" type="primary" @click="handleConfirmBind">确定</el-button>
      <el-button @click="handleCancelBind">取消</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="tsx">
import { ElMessage } from 'element-plus'
import { onMounted, ref } from 'vue'
import { cabinet } from '../../api/cabinet.js'
import { roomFile } from '../../api/room.js'
import { fetchMapList } from '../../api/task.js'
import BasicTable from '../../components/BasicTable.jsx'

const initialParams = {
  limit: 9999999,
}

const formRules = {
  name: [{ required: true, message: '请输入机房名称' }],
  // sid: [{ required: true, message: "请输入车站档案id" }],
  // type: [{ required: true, message: "请输入类型" }],
  status: [{ required: true, message: '请选择状态' }],
}

const queryFields = [
  {
    prop: 'name',
    title: '机房名称',
  },
  {
    prop: 'type',
    title: '类型',
  },
  {
    prop: 'status',
    title: '状态',
    slot: (row) => (
      <el-select class="w-full" v-model={row.value['status']} placeholder="状态" clearable>
        {Object.entries(statusType).map(([value, label]) => (
          <el-option key={value} label={label} value={value}></el-option>
        ))}
      </el-select>
    ),
  },
]

const tableFields = [
  {
    prop: 'id',
    title: '编号',
  },
  {
    prop: 'name',
    title: '机房名称',
  },
  // {
  //   prop: "type",
  //   title: "类型",
  // },
  {
    prop: 'status',
    title: '状态',
    formatter: (prop) => {
      return statusType[prop]
    },
  },
  {
    prop: 'mid',
    title: '地图编号',
  },
  // {
  //   prop: "x",
  //   title: "坐标x",
  // },
  // {
  //   prop: "y",
  //   title: "坐标y",
  // },
  // {
  //   prop: "createTime",
  //   title: "创建时间",
  //   formatter: (row) => {
  //     return parseTime(row);
  //   },
  // },
  // {
  //   prop: "updateTime",
  //   title: "修改时间",
  //   formatter: (row) => {
  //     return parseTime(row);
  //   },
  // },
  {
    title: '操作',
    action: true,
    slot: (row) => (
      <el-button link type="success" onClick={() => handleAssign(row)}>
        关联机柜
      </el-button>
    ),
  },
]

const statusType = {
  1: '使用中',
  2: '未使用',
  3: '维修中',
}

const formFields = [
  {
    prop: 'name',
    title: '机房名称',
  },
  // {
  //   prop: "sid",
  //   title: "车站档案id",
  // },
  // {
  //   prop: "type",
  //   title: "类型",
  // },
  {
    prop: 'status',
    title: '状态',
    slot: (form) => (
      <el-select class="w-full" v-model={form.value.status}>
        {Object.keys(statusType).map((key) => (
          <el-option label={statusType[key]} value={Number(key)} />
        ))}
      </el-select>
    ),
  },
  {
    prop: 'mid',
    title: '地图',
    slot: (form) => (
      <el-select class="w-full" v-model={form.value.mid}>
        {mapList.value.map((item) => (
          <el-option label={item.name} value={item.id}></el-option>
        ))}
      </el-select>
    ),
  },
  // {
  //   prop: "x",
  //   title: "坐标x",
  //   slot: (form) => <el-input v-model={form.value.x} type="number"></el-input>,
  // },
  // {
  //   prop: "y",
  //   title: "坐标y",
  //   slot: (form) => <el-input v-model={form.value.y} type="number"></el-input>,
  // },
]

const drawerVisible = ref(false)

const loading = ref(false)
const data = ref([])
const selected = ref([])
let curId: number

async function handleAssign(row) {
  curId = row.id
  drawerVisible.value = true
  loading.value = true
  try {
    let res = await cabinet.queryAll({ limit: 999999 })
    data.value = res.data.list
    res = await cabinet.queryByRid(row.id)
    selected.value = res.data.map((item) => item.id)
  } finally {
    loading.value = false
  }
}

async function handleConfirmBind() {
  loading.value = true
  try {
    await cabinet.batchBind({
      ids: selected.value,
      rid: curId,
    })
    ElMessage({ type: 'success', message: '关联成功' })
    drawerVisible.value = false
  } finally {
    loading.value = false
  }
}

function handleCancelBind() {
  drawerVisible.value = false
}

const mapList = ref([])
async function getMapList() {
  const res = await fetchMapList({ limit: 99999 })
  mapList.value = res.data.list
}

onMounted(() => {
  getMapList()
})
</script>
