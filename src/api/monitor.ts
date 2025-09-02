import request from '@/utils/request'

export const enum RobotStatus {
  ONLINE = 1,
  OFFLINE = 0,
  ERROR = 2,
}

export interface Robot {
  /**
   * 机器人名称
   */
  name: string
  /**
   * 机器人编号
   */
  code: string
  /**
   * 地图路径
   */
  map: string
  /**
   * 机器人状态
   * 1: 在线
   * 0: 离线
   * 2: 异常
   */
  status: RobotStatus
  /**
   * 机器人IP地址
   */
  ip: string
  /**
   * 机器人离线前的最新位置
   */
  point?: {
    x: number
    y: number
    theta: number
  } | null
}

/**
 * 充电点信息
 */
export interface ChargingPoint {
  /**
   * 角度
   */
  theta: number
  /**
   * X坐标
   */
  x: number
  /**
   * Y坐标
   */
  y: number
}

/**
 * 获取机器人列表
 */
export function getRobotList() {
  return request<Robot[]>({
    url: '/monitor/v1/robot',
    method: 'get',
  })
}

/**
 * 获取视频推流地址
 * @param robotCode 机器人编码
 * @returns 包含推流地址的响应
 */
export function getPublishUrl(robotCode: string) {
  return request<string>({
    url: '/monitor/v1/publish',
    method: 'post',
    data: { robotCode },
  })
}

/**
 * 绑定地图到机器人
 * @param mapId 地图ID
 * @param robotCode 机器人编码
 * @returns 绑定结果
 */
export function bindMapToRobot(mapId: number, robotCode: string) {
  return request({
    url: '/monitor/v1/binding',
    method: 'put',
    data: { mapId, robotCode },
  })
}

/**
 * 修改机器人名称
 * @param name 机器人名称
 * @param robotCode 机器人编码
 * @returns
 */
export function updateRobotName(name: string, robotCode: string) {
  return request({
    url: '/monitor/v1/alias',
    method: 'put',
    data: { name, robotCode },
  })
}

/**
 * 操作机器人
 * @param robotCode 机器人编码
 * @param type 操作类型 - stop: 急停, resume: 恢复
 * @returns 操作结果
 */
export function operateRobot(
  robotCode: string,
  type: 'stop' | 'resume' | 'goHome' | 'queryMarkers',
) {
  return request({
    url: '/monitor/v1/operate',
    method: 'post',
    data: { robotCode, type },
  })
}

/**
 * 获取充电点信息
 * @param robotCode 机器人编码
 * @returns 充电点坐标信息
 */
export function showChargingPoint(robotCode: string) {
  return request<ChargingPoint>({
    url: '/monitor/v1/showChargingPoint',
    method: 'get',
    params: { robotCode },
  })
}
