<template>
  <div class="p-4 h-full">
    <el-card class="mb-4 h-full overflow-y-auto">
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold">任务列表</h2>
          <el-button type="primary" @click="handleAdd">新增任务</el-button>
        </div>
      </template>

      <div>
        <el-form :inline="true" :model="queryForm">
          <el-form-item label="机器人编号">
            <el-select
              v-model="queryForm.robotCode"
              placeholder="请选择机器人编号"
              clearable
              class="w-60"
            >
              <el-option
                v-for="robot in robotList"
                :key="robot.code"
                :label="robot.name"
                :value="robot.code"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="任务名称">
            <el-input v-model="queryForm.name" placeholder="请输入任务名称" clearable />
          </el-form-item>
          <el-form-item label="任务时间范围">
            <el-date-picker
              v-model="queryForm.timeRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD"
              clearable
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table class="flex-1" :data="tableData" border style="width: 100%">
        <el-table-column prop="name" label="任务名称" />
        <el-table-column label="任务类型" width="100">
          <template #default="{ row }">
            {{ row.taskMode === TaskType.GUIDANCE ? '引导' : '巡检' }}
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="执行时间" />
        <el-table-column label="任务开关" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.schedule"
              inline-prompt
              :active-text="row.taskMode === TaskType.NORMAL ? '开' : '默认'"
              :inactive-text="row.taskMode === TaskType.NORMAL ? '关' : '后备'"
              @change="
                (val: string | number | boolean) =>
                  handleScheduleChange(row.id, val as boolean, row.taskMode)
              "
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right">
          <template #default="{ row }">
            <el-button link type="success" @click="handleTaskOperation(row, TaskOperation.START)"
              >开始</el-button
            >
            <el-button link type="warning" @click="handleTaskOperation(row, TaskOperation.PAUSE)"
              >暂停</el-button
            >
            <el-button link type="info" @click="handleTaskOperation(row, TaskOperation.RESUME)"
              >继续</el-button
            >
            <el-button link type="danger" @click="handleTaskOperation(row, TaskOperation.STOP)"
              >急停</el-button
            >
            <el-button
              class="!text-[var(--el-color-warning-dark-2)]"
              link
              type="info"
              @click="handleTaskOperation(row, TaskOperation.CANCEL)"
              >取消</el-button
            >
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增任务' : '编辑任务'"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        v-loading="dialogLoading"
      >
        <el-form-item label="机器人编号" prop="robotCode">
          <el-select
            v-model="form.robotCode"
            placeholder="请选择机器人编号"
            :loading="robotListLoading"
            clearable
            class="w-60"
            @click="fetchRobotList"
          >
            <el-option
              v-for="robot in robotList"
              :key="robot.code"
              :label="robot.name"
              :value="robot.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="任务类型" prop="taskMode">
          <el-radio-group v-model="form.taskMode">
            <el-radio :label="TaskType.GUIDANCE">引导</el-radio>
            <el-radio :label="TaskType.NORMAL">巡检</el-radio>
          </el-radio-group>
        </el-form-item>
        <template v-if="form.taskMode === TaskType.NORMAL">
          <el-form-item label="班次" prop="frequency">
            <el-checkbox-group v-model="form.frequency">
              <el-checkbox-button label="周一" :value="1" />
              <el-checkbox-button label="周二" :value="2" />
              <el-checkbox-button label="周三" :value="3" />
              <el-checkbox-button label="周四" :value="4" />
              <el-checkbox-button label="周五" :value="5" />
              <el-checkbox-button label="周六" :value="6" />
              <el-checkbox-button label="周日" :value="7" />
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="执行时间" prop="startTime">
            <div class="flex flex-col gap-2">
              <div class="flex items-center" v-for="(time, index) in form.startTime" :key="index">
                <el-time-picker
                  v-model="form.startTime[index]"
                  placeholder="开始时间"
                  format="HH:mm"
                  value-format="HH:mm"
                  :editable="false"
                  :clearable="false"
                />
                <el-button
                  link
                  type="danger"
                  :icon="Delete"
                  @click="() => handleDeleteStartTime(index)"
                />
              </div>
              <el-button type="primary" @click="handleAddStartTime">添加执行时间</el-button>
            </div>
          </el-form-item>
        </template>
        <el-form-item v-if="form.taskMode === TaskType.GUIDANCE" label="欢迎辞" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            placeholder="请输入欢迎辞"
            :rows="3"
            resize="none"
          />
        </el-form-item>
        <el-form-item label="任务路径" prop="paths">
          <div v-for="(path, index) in form.paths" :key="index" class="mb-4">
            <el-card shadow="hover" class="w-full">
              <div class="flex justify-between items-center mb-3">
                <span class="font-bold">路径点 {{ index + 1 }}</span>
                <el-button
                  type="danger"
                  @click="removePath(index)"
                  :disabled="form.paths.length === 1"
                  >删除</el-button
                >
              </div>
              <div class="flex flex-col gap-2">
                <el-form-item label="仓库">
                  <el-select
                    v-model="path.warehouseId"
                    placeholder="请选择仓库"
                    :loading="warehouseLoading"
                    @change="(val) => handleWarehouseChange(val, index)"
                    class="w-full"
                  >
                    <el-option
                      v-for="warehouse in warehouseList"
                      :key="warehouse.id"
                      :label="warehouse.name"
                      :value="warehouse.id.toString()"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="货架">
                  <el-select
                    v-model="path.shelfId"
                    placeholder="请选择货架"
                    :disabled="!path.warehouseId"
                    @change="(val) => handleShelfChange(val, index, path.warehouseId)"
                    class="w-full"
                  >
                    <el-option
                      v-for="shelf in shelfList[path.warehouseId.toString()] || []"
                      :key="shelf.id"
                      :label="shelf.shelfName"
                      :value="shelf.id.toString()"
                      :disabled="isWarehouseSelected(shelf.id, index)"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="语音内容">
                  <el-input
                    v-model="path.voiceContent"
                    type="textarea"
                    placeholder="请输入路径点语音内容"
                    :rows="2"
                    resize="none"
                  />
                </el-form-item>
              </div>
            </el-card>
          </div>
          <el-button type="primary" @click="addPath">添加路径</el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { dayjs, ElMessage, ElMessageBox, type FormItemRule } from 'element-plus'
