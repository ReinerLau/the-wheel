<template>
  <div>
    <div class="flex flex-col h-full gap-5">
      <!-- 顶部标题栏 -->
      <div class="card flex items-center justify-between">
        <div class="flex items-center gap-2">
          <el-select
            v-model="selectedRobotCode"
            placeholder="请选择机器人"
            size="large"
            class="w-48"
            @change="handleRobotSelect"
          >
            <el-option
              v-for="robot in data"
              :key="robot.code"
              :label="robot.name"
              :value="robot.code"
            />
          </el-select>
          <el-tag
            v-if="currentRobot"
            :type="getRobotStatusType(currentRobot.status)"
            size="large"
            class="h-[40px]"
          >
            {{ getRobotStatusText(currentRobot.status) }}
          </el-tag>
        </div>
        <!-- 按钮组 -->
        <div class="flex gap-1">
          <el-button
            v-if="currentRobot"
            type="primary"
            size="large"
            @click="openBindMapDialog(currentRobot)"
          >
            绑定地图
          </el-button>
          <el-button
            v-if="currentRobot"
            type="danger"
            size="large"
            @click="handleEmergencyStop(currentRobot)"
          >
            急停
          </el-button>
          <el-button
            v-if="currentRobot"
            type="success"
            size="large"
            @click="handleResume(currentRobot)"
          >
            恢复
          </el-button>
          <!-- 返回充点电 -->
          <el-button
            v-if="currentRobot"
            type="info"
            size="large"
            @click="handleReturnToCharge(currentRobot)"
          >
            返回充电点
          </el-button>
          <!-- 查询底盘标记点 -->
          <el-button
            v-if="currentRobot"
            type="warning"
            size="large"
            @click="handleQueryBaseMark(currentRobot)"
          >
            更新底盘标记点
          </el-button>
          <!-- 离线位置 -->
          <el-button
            v-if="currentRobot?.status === RobotStatus.OFFLINE"
            type="primary"
            size="large"
            @click="handleShowOfflineLocation"
          >
            离线位置
          </el-button>
        </div>
      </div>
      <!-- 当机器人离线时显示离线图标 -->
      <div
        v-if="currentRobot?.status === RobotStatus.OFFLINE"
        class="card flex-1 flex justify-center items-center flex-col"
      >
        <img src="../../assets/images/offline.svg" alt="离线" class="w-40 h-40" />
        <p class="mt-6 text-xl text-gray-500 font-medium">机器人已离线</p>
      </div>

      <!-- 内容区域，仅在机器人非离线状态显示 -->
      <div v-else class="flex-1 flex min-h-0 gap-5">
        <!-- 左侧 -->
        <div class="flex flex-col flex-1 gap-5">
          <div class="card flex-1 min-h-0">
            <CameraPlayer ref="cameraPlayer" :url="cameraUrl"></CameraPlayer>
          </div>
          <!-- 机器人信息 -->
          <div class="card">
            <RobotInformation
              :robot-code="robotCode"
              :robot-data="robotStatusData"
            ></RobotInformation>
          </div>
        </div>
        <!-- 右侧 -->
        <div class="w-1/3 flex flex-col justify-between gap-5 h-full">
          <!-- 任务列表 -->
          <div class="card flex-1 min-h-0">
            <el-table
              v-loading="tasksLoading"
              :data="taskList"
              :stripe="true"
              :border="true"
              table-layout="auto"
              class="w-full h-full"
            >
              <el-table-column prop="name" label="任务名称" header-align="center" align="center" />
              <el-table-column label="任务类型" header-align="center" align="center" width="80">
                <template #default="{ row }">
                  {{ row.taskMode === TaskType.GUIDANCE ? '引导' : '巡检' }}
                </template>
              </el-table-column>
              <el-table-column
                prop="startTime"
                label="执行时间"
                header-align="center"
                align="center"
              />
              <el-table-column label="操作" header-align="center" align="center" width="180">
                <template #default="{ row }">
                  <div class="flex gap-1 justify-center">
                    <el-button
                      type="warning"
                      size="small"
                      @click.stop="handleTaskOperation(row, TaskOperation.PAUSE)"
                    >
                      暂停
                    </el-button>
                    <el-button
                      type="info"
                      size="small"
                      @click.stop="handleTaskOperation(row, TaskOperation.RESUME)"
                    >
                      继续
                    </el-button>
                    <el-button
                      type="danger"
                      size="small"
                      @click.stop="handleTaskOperation(row, TaskOperation.CANCEL)"
                    >
                      取消
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <!-- 地图 -->
          <div v-show="currentRobot?.map" class="card overflow-hidden flex-1">
            <div class="bg-[#CCCCCC] h-full">
              <RobotPosition
                ref="robotPositionRef"
                :map="currentRobot?.map"
                :pos="robotPosition"
                :charging-point="chargingPointData"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 绑定地图弹窗 -->
    <el-dialog v-model="bindMapDialogVisible" title="绑定地图" width="500px">
      <div class="mb-4">
        <el-form>
          <el-form-item label="选择地图">
            <el-select v-model="selectedMapId" placeholder="请选择地图" class="w-full">
              <el-option
                v-for="map in mapList"
                :key="map.id ?? 0"
                :label="map.name"
                :value="map.id ?? 0"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- 地图预览 -->
      <img v-if="selectedMapPath" :src="selectedMapPath" alt="地图预览" class="w-full" />

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="bindMapDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleBindMap" :loading="bindingLoading"
            >确 定</el-button
          >
        </span>
      </template>
    </el-dialog>

    <!-- 位置信息对话框 -->
    <el-dialog v-model="locationDialog.visible" title="机器人位置信息" destroy-on-close>
      <div class="h-[600px]">
        <RobotPosition
          ref="locationRobotPositionRef"
          :map="locationDialog.mapPath"
          :pos="locationDialog.position"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, reactive, watch } from 'vue'
