/**
 * Admin Prices API Client
 * Functions for fetching and updating segment prices (admin only)
 */
import type { Segment } from '@/lib/supabase/database.types'

export interface SegmentWithPath {
  id: string
  street_id: string
  segment_from: string
  segment_to: string
  base_price_min: number
  base_price_max: number
  government_price: number
  adjustment_coef_min: number
  adjustment_coef_max: number
  created_at: string
  updated_at: string
  street: {
    id: string
    name: string
    district: {
      id: string
      name: string
    }
  }
}

export interface SegmentsListResponse {
  data: SegmentWithPath[]
  total: number
  page: number
  pageSize: number
}

export interface UpdateSegmentInput {
  base_price_min?: number
  base_price_max?: number
  government_price?: number
  adjustment_coef_min?: number
  adjustment_coef_max?: number
}

/**
 * Get paginated list of segments with district/street info
 */
export async function getSegments(params?: {
  search?: string
  districtId?: string
  streetId?: string
  page?: number
  pageSize?: number
}): Promise<SegmentsListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.search) searchParams.set('search', params.search)
  if (params?.districtId) searchParams.set('districtId', params.districtId)
  if (params?.streetId) searchParams.set('streetId', params.streetId)
  if (params?.page) searchParams.set('page', String(params.page))
  if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize))

  const res = await fetch(`/api/admin/prices?${searchParams}`)
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Không thể tải danh sách đoạn đường')
  }
  return res.json()
}

/**
 * Update segment prices
 */
export async function updateSegment(id: string, data: UpdateSegmentInput): Promise<Segment> {
  const res = await fetch(`/api/admin/prices/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Không thể cập nhật giá')
  }
  const result = await res.json()
  return result.data
}

/**
 * Format price for display (VND)
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN').format(price)
}

/**
 * Format price with unit
 */
export function formatPriceWithUnit(price: number): string {
  if (price >= 1_000_000_000) {
    return `${(price / 1_000_000_000).toFixed(1)} tỷ`
  }
  if (price >= 1_000_000) {
    return `${(price / 1_000_000).toFixed(0)} triệu`
  }
  return `${formatPrice(price)} đ`
}
