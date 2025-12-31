import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/server'

type RouteParams = {
  params: Promise<{ id: string }>
}

/**
 * PUT /api/admin/users/[id] - Update user (admin only)
 */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params

    // Verify admin session
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role from Better Auth 'user' table
    const { data: adminUser } = await supabaseAdmin
      .from('user')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (adminUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { email, phone, username, password, role, full_name, is_active } = body

    // Build update object (Better Auth uses camelCase)
    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    }

    if (email !== undefined) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 })
      }
      updateData.email = email
    }

    if (phone !== undefined) updateData.phone = phone || null
    if (username !== undefined) updateData.username = username || null
    if (role !== undefined) updateData.role = role
    if (full_name !== undefined) updateData.full_name = full_name || null
    if (is_active !== undefined) updateData.is_active = is_active

    // Handle password change through Better Auth if provided
    if (password) {
      if (password.length < 8) {
        return NextResponse.json(
          { error: 'Mật khẩu phải có ít nhất 8 ký tự' },
          { status: 400 }
        )
      }
      // Update password through Better Auth's account table
      const { scrypt, randomBytes } = await import('crypto')
      const { promisify } = await import('util')
      const scryptAsync = promisify(scrypt)
      const salt = randomBytes(16).toString('hex')
      const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer
      const hashedPassword = `${salt}:${derivedKey.toString('hex')}`

      await supabaseAdmin
        .from('account')
        .update({ password: hashedPassword })
        .eq('userId', id)
        .eq('providerId', 'credential')
    }

    // Update user in Better Auth 'user' table
    const { data, error } = await supabaseAdmin
      .from('user')
      .update(updateData)
      .eq('id', id)
      .select('id, email, name, phone, username, role, full_name, is_active, createdAt, updatedAt')
      .single()

    if (error) {
      // Check for duplicate email
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Email đã tồn tại' }, { status: 409 })
      }
      console.error('Error updating user:', error)
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('User PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/users/[id] - Delete user (admin only)
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params

    // Verify admin session
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role from Better Auth 'user' table
    const { data: adminUser } = await supabaseAdmin
      .from('user')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (adminUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    // Prevent self-deletion
    if (session.user.id === id) {
      return NextResponse.json(
        { error: 'Không thể xóa chính tài khoản của bạn' },
        { status: 400 }
      )
    }

    // Delete user from Better Auth 'user' table (cascades to 'account' and 'session')
    const { error } = await supabaseAdmin
      .from('user')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting user:', error)
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('User DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
