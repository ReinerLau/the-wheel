import PageLayout from '../../layout/PageLayout.vue'

export default {
  path: '/patrol-history',
  name: 'patrol-history',
  component: PageLayout,
  meta: { title: '巡检历史', root: true },
  children: [
    {
      path: 'list',
      name: 'patrol-history-list',
      component: () => import('../../views/logs/PatrolHistory.vue'),
      meta: {
        title: '巡检历史',
      },
    },
  ],
}
