import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/server'

type RouteParams = {
  params: Promise<{ id: string }>
}

/**
 * PUT /api/admin/prices/[id] - Update segment prices (admin only)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

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

    const body = await request.json()
    const {
      base_price_min,
      base_price_max,
      government_price,
      adjustment_coef_min,
      adjustment_coef_max,
    } = body

    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    // Validate and add numeric fields
    if (base_price_min !== undefined) {
      const val = Number(base_price_min)
      if (isNaN(val) || val < 0) {
        return NextResponse.json(
          { error: 'Giá tối thiểu phải là số không âm' },
          { status: 400 }
        )
      }
      updateData.base_price_min = val
    }

    if (base_price_max !== undefined) {
      const val = Number(base_price_max)
      if (isNaN(val) || val < 0) {
        return NextResponse.json(
          { error: 'Giá tối đa phải là số không âm' },
          { status: 400 }
        )
      }
      updateData.base_price_max = val
    }

    if (government_price !== undefined) {
      const val = Number(government_price)
      if (isNaN(val) || val < 0) {
        return NextResponse.json(
          { error: 'Giá nhà nước phải là số không âm' },
          { status: 400 }
        )
      }
      updateData.government_price = val
    }

    if (adjustment_coef_min !== undefined) {
      const val = Number(adjustment_coef_min)
      if (isNaN(val) || val < 0 || val > 10) {
        return NextResponse.json(
          { error: 'Hệ số điều chỉnh min phải từ 0 đến 10' },
          { status: 400 }
        )
      }
      updateData.adjustment_coef_min = val
    }

    if (adjustment_coef_max !== undefined) {
      const val = Number(adjustment_coef_max)
      if (isNaN(val) || val < 0 || val > 10) {
        return NextResponse.json(
          { error: 'Hệ số điều chỉnh max phải từ 0 đến 10' },
          { status: 400 }
        )
      }
      updateData.adjustment_coef_max = val
    }

    // Validate min <= max
    if (updateData.base_price_min !== undefined && updateData.base_price_max !== undefined) {
      if ((updateData.base_price_min as number) > (updateData.base_price_max as number)) {
        return NextResponse.json(
          { error: 'Giá tối thiểu không thể lớn hơn giá tối đa' },
          { status: 400 }
        )
      }
    }

    // Update segment
    const { data, error } = await supabaseAdmin
      .from('segments')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating segment:', error)
      return NextResponse.json({ error: 'Failed to update segment' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Segment not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Segment PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
