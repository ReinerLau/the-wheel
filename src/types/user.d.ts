/**
 * 用户相关类型定义
 */

/**
 * 登录请求参数接口
 */
export interface LoginParams {
  /** 用户名 */
  username: string
  /** 密码 */
  password: string
}

/**
 * 用户信息接口
 */
export interface UserInfo {
  /** 用户ID */
  id: string
  /** 用户名 */
  username: string
  /** 用户昵称 */
  nickName: string
  /** 公司ID */
  companyId?: string
  /** 邮箱 */
  email?: string
  /** 备注 */
  note?: string
}

/**
 * 用户列表查询参数接口
 */
export interface UserListParams {
  /** 页码 */
  page: number
  /** 每页数量 */
  limit: number
  /** 搜索关键词 */
  keyword?: string
}

/**
 * 创建用户参数接口
 */
export interface CreateUserParams {
  /** 用户ID */
  id?: string
  /** 用户名 */
  username: string
  /** 用户昵称 */
  nickName: string
  /** 公司ID */
  companyId: string
  /** 邮箱 */
  email?: string
  /** 密码 */
  password: string
  /** 备注 */
  note?: string
}

/**
 * 更新用户参数接口
 */
export interface UpdateUserParams extends UserInfo {
  /** 密码（可选，编辑时可能为空） */
  password?: string
}

/**
 * 分配角色参数接口
 */
export interface AssignRoleParams {
  /** 管理员ID */
  adminId: string
  /** 角色ID列表（逗号分隔） */
  roleIds: string
}

/**
 * 角色信息接口
 */
export interface RoleInfo {
  /** 角色ID */
  id: string
  /** 角色名称 */
  name: string
  /** 权限列表（逗号分隔） */
  menuList?: string
}

/**
 * 角色列表查询参数接口
 */
export interface RoleListParams {
  /** 页码 */
  page: number
  /** 每页数量 */
  limit: number
  /** 角色名称 */
  name?: string
}

/**
 * 创建角色参数接口
 */
export interface CreateRoleParams {
  /** 角色名称 */
  name: string
}

/**
 * 更新角色参数接口
 */
export interface UpdateRoleParams {
  /** 角色ID */
  id: string
  /** 角色名称 */
  name?: string
  /** 权限列表（逗号分隔） */
  menuList?: string
}
