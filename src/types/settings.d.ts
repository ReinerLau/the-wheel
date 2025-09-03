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
