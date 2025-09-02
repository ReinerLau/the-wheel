import request from "../utils/request";
/**异常日志 */
export const wisdomErrors = {
  /** 查询 */
  queryAll(params: object) {
    return request({
      url: "/wisdomErrors/v1/all",
      method: "get",
      params,
    });
  },
  /** 根据id获取异常数据 */
  queryById(id: number) {
    return request({
      url: "/wisdomErrors/v1/getById/" + id,
      method: "get",
    });
  },
  /** 创建 */
  create(data: object) {
    return request({
      url: "/wisdomErrors/v1/create",
      method: "post",
      data,
    });
  },
  /** 更新 */
  update(data: object) {
    return request({
      url: "/wisdomErrors/v1/update",
      method: "put",
      data,
    });
  },
  /** 删除 */
  delete(id: number) {
    return request({
      url: "/wisdomErrors/v1/delete/" + id,
      method: "delete",
    });
  },
  /** 导航 */
  navigation(data: object) {
    return request({
      url: "/wisdomErrors/v1/navigation",
      method: "post",
      data,
    });
  },
};
