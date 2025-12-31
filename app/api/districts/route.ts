import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

/**
 * GET /api/districts - Get districts that have segments data
 * Only returns districts with actual price data
 */
export async function GET() {
  // Get unique districts from streets that have segments
  const { data: streets, error } = await supabase
    .from('streets')
    .select(`
      district_id,
      districts (
        id,
        code,
        name,
        sort_order
      ),
      segments!inner(id)
    `)

  if (error) {
    console.error('Error fetching districts:', error)
    return NextResponse.json([])
  }

  // Extract unique districts
  const districtMap = new Map<string, { id: string; code: string; name: string; sort_order: number }>()
  for (const street of streets || []) {
    const d = street.districts as { id: string; code: string; name: string; sort_order: number } | null
    if (d && !districtMap.has(d.id)) {
      districtMap.set(d.id, d)
    }
  }

  // Sort by sort_order
  const districts = Array.from(districtMap.values()).sort((a, b) => a.sort_order - b.sort_order)

  return NextResponse.json(districts)
}
