<template>
  <div class="flex flex-col h-screen box-border bg-gray-100 p-2">
    <!-- 顶部标题栏 -->
    <div class="card mb-2">
      <div class="flex items-center gap-2 mb-2">
        <el-select
          v-model="selectedRobotCode"
          placeholder="请选择机器人"
          size="default"
          class="flex-1"
          @change="handleRobotSelect"
        >
          <el-option
            v-for="robot in data"
            :key="robot.code"
            :label="robot.name"
            :value="robot.code"
          />
        </el-select>
        <!-- 在线状态 -->
        <el-tag v-if="currentRobot" :type="getRobotStatusType(currentRobot.status)" size="large">
          {{ getRobotStatusText(currentRobot.status) }}
        </el-tag>
        <!-- 切换账号按钮 -->
        <el-button type="primary" size="default" @click="handleSwitchAccount">切换账号</el-button>
      </div>
      <div class="flex items-center">
        <!-- 返回充点电 -->
        <el-button
          class="flex-1"
          v-if="currentRobot"
          type="info"
          size="large"
          @click="handleReturnToCharge(currentRobot)"
        >
          返回充电点
        </el-button>
        <!-- 查询底盘标记点 -->
        <el-button
          class="flex-1"
          v-if="currentRobot"
          type="warning"
          size="large"
          @click="handleQueryBaseMark(currentRobot)"
        >
          更新底盘标记点
        </el-button>
      </div>
    </div>

    <!-- 当机器人离线时显示离线图标 -->
    <div
      v-if="currentRobot?.status === 0"
      class="card flex-1 flex justify-center items-center flex-col"
    >
      <img src="../../assets/images/offline.svg" alt="离线" class="w-40 h-40 text-gray-400" />
      <p class="mt-6 text-xl text-gray-500 font-medium">机器人已离线</p>
    </div>

    <!-- 内容区域 - 垂直排列，仅在机器人非离线状态显示 -->
    <el-scrollbar v-else class="flex-1">
      <!-- 左侧内容区域 - 摄像头和机器人信息 -->
      <div class="card overflow-hidden mb-2">
        <CameraPlayer ref="cameraPlayer" :url="cameraUrl"></CameraPlayer>
      </div>
      <!-- 任务列表区域 -->
      <div class="card mb-2">
        <!-- 任务列表模式 -->
        <div v-if="!isControllerMode">
          <el-table
            v-loading="tasksLoading"
            :data="taskList"
            :stripe="true"
            :border="false"
            table-layout="auto"
            class="w-full"
            :header-cell-style="{ background: '#f8f9fa', fontSize: '13px' }"
            :cell-style="{ fontSize: '13px' }"
          >
            <el-table-column prop="name" label="任务名称" header-align="center" align="center" />
            <el-table-column label="任务类型" header-align="center" align="center">
              <template #default="{ row }">
                <el-tag
                  size="small"
                  :type="row.taskMode === TaskType.GUIDANCE ? 'success' : 'primary'"
                >
                  {{ row.taskMode === TaskType.GUIDANCE ? '引导' : '巡检' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="startTime"
              label="执行时间"
              header-align="center"
              align="center"
            />
            <el-table-column label="操作" header-align="center" align="center">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click.stop="enterControllerMode(row)">
                  操作
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 遥控器模式 -->
        <div v-else class="controller-mode">
          <!-- 顶部控制栏 -->
          <div class="flex items-center justify-between mb-4">
            <el-button link size="large" @click="exitControllerMode">
              <el-icon size="20">
                <Back />
              </el-icon>
            </el-button>
            <h3 class="text-lg font-medium">{{ selectedTask?.name || '未选择任务' }}</h3>
          </div>

          <!-- 操作按钮组 -->
          <div>
            <el-row :gutter="12" class="mb-3">
              <el-col :span="12">
                <el-button
                  type="success"
                  size="large"
                  class="w-full"
                  @click="handleTaskOperationInController(TaskOperation.START)"
                >
                  开始
                </el-button>
              </el-col>
              <el-col :span="12">
                <el-button
                  type="warning"
                  size="large"
                  class="w-full"
                  @click="handleTaskOperationInController(TaskOperation.PAUSE)"
                >
                  暂停
                </el-button>
              </el-col>
            </el-row>
            <el-row :gutter="12">
              <el-col :span="12">
                <el-button
                  type="info"
                  size="large"
                  class="w-full"
                  @click="handleTaskOperationInController(TaskOperation.RESUME)"
                >
                  继续
                </el-button>
              </el-col>
              <el-col :span="12">
                <el-button
                  type="danger"
                  size="large"
                  class="w-full"
                  @click="handleTaskOperationInController(TaskOperation.CANCEL)"
                >
                  取消
                </el-button>
              </el-col>
            </el-row>
          </div>
        </div>
      </div>
      <div class="card mb-2">
        <RobotInformation :robot-code="robotCode" :robot-data="robotStatusData"></RobotInformation>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  getRobotList as fetchRobotList,
  operateRobot,
  RobotStatus,
  type Robot,
} from '../../api/monitor'
import { getTaskList, operateTask, TaskOperation } from '../../api/task'
import { TaskType } from '../../constants/task'
import type { Map } from '../../types/map'
import type { Task } from '../../types/task'
import CameraPlayer from '../../components/CameraPlayer.vue'
import RobotInformation from './components/RobotInformation.vue'
import useRobotStatusWebsocket from '../../composables/useRobotStatusWebsocket'
import type { RobotStatusData } from '../../composables/useRobotStatusWebsocket'
import useTaskWebsocket from '../../composables/useTaskWebsocket'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { Back } from '@element-plus/icons-vue'
import { useUserStore } from '../../store/user'

const router = useRouter()
const { logout } = useUserStore()

// 机器人表格数据
const data = ref<Robot[]>([])

// 任务列表数据
const taskList = ref<Task[]>([])
const tasksLoading = ref(false)

// 摄像头播放器
const cameraPlayer = ref<InstanceType<typeof CameraPlayer> | null>(null)

// 当前选中的机器人编码
const selectedRobotCode = ref('')

onMounted(() => {
  getRobotList().then(() => {
    // 默认选择第一个机器人
    if (data.value.length > 0) {
      selectedRobotCode.value = data.value[0].code
      handleRobotSelect(selectedRobotCode.value)
    }
  })
})

// 组件卸载前关闭所有 WebSocket 连接
onBeforeUnmount(() => {
  closeWebsocket()
  closeTaskWebsocket()
})

// 当前选中的机器人
const robotCode = ref('')

/** 当前选中的机器人 */
const currentRobot = ref<Robot | null>(null)

/** 当前选中的机器人摄像头地址 */
const cameraUrl = ref('')

/** 机器人状态数据 */
const robotStatusData = ref<RobotStatusData | null>(null)

// 机器人表格数据加载 loading
const loading = ref(false)

// 绑定地图弹窗相关状态
const selectedMapId = ref<number>(0)
const selectedMapPath = ref<string>('')
const mapList = ref<Map[]>([])

// 使用机器人状态 WebSocket 连接
const { connectWebsocket, closeWebsocket, latestData } = useRobotStatusWebsocket()

// 使用任务 WebSocket 连接
const { connectWebsocket: connectTaskWebsocket, closeWebsocket: closeTaskWebsocket } =
  useTaskWebsocket()

/**
 * 监听地图选择变化
 */
watch(selectedMapId, (newMapId) => {
  if (newMapId) {
    const selectedMap = mapList.value.find((map) => map.id === newMapId)
    if (selectedMap) {
      selectedMapPath.value = selectedMap.path
    }
  } else {
    selectedMapPath.value = ''
  }
})

/**
 * 监听 WebSocket 数据变化
 */
watch(
  latestData,
  (newData) => {
    if (newData) {
      robotStatusData.value = newData
    }
  },
  { immediate: true },
)

/**
 * 监听机器人编码变化，连接或断开 WebSocket
 */
watch(robotCode, (newCode) => {
  if (newCode) {
    // 连接机器人状态 WebSocket
    connectWebsocket(newCode)

    // 连接任务 WebSocket，并在收到匹配的任务更新时刷新任务列表
    connectTaskWebsocket(newCode, () => {
      // 当任务更新且与当前选中机器人匹配时，刷新任务列表
      getTasksForRobot(newCode)
    })

    // 获取机器人相关的任务初始数据
    getTasksForRobot(newCode)
  } else {
    // 断开 WebSocket 连接
    closeWebsocket()
    closeTaskWebsocket()

    // 重置数据
    robotStatusData.value = null
    taskList.value = []
  }
})

/**
 * 获取机器人表格数据
 */
async function getRobotList() {
  loading.value = true
  try {
    const res = await fetchRobotList()
    data.value = res.data.map((robot) => ({ ...robot, isEditing: false }))
  } finally {
    loading.value = false
  }
}

/**
 * 获取机器人相关的任务
 * @param robotCode 机器人编码
 */
async function getTasksForRobot(robotCode: string) {
  if (!robotCode) return

  tasksLoading.value = true
  try {
    const res = await getTaskList({
      limit: 100,
      page: 1,
      robotCode,
      schedule: true,
    })
    taskList.value = res.data.list || []
  } catch {
    ElMessage.error('获取任务列表失败')
  } finally {
    tasksLoading.value = false
  }
}

/**
 * 处理任务操作
 * @param task 任务
 * @param operation 操作类型
 */
function handleTaskOperation(task: Task, operation: TaskOperation) {
  const operationMap: Partial<Record<TaskOperation, string>> = {
    [TaskOperation.START]: '开始',
    [TaskOperation.PAUSE]: '暂停',
    [TaskOperation.RESUME]: '继续',
    [TaskOperation.CANCEL]: '取消',
  }

  ElMessageBox.confirm(`确认${operationMap[operation]}该任务吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      await operateTask({ operation, taskId: task.id })
      ElMessage.success(`${operationMap[operation]}成功`)
      // 刷新任务列表
      getTasksForRobot(robotCode.value)
    })
    .catch(() => {})
}

/**
 * 根据机器人状态获取对应的文本
 */
function getRobotStatusText(status: RobotStatus): string {
  if (status === RobotStatus.ONLINE) return '在线'
  if (status === RobotStatus.OFFLINE) return '离线'
  if (status === RobotStatus.ERROR) return '异常'
  return '未知'
}

/**
 * 根据机器人状态获取对应的标签类型
 */
function getRobotStatusType(status: RobotStatus): 'success' | 'danger' | 'warning' | 'info' {
  if (status === RobotStatus.ONLINE) return 'success'
  if (status === RobotStatus.OFFLINE) return 'warning'
  if (status === RobotStatus.ERROR) return 'danger'
  return 'info'
}

/**
 * 处理机器人下拉选择
 */
function handleRobotSelect(code: string) {
  if (!code) return

  // 切换机器人时退出遥控器模式
  exitControllerMode()

  // 找到对应的机器人
  const robot = data.value.find((item) => item.code === code)
  if (robot) {
    // 模拟表格行选择
    handleCurrentChange(robot)
  }
}

/**
 * 切换选中机器人
 */
async function handleCurrentChange(row: Robot) {
  robotCode.value = row.code
  selectedRobotCode.value = row.code
  currentRobot.value = row

  // 重置摄像头地址
  cameraUrl.value = ''

  await nextTick()

  // 使用机器人IP直接请求获取source_id
  if (row.ip) {
    // 获取source_id
    const sourceRes = await axios.get(`http://${row.ip}/ks/source`)
    if (sourceRes.data?.data?.[0]?.id) {
      const sourceId = sourceRes.data.data[0].id
      console.log('获取到source_id:', sourceId)

      // 使用source_id获取webrtc地址
      const streamRes = await axios.get(
        `http://${row.ip}/stream/live/subscribe?source_id=${sourceId}`,
      )

      if (streamRes.data?.data) {
        // 获取原始webrtc地址
        const originalUrl = streamRes.data.data
        console.log('获取到原始webrtc地址:', originalUrl)

        // 修改webrtc地址中的IP为机器人IP
        // 格式: webrtc://127.0.0.1/live/xxx/xxx -> webrtc://机器人IP/live/xxx/xxx
        const urlParts = originalUrl.split('/')
        if (urlParts.length >= 3) {
          // 移除IP中可能包含的端口信息 (例如: 192.168.1.1:8080 → 192.168.1.1)
          const robotIp = row.ip.split(':')[0]
          urlParts[2] = robotIp + ':1985'

          // 组合新的URL
          cameraUrl.value = urlParts.join('/')
          console.log('修改后的webrtc地址:', cameraUrl.value)

          // 通知摄像头播放器播放视频
          nextTick(() => {
            cameraPlayer.value?.play()
          })
        } else {
          ElMessage.warning('视频流地址格式错误')
        }
      } else {
        ElMessage.warning('获取视频流地址失败')
      }
    } else {
      ElMessage.warning('获取source_id失败')
    }
  } else {
    console.error('机器人IP地址为空')
    ElMessage.warning('机器人IP地址为空，无法获取视频流')
  }
}

// 遥控器模式相关状态
const isControllerMode = ref(false)
const selectedTask = ref<Task | null>(null)

/**
 * 进入遥控器模式
 */
function enterControllerMode(task: Task) {
  isControllerMode.value = true
  selectedTask.value = task
}

/**
 * 退出遥控器模式
 */
function exitControllerMode() {
  isControllerMode.value = false
  selectedTask.value = null
}

/**
 * 处理任务操作（遥控器模式）
 */
function handleTaskOperationInController(operation: TaskOperation) {
  if (selectedTask.value) {
    handleTaskOperation(selectedTask.value, operation)
  }
}

/**
 * 处理切换账号
 */
async function handleSwitchAccount() {
  ElMessageBox.confirm('确认切换账号吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      await logout()
      router.push('/login')
    })
    .catch(() => {})
}

/**
 * 处理机器人返回充点电
 */
async function handleReturnToCharge(robot: Robot) {
  try {
    await operateRobot(robot.code, 'goHome')
    ElMessage.success('返回充点电操作成功')
  } catch {
    ElMessage.error('返回充点电操作失败')
  }
}

/**
 * 处理机器人查询底盘标记点
 */
async function handleQueryBaseMark(robot: Robot) {
  try {
    await operateRobot(robot.code, 'queryMarkers')
    ElMessage.success('查询底盘标记点操作成功')
  } catch {
    ElMessage.error('查询底盘标记点操作失败')
  }
}
</script>

<style scoped lang="scss">
.card {
  padding: 12px;
  background-color: #fff;
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.12);
  border-radius: 4px;
}

.controller-mode {
  padding: 12px;
  background-color: #fff;
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.12);
  border-radius: 4px;
}
</style>
