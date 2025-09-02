// import PageLayout from "../../layout/PageLayout.vue";

// // export default {
//   path: "/files",
//   name: "files",
//   component: PageLayout,
//   meta: { title: "档案管理", root: true },
//   children: [
//     {
//       path: "station",
//       name: "files-station",
//       component: () => import("../../views/files/StationList.vue"),
//       meta: {
//         title: "车站档案",
//         buttons: [
//           {
//             name: "files-station:create",
//             meta: {
//               title: "添加",
//             },
//           },
//           {
//             name: "files-station:edit",
//             meta: {
//               title: "编辑",
//             },
//           },
//           {
//             name: "files-station:delete",
//             meta: {
//               title: "删除",
//             },
//           },
//         ],
//       },
//     },
//     {
//       path: "room",
//       name: "files-room",
//       component: () => import("../../views/files/RoomList.vue"),
//       meta: {
//         title: "机房档案",
//         buttons: [
//           {
//             name: "files-room:create",
//             meta: {
//               title: "添加",
//             },
//           },
//           {
//             name: "files-room:edit",
//             meta: {
//               title: "编辑",
//             },
//           },
//           {
//             name: "files-room:delete",
//             meta: {
//               title: "删除",
//             },
//           },
//           {
//             name: "files-room:cabinet",
//             meta: {
//               title: "关联机柜",
//             },
//           },
//         ],
//       },
//     },
//     {
//       path: "cabinet",
//       name: "files-cabinet",
//       component: () => import("../../views/files/CabinetList.vue"),
//       meta: {
//         title: "机柜档案",
//         buttons: [
//           {
//             name: "files-cabinet:create",
//             meta: {
//               title: "添加",
//             },
//           },
//           {
//             name: "files-cabinet:edit",
//             meta: {
//               title: "编辑",
//             },
//           },
//           {
//             name: "files-cabinet:delete",
//             meta: {
//               title: "删除",
//             },
//           },
//           {
//             name: "files-cabinet:device",
//             meta: {
//               title: "关联设备",
//             },
//           },
//           {
//             name: "files-cabinet:coord",
//             meta: {
//               title: "坐标采集",
//             },
//           },
//         ],
//       },
//     },
//     {
//       path: "device",
//       name: "files-device",
//       component: () => import("@/views/files/DeviceList"),
//       meta: {
//         title: "设备档案",
//         buttons: [
//           {
//             name: "files-device:create",
//             meta: {
//               title: "添加",
//             },
//           },
//           {
//             name: "files-device:edit",
//             meta: {
//               title: "编辑",
//             },
//           },
//           {
//             name: "files-device:delete",
//             meta: {
//               title: "删除",
//             },
//           },
//           {
//             name: "files-device:pose",
//             meta: {
//               title: "姿势采集",
//             },
//           },
//         ],
//       },
//     },
//     {
//       path: "robot",
//       name: "files-robot",
//       component: () => import("@/views/files/RobotList.tsx"),
//       meta: {
//         title: "机器人档案",
//         buttons: [
//           {
//             name: "files-robot:edit",
//             meta: {
//               title: "编辑",
//             },
//           },
//           {
//             name: "files-robot:check",
//             meta: {
//               title: "坐标校对",
//             },
//           },
//           {
//             name: "files-robot:camera",
//             meta: {
//               title: "关联摄像头",
//             },
//           },
//           {
//             name: "files-robot:openAutoInspect",
//             meta: {
//               title: "开启自动巡逻",
//             },
//           },
//           {
//             name: "files-robot:closeAutoInspect",
//             meta: {
//               title: "关闭自动巡逻",
//             },
//           },
//           {
//             name: "files-robot:return",
//             meta: {
//               title: "返回充电点",
//             },
//           },
//         ],
//       },
//     },
//     {
//       path: "camera",
//       name: "files-camera",
//       component: () => import("../../views/files/CameraList.vue"),
//       meta: {
//         title: "摄像头档案",
//         buttons: [
//           {
//             name: "files-camera:create",
//             meta: {
//               title: "添加",
//             },
//           },
//           {
//             name: "files-camera:edit",
//             meta: {
//               title: "编辑",
//             },
//           },
//           {
//             name: "files-camera:delete",
//             meta: {
//               title: "删除",
//             },
//           },
//         ],
//       },
//     },
//     {
//       path: "map",
//       name: "files-map",
//       component: () => import("../../views/files/MapList.vue"),
//       meta: {
//         title: "地图档案",
//         buttons: [
//           {
//             name: "files-map:create",
//             meta: {
//               title: "添加",
//             },
//           },
//           {
//             name: "files-map:edit",
//             meta: {
//               title: "编辑",
//             },
//           },
//           {
//             name: "files-map:delete",
//             meta: {
//               title: "删除",
//             },
//           },
//           {
//             name: "files-map:charge",
//             meta: {
//               title: "充电点",
//             },
//           },
//         ],
//       },
//     },
//     // {
//     //   path: "threshold",
//     //   name: "files-threshold",
//     //   component: () => import("@/views/files/ThresholdList.tsx"),
//     //   meta: {
//     //     title: "阈值档案",
//     //     buttons: [
//     //       {
//     //         name: "files-threshold:create",
//     //         meta: {
//     //           title: "添加",
//     //         },
//     //       },
//     //       {
//     //         name: "files-threshold:edit",
//     //         meta: {
//     //           title: "编辑",
//     //         },
//     //       },
//     //       {
//     //         name: "files-threshold:delete",
//     //         meta: {
//     //           title: "删除",
//     //         },
//     //       },
//     //     ],
//     //   },
//     // },
//     {
//       path: "posegroup",
//       name: "files-posegroup",
//       component: () => import("@/views/files/PoseGroupList.tsx"),
//       meta: {
//         title: "姿态组档案",
//       },
//     },
//     {
//       path: "pose",
//       name: "files-pose",
//       component: () => import("@/views/files/PoseList.tsx"),
//       meta: {
//         title: "姿态档案",
//       },
//     },
//     {
//       path: "information",
//       name: "files-information",
//       component: () => import("@/views/files/InformationCollect.tsx"),
//       meta: {
//         title: "信息采集",
//       },
//     },
//   ],
// };
