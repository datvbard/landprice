/**
 * Excel Parser for Land Price Data
 * Parses Excel files with district sheets and coefficient sheets
 */
import * as XLSX from 'xlsx'

export interface ParsedSegment {
  streetName: string
  segmentFrom: string
  segmentTo: string
  basePriceMin: number
  basePriceMax: number
  governmentPrice: number
  adjustmentCoefMin: number
  adjustmentCoefMax: number
}

export interface ParsedDistrict {
  districtName: string
  segments: ParsedSegment[]
}

export interface ParsedCoefficient {
  code: string
  name: string
  coefficient: number
  description?: string
  // For location coefficients
  widthMin?: number
  widthMax?: number
  // For area coefficients
  areaMin?: number
  areaMax?: number
  // For depth coefficients
  depthMin?: number
  depthMax?: number
}

export interface ParsedExcel {
  districts: ParsedDistrict[]
  coefficients: {
    landTypes: ParsedCoefficient[]
    locations: ParsedCoefficient[]
    areas: ParsedCoefficient[]
    depths: ParsedCoefficient[]
    fengShuis: ParsedCoefficient[]
  }
  errors: string[]
}

export interface SheetPreview {
  name: string
  type: 'district' | 'coefficient' | 'unknown'
  headers: string[]
  rows: (string | number)[][]
  rowCount: number
}

export interface ExcelPreview {
  sheets: SheetPreview[]
  isValid: boolean
  errors: string[]
}

/**
 * Parse Excel file buffer and return preview data
 */
export function parseExcelPreview(buffer: ArrayBuffer): ExcelPreview {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheets: SheetPreview[] = []
  const errors: string[] = []

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, { header: 1 })

    if (data.length === 0) {
      errors.push(`Sheet "${sheetName}" trống`)
      continue
    }

    const headers = (data[0] || []).map(h => String(h || ''))
    const rows = data.slice(1, 11) // First 10 data rows for preview
    const rowCount = data.length - 1

    // Detect sheet type
    let type: 'district' | 'coefficient' | 'unknown' = 'unknown'
    const lowerName = sheetName.toLowerCase()

    if (lowerName.includes('quận') || lowerName.includes('huyện') || lowerName.includes('district')) {
      type = 'district'
    } else if (
      lowerName.includes('loại đất') || lowerName.includes('vị trí') ||
      lowerName.includes('diện tích') || lowerName.includes('chiều sâu') ||
      lowerName.includes('phong thủy') || lowerName.includes('hệ số') ||
      lowerName.includes('coefficient')
    ) {
      type = 'coefficient'
    }

    sheets.push({
      name: sheetName,
      type,
      headers,
      rows,
      rowCount,
    })
  }

  return {
    sheets,
    isValid: errors.length === 0 && sheets.length > 0,
    errors,
  }
}

/**
 * Parse Excel file and extract all data
 */
export function parseExcelFull(buffer: ArrayBuffer): ParsedExcel {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const result: ParsedExcel = {
    districts: [],
    coefficients: {
      landTypes: [],
      locations: [],
      areas: [],
      depths: [],
      fengShuis: [],
    },
    errors: [],
  }

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)

    if (data.length === 0) {
      result.errors.push(`Sheet "${sheetName}" trống`)
      continue
    }

    const lowerName = sheetName.toLowerCase()

    // Parse district sheets
    if (lowerName.includes('quận') || lowerName.includes('huyện') || lowerName.includes('district')) {
      const segments = parseDistrictSheet(data, sheetName, result.errors)
      if (segments.length > 0) {
        result.districts.push({
          districtName: extractDistrictName(sheetName),
          segments,
        })
      }
    }
    // Parse coefficient sheets
    else if (lowerName.includes('loại đất') || lowerName.includes('land_type')) {
      result.coefficients.landTypes = parseLandTypeSheet(data, result.errors)
    }
    else if (lowerName.includes('vị trí') || lowerName.includes('location')) {
      result.coefficients.locations = parseLocationSheet(data, result.errors)
    }
    else if (lowerName.includes('diện tích') || lowerName.includes('area')) {
      result.coefficients.areas = parseAreaSheet(data, result.errors)
    }
    else if (lowerName.includes('chiều sâu') || lowerName.includes('depth')) {
      result.coefficients.depths = parseDepthSheet(data, result.errors)
    }
    else if (lowerName.includes('phong thủy') || lowerName.includes('feng_shui')) {
      result.coefficients.fengShuis = parseFengShuiSheet(data, result.errors)
    }
  }

  return result
}

