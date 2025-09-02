import request from '@/utils/request'

export interface Regulation {
  /**
   * 规章ID
   */
  position: number
  /**
   * 规章名称
   */
  fileName: string
  /**
   * 规章原文件路径
   */
  filePath: string
  context: string
}

/**
 * 获取规章列表
 */
// export function getRegulationList(params: {
//   /**
//    * 页码
//    */
//   page?: number
//   /**
//    * 每页条数
//    */
//   limit?: number
//   /**
//    * 关键字
//    */
//   keyword?: string
// }) {
//   return request<{ list: Regulation[]; total: number }>({
//     url: '/pdf-rules/v1/list',
//     method: 'get',
//     params,
//   })
// }

/**
 * 创建规章
 */
export function createRegulation(data: {
  /**
   * 规章名称
   */
  name: string
  /**
   * 规章原文件
   */
  file: File
}) {
  return request({
    url: '/pdf-rules/v1/upload',
    method: 'post',
    data,
  })
}

/**
 * 删除规章
 */
export function deleteRegulation(
  /**
   * 名字
   */
  data: { objectName: string },
) {
  return request({
    url: `/pdf-rules/v1/delete`,
    method: 'delete',
    data,
  })
}

/**
 * 更新文件
 * @param data
 * @returns
 */
export const updateRegulation = (data: { objectName: string }) => {
  return request.put('/pdf-rules/v1/update', data)
}

/**
 * 搜索PDF文件
 */
export function searchRegulationList(params: {
  /**
   * 关键字
   */
  keyword?: string
}) {
  return request<{ data: Regulation[] }>({
    url: '/pdf-rules/v1/search',
    method: 'get',
    params,
  })
}

/**
 * 读取规章文件内容
 */
export function readRegulation(params: {
  /**
   * 文件名
   */
  objectName: string
}) {
  return request<string>({
    url: '/pdf-rules/v1/read',
    method: 'get',
    params,
  })
}
