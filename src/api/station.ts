import request from "../utils/request";
/**车站档案 */
export const station = {
  /** 查询 */
  queryAll(params: object) {
    return request({
      url: "/wisdomStationFile/v1/list",
      method: "get",
      params,
    });
  },
  /** 根据机房ID获取车站档案 */
  queryByRid(id: number) {
    return request({
      url: `/wisdomStationFile/v1/getById/${id}`,
      method: "get",
    });
  },
  /** 创建 */
  create(data: object) {
    return request({
      url: "/wisdomStationFile/v1/create",
      method: "post",
      data,
    });
  },
  /** 更新 */
  update(data: object) {
    return request({
      url: "/wisdomStationFile/v1/update",
      method: "put",
      data,
    });
  },
  /** 删除 */
  delete(id: number) {
    return request({
      url: "/wisdomStationFile/v1/delete/" + id,
      method: "delete",
    });
  },
};
