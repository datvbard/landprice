'use client'

import { useState, useEffect, useCallback } from 'react'
import type { District, Street } from '@/lib/supabase/database.types'
import { getSegments, updateSegment, formatPrice, type SegmentWithPath, type UpdateSegmentInput } from '@/lib/api/admin-prices'

// Icons
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
  </svg>
)

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
  </svg>
)

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
  </svg>
)

const XIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
  </svg>
)

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  </div>
)

interface EditingCell {
  segmentId: string
  field: keyof UpdateSegmentInput
  value: string
}

export default function PricesPage() {
  const [segments, setSegments] = useState<SegmentWithPath[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [districtId, setDistrictId] = useState('')
  const [streetId, setStreetId] = useState('')
  const [districts, setDistricts] = useState<District[]>([])
  const [streets, setStreets] = useState<Street[]>([])

  // Editing state
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null)
  const [saving, setSaving] = useState(false)

  // Fetch districts for filter
  useEffect(() => {
    fetch('/api/districts')
      .then(res => res.json())
      .then(data => setDistricts(data))
      .catch(console.error)
  }, [])

  // Fetch streets when district changes
  useEffect(() => {
    if (districtId) {
      fetch(`/api/streets?districtId=${districtId}`)
        .then(res => res.json())
        .then(data => setStreets(data))
        .catch(console.error)
    } else {
      setStreets([])
      setStreetId('')
    }
  }, [districtId])

  // Fetch segments
  const fetchSegments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getSegments({
        search: search || undefined,
        districtId: districtId || undefined,
        streetId: streetId || undefined,
        page,
        pageSize: 20,
      })
      setSegments(result.data)
      setTotal(result.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }, [search, districtId, streetId, page])

  useEffect(() => {
    fetchSegments()
  }, [fetchSegments])

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchSegments()
  }

  // Start editing a cell
  const startEdit = (segment: SegmentWithPath, field: keyof UpdateSegmentInput) => {
    setEditingCell({
      segmentId: segment.id,
      field,
      value: String(segment[field]),
    })
  }

  // Cancel editing
  const cancelEdit = () => {
    setEditingCell(null)
  }

  // Save edited value
  const saveEdit = async () => {
    if (!editingCell) return

    try {
      setSaving(true)
      const updateData: UpdateSegmentInput = {
        [editingCell.field]: Number(editingCell.value),
      }
      const updated = await updateSegment(editingCell.segmentId, updateData)

      // Update local state
      setSegments(prev => prev.map(s =>
        s.id === editingCell.segmentId
          ? { ...s, [editingCell.field]: updated[editingCell.field as keyof typeof updated] }
          : s
      ))
      setEditingCell(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể lưu')
    } finally {
      setSaving(false)
    }
  }

  // Render editable cell
  const renderEditableCell = (segment: SegmentWithPath, field: keyof UpdateSegmentInput, value: number) => {
    const isEditing = editingCell?.segmentId === segment.id && editingCell?.field === field

    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={editingCell.value}
            onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
            className="w-24 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-primary/20"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit()
              if (e.key === 'Escape') cancelEdit()
            }}
          />
          <button
            onClick={saveEdit}
            disabled={saving}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
          >
            <CheckIcon />
          </button>
          <button
            onClick={cancelEdit}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
          >
            <XIcon />
          </button>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2 group">
        <span>{formatPrice(value)}</span>
        <button
          onClick={() => startEdit(segment, field)}
          className="p-1 text-gray-400 hover:text-primary hover:bg-primary/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <EditIcon />
        </button>
      </div>
    )
  }

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Giá Đất</h1>
        <p className="text-sm text-gray-500 mt-1">Tổng cộng {total} đoạn đường</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm đoạn đường..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon />
              </div>
            </div>
          </div>

          {/* District filter */}
          <select
            value={districtId}
            onChange={(e) => {
              setDistrictId(e.target.value)
              setStreetId('')
              setPage(1)
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">Tất cả quận/huyện</option>
            {districts.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {/* Street filter */}
          <select
            value={streetId}
            onChange={(e) => {
              setStreetId(e.target.value)
              setPage(1)
            }}
            disabled={!districtId}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
          >
            <option value="">Tất cả đường</option>
            {streets.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Tìm kiếm
          </button>
        </form>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">{error}</div>
          <button onClick={fetchSegments} className="px-4 py-2 bg-primary text-white rounded-lg">
            Thử lại
          </button>
        </div>
      ) : segments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-400 text-4xl mb-4">📋</div>
          <div className="text-gray-600 font-medium">
            {search || districtId ? 'Không tìm thấy kết quả' : 'Chưa có dữ liệu giá đất'}
          </div>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Vị trí</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Đoạn</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Giá min (đ/m²)</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Giá max (đ/m²)</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Giá nhà nước</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Hệ số min</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Hệ số max</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {segments.map((segment) => (
                    <tr key={segment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-800">{segment.street.name}</div>
                        <div className="text-xs text-gray-500">{segment.street.district.name}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {segment.segment_from} → {segment.segment_to}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {renderEditableCell(segment, 'base_price_min', segment.base_price_min)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {renderEditableCell(segment, 'base_price_max', segment.base_price_max)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {renderEditableCell(segment, 'government_price', segment.government_price)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {renderEditableCell(segment, 'adjustment_coef_min', segment.adjustment_coef_min)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {renderEditableCell(segment, 'adjustment_coef_max', segment.adjustment_coef_max)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Trang {page} / {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Trước
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
