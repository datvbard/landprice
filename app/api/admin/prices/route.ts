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

    // Check admin role from Better Auth 'user' table
    const { data: adminUser } = await supabaseAdmin
      .from('user')
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
      // Get street IDs for this district first, then filter segments
      const { data: districtStreets } = await supabaseAdmin
        .from('streets')
        .select('id')
        .eq('district_id', districtId)

      if (districtStreets && districtStreets.length > 0) {
        const streetIds = districtStreets.map(s => s.id)
        query = query.in('street_id', streetIds)
      } else {
        // No streets in this district, return empty
        return NextResponse.json({
          data: [],
          total: 0,
          page,
          pageSize,
        })
      }
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

/**
 * POST /api/admin/prices - Create a new segment (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const { data: adminUser } = await supabaseAdmin
      .from('user')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (adminUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const {
      district_name,
      street_name,
      segment_from,
      segment_to,
      base_price_min,
      base_price_max,
      government_price,
      adjustment_coef_min,
      adjustment_coef_max,
    } = body

    // Validate required fields
    if (!district_name || !street_name || !segment_from || !segment_to) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 })
    }

    // Find or create district
    let { data: district } = await supabaseAdmin
      .from('districts')
      .select('id')
      .eq('name', district_name.trim())
      .single()

    if (!district) {
      // Generate code from name (e.g., "TP. Trà Vinh" -> "TPTV")
      const districtCode = district_name.trim()
        .split(/\s+/)
        .map((w: string) => w.charAt(0).toUpperCase())
        .join('')
        .substring(0, 10)

      // Get max sort_order
      const { data: maxOrder } = await supabaseAdmin
        .from('districts')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)
        .single()

      const { data: newDistrict, error: districtError } = await supabaseAdmin
        .from('districts')
        .insert({
          name: district_name.trim(),
          code: districtCode,
          sort_order: (maxOrder?.sort_order || 0) + 1,
        })
        .select('id')
        .single()

      if (districtError) {
        console.error('Error creating district:', districtError)
        return NextResponse.json({ error: 'Không thể tạo quận/huyện' }, { status: 500 })
      }
      district = newDistrict
    }

    // Find or create street
    let { data: street } = await supabaseAdmin
      .from('streets')
      .select('id')
      .eq('name', street_name.trim())
      .eq('district_id', district.id)
      .single()

    if (!street) {
      const { data: newStreet, error: streetError } = await supabaseAdmin
        .from('streets')
        .insert({ name: street_name.trim(), district_id: district.id })
        .select('id')
        .single()

      if (streetError) {
        return NextResponse.json({ error: 'Không thể tạo đường' }, { status: 500 })
      }
      street = newStreet
    }

    // Create segment
    const { data: segment, error: segmentError } = await supabaseAdmin
      .from('segments')
      .insert({
        street_id: street.id,
        segment_from: segment_from.trim(),
        segment_to: segment_to.trim(),
        base_price_min: base_price_min || 0,
        base_price_max: base_price_max || 0,
        government_price: government_price || 0,
        adjustment_coef_min: adjustment_coef_min || 1,
        adjustment_coef_max: adjustment_coef_max || 1,
      })
      .select(`
        *,
        street:streets(
          id,
          name,
          district:districts(id, name)
        )
      `)
      .single()

    if (segmentError) {
      console.error('Error creating segment:', segmentError)
      return NextResponse.json({ error: 'Không thể tạo đoạn đường' }, { status: 500 })
    }

    return NextResponse.json({ data: segment }, { status: 201 })
  } catch (error) {
    console.error('Prices POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/prices - Delete all segments (admin only)
 * WARNING: This deletes ALL price data!
 */
export async function DELETE() {
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

    // Delete all segments first (due to FK constraint)
    const { error: segmentError } = await supabaseAdmin
      .from('segments')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (segmentError) {
      console.error('Error deleting segments:', segmentError)
      return NextResponse.json({ error: 'Failed to delete segments' }, { status: 500 })
    }

    // Delete all streets
    const { error: streetError } = await supabaseAdmin
      .from('streets')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (streetError) {
      console.error('Error deleting streets:', streetError)
      return NextResponse.json({ error: 'Failed to delete streets' }, { status: 500 })
    }

    // Delete all districts
    const { error: districtError } = await supabaseAdmin
      .from('districts')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (districtError) {
      console.error('Error deleting districts:', districtError)
      return NextResponse.json({ error: 'Failed to delete districts' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Đã xóa tất cả dữ liệu giá đất' })
  } catch (error) {
    console.error('Prices DELETE all error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
