import { onBeforeUnmount, ref } from 'vue'
import { getToken } from '@/utils/auth'

// 告警位置接口
interface Point {
  theta: number
  x: number
  y: number
}

// 告警数据接口
export interface AlarmData {
  alertTime: string
  image: string
  message: string
  point: Point
  robotCode: string
}

/**
 * 告警WebSocket连接hook
 * 用于连接告警WebSocket服务，接收实时告警信息
 * @returns WebSocket 相关方法和状态
 */
export default function useAlarmWebsocket() {
  // WebSocket实例
  let websocket: WebSocket | null = null

  // 连接状态
  const isConnected = ref(false)

  // 最新接收到的数据
  const latestData = ref<AlarmData | null>(null)

  /**
   * 初始化WebSocket连接
   * @param onMessage 消息处理回调
   */
  function connectWebsocket(onMessage?: (e: MessageEvent) => void) {
    // 如果已经有连接，先关闭
    if (websocket) {
      closeWebsocket()
    }

    // 获取认证令牌
    const token = getToken()

    // 创建新的WebSocket连接
    try {
      // 使用默认WebSocket URL
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${wsProtocol}//${window.location.host}/websocket/alarm2`

      websocket = new WebSocket(wsUrl, token ? [token] : undefined)

      // 设置连接打开回调
      websocket.onopen = () => {
        isConnected.value = true
        console.log('告警WebSocket连接已建立')
      }

      // 设置消息处理回调
      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as AlarmData
          latestData.value = data
          if (onMessage) {
            onMessage(event)
          }
        } catch (error) {
          console.error('解析告警消息失败:', error)
        }
      }

      // 设置错误处理回调
      websocket.onerror = (error) => {
        console.error('告警WebSocket连接发生错误:', error)
        isConnected.value = false
      }

      // 设置连接关闭回调
      websocket.onclose = (event) => {
        console.log(`告警WebSocket连接已关闭，代码: ${event.code}`)
        isConnected.value = false

        // 根据关闭代码判断是否需要进行特殊处理
        if (event.code === 1006) {
          console.error('WebSocket 异常关闭，可能是认证问题')
        }
      }
    } catch (error) {
      console.error('创建告警WebSocket连接失败:', error)
    }
  }

  /**
   * 断开WebSocket连接
   */
  function closeWebsocket() {
    if (
      websocket &&
      (websocket.readyState === WebSocket.OPEN || websocket.readyState === WebSocket.CONNECTING)
    ) {
      websocket.close()
      isConnected.value = false
    }
    websocket = null
  }

  // 组件卸载前自动断开连接
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