import {
  getRobotList as fetchRobotList,
  RobotStatus,
  bindMapToRobot,
  operateRobot,
  showChargingPoint,
  type Robot,
  type ChargingPoint,
} from '../../api/monitor'
import { fetchList } from '../../api/map'
import { getTaskList, operateTask, TaskOperation } from '../../api/task'
import { TaskType } from '../../constants/task'
import type { Map } from '../../types/map'
import type { Task } from '../../types/task'
import CameraPlayer from '../../components/CameraPlayer.vue'
import RobotInformation from './components/RobotInformation.vue'
import RobotPosition from './components/RobotPosition.vue'
import useRobotStatusWebsocket from '../../composables/useRobotStatusWebsocket'
import type { RobotStatusData } from '../../composables/useRobotStatusWebsocket'
import useTaskWebsocket from '../../composables/useTaskWebsocket'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

// 机器人表格数据
const data = ref<Robot[]>([])

// 任务列表数据
const taskList = ref<Task[]>([])
const tasksLoading = ref(false)

// 摄像头播放器
const cameraPlayer = ref<InstanceType<typeof CameraPlayer> | null>(null)

// 地图组件引用
const robotPositionRef = ref<InstanceType<typeof RobotPosition> | null>(null)

// 位置信息对话框
const locationDialog = reactive({
  visible: false,
  position: null as { x: number; y: number; theta: number } | null,
  mapPath: '',
})

// 位置对话框中的 RobotPosition 组件引用
const locationRobotPositionRef = ref<InstanceType<typeof RobotPosition> | null>(null)

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

// 当前选中的机器人
const robotCode = ref('')

/** 当前选中的机器人 */
const currentRobot = ref<Robot | null>(null)

/** 当前选中的机器人摄像头地址 */
const cameraUrl = ref('')

/** 机器人位置 */
const robotPosition = ref<{ x: number; y: number; theta: number } | null>(null)

/** 机器人状态数据 */
const robotStatusData = ref<RobotStatusData | null>(null)

/** 充电点信息 */
const chargingPointData = ref<ChargingPoint | null>(null)

// 机器人表格数据加载 loading
const loading = ref(false)

// 绑定地图弹窗相关状态
const bindMapDialogVisible = ref(false)
const selectedMapId = ref<number>(0)
const selectedMapPath = ref<string>('')
const mapList = ref<Map[]>([])
const targetRobotCode = ref('')
const bindingLoading = ref(false)

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

      // 更新机器人位置
      if (newData.agvState?.displayPosition) {
        robotPosition.value = {
          x: newData.agvState.displayPosition.x,
          y: newData.agvState.displayPosition.y,
          theta: newData.agvState.displayPosition.theta,
        }

        // 更新地图上的位置
        robotPositionRef.value?.updatePosition()
      }
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

// 获取机器人表格数据
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
 * 获取充电点信息
 * @param robotCode 机器人编码
 */
