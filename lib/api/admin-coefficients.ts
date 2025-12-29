/**
 * Admin Coefficients API Client
 * Functions for fetching and updating coefficient values (admin only)
 */
import type {
  LandTypeCoefficient,
  LocationCoefficient,
  AreaCoefficient,
  DepthCoefficient,
  FengShuiCoefficient,
} from '@/lib/supabase/database.types'

export type CoefficientType = 'land_type' | 'location' | 'area' | 'depth' | 'feng_shui'

export type AnyCoefficient =
  | LandTypeCoefficient
  | LocationCoefficient
  | AreaCoefficient
  | DepthCoefficient
  | FengShuiCoefficient

export interface UpdateLandTypeInput {
  name?: string
  description?: string | null
  coefficient?: number
}

export interface UpdateLocationInput {
  name?: string
  description?: string | null
  width_min?: number
  width_max?: number
  coefficient?: number
}

export interface UpdateAreaInput {
  name?: string
  area_min?: number
  area_max?: number
  coefficient?: number
}

export interface UpdateDepthInput {
  name?: string
  depth_min?: number
  depth_max?: number
  coefficient?: number
}

export interface UpdateFengShuiInput {
  name?: string
  description?: string | null
  coefficient?: number
}

/**
 * Get coefficients by type
 */
export async function getCoefficientsByType(type: CoefficientType): Promise<AnyCoefficient[]> {
  const res = await fetch(`/api/admin/coefficients?type=${type}`)
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Không thể tải hệ số')
  }
  const result = await res.json()
  return result.data
}

/**
 * Update coefficient
 */
export async function updateCoefficient(
  type: CoefficientType,
  id: string,
  data: UpdateLandTypeInput | UpdateLocationInput | UpdateAreaInput | UpdateDepthInput | UpdateFengShuiInput
): Promise<AnyCoefficient> {
  const res = await fetch(`/api/admin/coefficients/${id}?type=${type}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Không thể cập nhật hệ số')
  }
  const result = await res.json()
  return result.data
}

/**
 * Get human-readable label for coefficient type
 */
export function getCoefficientTypeLabel(type: CoefficientType): string {
  const labels: Record<CoefficientType, string> = {
    land_type: 'Loại đất',
    location: 'Vị trí',
    area: 'Diện tích',
    depth: 'Chiều sâu',
    feng_shui: 'Phong thủy',
  }
  return labels[type]
}

/**
 * Get table name for coefficient type
 */
export function getCoefficientTableName(type: CoefficientType): string {
  const tables: Record<CoefficientType, string> = {
    land_type: 'land_type_coefficients',
    location: 'location_coefficients',
    area: 'area_coefficients',
    depth: 'depth_coefficients',
    feng_shui: 'feng_shui_coefficients',
  }
  return tables[type]
}

/**
 * Format coefficient for display
 */
export function formatCoefficient(value: number): string {
  return value.toFixed(2)
}
