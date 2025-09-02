import { config } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { beforeAll } from 'vitest'

beforeAll(() => {
  config.global.plugins = [ElementPlus]
})
