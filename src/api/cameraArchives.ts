import request from "../utils/request";
/**摄像头档案 */
export const cameraArchives = {
  /** 查询 */
  queryAll(params: object) {
    return request({
      url: "/camera/v1",
      method: "get",
      params,
    });
  },
  /** 根据ID获取摄像头信息 */
  queryById(id: number) {
    return request({
      url: "/camera/v1/getone/" + id,
      method: "get",
    });
  },
  /** 根据code获取摄像头信息 */
  getByCameraId(id: string, rtype: string) {
    return request({
      url: `/camera/v1/getbyrid/${id}&${rtype}`,
      method: "get",
    });
  },
  /** 创建 */
  create(data: object) {
    return request({
      url: "/camera/v1",
      method: "post",
      data,
    });
  },
  /** 更新 */
  update(data: object) {
    return request({
      url: "/camera/v1",
      method: "put",
      data,
    });
  },
  /** 删除摄像头档案 */
  delete(id: number) {
    return request({
      url: "/camera/v1/" + id,
      method: "delete",
    });
  },
  /** 解绑摄像头绑定 */
  unbind(data: any) {
    return request({
      url: `/camera/v1/unbindToRid/${data.id}/${data.rid}/${data.rtype}`,
      method: "delete",
      data,
    });
  },
  /**
   * 获取机器人绑定的摄像头
   * @param code 机器人code
   * @param type 机器人类型
   */
  getBindCamera(code, type) {
    return request({
      url: `/camera/v1/getbyrid/${code}&${type}`,
      method: "get",
    });
  },
  /**
   * 机器人批量绑定摄像头
   * @param data
   */
  batchBindCamera(data) {
    return request({
      url: "/camera/v1/batchBind",
      method: "put",
      data,
    });
  },
};
