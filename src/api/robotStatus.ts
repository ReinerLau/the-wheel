import request from "../utils/request";
/**机器人日志 */
export const robotStatus = {
  /** 查询机器人异常日志表列表 */
  queryAll(params: object) {
    return request({
      url: "/dc-robot-inspection-log/v1/list",
      method: "get",
      params,
    });
  },
  /**
   * 获取机器人状态
   * @param code 机器人编号，不是机器人id
   */
  getOne(code) {
    return request({
      url: `/dc-robot-inspection-log/v1/getOne/${code}`,
      method: "get",
    });
  },
};
