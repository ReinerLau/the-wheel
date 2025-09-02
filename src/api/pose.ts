import type { ListReponse } from '@/utils'
import request from '@/utils/request'
import type { ActionResponse } from '@/utils/request'

interface ListItem {
  arm: string
  id: number
  name: string
}

export const poseApi = {
  getList(params: Record<string, unknown>): Promise<ListReponse<ListItem>> {
    return request({
      url: '/dc-arm-posture/v1/list',
      method: 'get',
      params,
    })
  },
  create(data: Record<string, unknown>): Promise<ActionResponse> {
    return request({
      url: '/dc-arm-posture/v1/create',
      method: 'post',
      data,
    })
  },
  update(data: Record<string, unknown>): Promise<ActionResponse> {
    return request({
      url: '/dc-arm-posture/v1/update',
      method: 'put',
      data,
    })
  },
  delete(id: number): Promise<ActionResponse> {
    return request({
      url: `/dc-arm-posture/v1/delete/${id}`,
      method: 'delete',
    })
  },
  postureAcquisition(data: { postureId: number; robot: string }): Promise<ActionResponse> {
    return request({
      url: '/dc-arm-posture/v1/postureAcquisition',
      method: 'put',
      data,
    })
  },
  getPoseByPoseGroupId(id: string) {
    return request({
      url: `/dc-arm-posture/v1/getByParentId/${id}`,
      method: 'get',
    })
  },
}
