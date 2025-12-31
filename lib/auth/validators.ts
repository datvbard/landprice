/**
 * Validation utilities for authentication
 */

// Email regex pattern
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Vietnamese phone: 10-11 digits, may start with 0, +84, or 84
const PHONE_REGEX = /^(\+84|84|0)[0-9]{9,10}$/

// Username: 3-50 chars, alphanumeric + underscore, must start with letter
const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_]{2,49}$/

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim())
}

export function isValidPhone(phone: string): boolean {
  return PHONE_REGEX.test(phone.trim().replace(/\s/g, ''))
}

export function isValidUsername(username: string): boolean {
  return USERNAME_REGEX.test(username.trim())
}

/**
 * Password validation: min 8 chars with complexity
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export function isValidPassword(password: string): boolean {
  if (password.length < 8) return false
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  return hasUpperCase && hasLowerCase && hasNumber
}

/**
 * Normalize input to determine if it's email, phone, or username
 */
export function normalizeIdentifier(input: string): {
  type: 'email' | 'phone' | 'username' | 'invalid'
  value: string
} {
  const trimmed = input.trim()

  if (isValidEmail(trimmed)) {
    return { type: 'email', value: trimmed.toLowerCase() }
  }

  const phoneNormalized = trimmed.replace(/\s/g, '')
  if (isValidPhone(phoneNormalized)) {
    // Normalize +84 or 84 prefix to 0 prefix
    let normalized = phoneNormalized
    if (normalized.startsWith('+84')) {
      normalized = '0' + normalized.slice(3)
    } else if (normalized.startsWith('84') && normalized.length >= 11) {
      normalized = '0' + normalized.slice(2)
    }
    return { type: 'phone', value: normalized }
  }

  // Check username last (after email/phone)
  if (isValidUsername(trimmed)) {
    return { type: 'username', value: trimmed.toLowerCase() }
  }

  return { type: 'invalid', value: trimmed }
}

/**
 * @deprecated Use normalizeIdentifier instead
 */
export function normalizeEmailOrPhone(input: string): {
  type: 'email' | 'phone' | 'invalid'
  value: string
} {
  const result = normalizeIdentifier(input)
  if (result.type === 'username') {
    return { type: 'invalid', value: result.value }
  }
  return result as { type: 'email' | 'phone' | 'invalid'; value: string }
}
