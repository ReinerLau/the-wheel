import { describe, expect, it, vi, beforeEach } from 'vitest'
import WarehouseCard from '../WarehouseCard.vue'
import { mount } from '@vue/test-utils'
import { useRouter, type Router } from 'vue-router'

// We need to mock vue-router at the top level but we'll control when it's used
vi.mock('vue-router')

describe('WarehouseCard', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should render', () => {
    const wrapper = mount(WarehouseCard, {
      shallow: true,
      props: {
        warehouse: {
          id: 1,
          name: '仓库1',
          constructionTime: '2021-01-01',
          buildingArea: 100,
          ceilingHeight: 3,
          tunnelLength: 10,
          shelveCount: 10,
          materialCount: 100,
        },
      },
    })

    const constructionTime = wrapper.find('[data-test="constructionTime"]')
    const buildingArea = wrapper.find('[data-test="buildingArea"]')
    const ceilingHeight = wrapper.find('[data-test="ceilingHeight"]')
    const tunnelLength = wrapper.find('[data-test="tunnelLength"]')
    const shelveCount = wrapper.find('[data-test="shelveCount"]')
    const materialCount = wrapper.find('[data-test="materialCount"]')

    expect(constructionTime.text()).toBe('2021-01-01')
    expect(buildingArea.text()).toBe('100㎡')
    expect(ceilingHeight.text()).toBe('3m')
    expect(tunnelLength.text()).toBe('10m')
    expect(shelveCount.text()).toBe('10')
    expect(materialCount.text()).toBe('100')
  })

  it('should emit edit event', () => {
    const warehouse = {
      id: 1,
      name: '仓库1',
      constructionTime: '2021-01-01',
      buildingArea: 100,
      ceilingHeight: 3,
      tunnelLength: 10,
      shelveCount: 10,
      materialCount: 100,
    }
    const wrapper = mount(WarehouseCard, {
      props: { warehouse },
    })

    wrapper.find('[data-test="edit"]').trigger('click')
    wrapper.find('[data-test="delete"]').trigger('click')

    expect(wrapper.emitted('edit')![0]).toEqual([warehouse])
    expect(wrapper.emitted('delete')![0]).toEqual([warehouse])
  })

  it('should navigate to warehouse detail page when view button is clicked', async () => {
    const warehouse = {
      id: 1,
      name: '仓库1',
      constructionTime: '2021-01-01',
      buildingArea: 100,
      ceilingHeight: 3,
      tunnelLength: 10,
      shelveCount: 10,
      materialCount: 100,
    }

    // Setup the router mock only for this test
    const mockPush = vi.fn()
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as unknown as Router)

    const wrapper = mount(WarehouseCard, {
      props: { warehouse },
    })

    await wrapper.find('[data-test="view"]').trigger('click')

    expect(mockPush).toHaveBeenCalledTimes(1)
    expect(mockPush).toHaveBeenCalledWith({
      name: 'warehouse-detail',
      params: {
        id: warehouse.id,
        name: warehouse.name,
      },
    })
  })
})