async function getChargingPoint(robotCode: string) {
  if (!robotCode) return

  try {
    const res = await showChargingPoint(robotCode)
    chargingPointData.value = res.data

    // 更新地图上的充电点位置
    await nextTick()
    robotPositionRef.value?.updateChargingPoint()
  } catch {
    ElMessage.error('获取充电点信息失败')
  }
}

/**
 * 处理任务操作
 * @param task 任务
 * @param operation 操作类型
 */
function handleTaskOperation(task: Task, operation: TaskOperation) {
  const operationMap: Partial<Record<TaskOperation, string>> = {
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

  // 找到对应的机器人
  const robot = data.value.find((item) => item.code === code)
  if (robot) {
    // 模拟表格行选择
    handleCurrentChange(robot)
  }
}

// 已删除不再使用的编辑和保存机器人名称的函数

/**
 * 切换选中机器人
 */
async function handleCurrentChange(row: Robot) {
  robotCode.value = row.code
  selectedRobotCode.value = row.code
  currentRobot.value = row

  // 重置位置信息
  robotPosition.value = null
  // 重置机器人状态数据
  robotStatusData.value = null
  // 重置摄像头地址
  cameraUrl.value = ''
  // 重置充电点信息
  chargingPointData.value = null

  await nextTick()
  // 初始化地图，不显示位置
  robotPositionRef.value?.initialize()

  // 获取充电点信息
  await getChargingPoint(row.code)

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

/**
 * 打开绑定地图弹窗
 */
function openBindMapDialog(robot: Robot) {
  targetRobotCode.value = robot.code
  bindMapDialogVisible.value = true
  selectedMapId.value = 0
  selectedMapPath.value = ''

  // 获取地图列表
  getMapList(robot.map)
}

/**
 * 获取地图列表
 * @param currentMapPath 当前机器人已绑定的地图路径
 */
async function getMapList(currentMapPath?: string) {
  try {
    const res = await fetchList({ page: 1, limit: 100 })
    mapList.value = res.data.list

    // 如果有已绑定的地图路径，找到对应的地图并选中
    if (currentMapPath) {
      const matchedMap = mapList.value.find((map) => map.path === currentMapPath)
      if (matchedMap && matchedMap.id) {
        selectedMapId.value = matchedMap.id
        selectedMapPath.value = matchedMap.path
      }
    }
  } catch {
    ElMessage.error('获取地图列表失败')
  }
}

/**
 * 处理绑定地图
 */
async function handleBindMap() {
  if (!selectedMapId.value) {
    ElMessage.warning('请选择地图')
    return
  }

  bindingLoading.value = true
  try {
    await bindMapToRobot(selectedMapId.value, targetRobotCode.value)
    ElMessage.success('绑定地图成功')
    bindMapDialogVisible.value = false

    // 刷新机器人列表
    await getRobotList()

    // 如果绑定的是当前选中的机器人，则更新其信息
    if (targetRobotCode.value === robotCode.value) {
      const updatedRobot = data.value.find((robot) => robot.code === robotCode.value)
      if (updatedRobot) {
        currentRobot.value = updatedRobot
        if (updatedRobot.map) {
          await nextTick()
          robotPositionRef.value?.initialize()
        }
      }
    }
  } catch {
    ElMessage.error('绑定地图失败')
  } finally {
    bindingLoading.value = false
  }
}

/**
 * 处理机器人急停
 */
async function handleEmergencyStop(robot: Robot) {
  try {
    await operateRobot(robot.code, 'stop')
    ElMessage.success('急停操作成功')
  } catch {
    ElMessage.error('急停操作失败')
  }
}

/**
 * 处理机器人恢复
 */
async function handleResume(robot: Robot) {
  try {
    await operateRobot(robot.code, 'resume')
    ElMessage.success('恢复操作成功')
  } catch {
    ElMessage.error('恢复操作失败')
  }
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

/**
 * 显示离线位置信息
 */
const handleShowOfflineLocation = async () => {
  if (!currentRobot.value) {
    ElMessage.warning('请先选择机器人')
    return
  }

  if (!currentRobot.value.point) {
    ElMessage.warning('无法获取机器人位置信息')
    return
  }

  locationDialog.position = currentRobot.value.point
  locationDialog.mapPath = currentRobot.value.map || ''
  locationDialog.visible = true

  // 等待对话框打开后初始化地图
  await nextTick()
  if (locationRobotPositionRef.value) {
    locationRobotPositionRef.value.initialize()
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
</style>
