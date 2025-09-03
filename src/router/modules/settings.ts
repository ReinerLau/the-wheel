import PageLayout from '../../layout/PageLayout.vue'

export default {
  path: '/settings',
  name: 'settings',
  component: PageLayout,
  meta: { title: '设置', root: true },
  children: [
    {
      path: 'index',
      name: 'settings-index',
      component: () => import('../../views/settings/SettingsIndex.vue'),
      meta: {
        title: '系统设置',
        identity: 'settings'
      }
    }
  ]
}
