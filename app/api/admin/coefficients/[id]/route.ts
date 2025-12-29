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

type RouteParams = {
  params: Promise<{ id: string }>
}

/**
 * PUT /api/admin/coefficients/[id]?type=land_type - Update coefficient (admin only)
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

    // Parse query params
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') as CoefficientType

    if (!type || !tableMap[type]) {
      return NextResponse.json(
        { error: 'Invalid coefficient type' },
        { status: 400 }
      )
    }

    const tableName = tableMap[type]
    const body = await request.json()

    // Build update object based on type
    const updateData: Record<string, unknown> = {}

    // Common fields
    if (body.name !== undefined) {
      if (!body.name.trim()) {
        return NextResponse.json({ error: 'Tên không được để trống' }, { status: 400 })
      }
      updateData.name = body.name.trim()
    }

    if (body.coefficient !== undefined) {
      const val = Number(body.coefficient)
      if (isNaN(val) || val < 0 || val > 10) {
        return NextResponse.json(
          { error: 'Hệ số phải là số từ 0 đến 10' },
          { status: 400 }
        )
      }
      updateData.coefficient = val
    }

    // Type-specific fields
    if (type === 'land_type' || type === 'feng_shui') {
      if (body.description !== undefined) {
        updateData.description = body.description || null
      }
    }

    if (type === 'location') {
      if (body.description !== undefined) {
        updateData.description = body.description || null
      }
      if (body.width_min !== undefined) {
        const val = Number(body.width_min)
        if (isNaN(val) || val < 0) {
          return NextResponse.json({ error: 'Độ rộng tối thiểu không hợp lệ' }, { status: 400 })
        }
        updateData.width_min = val
      }
      if (body.width_max !== undefined) {
        const val = Number(body.width_max)
        if (isNaN(val) || val < 0) {
          return NextResponse.json({ error: 'Độ rộng tối đa không hợp lệ' }, { status: 400 })
        }
        updateData.width_max = val
      }
    }

    if (type === 'area') {
      if (body.area_min !== undefined) {
        const val = Number(body.area_min)
        if (isNaN(val) || val < 0) {
          return NextResponse.json({ error: 'Diện tích tối thiểu không hợp lệ' }, { status: 400 })
        }
        updateData.area_min = val
      }
      if (body.area_max !== undefined) {
        const val = Number(body.area_max)
        if (isNaN(val) || val < 0) {
          return NextResponse.json({ error: 'Diện tích tối đa không hợp lệ' }, { status: 400 })
        }
        updateData.area_max = val
      }
    }

    if (type === 'depth') {
      if (body.depth_min !== undefined) {
        const val = Number(body.depth_min)
        if (isNaN(val) || val < 0) {
          return NextResponse.json({ error: 'Chiều sâu tối thiểu không hợp lệ' }, { status: 400 })
        }
        updateData.depth_min = val
      }
      if (body.depth_max !== undefined) {
        const val = Number(body.depth_max)
        if (isNaN(val) || val < 0) {
          return NextResponse.json({ error: 'Chiều sâu tối đa không hợp lệ' }, { status: 400 })
        }
        updateData.depth_max = val
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Không có dữ liệu để cập nhật' }, { status: 400 })
    }

    // Update coefficient
    const { data, error } = await supabaseAdmin
      .from(tableName)
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error(`Error updating ${type} coefficient:`, error)
      return NextResponse.json({ error: 'Failed to update coefficient' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Coefficient not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Coefficient PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
