import request from "../utils/request";

/**获取用户操作日志记录数据列表 */
export function fetchList(params: object) {
  return request({
    url: "/userOperationLog/v1/list",
    method: "get",
    params: params,
  });
}

/**获取一条用户操作日志记录数据 */
export function getUserOperationLogById(id: number) {
  return request({
    url: `/userOperationLog/v1/getById/${id}`,
    method: "get",
  });
}
