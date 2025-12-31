import type { User } from '@/lib/supabase/database.types'

/**
 * Users API client functions
 * Admin-only operations for user management
 */

// Response types
export interface UsersListResponse {
  data: Omit<User, 'password_hash'>[]
  total: number
}

export interface CreateUserInput {
  email: string
  phone?: string
  username?: string
  password: string
  role: 'admin' | 'user'
  full_name?: string
  is_active?: boolean
}

export interface UpdateUserInput {
  email?: string
  phone?: string
  username?: string
  password?: string
  role?: 'admin' | 'user'
  full_name?: string
  is_active?: boolean
}

// Error handling
class UsersApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'UsersApiError'
    this.status = status
  }
}

/**
 * Fetch all users with optional search/filter
 */
export async function getUsers(search?: string): Promise<UsersListResponse> {
  const params = new URLSearchParams()
  if (search) params.set('search', search)

  const res = await fetch(`/api/admin/users?${params.toString()}`)
  const data = await res.json()

  if (!res.ok) {
    throw new UsersApiError(data.error || 'Failed to fetch users', res.status)
  }

  return data
}

/**
 * Create a new user
 */
export async function createUser(input: CreateUserInput): Promise<Omit<User, 'password_hash'>> {
  const res = await fetch('/api/admin/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const data = await res.json()

  if (!res.ok) {
    throw new UsersApiError(data.error || 'Failed to create user', res.status)
  }

  return data.data
}

/**
 * Update an existing user
 */
export async function updateUser(id: string, input: UpdateUserInput): Promise<Omit<User, 'password_hash'>> {
  const res = await fetch(`/api/admin/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const data = await res.json()

  if (!res.ok) {
    throw new UsersApiError(data.error || 'Failed to update user', res.status)
  }

  return data.data
}

/**
 * Delete a user
 */
export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`/api/admin/users/${id}`, {
    method: 'DELETE',
  })

  if (!res.ok) {
    const data = await res.json()
    throw new UsersApiError(data.error || 'Failed to delete user', res.status)
  }
}

/**
 * Format role for display
 */
export function formatRole(role: 'admin' | 'user'): string {
  return role === 'admin' ? 'Quản trị viên' : 'Người dùng'
}

/**
 * Format date for display
 */
export function formatUserDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
