import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/server'

type RouteParams = {
  params: Promise<{ id: string }>
}

/**
 * DELETE /api/history/[id] - Delete a history record
 * Only allows deleting own records
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params

    // Get current session
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete only if owned by user
    const { error } = await supabaseAdmin
      .from('search_history')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id)

    if (error) {
      console.error('Error deleting history:', error)
      return NextResponse.json({ error: 'Failed to delete history' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('History DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/history/[id] - Get a single history record
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params

    // Get current session
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('search_history')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'History record not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('History GET single error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
