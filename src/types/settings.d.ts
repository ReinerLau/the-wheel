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
 * 用药时间接口
 */
export interface MedicationTime {
  /** 时间ID */
  id: string
  /** 药物ID */
  medicationId: string
  /** 用药日期时间 */
  datetime: string
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
