/**
 * Authentication Client Test Suite
 *
 * Tests for client-side authentication hooks
 */

import { renderHook, waitFor } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useRequireAuth, useIsAuthenticated } from '@/lib/auth-client'
import { createMockSession } from './utils/test-helpers'

// Mock next-auth and next/navigation
jest.mock('next-auth/react')
jest.mock('next/navigation')

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('useRequireAuth Hook', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    } as any)
  })

  it('should redirect to login when not authenticated', async () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn()
    })

    renderHook(() => useRequireAuth())

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/login')
    })
  })

  it('should not redirect when authenticated', () => {
    const session = createMockSession()
    mockUseSession.mockReturnValue({
      data: session,
      status: 'authenticated',
      update: jest.fn()
    })

    const { result } = renderHook(() => useRequireAuth())

    expect(mockPush).not.toHaveBeenCalled()
    expect(result.current.session).toEqual(session)
    expect(result.current.status).toBe('authenticated')
  })

  it('should not redirect while loading', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: jest.fn()
    })

    renderHook(() => useRequireAuth())

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('should return session data when authenticated', () => {
    const session = createMockSession({
      user: { email: 'test@example.com', name: 'Test User' }
    })

    mockUseSession.mockReturnValue({
      data: session,
      status: 'authenticated',
      update: jest.fn()
    })

    const { result } = renderHook(() => useRequireAuth())

    expect(result.current.session).toEqual(session)
    expect(result.current.session?.user.email).toBe('test@example.com')
  })
})

describe('useIsAuthenticated Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return true when authenticated', () => {
    const session = createMockSession()
    mockUseSession.mockReturnValue({
      data: session,
      status: 'authenticated',
      update: jest.fn()
    })

    const { result } = renderHook(() => useIsAuthenticated())

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.session).toEqual(session)
  })

  it('should return false when not authenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn()
    })

    const { result } = renderHook(() => useIsAuthenticated())

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.session).toBeNull()
  })

  it('should return loading state', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: jest.fn()
    })

    const { result } = renderHook(() => useIsAuthenticated())

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isLoading).toBe(true)
    expect(result.current.session).toBeNull()
  })

  it('should update when session changes', () => {
    const { rerender, result } = renderHook(() => useIsAuthenticated())

    // Initially not authenticated
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn()
    })
    rerender()
    expect(result.current.isAuthenticated).toBe(false)

    // Then authenticated
    const session = createMockSession()
    mockUseSession.mockReturnValue({
      data: session,
      status: 'authenticated',
      update: jest.fn()
    })
    rerender()
    expect(result.current.isAuthenticated).toBe(true)
  })
})

describe('Authentication Integration', () => {
  it('should handle session expiration', () => {
    const expiredSession = createMockSession({
      expires: new Date(Date.now() - 1000).toISOString() // Expired 1 second ago
    })

    mockUseSession.mockReturnValue({
      data: expiredSession,
      status: 'authenticated',
      update: jest.fn()
    })

    const { result } = renderHook(() => useIsAuthenticated())

    // Session is still returned even if expired
    // NextAuth handles automatic session refresh
    expect(result.current.session).toEqual(expiredSession)
  })

  it('should provide user information', () => {
    const session = createMockSession({
      user: {
        id: 'user-123',
        email: 'admin@hablas.com',
        name: 'Admin User'
      }
    })

    mockUseSession.mockReturnValue({
      data: session,
      status: 'authenticated',
      update: jest.fn()
    })

    const { result } = renderHook(() => useIsAuthenticated())

    expect(result.current.session?.user.id).toBe('user-123')
    expect(result.current.session?.user.email).toBe('admin@hablas.com')
    expect(result.current.session?.user.name).toBe('Admin User')
  })
})
