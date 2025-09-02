import request from "../utils/request";
/** 统计分析 */
/** 查询设备巡检的正常异常记录数 */
export function getDeviceRecords(data: object) {
  return request({
    url: "/statistics-display/v1/ByHour",
    method: "post",
    data,
  });
}
/** 设备异常类型占比 */
export function getDeviceTypeError(data: object) {
  return request({
    url: "/statistics-display/v1/percent",
    method: "post",
    data,
  });
}
/** 设备告警次数 */
export function getDeviceAlarmRanking(data: object) {
  return request({
    url: "/statistics-display/v1/byMonth",
    method: "post",
    data,
  });
}
/** 获取异常日志列表数据 */
export function getDeviceWisdomErrors(data: object) {
  return request({
    url: "/wisdomErrors/v1/list",
    method: "post",
    data,
  });
}
/** 获取正常日志列表数据 */
export function getDeviceNormalList(data: object) {
  return request({
    url: "/dc-device-log/v1/normalList",
    method: "post",
    data,
  });
}
