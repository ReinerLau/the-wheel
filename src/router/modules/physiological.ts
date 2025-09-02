import PageLayout from '../../layout/PageLayout.vue'

export default {
  path: '/physiological',
  name: 'physiological',
  component: PageLayout,
  meta: { title: '生理体征', root: true },
  children: [
    {
      path: 'monitor',
      name: 'physiological-monitor',
      component: () => import('../../views/physiological/PhysiologicalMonitor.vue'),
      meta: {
        title: '生理体征监测',
        identity: 'physiological-monitor',
        buttons: [
          {
            name: 'physiological:refresh',
            meta: {
              title: '刷新数据',
            },
          },
          {
            name: 'physiological:export',
            meta: {
              title: '导出数据',
            },
          },
        ],
      },
    },
  ],
}
