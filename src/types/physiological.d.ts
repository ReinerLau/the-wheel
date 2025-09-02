/**
 * 生理体征相关类型定义
 */

/**
 * 生理体征参数类型
 */
export interface PhysiologicalParams {
  /** 体温 (°C) */
  temperature: number
  /** 心率 (次/分) */
  heartRate: number
  /** 血压 - 收缩压/舒张压 (mmHg) */
  bloodPressure: {
    systolic: number
    diastolic: number
  }
  /** 血氧饱和度 (%) */
  oxygenSaturation: number
  /** 记录时间 */
  timestamp: string
}

/**
 * 实时生理体征数据
 */
export interface RealtimePhysiologicalData {
  /** 当前生理参数 */
  current: PhysiologicalParams
  /** 状态：正常、警告、危险 */
  status: 'normal' | 'warning' | 'danger'
  /** 最后更新时间 */
  lastUpdated: string
}

/**
 * 历史生理体征数据（当天）
 */
export interface HistoricalPhysiologicalData {
  /** 每小时的生理参数记录 */
  hourlyData: Array<{
    hour: number
    temperature: number
    heartRate: number
    systolic: number
    diastolic: number
    oxygenSaturation: number
  }>
}

/**
 * 生理体征阈值设置
 */
export interface PhysiologicalThresholds {
  /** 体温阈值 */
  temperature: {
    min: number
    max: number
    warningMin: number
    warningMax: number
  }
  /** 心率阈值 */
  heartRate: {
    min: number
    max: number
    warningMin: number
    warningMax: number
  }
  /** 血压阈值 */
  bloodPressure: {
    systolic: {
      min: number
      max: number
      warningMin: number
      warningMax: number
    }
    diastolic: {
      min: number
      max: number
      warningMin: number
      warningMax: number
    }
  }
  /** 血氧阈值 */
  oxygenSaturation: {
    min: number
    max: number
    warningMin: number
    warningMax: number
  }
}
