/**
 * Excel Data Importer
 * Imports parsed Excel data into database with upsert logic
 */
import { supabaseAdmin } from '@/lib/supabase/server'
import type { ParsedExcel, ParsedDistrict, ParsedCoefficient } from './parser'

export interface ImportProgress {
  stage: 'districts' | 'streets' | 'segments' | 'coefficients' | 'done'
  current: number
  total: number
  message: string
}

export interface ImportResult {
  success: boolean
  stats: {
    districtsCreated: number
    districtsUpdated: number
    streetsCreated: number
    streetsUpdated: number
    segmentsCreated: number
    segmentsUpdated: number
    coefficientsUpdated: number
  }
  errors: string[]
}

/**
 * Import parsed Excel data into database
 */
export async function importExcelData(
  data: ParsedExcel,
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    stats: {
      districtsCreated: 0,
      districtsUpdated: 0,
      streetsCreated: 0,
      streetsUpdated: 0,
      segmentsCreated: 0,
      segmentsUpdated: 0,
      coefficientsUpdated: 0,
    },
    errors: [...data.errors],
  }

  try {
    // Import districts and their data
    const totalDistricts = data.districts.length
    for (let i = 0; i < totalDistricts; i++) {
      const district = data.districts[i]
      onProgress?.({
        stage: 'districts',
        current: i + 1,
        total: totalDistricts,
        message: `Đang xử lý ${district.districtName}...`,
      })

      await importDistrict(district, result)
    }

    // Import coefficients
    onProgress?.({
      stage: 'coefficients',
      current: 0,
      total: 5,
      message: 'Đang cập nhật hệ số...',
    })

    await importCoefficients(data.coefficients, result, onProgress)

    onProgress?.({
      stage: 'done',
      current: 1,
      total: 1,
      message: 'Hoàn thành!',
    })

    result.success = result.errors.length === 0
  } catch (error) {
    result.errors.push(`Lỗi hệ thống: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return result
}

/**
 * Import a district with its streets and segments
 */
async function importDistrict(district: ParsedDistrict, result: ImportResult): Promise<void> {
  // Get or create district
  const { data: existingDistrict } = await supabaseAdmin
    .from('districts')
    .select('id')
    .eq('name', district.districtName)
    .single()

  let districtId: string

  if (existingDistrict) {
    districtId = existingDistrict.id
    result.stats.districtsUpdated++
  } else {
    // Create new district
    const { data: newDistrict, error } = await supabaseAdmin
      .from('districts')
      .insert({
        code: generateCode(district.districtName),
        name: district.districtName,
        sort_order: 999,
      })
      .select('id')
      .single()

    if (error || !newDistrict) {
      result.errors.push(`Không thể tạo quận/huyện: ${district.districtName}`)
      return
    }
    districtId = newDistrict.id
    result.stats.districtsCreated++
  }

  // Group segments by street
  const streetMap = new Map<string, typeof district.segments>()
  for (const segment of district.segments) {
    const existing = streetMap.get(segment.streetName) || []
    existing.push(segment)
    streetMap.set(segment.streetName, existing)
  }

  // Import each street with its segments
  for (const [streetName, segments] of streetMap) {
    await importStreetWithSegments(districtId, streetName, segments, result)
  }
}

/**
 * Import a street with its segments
 */
async function importStreetWithSegments(
  districtId: string,
  streetName: string,
  segments: ParsedDistrict['segments'],
  result: ImportResult
): Promise<void> {
  // Get or create street
  const { data: existingStreet } = await supabaseAdmin
    .from('streets')
    .select('id')
    .eq('district_id', districtId)
    .eq('name', streetName)
    .single()

  let streetId: string

  if (existingStreet) {
    streetId = existingStreet.id
    result.stats.streetsUpdated++
  } else {
    // Create new street
    const { data: newStreet, error } = await supabaseAdmin
      .from('streets')
      .insert({
        district_id: districtId,
        code: generateCode(streetName),
        name: streetName,
      })
      .select('id')
      .single()

    if (error || !newStreet) {
      result.errors.push(`Không thể tạo đường: ${streetName}`)
      return
    }
    streetId = newStreet.id
    result.stats.streetsCreated++
  }

  // Import segments
  for (const segment of segments) {
    const segmentKey = `${segment.segmentFrom}-${segment.segmentTo}`

    // Check if segment exists
    const { data: existingSegment } = await supabaseAdmin
      .from('segments')
      .select('id')
      .eq('street_id', streetId)
      .eq('segment_from', segment.segmentFrom)
      .eq('segment_to', segment.segmentTo)
      .single()

    if (existingSegment) {
      // Update existing segment
      const { error } = await supabaseAdmin
        .from('segments')
        .update({
          base_price_min: segment.basePriceMin,
          base_price_max: segment.basePriceMax,
          government_price: segment.governmentPrice,
          adjustment_coef_min: segment.adjustmentCoefMin,
          adjustment_coef_max: segment.adjustmentCoefMax,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSegment.id)

      if (error) {
        result.errors.push(`Không thể cập nhật đoạn: ${streetName} (${segmentKey})`)
      } else {
        result.stats.segmentsUpdated++
      }
    } else {
      // Create new segment
      const { error } = await supabaseAdmin
        .from('segments')
        .insert({
          street_id: streetId,
          segment_from: segment.segmentFrom,
          segment_to: segment.segmentTo,
          base_price_min: segment.basePriceMin,
          base_price_max: segment.basePriceMax,
          government_price: segment.governmentPrice,
          adjustment_coef_min: segment.adjustmentCoefMin,
          adjustment_coef_max: segment.adjustmentCoefMax,
        })

      if (error) {
        result.errors.push(`Không thể tạo đoạn: ${streetName} (${segmentKey})`)
      } else {
        result.stats.segmentsCreated++
      }
    }
  }
}

/**
 * Import coefficients
 */
async function importCoefficients(
  coefficients: ParsedExcel['coefficients'],
  result: ImportResult,
  onProgress?: (progress: ImportProgress) => void
): Promise<void> {
  const types = [
    { key: 'landTypes', table: 'land_type_coefficients', name: 'Loại đất' },
    { key: 'locations', table: 'location_coefficients', name: 'Vị trí' },
    { key: 'areas', table: 'area_coefficients', name: 'Diện tích' },
    { key: 'depths', table: 'depth_coefficients', name: 'Chiều sâu' },
    { key: 'fengShuis', table: 'feng_shui_coefficients', name: 'Phong thủy' },
  ] as const

  for (let i = 0; i < types.length; i++) {
    const { key, table, name } = types[i]
    const items = coefficients[key]

    onProgress?.({
      stage: 'coefficients',
      current: i + 1,
      total: 5,
      message: `Đang cập nhật hệ số ${name}...`,
    })

    if (!items || items.length === 0) continue

    for (const item of items) {
      await upsertCoefficient(table, item, result)
    }
  }
}

/**
 * Upsert a single coefficient
 */
async function upsertCoefficient(
  table: string,
  item: ParsedCoefficient,
  result: ImportResult
): Promise<void> {
  // Build update data based on table type
  const updateData: Record<string, unknown> = {
    name: item.name,
    coefficient: item.coefficient,
  }

  if (item.description !== undefined) {
    updateData.description = item.description
  }
  if (item.widthMin !== undefined) {
    updateData.width_min = item.widthMin
    updateData.width_max = item.widthMax
  }
  if (item.areaMin !== undefined) {
    updateData.area_min = item.areaMin
    updateData.area_max = item.areaMax
  }
  if (item.depthMin !== undefined) {
    updateData.depth_min = item.depthMin
    updateData.depth_max = item.depthMax
  }

  // Check if exists by code
  const { data: existing } = await supabaseAdmin
    .from(table)
    .select('id')
    .eq('code', item.code)
    .single()

  if (existing) {
    // Update existing
    const { error } = await supabaseAdmin
      .from(table)
      .update(updateData)
      .eq('id', existing.id)

    if (!error) {
      result.stats.coefficientsUpdated++
    }
  } else {
    // Insert new
    const { error } = await supabaseAdmin
      .from(table)
      .insert({
        code: item.code,
        ...updateData,
        sort_order: 999,
      })

    if (!error) {
      result.stats.coefficientsUpdated++
    }
  }
}

/**
 * Generate code from name (remove accents, lowercase, replace spaces)
 */
function generateCode(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 50)
}
