/**
 * 权限列表配置
 * 每个权限包含ID和权限名称
 */
export interface Permission {
  /** 权限ID */
  id: string
  /** 权限名称 */
  name: string
}

/**
 * 权限列表对象
 * 对象中的每个属性表示一个权限模块
 */
export const PERMISSIONS: Record<string, Permission> = {
  /** 设置生理体征权限 */
  PHYSIOLOGICAL_SETTINGS: {
    id: 'physiological:settings',
    name: '设置生理体征'
  },

  /** 设置警报权限 */
  ALARM_SETTINGS: {
    id: 'alarm:settings',
    name: '设置警报'
  },

  /** 设置用药权限 */
  MEDICATION_SETTINGS: {
    id: 'medication:settings',
    name: '设置用药'
  },

  /** 设置权限权限 */
  AUTHORITY_SETTINGS: {
    id: 'authority:settings',
    name: '设置权限'
  }
} as const

/**
 * 获取所有权限列表
 * @returns 权限数组
 */
export function getAllPermissions(): Permission[] {
  return Object.values(PERMISSIONS)
}

/**
 * 根据权限ID获取权限信息
 * @param id 权限ID
 * @returns 权限信息或undefined
 */
export function getPermissionById(id: string): Permission | undefined {
  return Object.values(PERMISSIONS).find((permission) => permission.id === id)
}

/**
 * 检查是否有指定权限
 * @param userPermissions 用户权限ID数组
 * @param requiredPermission 需要检查的权限ID
 * @returns 是否有权限
 */
export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  return userPermissions.includes(requiredPermission)
}
