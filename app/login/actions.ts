'use server'

import { supabaseAdmin } from '@/lib/supabase/server'
import { normalizeIdentifier, isValidPassword } from '@/lib/auth/validators'

export type ValidationResult = {
  success: boolean
  error?: string
  email?: string
  redirectTo?: string
}

/**
 * Validates login input and returns user email for client-side auth
 * - Validates username/email/phone format
 * - Checks user exists and is active
 * - Returns email and redirect path
 */
export async function validateLoginInput(
  identifier: string,
  password: string
): Promise<ValidationResult> {
  try {
    // Validate inputs
    if (!identifier || !password) {
      return { success: false, error: 'Vui lòng nhập đầy đủ thông tin' }
    }

    if (!isValidPassword(password)) {
      return { success: false, error: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số' }
    }

    // Normalize identifier (username, email, or phone)
    const normalized = normalizeIdentifier(identifier)
    if (normalized.type === 'invalid') {
      return { success: false, error: 'Tên đăng nhập không đúng định dạng' }
    }

    // Query user from Better Auth 'user' table based on identifier type
    let query
    switch (normalized.type) {
      case 'email':
        query = supabaseAdmin.from('user').select('*').eq('email', normalized.value).single()
        break
      case 'phone':
        query = supabaseAdmin.from('user').select('*').eq('phone', normalized.value).single()
        break
      case 'username':
        query = supabaseAdmin.from('user').select('*').eq('username', normalized.value).single()
        break
    }

    const { data: user, error: userError } = await query

    // Generic error to prevent user enumeration
    if (userError || !user) {
      return { success: false, error: 'Tên đăng nhập hoặc mật khẩu không chính xác' }
    }

    // Check if user is active (use generic error)
    if (!user.is_active) {
      return { success: false, error: 'Tên đăng nhập hoặc mật khẩu không chính xác' }
    }

    // Determine redirect based on role
    // Note: (admin) route group doesn't add /admin to URL - it's just /dashboard
    const redirectTo = user.role === 'admin' ? '/dashboard' : '/'

    return { success: true, email: user.email, redirectTo }
  } catch (error) {
    console.error('Validation error:', error)
    return { success: false, error: 'Đã xảy ra lỗi, vui lòng thử lại' }
  }
}

/**
 * Get user by email or phone (for internal use)
 */
export async function getUserByIdentifier(identifier: string) {
  const normalized = normalizeEmailOrPhone(identifier)
  if (normalized.type === 'invalid') return null

  const query = normalized.type === 'email'
    ? supabaseAdmin.from('user').select('*').eq('email', normalized.value).single()
    : supabaseAdmin.from('user').select('*').eq('phone', normalized.value).single()

  const { data } = await query
  return data
}
