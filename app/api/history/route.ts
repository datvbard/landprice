import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/server'
import type { SearchHistoryInsert } from '@/lib/supabase/database.types'

/**
 * GET /api/history - Fetch user's search history
 * Query params: page (default 1), limit (default 20)
 */
export async function GET(request: Request) {
  try {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = (page - 1) * limit

    // Fetch history with pagination
    const { data, error, count } = await supabaseAdmin
      .from('search_history')
      .select('*', { count: 'exact' })
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching history:', error)
      return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
    }

    return NextResponse.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: offset + limit < (count || 0)
      }
    })
  } catch (error) {
    console.error('History GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/history - Save search result to history
 */
export async function POST(request: Request) {
  try {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate required fields
    const { district_name, street_name, segment_desc, area, total_price, coefficients_json, segment_id } = body

    if (!segment_desc || !area || !total_price) {
      return NextResponse.json(
        { error: 'Missing required fields: segment_desc, area, total_price' },
        { status: 400 }
      )
    }

    // Insert into search_history
    const historyRecord: SearchHistoryInsert = {
      user_id: session.user.id,
      district_name: district_name || null,
      street_name: street_name || null,
      segment_desc: segment_desc,
      area: parseFloat(area),
      total_price: parseFloat(total_price),
      coefficients_json: coefficients_json || null,
    }

    const { data, error } = await supabaseAdmin
      .from('search_history')
      .insert(historyRecord)
      .select()
      .single()

    if (error) {
      console.error('Error saving history:', error)
      return NextResponse.json({ error: 'Failed to save history' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('History POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