/**
 * Extract district name from sheet name
 */
function extractDistrictName(sheetName: string): string {
  // Remove common prefixes/suffixes
  let name = sheetName
    .replace(/^(quận|huyện|q\.|h\.)/i, '')
    .replace(/district/i, '')
    .trim()

  // Capitalize first letter
  if (name.length > 0) {
    name = name.charAt(0).toUpperCase() + name.slice(1)
  }

  return name || sheetName
}

/**
 * Parse district sheet (segments data)
 */
function parseDistrictSheet(
  data: Record<string, unknown>[],
  sheetName: string,
  errors: string[]
): ParsedSegment[] {
  const segments: ParsedSegment[] = []

  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    const rowNum = i + 2 // Excel row number (1-indexed + header)

    // Find columns by various possible names
    const streetName = findValue(row, ['tên đường', 'đường', 'street', 'street_name', 'ten_duong'])
    const segmentFrom = findValue(row, ['từ', 'đoạn từ', 'from', 'segment_from', 'tu'])
    const segmentTo = findValue(row, ['đến', 'đoạn đến', 'to', 'segment_to', 'den'])
    const basePriceMin = findNumber(row, ['giá min', 'giá tối thiểu', 'base_price_min', 'gia_min', 'price_min'])
    const basePriceMax = findNumber(row, ['giá max', 'giá tối đa', 'base_price_max', 'gia_max', 'price_max'])
    const governmentPrice = findNumber(row, ['giá nhà nước', 'giá nn', 'government_price', 'gia_nn'])
    const adjustmentCoefMin = findNumber(row, ['hệ số min', 'hs min', 'adjustment_coef_min', 'coef_min']) || 1
    const adjustmentCoefMax = findNumber(row, ['hệ số max', 'hs max', 'adjustment_coef_max', 'coef_max']) || 1

    if (!streetName) {
      errors.push(`[${sheetName}] Dòng ${rowNum}: Thiếu tên đường`)
      continue
    }

    segments.push({
      streetName: String(streetName),
      segmentFrom: String(segmentFrom || 'Đầu đường'),
      segmentTo: String(segmentTo || 'Cuối đường'),
      basePriceMin: basePriceMin || 0,
      basePriceMax: basePriceMax || basePriceMin || 0,
      governmentPrice: governmentPrice || 0,
      adjustmentCoefMin,
      adjustmentCoefMax,
    })
  }

  return segments
}

/**
 * Parse land type coefficients sheet
 */
function parseLandTypeSheet(data: Record<string, unknown>[], errors: string[]): ParsedCoefficient[] {
  const coefficients: ParsedCoefficient[] = []

  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    const code = findValue(row, ['mã', 'code', 'ma'])
    const name = findValue(row, ['tên', 'loại đất', 'name', 'ten'])
    const coefficient = findNumber(row, ['hệ số', 'coefficient', 'he_so'])
    const description = findValue(row, ['mô tả', 'description', 'mo_ta'])

    if (!code || !name) continue

    coefficients.push({
      code: String(code),
      name: String(name),
      coefficient: coefficient || 1,
      description: description ? String(description) : undefined,
    })
  }

  return coefficients
}

/**
 * Parse location coefficients sheet
 */
