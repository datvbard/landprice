'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getCoefficientsByType,
  updateCoefficient,
  getCoefficientTypeLabel,
  formatCoefficient,
  type CoefficientType,
  type AnyCoefficient,
} from '@/lib/api/admin-coefficients'
import type {
  LandTypeCoefficient,
  LocationCoefficient,
  AreaCoefficient,
  DepthCoefficient,
  FengShuiCoefficient,
} from '@/lib/supabase/database.types'

// Icons
const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
  </svg>
)

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

const COEFFICIENT_TYPES: CoefficientType[] = ['land_type', 'location', 'area', 'depth', 'feng_shui']

export default function CoefficientsPage() {
  const [activeTab, setActiveTab] = useState<CoefficientType>('land_type')
  const [coefficients, setCoefficients] = useState<AnyCoefficient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Edit modal state
  const [editingItem, setEditingItem] = useState<AnyCoefficient | null>(null)
  const [editForm, setEditForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  // Fetch coefficients
  const fetchCoefficients = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getCoefficientsByType(activeTab)
      setCoefficients(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    fetchCoefficients()
  }, [fetchCoefficients])

  // Open edit modal
  const openEdit = (item: AnyCoefficient) => {
    setEditingItem(item)
    // Initialize form based on coefficient type
    const form: Record<string, string> = {
      name: item.name,
      coefficient: String(item.coefficient),
    }

    if ('description' in item) {
      form.description = item.description || ''
    }
    if ('width_min' in item) {
      form.width_min = String((item as LocationCoefficient).width_min)
      form.width_max = String((item as LocationCoefficient).width_max)
    }
    if ('area_min' in item) {
      form.area_min = String((item as AreaCoefficient).area_min)
      form.area_max = String((item as AreaCoefficient).area_max)
    }
    if ('depth_min' in item) {
      form.depth_min = String((item as DepthCoefficient).depth_min)
      form.depth_max = String((item as DepthCoefficient).depth_max)
    }

    setEditForm(form)
  }

  // Close edit modal
  const closeEdit = () => {
    setEditingItem(null)
    setEditForm({})
  }

  // Save edited coefficient
  const saveEdit = async () => {
    if (!editingItem) return

    try {
      setSaving(true)

      // Build update data based on type
      const updateData: Record<string, unknown> = {
        name: editForm.name,
        coefficient: Number(editForm.coefficient),
      }

      if (activeTab === 'land_type' || activeTab === 'feng_shui') {
        updateData.description = editForm.description || null
      }

      if (activeTab === 'location') {
        updateData.description = editForm.description || null
        updateData.width_min = Number(editForm.width_min)
        updateData.width_max = Number(editForm.width_max)
      }

      if (activeTab === 'area') {
        updateData.area_min = Number(editForm.area_min)
        updateData.area_max = Number(editForm.area_max)
      }

      if (activeTab === 'depth') {
        updateData.depth_min = Number(editForm.depth_min)
        updateData.depth_max = Number(editForm.depth_max)
      }

      const updated = await updateCoefficient(activeTab, editingItem.id, updateData)

      // Update local state
      setCoefficients(prev => prev.map(c => c.id === editingItem.id ? updated : c))
      closeEdit()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể lưu')
    } finally {
      setSaving(false)
    }
  }

  // Render table based on coefficient type
  const renderTable = () => {
    if (loading) return <LoadingSpinner />

    if (error) {
      return (
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">{error}</div>
          <button onClick={fetchCoefficients} className="px-4 py-2 bg-primary text-white rounded-lg">
            Thử lại
          </button>
        </div>
      )
    }

    if (coefficients.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-400 text-4xl mb-4">📊</div>
          <div className="text-gray-600 font-medium">Chưa có dữ liệu hệ số</div>
        </div>
      )
    }

    switch (activeTab) {
      case 'land_type':
        return renderLandTypeTable(coefficients as LandTypeCoefficient[])
      case 'location':
        return renderLocationTable(coefficients as LocationCoefficient[])
      case 'area':
        return renderAreaTable(coefficients as AreaCoefficient[])
      case 'depth':
        return renderDepthTable(coefficients as DepthCoefficient[])
      case 'feng_shui':
        return renderFengShuiTable(coefficients as FengShuiCoefficient[])
    }
  }

  const renderLandTypeTable = (items: LandTypeCoefficient[]) => (
    <table className="w-full">
      <thead className="bg-gray-50 border-b">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Mã</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tên loại đất</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Mô tả</th>
          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Hệ số</th>
          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {items.map(item => (
          <tr key={item.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 text-sm font-mono text-gray-600">{item.code}</td>
            <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.name}</td>
            <td className="px-4 py-3 text-sm text-gray-500">{item.description || '-'}</td>
            <td className="px-4 py-3 text-sm text-right font-medium">{formatCoefficient(item.coefficient)}</td>
            <td className="px-4 py-3 text-right">
              <button onClick={() => openEdit(item)} className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg">
                <EditIcon />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )

  const renderLocationTable = (items: LocationCoefficient[]) => (
    <table className="w-full">
      <thead className="bg-gray-50 border-b">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Mã</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tên vị trí</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Mô tả</th>
          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Độ rộng (m)</th>
          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Hệ số</th>
          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {items.map(item => (
          <tr key={item.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 text-sm font-mono text-gray-600">{item.code}</td>
            <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.name}</td>
            <td className="px-4 py-3 text-sm text-gray-500">{item.description || '-'}</td>
            <td className="px-4 py-3 text-sm text-right">{item.width_min} - {item.width_max}</td>
            <td className="px-4 py-3 text-sm text-right font-medium">{formatCoefficient(item.coefficient)}</td>
            <td className="px-4 py-3 text-right">
              <button onClick={() => openEdit(item)} className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg">
                <EditIcon />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )

  const renderAreaTable = (items: AreaCoefficient[]) => (
    <table className="w-full">
      <thead className="bg-gray-50 border-b">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Mã</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tên</th>
          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Diện tích (m²)</th>
          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Hệ số</th>
          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {items.map(item => (
          <tr key={item.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 text-sm font-mono text-gray-600">{item.code}</td>
            <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.name}</td>
            <td className="px-4 py-3 text-sm text-right">{item.area_min} - {item.area_max}</td>
            <td className="px-4 py-3 text-sm text-right font-medium">{formatCoefficient(item.coefficient)}</td>
            <td className="px-4 py-3 text-right">
              <button onClick={() => openEdit(item)} className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg">
                <EditIcon />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )

  const renderDepthTable = (items: DepthCoefficient[]) => (
    <table className="w-full">
      <thead className="bg-gray-50 border-b">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Mã</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tên</th>
          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Chiều sâu (m)</th>
          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Hệ số</th>
          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {items.map(item => (
          <tr key={item.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 text-sm font-mono text-gray-600">{item.code}</td>
            <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.name}</td>
            <td className="px-4 py-3 text-sm text-right">{item.depth_min} - {item.depth_max}</td>
            <td className="px-4 py-3 text-sm text-right font-medium">{formatCoefficient(item.coefficient)}</td>
            <td className="px-4 py-3 text-right">
              <button onClick={() => openEdit(item)} className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg">
                <EditIcon />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )

  const renderFengShuiTable = (items: FengShuiCoefficient[]) => (
    <table className="w-full">
      <thead className="bg-gray-50 border-b">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Mã</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tên</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Mô tả</th>
          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Hệ số</th>
          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {items.map(item => (
          <tr key={item.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 text-sm font-mono text-gray-600">{item.code}</td>
            <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.name}</td>
            <td className="px-4 py-3 text-sm text-gray-500">{item.description || '-'}</td>
            <td className="px-4 py-3 text-sm text-right font-medium">{formatCoefficient(item.coefficient)}</td>
            <td className="px-4 py-3 text-right">
              <button onClick={() => openEdit(item)} className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg">
                <EditIcon />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )

  // Render edit form fields based on type
  const renderEditFields = () => {
    return (
      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
          <input
            type="text"
            value={editForm.name || ''}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Description - for land_type, location, feng_shui */}
        {(activeTab === 'land_type' || activeTab === 'location' || activeTab === 'feng_shui') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea
              value={editForm.description || ''}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              rows={2}
            />
          </div>
        )}

        {/* Width range - for location */}
        {activeTab === 'location' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Độ rộng min (m)</label>
              <input
                type="number"
                step="0.1"
                value={editForm.width_min || ''}
                onChange={(e) => setEditForm({ ...editForm, width_min: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Độ rộng max (m)</label>
              <input
                type="number"
                step="0.1"
                value={editForm.width_max || ''}
                onChange={(e) => setEditForm({ ...editForm, width_max: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        )}

        {/* Area range - for area */}
        {activeTab === 'area' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diện tích min (m²)</label>
              <input
                type="number"
                value={editForm.area_min || ''}
                onChange={(e) => setEditForm({ ...editForm, area_min: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diện tích max (m²)</label>
              <input
                type="number"
                value={editForm.area_max || ''}
                onChange={(e) => setEditForm({ ...editForm, area_max: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        )}

        {/* Depth range - for depth */}
        {activeTab === 'depth' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chiều sâu min (m)</label>
              <input
                type="number"
                step="0.1"
                value={editForm.depth_min || ''}
                onChange={(e) => setEditForm({ ...editForm, depth_min: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chiều sâu max (m)</label>
              <input
                type="number"
                step="0.1"
                value={editForm.depth_max || ''}
                onChange={(e) => setEditForm({ ...editForm, depth_max: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        )}

        {/* Coefficient */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hệ số</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="10"
            value={editForm.coefficient || ''}
            onChange={(e) => setEditForm({ ...editForm, coefficient: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Hệ Số</h1>
        <p className="text-sm text-gray-500 mt-1">Quản lý các hệ số điều chỉnh giá đất</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="flex border-b overflow-x-auto">
          {COEFFICIENT_TYPES.map(type => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === type
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {getCoefficientTypeLabel(type)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {renderTable()}
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeEdit} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                Chỉnh sửa {getCoefficientTypeLabel(activeTab)}
              </h2>
              <button
                onClick={closeEdit}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Form */}
            <div className="p-4">
              {renderEditFields()}
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-4 border-t">
              <button
                onClick={closeEdit}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
              >
                {saving ? 'Đang lưu...' : 'Cập nhật'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
