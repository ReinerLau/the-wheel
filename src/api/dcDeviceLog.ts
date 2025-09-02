import request from "../utils/request";
/**机房设备日志 */
export const dcDeviceLog = {
  /** 查询 */
  queryAll(params: object) {
    return request({
      url: "/dc-device-log/v1/list",
      method: "get",
      params,
    });
  },
  /** 创建 */
  create(data: object) {
    return request({
      url: "/dc-device-log/v1/create",
      method: "post",
      data,
    });
  },
  /** 更新 */
  update(data: object) {
    return request({
      url: "/dc-device-log/v1/update",
      method: "put",
      data,
    });
  },
  /** 删除 */
  delete(id: number) {
    return request({
      url: "/dc-device-log/v1/delete/" + id,
      method: "delete",
    });
  },
};
