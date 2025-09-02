import { describe, it, expect, vi, beforeEach } from 'vitest'
import { paramSerializer, requestInterceptor } from '../request'
import type { InternalAxiosRequestConfig } from 'axios'
import * as auth from '../auth'

// Mock the auth module
vi.mock('../auth', () => ({
  getToken: vi.fn(),
}))

describe('paramSerializer', () => {
  it('should properly serialize params while filtering out null, undefined, and empty string values', () => {
    const params = {
      id: 1,
      name: 'test',
      description: null,
      category: undefined,
      status: '',
      tags: ['frontend', 'backend', 'devops'],
      count: 0,
      isActive: false,
      price: 19.99,
    }

    const result = paramSerializer(params)

    // Only valid values should be included
    expect(result).toBe(
      'id=1&name=test&tags=frontend&tags=backend&tags=devops&count=0&isActive=false&price=19.99',
    )
  })
})

describe('requestInterceptor', () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks()
  })

  it('should set Authorization header and apply paramSerializer for GET requests', () => {
    // Mock token
    vi.mocked(auth.getToken).mockReturnValue('test-token')

    // Create a mock config for GET request
    const config: InternalAxiosRequestConfig = {
      headers: {},
      method: 'get',
    } as InternalAxiosRequestConfig

    // Call the interceptor
    const result = requestInterceptor(config)

    // Check that token was added
    expect(result.headers['Authorization']).toBe('test-token')

    // Check that paramSerializer was assigned
    expect(result.paramsSerializer).toBe(paramSerializer)
  })
})
