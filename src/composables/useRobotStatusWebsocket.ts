import { ref, onBeforeUnmount } from 'vue'
import { getToken } from '@/utils/auth'

// 电池状态接口
interface Battery {
  chargeState: boolean
  chargepileId: string
  handCharge: boolean
  level: number
}

// 地图信息接口
interface MapInfo {
  height: number
  width: number
  originX: number
  originY: number
  resolution: number
}

// 地图接口
interface Map {
  errorMessage: string
  floor: number
  info: MapInfo
  mapName: string
}

// 位置接口
interface Position {
  x: number
  y: number
  theta: number
}

// 停止状态接口
interface StopStatus {
  collisionState: number
  estopState: boolean
  hardEstopAbolishState: boolean
  hardEstopState: boolean
  softEstopState: boolean
}

// 任务状态接口
interface TaskStatus {
  isPaused: boolean
  moveRetryTimes: number
  moveStatus: string
  moveTarget: string
  outTaskId: string
  runningStatus: string
  targetFloor: number
}

// 速度接口
interface Velocity {
  vtheta: number
  vx: number
  vy: number
}

// AGV 状态接口
interface AgvState {
  battery: Battery
  currentMap: Map
  displayPosition: Position
  errorCode: string
  position: Position
  stopStatus: StopStatus
  taskStatus: TaskStatus
  velocity: Velocity
}

// 机器人状态数据接口
export interface RobotStatusData {
  agvState: AgvState
  code: string
  manufacturer: string
  mapPath: string
  serialNumber: string
  timestamp: number
  version: string
  environment?: {
    temperature: number
    humidity: number
  }
}

/**
 * 机器人状态 WebSocket 连接
 * @returns WebSocket 相关方法和状态
 */
export default function useRobotStatusWebsocket() {
  // WebSocket 实例
  let websocket: WebSocket | null = null

  // 连接状态
  const isConnected = ref(false)

  // 最新接收到的数据
  const latestData = ref<RobotStatusData | null>(null)

  /**
   * 初始化 WebSocket 连接
   * @param robotCode 机器人编码
   * @param onMessage 消息处理回调函数
   */
  function connectWebsocket(robotCode: string, onMessage?: (data: RobotStatusData) => void) {
    // 如果已经有连接，先关闭
    if (websocket) {
      closeWebsocket()
    }

    // 获取认证令牌
    const token = getToken()
    // const token =
    // 'BearereyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImNyZWF0ZWQiOjE3NDM1NTU4NDc0NjIsImV4cCI6MTc0NDE2MDY0Nywic3RhdGlvbklkIjo5fQ.nLwJxHqT6-rFh45vIIx1Ewp9QR4kVr9td_C9JcMWbcZM3gifEEb-cP8L1qtQpmnhPQVBwsisJ1sAjHmUpt-m9g'

    if (!token) {
      console.error('无法连接 WebSocket: 缺少认证令牌')
      return
    }

    // 创建新的 WebSocket 连接
    const wsUrl =
      `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//` +
      `${window.location.host}/websocket/agvStatus/${robotCode}`

    // 使用令牌作为 WebSocket 协议
    websocket = new WebSocket(wsUrl, [token])

    // 设置连接打开回调
    websocket.onopen = () => {
      isConnected.value = true
      console.log(`Robot ${robotCode} WebSocket connected`)
    }

    // 设置消息接收回调
    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as RobotStatusData
        latestData.value = data
        if (onMessage) {
          onMessage(data)
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    // 设置关闭回调
    websocket.onclose = (event) => {
      isConnected.value = false
      console.log(`Robot ${robotCode} WebSocket disconnected with code: ${event.code}`)

      // 根据关闭代码判断是否需要进行特殊处理
      if (event.code === 1006) {
        console.error('WebSocket 异常关闭，可能是认证问题')
      }
    }

    // 设置错误回调
    websocket.onerror = (error) => {
      console.error('WebSocket error:', error)
      isConnected.value = false
    }
  }

  /**
   * 关闭 WebSocket 连接
   */
  function closeWebsocket() {
    if (websocket) {
      websocket.close()
      websocket = null
      isConnected.value = false
    }
  }

  // 组件卸载前关闭连接
  onBeforeUnmount(() => {
    closeWebsocket()
  })

  return {
    connectWebsocket,
    closeWebsocket,
    isConnected,
    latestData,
  }
}
