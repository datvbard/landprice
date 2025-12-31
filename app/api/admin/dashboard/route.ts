import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/server'

interface DashboardStats {
  segments: number
  coefficients: number
  users: number
  searches: number
}

interface RecentSegment {
  id: string
  segment_from: string | null
  segment_to: string | null
  base_price_min: number | null
  base_price_max: number | null
  government_price: number | null
  updated_at: string | null
  streets: {
    name: string
    districts: {
      name: string
    }
  } | null
}

interface RecentSearch {
  id: string
  district_name: string
  street_name: string
  segment_desc: string | null
  area: number | null
  total_price: number | null
  created_at: string
  user_id: string
}

/**
 * GET /api/admin/dashboard - Fetch dashboard statistics (admin only)
 */
export async function GET() {
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

    // Fetch all stats in parallel
    const [segmentsResult, coefficientsResult, usersResult, searchesResult] = await Promise.all([
      supabaseAdmin.from('segments').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('coefficient_values').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('user').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('search_history').select('*', { count: 'exact', head: true }),
    ])

    const stats: DashboardStats = {
      segments: segmentsResult.count || 0,
      coefficients: coefficientsResult.count || 0,
      users: usersResult.count || 0,
      searches: searchesResult.count || 0,
    }

    // Fetch recent segments (6 rows)
    const { data: recentSegments } = await supabaseAdmin
      .from('segments')
      .select(`
        id,
        segment_from,
        segment_to,
        base_price_min,
        base_price_max,
        government_price,
        updated_at,
        streets (
          name,
          districts (
            name
          )
        )
      `)
      .order('updated_at', { ascending: false })
      .limit(6) as { data: RecentSegment[] | null }

    // Fetch recent searches (5 rows)
    const { data: recentSearches } = await supabaseAdmin
      .from('search_history')
      .select(`
        id,
        district_name,
        street_name,
        segment_desc,
        area,
        total_price,
        created_at,
        user_id
      `)
      .order('created_at', { ascending: false })
      .limit(5) as { data: RecentSearch[] | null }

    return NextResponse.json({
      stats,
      recentSegments: recentSegments || [],
      recentSearches: recentSearches || [],
    })
  } catch (error) {
    console.error('Dashboard GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
