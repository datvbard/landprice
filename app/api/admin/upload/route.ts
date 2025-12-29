import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/server'
import { parseExcelPreview, parseExcelFull } from '@/lib/excel/parser'
import { importExcelData } from '@/lib/excel/importer'

/**
 * POST /api/admin/upload - Upload and preview/import Excel file (admin only)
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
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (adminUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const action = formData.get('action') as 'preview' | 'import' | null

    if (!file) {
      return NextResponse.json({ error: 'Không có file được tải lên' }, { status: 400 })
    }

    // Validate file type
    const fileName = file.name.toLowerCase()
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      return NextResponse.json(
        { error: 'Chỉ chấp nhận file Excel (.xlsx, .xls)' },
        { status: 400 }
      )
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File quá lớn. Giới hạn 10MB' },
        { status: 400 }
      )
    }

    // Read file buffer
    const buffer = await file.arrayBuffer()

    if (action === 'preview' || !action) {
      // Preview mode - just parse and return structure
      const preview = parseExcelPreview(buffer)
      return NextResponse.json({ preview })
    }

    if (action === 'import') {
      // Import mode - parse and import to database
      const parsed = parseExcelFull(buffer)

      if (parsed.errors.length > 0 && parsed.districts.length === 0) {
        return NextResponse.json({
          success: false,
          errors: parsed.errors,
          stats: null,
        })
      }

      const result = await importExcelData(parsed)

      return NextResponse.json({
        success: result.success,
        stats: result.stats,
        errors: result.errors,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
