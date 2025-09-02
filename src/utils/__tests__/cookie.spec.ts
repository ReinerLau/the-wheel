import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setCookie, getCookie, removeCookie } from '../cookie'

// Create a type-safe mock for js-cookie using vi.hoisted
const mockCookies = vi.hoisted(() => {
  return {
    set: vi.fn(),
    get: vi.fn(),
    remove: vi.fn(),
  }
})

// Mock js-cookie module
vi.mock('js-cookie', () => {
  return {
    default: mockCookies,
  }
})

describe('Cookie Utilities', () => {
  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks()
  })

  describe('setCookie', () => {
    it('should call Cookies.set with correct parameters', () => {
      const key = 'testKey'
      const value = 'testValue'
      const expires = 7

      setCookie(key, value, expires)

      expect(mockCookies.set).toHaveBeenCalledTimes(1)
      expect(mockCookies.set).toHaveBeenCalledWith(key, value, { expires })
    })
  })

  describe('getCookie', () => {
    it('should call Cookies.get with correct parameter', () => {
      const key = 'testKey'
      const mockValue = 'mockValue'

      // Setup mock return value
      mockCookies.get.mockReturnValue(mockValue)

      const result = getCookie(key)

      expect(mockCookies.get).toHaveBeenCalledTimes(1)
      expect(mockCookies.get).toHaveBeenCalledWith(key)
      expect(result).toBe(mockValue)
    })

    it('should return undefined for non-existent cookie', () => {
      const key = 'nonExistentKey'

      // Setup mock return value
      mockCookies.get.mockReturnValue(undefined)

      const result = getCookie(key)

      expect(mockCookies.get).toHaveBeenCalledWith(key)
      expect(result).toBeUndefined()
    })
  })

  describe('removeCookie', () => {
    it('should call Cookies.remove with correct parameter', () => {
      const key = 'testKey'

      removeCookie(key)

      expect(mockCookies.remove).toHaveBeenCalledTimes(1)
      expect(mockCookies.remove).toHaveBeenCalledWith(key)
    })
  })
})
