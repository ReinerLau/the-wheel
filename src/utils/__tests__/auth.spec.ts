import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getToken, setToken, removeToken } from '../auth'

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

describe('Auth utilities', () => {
  const tokenKey = 'robot_management_web_token'
  const mockToken = 'test-token-123'

  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks()
  })

  describe('getToken', () => {
    it('should return token from cookies', () => {
      // Setup mock return value
      mockCookies.get.mockReturnValue(mockToken)

      const result = getToken()

      expect(mockCookies.get).toHaveBeenCalledTimes(1)
      expect(mockCookies.get).toHaveBeenCalledWith(tokenKey)
      expect(result).toBe(mockToken)
    })

    it('should return undefined when no token exists', () => {
      // Setup mock return value
      mockCookies.get.mockReturnValue(undefined)

      const result = getToken()

      expect(mockCookies.get).toHaveBeenCalledWith(tokenKey)
      expect(result).toBeUndefined()
    })
  })

  describe('setToken', () => {
    it('should set token in cookies', () => {
      // Setup mock return value
      mockCookies.set.mockReturnValue(mockToken)

      const result = setToken(mockToken)

      expect(mockCookies.set).toHaveBeenCalledTimes(1)
      expect(mockCookies.set).toHaveBeenCalledWith(tokenKey, mockToken)
      expect(result).toBe(mockToken)
    })
  })

  describe('removeToken', () => {
    it('should remove token from cookies', () => {
      removeToken()

      expect(mockCookies.remove).toHaveBeenCalledTimes(1)
      expect(mockCookies.remove).toHaveBeenCalledWith(tokenKey)
    })
  })
})