function parseLocationSheet(data: Record<string, unknown>[], errors: string[]): ParsedCoefficient[] {
  const coefficients: ParsedCoefficient[] = []

  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    const code = findValue(row, ['mã', 'code', 'ma'])
    const name = findValue(row, ['tên', 'vị trí', 'name', 'ten'])
    const coefficient = findNumber(row, ['hệ số', 'coefficient', 'he_so'])
    const description = findValue(row, ['mô tả', 'description', 'mo_ta'])
    const widthMin = findNumber(row, ['độ rộng min', 'width_min', 'do_rong_min'])
    const widthMax = findNumber(row, ['độ rộng max', 'width_max', 'do_rong_max'])

    if (!code || !name) continue

    coefficients.push({
      code: String(code),
      name: String(name),
      coefficient: coefficient || 1,
      description: description ? String(description) : undefined,
      widthMin: widthMin || 0,
      widthMax: widthMax || 999,
    })
  }

  return coefficients
}

/**
 * Parse area coefficients sheet
 */
function parseAreaSheet(data: Record<string, unknown>[], errors: string[]): ParsedCoefficient[] {
  const coefficients: ParsedCoefficient[] = []

  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    const code = findValue(row, ['mã', 'code', 'ma'])
    const name = findValue(row, ['tên', 'name', 'ten'])
    const coefficient = findNumber(row, ['hệ số', 'coefficient', 'he_so'])
    const areaMin = findNumber(row, ['diện tích min', 'area_min', 'dien_tich_min'])
    const areaMax = findNumber(row, ['diện tích max', 'area_max', 'dien_tich_max'])

    if (!code || !name) continue

    coefficients.push({
      code: String(code),
      name: String(name),
      coefficient: coefficient || 1,
      areaMin: areaMin || 0,
      areaMax: areaMax || 99999,
    })
  }

  return coefficients
}

/**
 * Parse depth coefficients sheet
 */
function parseDepthSheet(data: Record<string, unknown>[], errors: string[]): ParsedCoefficient[] {
  const coefficients: ParsedCoefficient[] = []

  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    const code = findValue(row, ['mã', 'code', 'ma'])
    const name = findValue(row, ['tên', 'name', 'ten'])
    const coefficient = findNumber(row, ['hệ số', 'coefficient', 'he_so'])
    const depthMin = findNumber(row, ['chiều sâu min', 'depth_min', 'chieu_sau_min'])
    const depthMax = findNumber(row, ['chiều sâu max', 'depth_max', 'chieu_sau_max'])

    if (!code || !name) continue

    coefficients.push({
      code: String(code),
      name: String(name),
      coefficient: coefficient || 1,
      depthMin: depthMin || 0,
      depthMax: depthMax || 999,
    })
  }

  return coefficients
}

/**
 * Parse feng shui coefficients sheet
 */
function parseFengShuiSheet(data: Record<string, unknown>[], errors: string[]): ParsedCoefficient[] {
  const coefficients: ParsedCoefficient[] = []

  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    const code = findValue(row, ['mã', 'code', 'ma'])
    const name = findValue(row, ['tên', 'name', 'ten'])
    const coefficient = findNumber(row, ['hệ số', 'coefficient', 'he_so'])
    const description = findValue(row, ['mô tả', 'description', 'mo_ta'])

    if (!code || !name) continue

    coefficients.push({
      code: String(code),
      name: String(name),
      coefficient: coefficient || 1,
      description: description ? String(description) : undefined,
    })
  }

  return coefficients
}

/**
 * Find value in row by possible column names
 */
function findValue(row: Record<string, unknown>, possibleKeys: string[]): unknown {
  for (const key of possibleKeys) {
    // Check exact match
    if (row[key] !== undefined) return row[key]
    // Check case-insensitive
    const lowerKey = key.toLowerCase()
    for (const rowKey of Object.keys(row)) {
      if (rowKey.toLowerCase() === lowerKey) return row[rowKey]
    }
  }
  return undefined
}

/**
 * Find numeric value in row by possible column names
 */
function findNumber(row: Record<string, unknown>, possibleKeys: string[]): number | undefined {
  const value = findValue(row, possibleKeys)
  if (value === undefined || value === null || value === '') return undefined
  const num = Number(value)
  return isNaN(num) ? undefined : num
}
