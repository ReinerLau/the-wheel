export interface Map {
  /**
   * 地图ID
   */
  id?: number
  /**
   * 地图名称
   */
  name: string
  /**
   * 地图文件路径
   */
  path: string
}

export interface MapListParams {
  page?: number
  limit?: number
  name?: string
}

export interface MapListResponse {
  list: Map[]
  total: number
}

export interface MapUploadResponse {
  fileUrl: string
}

export interface MapAddParams {
  name: string
  path: string
}

export interface MapUpdateParams {
  id: number
  name?: string
  path?: string
}