import {
  getTaskList,
  createTask,
  updateTask,
  deleteTask,
  operateTask,
  toggleTaskSchedule,
  TaskOperation,
} from '@/api/task'
import { robotArchives } from '@/api/robotArchives'
import { getWarehouseList } from '@/api/warehouseManagement'
import { getShelfList } from '@/api/shelf'
import { TaskType } from '@/constants/task'
import type { Task, TaskPath } from '@/types/task'
import type { Warehouse } from '@/types/warehouse'
import type { Shelf } from '@/types/shelf'
import { Delete } from '@element-plus/icons-vue'

const tableData = ref<Task[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref()
const dialogLoading = ref(false)

const queryForm = ref({
  robotCode: '',
  name: '',
  timeRange: [],
})

const defaultForm: Task = {
  id: 0,
  robotCode: '',
  name: '',
  taskMode: TaskType.GUIDANCE,
  frequency: [],
  times: '',
  content: '',
  startTime: [],
  paths: [
    {
      shelfId: '',
      warehouseId: '',
      shelfCode: '',
      warehouseName: '',
      voiceContent: '',
    },
  ],
}

const form = ref<Task>(JSON.parse(JSON.stringify(defaultForm)))

const rules: Partial<Record<string, FormItemRule[]>> = {
  robotCode: [{ required: true, message: '请选择机器人', trigger: 'change' }],
  name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  taskMode: [{ required: true, message: '请选择任务类型', trigger: 'change' }],
  frequency: [
    {
      required: true,
      message: '请选择班次',
      trigger: 'change',
      type: 'array',
      min: 1,
      validator: (_: unknown, value: number[], callback: (error?: Error) => void) => {
        if (form.value.taskMode === TaskType.NORMAL && (!value || value.length === 0)) {
          callback(new Error('请选择班次'))
          return
        }
        callback()
      },
    },
  ],
  startTime: [
    {
      required: true,
      message: '请添加执行时间',
      trigger: 'change',
      validator: (_: unknown, value: string[], callback: (error?: Error) => void) => {
        if (form.value.taskMode === TaskType.NORMAL && value.length === 0) {
          callback(new Error('请添加执行时间'))
          return
        }
        callback()
      },
    },
  ],
  paths: [
    { required: true, message: '请至少添加一个巡检路径', trigger: 'change', type: 'array', min: 1 },
    {
      validator: (_: unknown, value: TaskPath[], callback: (error?: Error) => void) => {
        if (!value || value.length === 0) {
          callback(new Error('请至少添加一个巡检路径'))
          return
        }
        const invalidPath = value.some((path) => !path.warehouseId || !path.shelfId)
        if (invalidPath) {
          callback(new Error('请为每个路径选择仓库和货架'))
          return
        }
        callback()
      },
      trigger: 'change',
    },
  ],
}

const fetchData = async () => {
  const params = {
    page: currentPage.value,
    limit: pageSize.value,
    robotCode: queryForm.value.robotCode,
    name: queryForm.value.name,
    startTime: queryForm.value.timeRange?.[0],
    endTime: queryForm.value.timeRange?.[1],
  }
  const res = await getTaskList(params)
  tableData.value = res.data.list
  total.value = res.data.total
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchData()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchData()
}

const robotList = ref<{ code: string; name: string }[]>([])
const robotListLoading = ref(false)

const warehouseList = ref<Warehouse[]>([])
const warehouseLoading = ref(false)
const shelfList = ref<{ [key: string]: Shelf[] }>({})

const fetchRobotList = async () => {
  if (robotListLoading.value) return
  robotListLoading.value = true
  const res = await robotArchives.queryAll({})
  robotList.value = res.data.list || []
  robotListLoading.value = false
}

const fetchWarehouseList = async () => {
  if (warehouseLoading.value) return
  warehouseLoading.value = true
  const res = await getWarehouseList({})
  warehouseList.value = res.data.list || []
  warehouseLoading.value = false
}

const fetchShelfList = async (warehouseId: number | string) => {
  if (!warehouseId) return
  const res = await getShelfList({ warehouseId, limit: 9999 })
  shelfList.value[warehouseId.toString()] = res.data.list || []
}

const handleShelfChange = (shelfId: number, index: number, warehouseId: string | number) => {
  const shelf = shelfList.value[warehouseId.toString()]?.find((shelf) => shelf.id == shelfId)
  if (shelf) {
    form.value.paths[index].shelfCode = shelf.shelfName
  }
}
const addPath = () => {
  form.value.paths.push({
    shelfId: '',
    warehouseId: '',
    shelfCode: '',
    warehouseName: '',
    voiceContent: '',
  })
}

const handleWarehouseChange = async (warehouseId: number | string, index: number) => {
  form.value.paths[index].shelfId = ''
  form.value.paths[index].shelfCode = ''
  const warehouse = warehouseList.value.find((w) => w.id == warehouseId)
  form.value.paths[index].warehouseName = warehouse?.name || ''
  if (form.value.paths[index].voiceContent === undefined) {
    form.value.paths[index].voiceContent = ''
  }
  await fetchShelfList(warehouseId)
}

const removePath = (index: number) => {
  form.value.paths.splice(index, 1)
}

const handleAdd = async () => {
  await fetchWarehouseList()
  dialogType.value = 'add'
  form.value = JSON.parse(JSON.stringify(defaultForm))
  dialogVisible.value = true
}

const handleEdit = async (row: Task) => {
  dialogType.value = 'edit'
  form.value = { ...row }
  dialogVisible.value = true

  dialogLoading.value = true
  try {
    await fetchWarehouseList()
    await Promise.all(row.paths.map((path) => fetchShelfList(path.warehouseId)))
  } finally {
    dialogLoading.value = false
  }
}

const handleDelete = (row: Task) => {
  ElMessageBox.confirm('确认删除该任务吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      await deleteTask(row.id)
      ElMessage.success('删除成功')
      fetchData()
    })
    .catch(() => {})
}

