import { TaskType } from '@/constants/task'

export interface Task {
  /**
   * 任务ID
   */
  id: number
  /**
   * 任务名称
   */
  name: string
  /**
   * 机器人编码
   */
  robotCode: string
  /**
   * 任务类型
   */
  taskMode: TaskType
  /**
   * 任务时间(多次)
   */
  times: string
  /**
   * 班次（周一至周日，1-7 代表周一至周日）
   */
  frequency: number[]
  /**
   * 执行时间
   */
  startTime: string[]
  /**
   * 语音内容
   */
  content: string
  /**
   * 定时任务状态
   */
  schedule?: boolean
  /**
   * 路径
   */
  paths: {
    /**
     * 仓库名称
     */
    warehouseName: string
    /**
     * 仓库ID
     */
    warehouseId: number | string
    /**
     * 货架编码
     */
    shelfCode: string
    /**
     * 货架ID
     */
    shelfId: string | number
    /**
     * 路径点语音内容
     */
    voiceContent: string
  }[]
}

export type TaskPath = Task['paths'][0]
