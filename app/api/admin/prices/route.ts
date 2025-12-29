import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/server'

/**
 * GET /api/admin/prices - Get paginated segments with prices (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin session
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const { data: adminUser } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (adminUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    // Parse query params
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const districtId = searchParams.get('districtId') || ''
    const streetId = searchParams.get('streetId') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10)
    const offset = (page - 1) * pageSize

    // Build query for segments with street and district info
    let query = supabaseAdmin
      .from('segments')
      .select(`
        *,
        street:streets!inner(
          id,
          name,
          district:districts!inner(id, name)
        )
      `, { count: 'exact' })

    // Filter by street
    if (streetId) {
      query = query.eq('street_id', streetId)
    } else if (districtId) {
      // Filter by district through streets
      query = query.eq('street.district.id', districtId)
    }

    // Search filter (search in street name or segment description)
    if (search) {
      query = query.or(`segment_from.ilike.%${search}%,segment_to.ilike.%${search}%`)
    }

    // Order and paginate
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching segments:', error)
      return NextResponse.json({ error: 'Failed to fetch segments' }, { status: 500 })
    }

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      page,
      pageSize,
    })
  } catch (error) {
    console.error('Prices GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
