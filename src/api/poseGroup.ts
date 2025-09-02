import type { ListReponse } from '@/utils'
import request from '@/utils/request'
import type { ActionResponse } from '@/utils/request'

interface ListItem {
  id: number
  name: string
}

export const poseGroupApi = {
  getList(params: Record<string, unknown>): Promise<ListReponse<ListItem>> {
    return request({
      url: '/dc-arm-posture-list/v1/list',
      method: 'get',
      params,
    })
  },
  create(data: Record<string, unknown>): Promise<ActionResponse> {
    return request({
      url: '/dc-arm-posture-list/v1/create',
      method: 'post',
      data,
    })
  },
  update(data: Record<string, unknown>): Promise<ActionResponse> {
    return request({
      url: '/dc-arm-posture-list/v1/update',
      method: 'put',
      data,
    })
  },
  delete(id: number): Promise<ActionResponse> {
    return request({
      url: `/dc-arm-posture-list/v1/delete/${id}`,
      method: 'delete',
    })
  },
  bindSubPose(data: { parentId: string; subsetIdList: number[] }): Promise<ActionResponse> {
    return request({
      url: `/dc-arm-posture-list/v1/arm-subset-handlerBatch`,
      method: 'post',
      data,
    })
  },
  syncPoseGroup(data: {
    armParentProfileId: number
    cabinetProfileId: number
  }): Promise<ActionResponse> {
    return request({
      url: `/dc-arm-posture-list/v1/sync-arm-profile`,
      method: 'post',
      data,
    })
  },
}
