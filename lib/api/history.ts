import type { SearchHistory, Json } from '@/lib/supabase/database.types'

/**
 * History API client functions
 * Used for fetching, saving, and deleting search history records
 */

// Response types
export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export interface HistoryListResponse {
  data: SearchHistory[]
  pagination: PaginationInfo
}

export interface SaveHistoryInput {
  district_name?: string
  street_name?: string
  segment_desc: string
  area: number
  total_price: number
  coefficients_json?: Json
  segment_id?: string
}

// Error handling
class HistoryApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'HistoryApiError'
    this.status = status
  }
}

/**
 * Fetch user's search history with pagination
 */
export async function getHistory(page = 1, limit = 20): Promise<HistoryListResponse> {
  const res = await fetch(`/api/history?page=${page}&limit=${limit}`)
  const data = await res.json()

  if (!res.ok) {
    throw new HistoryApiError(data.error || 'Failed to fetch history', res.status)
  }

  return data
}

/**
 * Save a search result to history
 */
export async function saveHistory(input: SaveHistoryInput): Promise<SearchHistory> {
  const res = await fetch('/api/history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const data = await res.json()

  if (!res.ok) {
    throw new HistoryApiError(data.error || 'Failed to save history', res.status)
  }

  return data.data
}

/**
 * Delete a history record by ID
 */
export async function deleteHistory(id: string): Promise<void> {
  const res = await fetch(`/api/history/${id}`, {
    method: 'DELETE',
  })

  if (!res.ok) {
    const data = await res.json()
    throw new HistoryApiError(data.error || 'Failed to delete history', res.status)
  }
}

/**
 * Get a single history record by ID
 */
export async function getHistoryById(id: string): Promise<SearchHistory> {
  const res = await fetch(`/api/history/${id}`)
  const data = await res.json()

  if (!res.ok) {
    throw new HistoryApiError(data.error || 'History not found', res.status)
  }

  return data
}

/**
 * Format price for display (e.g., "1.665 tỷ")
 */
export function formatHistoryPrice(price: number): string {
  if (price >= 1_000_000_000) {
    const billions = price / 1_000_000_000
    return `${billions.toFixed(3).replace(/\.?0+$/, '')} tỷ`
  } else if (price >= 1_000_000) {
    const millions = price / 1_000_000
    return `${millions.toFixed(0)} triệu`
  }
  return `${price.toLocaleString('vi-VN')} đồng`
}

/**
 * Format date for display (e.g., "10:30 - Hôm nay")
 */
export function formatHistoryDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const time = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

  const isToday = date.toDateString() === now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = date.toDateString() === yesterday.toDateString()

  if (isToday) {
    return `${time} - Hôm nay`
  }
  if (isYesterday) {
    return `${time} - Hôm qua`
  }

  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  return `${time} - ${day}/${month}`
}