/**
 * 操作任务
 * @param row 任务
 * @param operation 操作
 */
const handleTaskOperation = (row: Task, operation: TaskOperation) => {
  const operationMap = {
    [TaskOperation.START]: '开始',
    [TaskOperation.PAUSE]: '暂停',
    [TaskOperation.RESUME]: '继续',
    [TaskOperation.STOP]: '急停',
    [TaskOperation.CANCEL]: '取消',
  }

  ElMessageBox.confirm(`确认${operationMap[operation]}该任务吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    await operateTask({ operation, taskId: row.id })
    ElMessage.success(`${operationMap[operation]}成功`)
  })
}

const handleSubmit = async () => {
  console.log(form.value.paths)

  if (!formRef.value) return

  if (!form.value.paths.length) {
    ElMessage.warning('请至少添加一个巡检路径')
    return
  }

  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      if (form.value.taskMode === TaskType.GUIDANCE) {
        form.value.frequency = []
        form.value.startTime = []
      }

      if (dialogType.value === 'add') {
        await createTask(form.value)
        ElMessage.success('创建成功')
      } else {
        await updateTask(form.value)
        ElMessage.success('更新成功')
      }
      dialogVisible.value = false
      fetchData()
    }
  })
}

const handleQuery = () => {
  currentPage.value = 1
  fetchData()
}

const resetQuery = () => {
  queryForm.value = {
    robotCode: '',
    name: '',
    timeRange: [],
  }
  handleQuery()
}

const handleScheduleChange = async (taskId: number, enable: boolean, taskMode: TaskType) => {
  try {
    await toggleTaskSchedule({
      taskId,
      enable,
      taskMode,
    })

    // 根据任务类型显示不同的成功提示信息
    if (taskMode === TaskType.GUIDANCE) {
      ElMessage.success(`已设为${enable ? '默认' : '后备'}`)
    } else {
      ElMessage.success(`${enable ? '开启' : '关闭'}定时任务成功`)
    }

    fetchData()
  } catch (error) {
    // Revert the switch state in case of error
    const task = tableData.value.find((t) => t.id === taskId)
    if (task) {
      task.schedule = !enable
    }
    throw error
  }
}

onMounted(() => {
  fetchRobotList()
  fetchData()
})

const isWarehouseSelected = (shelfId: number, currentIndex: number) => {
  return form.value.paths.some(
    (path, index) => index !== currentIndex && path.shelfId === shelfId.toString(),
  )
}

/**
 * 删除第几个执行时间
 * @param index 第几个执行时间
 */
const handleDeleteStartTime = (index: number) => {
  form.value.startTime.splice(index, 1)
}

const handleAddStartTime = () => {
  form.value.startTime.push(dayjs().format('HH:mm'))
}
</script>
