import request from "../utils/request";

/**
 * 警报开关
 */
export function controlAlarm(data) {
  return request({
    url: "/dcInspectionControl/v1/alarm",
    method: "put",
    data,
  });
}
/**
 * 大灯开关
 */
export function controlLight(data) {
  return request({
    url: "/dcInspectionControl/v1/led",
    method: "put",
    data,
  });
}
/**
 * 语音对讲开关
 */
export function controlVoice(data) {
  return request({
    url: "/dcInspectionControl/v1/voiceCall",
    method: "put",
    data,
  });
}
/**
 * 实时监控开关
 */
export function controlVideo(data) {
  return request({
    url: "/dcInspectionControl/v1/realTimeMonitoring",
    method: "put",
    data,
  });
}
/**
 * 切换自动巡检策略
 */
export function controlStrategy(rid, strategy) {
  return request({
    url: `/wisdom-auto-inspection/v1/updateStrategy/${rid}/${strategy}`,
    method: "put",
  });
}

/**
 * 控制机械臂开关
 */
export function controlArm(data) {
  return request({
    url: "/armControl/v1/armControl",
    method: "post",
    data,
  });
}

/**
 * 控制机械臂姿势
 */
export function controlArmPose(data) {
  return request({
    url: "/armControl/v1/armPose",
    method: "post",
    data,
  });
}

/**
 * 云台控制
 */
export function controlPanTilt(data) {
  return request({
    url: "/dcInspectionControl/v1/ptzControl",
    method: "put",
    data,
  });
}

/**
 * 红外遥控
 */
export function controlRemote(data) {
  return request({
    url: "/dcInspectionControl/v1/handset",
    method: "put",
    data,
  });
}

/**
 * 获取机械臂状态
 * @param code 机器人编号
 */
export function getArmStatus(code) {
  return request({
    url: `/armStatus/v1/getArmStatus/${code}`,
    method: "get",
  });
}
