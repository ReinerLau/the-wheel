/**
 * 权限 ID 枚举
 * 定义系统中所有权限的唯一标识符
 */
export enum PermissionId {
  /** 设置生理体征 */
  PHYSIOLOGICAL_SETTINGS = 'physiological:settings',
  /** 设置警报 */
  ALARM_SETTINGS = 'alarm:settings',
  /** 设置用药 */
  MEDICATION_SETTINGS = 'medication:settings',
  /** 设置权限 */
  AUTHORITY_SETTINGS = 'authority:settings'
}

/**
 * 权限列表配置
 * 每个权限包含ID和权限名称
 */
export interface Permission {
  /** 权限ID */
  id: PermissionId
  /** 权限名称 */
  name: string
}

/**
 * 权限列表数组
 * 包含系统中所有权限的配置信息
 */
export const PERMISSIONS: readonly Permission[] = [
  /** 设置生理体征权限 */
  {
    id: PermissionId.PHYSIOLOGICAL_SETTINGS,
    name: '设置生理体征'
  },

  /** 设置警报权限 */
  {
    id: PermissionId.ALARM_SETTINGS,
    name: '设置警报'
  },

  /** 设置用药权限 */
  {
    id: PermissionId.MEDICATION_SETTINGS,
    name: '设置用药'
  },

  /** 设置权限权限 */
  {
    id: PermissionId.AUTHORITY_SETTINGS,
    name: '设置权限'
  }
] as const
