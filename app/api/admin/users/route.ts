import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/server'

/**
 * GET /api/admin/users - Fetch all users (admin only)
 * Query params: search (optional)
 */
export async function GET(request: Request) {
  try {
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

    // Get search param
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    // Build query - use 'user' table (Better Auth uses camelCase)
    let query = supabaseAdmin
      .from('user')
      .select('id, email, name, phone, username, role, full_name, is_active, createdAt, updatedAt', { count: 'exact' })
      .order('createdAt', { ascending: false })

    // Apply search filter
    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%,phone.ilike.%${search}%,username.ilike.%${search}%`)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    return NextResponse.json({ data: data || [], total: count || 0 })
  } catch (error) {
    console.error('Users GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/users - Create a new user (admin only)
 */
export async function POST(request: Request) {
  try {
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

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email và mật khẩu là bắt buộc' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 })
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Mật khẩu phải có ít nhất 8 ký tự' },
        { status: 400 }
      )
    }

    // Hash password using scrypt (Better Auth compatible)
    const crypto = await import('crypto')
    const { promisify } = await import('util')
    const scryptAsync = promisify(crypto.scrypt)
    const salt = crypto.randomBytes(16).toString('hex')
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer
    const hashedPassword = `${salt}:${derivedKey.toString('hex')}`

    // Generate unique IDs
    const userId = crypto.randomBytes(16).toString('base64url')
    const accountId = crypto.randomBytes(16).toString('base64url')

    // Create user directly in database (avoid session change from signUpEmail)
    const { error: userError } = await supabaseAdmin
      .from('user')
      .insert({
        id: userId,
        email,
        name: full_name || email.split('@')[0],
        phone: phone || null,
        username: username || null,
        role: role || 'user',
        full_name: full_name || null,
        is_active: is_active ?? true,
        emailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

    if (userError) {
      if (userError.code === '23505') {
        return NextResponse.json({ error: 'Email hoặc username đã tồn tại' }, { status: 409 })
      }
      console.error('Error creating user:', userError)
      return NextResponse.json({ error: 'Không thể tạo tài khoản' }, { status: 500 })
    }

    // Create account with password
    const { error: accountError } = await supabaseAdmin
      .from('account')
      .insert({
        id: accountId,
        accountId: email,
        providerId: 'credential',
        userId: userId,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

    if (accountError) {
      // Rollback user creation
      await supabaseAdmin.from('user').delete().eq('id', userId)
      console.error('Error creating account:', accountError)
      return NextResponse.json({ error: 'Không thể tạo tài khoản' }, { status: 500 })
    }

    // Fetch created user
    const { data, error } = await supabaseAdmin
      .from('user')
      .select('id, email, name, phone, username, role, full_name, is_active, createdAt, updatedAt')
      .eq('id', userId)
      .single()

    if (error) {
      // Check for duplicate email
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Email đã tồn tại' }, { status: 409 })
      }
      console.error('Error creating user:', error)
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Users POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
