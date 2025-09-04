/**
 * 设置相关类型定义
 */

/**
 * 生理体征设置范围接口
 */
export interface PhysiologicalRange {
  min: number
  max: number
}

/**
 * 血压设置范围接口
 */
export interface BloodPressureRange {
  systolic: PhysiologicalRange
  diastolic: PhysiologicalRange
}

/**
 * 生理体征设置表单接口
 */
export interface PhysiologicalSettings {
  /** 体温范围设置 (°C) */
  temperature: PhysiologicalRange
  /** 心率范围设置 (次/分) */
  heartRate: PhysiologicalRange
  /** 血压范围设置 (mmHg) */
  bloodPressure: BloodPressureRange
  /** 血氧饱和度范围设置 (%) */
  oxygenSaturation: PhysiologicalRange
}

/**
 * 铃声选项接口
 */
export interface SoundOption {
  /** 选项标签 */
  label: string
  /** 选项值 */
  value: string
}

/**
 * 警报设置接口
 */
export interface AlarmSettings {
  /** 警报开关 */
  enabled: boolean
  /** 警报铃声文件名或URL */
  soundFile: string
}

/**
 * 药物信息接口
 */
export interface Medication {
  /** 药物ID */
  id: string
  /** 药物名称 */
  name: string
  /** 药物规格 */
  specification: string
  /** 药物用法 */
  usage: string
}

/**
 * 用药方式枚举
 */
export type MedicationType = 'once' | 'repeat'

/**
 * 重复频率枚举
 */
export type RepeatFrequency = 'daily' | 'weekly' | 'monthly'

/**
 * 重复配置接口
 */
export interface RepeatConfig {
  /** 重复频率 */
  frequency: RepeatFrequency
  /** 重复间隔（每N天/周/月） */
  interval: number
  /** 结束日期（可选） */
  endDate?: string
  /** 每周重复的星期几（仅当频率为weekly时使用） */
  weekDays?: number[]
  /** 每月重复的日期（仅当频率为monthly时使用） */
  monthDay?: number
}

/**
 * 用药时间接口
 */
export interface MedicationTime {
  /** 时间ID */
  id: string
  /** 药物ID */
  medicationId: string
  /** 用药方式：单次或重复 */
  type: MedicationType
  /** 用药日期时间（单次）或时间（重复） */
  datetime: string
  /** 重复配置（仅当type为repeat时使用） */
  repeatConfig?: RepeatConfig
  /** 是否启用 */
  enabled: boolean
}

/**
 * 用药设置接口
 */
export interface MedicationSettings {
  /** 用药提醒开关 */
  enabled: boolean
  /** 用药时间列表 */
  medicationTimes: MedicationTime[]
}

/**
 * 地点接口
 */
export interface Location {
  /** 地点ID */
  id: string
  /** 地点名称 */
  name: string
  /** X坐标 */
  x: number
  /** Y坐标 */
  y: number
  /** 创建时间 */
  createTime?: string
}

/**
 * 路线接口
 */
export interface Route {
  /** 路线ID */
  id: string
  /** 路线名称 */
  name: string
  /** 路线经过的地点ID列表 */
  locationIds: string[]
  /** 路线经过的地点详情列表 */
  locations?: Location[]
  /** 创建时间 */
  createTime?: string
}

/**
 * 地点坐标信息接口
 */
export interface LocationCoordinates {
  /** X坐标 */
  x: number
  /** Y坐标 */
  y: number
}

/**
 * 设置保存响应接口
 */
export interface SettingsSaveResponse {
  /** 是否保存成功 */
  success: boolean
  /** 响应消息 */
  message: string
  /** 保存时间戳 */
  timestamp: string
}
