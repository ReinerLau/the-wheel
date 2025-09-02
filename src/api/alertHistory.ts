import request from '../utils/request'

/**获取告警历史列表 */
export function fetchAlertHistoryList(params: object) {
  return request({
    url: '/perception-environment/v1/list',
    method: 'get',
    params: params,
  })
}

/**根据ID获取告警历史详情 */
export function getAlertHistoryById(id: string) {
  return request({
    url: `/perception-environment/v1/detail/${id}`,
    method: 'get',
  })
}
