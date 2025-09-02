import { ref, onBeforeUnmount } from 'vue'
import { getToken } from '@/utils/auth'

// 路径信息接口
interface Path {
  shelfCode: string
  shelfId: string
  voiceContent: string
  warehouseId: string
  warehouseName: string
}

// 任务数据接口
export interface TaskData {
  content: string
  frequency: number[]
  id: number
  name: string
  paths: Path[]
  robotCode: string
  schedule: boolean
  shift: number
  startTime: string
  taskMode: string
}

/**
 * 任务 WebSocket 连接
 * @returns WebSocket 相关方法和状态
 */
export default function useTaskWebsocket() {
  // WebSocket 实例
  let websocket: WebSocket | null = null

  // 连接状态
  const isConnected = ref(false)

  // 最新接收到的数据
  const latestData = ref<TaskData | null>(null)

  /**
   * 初始化 WebSocket 连接
   * @param robotCode 机器人编码
   * @param onTaskUpdate 任务更新回调函数
   */
  function connectWebsocket(robotCode: string, onTaskUpdate?: () => void) {
    // 如果已经有连接，先关闭
    if (websocket) {
      closeWebsocket()
    }

    // 获取认证令牌
    const token = getToken()

    if (!token) {
      console.error('无法连接 WebSocket: 缺少认证令牌')
      return
    }

    // 创建新的 WebSocket 连接
    const wsUrl =
      `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//` +
      `${window.location.host}/websocket/task/${robotCode}`

    // 使用令牌作为 WebSocket 协议
    websocket = new WebSocket(wsUrl, [token])

    // 设置连接打开回调
    websocket.onopen = () => {
      isConnected.value = true
      console.log(`Task WebSocket for robot ${robotCode} connected`)
    }

    // 设置消息接收回调
    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as TaskData
        latestData.value = data

        // 检查接收到的任务的机器人编码是否与当前选中的机器人匹配
        if (data.robotCode === robotCode && onTaskUpdate) {
          onTaskUpdate()
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    // 设置关闭回调
    websocket.onclose = (event) => {
      isConnected.value = false
      console.log(`Task WebSocket disconnected with code: ${event.code}`)

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
