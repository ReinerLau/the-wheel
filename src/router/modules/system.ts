import PageLayout from '../../layout/PageLayout.vue'

export default {
  path: '/system',
  name: 'system',
  component: PageLayout,
  meta: { title: '系统管理', root: true },
  children: [
    // 任务管理
    {
      path: 'task/list',
      name: 'task-list',
      component: () => import('../../views/task/TaskList.vue'),
      meta: {
        identity: 'task',
        title: '任务管理',
        buttons: [],
      },
    },

    // 库房管理
    {
      path: 'warehouse/management',
      name: 'warehouse-management',
      component: () => import('../../views/warehouse/WarehouseManagement.vue'),
      meta: {
        title: '库房管理',
      },
    },
    {
      path: 'warehouse/detail/:id/:name',
      name: 'warehouse-detail',
      component: () => import('../../views/warehouse/WarehouseDetail.vue'),
      meta: {
        title: '库房详情',
        hidden: true,
      },
    },

    // 物资管理
    {
      path: 'material/management',
      name: 'material-management',
      component: () => import('../../views/material/MaterialManagement.vue'),
      meta: {
        title: '物资管理',
      },
    },

    // 规章管理
    {
      path: 'regulation/list',
      name: 'regulation-list',
      component: () => import('../../views/regulation/RegulationList.vue'),
      meta: {
        title: '规章管理',
      },
    },

    // 地图管理
    {
      path: 'map/management',
      name: 'map-management',
      component: () => import('../../views/map/MapManagement.vue'),
      meta: {
        title: '地图管理',
        buttons: [
          {
            name: 'map-management:create',
            meta: {
              title: '添加',
            },
          },
          {
            name: 'map-management:edit',
            meta: {
              title: '编辑',
            },
          },
          {
            name: 'map-management:delete',
            meta: {
              title: '删除',
            },
          },
        ],
      },
    },

    // 权限管理
    {
      path: 'authority/index',
      name: 'authority-index',
      component: () => import('../../views/authority/AuthorityManagement.vue'),
      meta: {
        title: '权限管理',
        buttons: [
          {
            name: 'authority:user:create',
            meta: {
              title: '添加用户',
            },
          },
        ],
      },
    },
  ],
}
