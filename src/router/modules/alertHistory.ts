import PageLayout from '../../layout/PageLayout.vue'

export default {
  path: '/alert-history',
  name: 'alert-history',
  component: PageLayout,
  meta: { title: '告警历史', root: true },
  children: [
    {
      path: 'list',
      name: 'alert-history-list',
      component: () => import('../../views/logs/AlertHistory.vue'),
      meta: {
        title: '告警历史',
      },
    },
  ],
}
