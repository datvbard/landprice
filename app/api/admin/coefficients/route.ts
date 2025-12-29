import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/server'

type CoefficientType = 'land_type' | 'location' | 'area' | 'depth' | 'feng_shui'

const tableMap: Record<CoefficientType, string> = {
  land_type: 'land_type_coefficients',
  location: 'location_coefficients',
  area: 'area_coefficients',
  depth: 'depth_coefficients',
  feng_shui: 'feng_shui_coefficients',
}

/**
 * GET /api/admin/coefficients?type=land_type - Get coefficients by type (admin only)
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
    const type = searchParams.get('type') as CoefficientType

    if (!type || !tableMap[type]) {
      return NextResponse.json(
        { error: 'Invalid coefficient type. Use: land_type, location, area, depth, feng_shui' },
        { status: 400 }
      )
    }

    const tableName = tableMap[type]

    const { data, error } = await supabaseAdmin
      .from(tableName)
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      console.error(`Error fetching ${type} coefficients:`, error)
      return NextResponse.json({ error: 'Failed to fetch coefficients' }, { status: 500 })
    }

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error('Coefficients GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
