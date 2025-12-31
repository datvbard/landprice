'use client'

import { useState, useEffect, useCallback } from 'react'
import StatCard from '@/components/admin/stat-card'
import DataTable, { TableActions } from '@/components/admin/data-table'
import ActivityItem from '@/components/admin/activity-item'

// Types
interface DashboardStats {
  segments: number
  coefficients: number
  users: number
  searches: number
}

interface RecentSegment {
  id: string
  segment_from: string | null
  segment_to: string | null
  base_price_min: number | null
  base_price_max: number | null
  government_price: number | null
  updated_at: string | null
  streets: {
    name: string
    districts: {
      name: string
    }
  } | null
}

interface RecentSearch {
  id: string
  district_name: string
  street_name: string
  segment_desc: string | null
  area: number | null
  total_price: number | null
  created_at: string
  user_id: string
}

interface DashboardData {
  stats: DashboardStats
  recentSegments: RecentSegment[]
  recentSearches: RecentSearch[]
}

// Icons for stats
const LocationIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
  </svg>
)

const CalculatorIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
  </svg>
)

const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
  </svg>
)

const SearchIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
  </svg>
)

// Activity icon
const SearchActivityIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
  </svg>
)

// Format number with locale
function formatNumber(num: number): string {
  return num.toLocaleString('vi-VN')
}

// Format price with unit
function formatPrice(price: number | null): string {
  if (!price) return '-'
  return formatNumber(price)
}

// Format relative time
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Vừa xong'
  if (diffMins < 60) return `${diffMins} phút trước`
  if (diffHours < 24) return `${diffHours} giờ trước`
  if (diffDays < 7) return `${diffDays} ngày trước`
  return date.toLocaleDateString('vi-VN')
}

// Table columns
const columns = [
  { key: 'stt', header: 'STT', className: 'w-[50px] text-center font-medium text-gray-500' },
  { key: 'district', header: 'Địa phương', className: 'font-medium text-gray-700' },
  { key: 'street', header: 'Tên đường', className: 'font-semibold text-gray-800' },
  { key: 'segmentFrom', header: 'Đoạn (Từ)', className: 'text-gray-600 text-xs max-w-[150px] truncate' },
  { key: 'segmentTo', header: 'Đoạn (Đến)', className: 'text-gray-600 text-xs max-w-[150px] truncate' },
  { key: 'priceUbnd', header: 'Giá UBND', className: 'text-right font-semibold text-gray-600' },
  { key: 'priceLow', header: 'Giá thấp', className: 'text-right font-semibold text-cyan-600' },
  { key: 'priceHigh', header: 'Giá cao', className: 'text-right font-semibold text-[#FF6B35]' },
  {
    key: 'actions',
    header: 'Thao tác',
    render: () => <TableActions />,
  },
]

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm">
            <div className="h-12 w-12 bg-gray-200 rounded-lg mb-3" />
            <div className="h-8 w-24 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-20 bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 bg-white rounded-xl p-5 shadow-sm">
          <div className="h-6 w-48 bg-gray-200 rounded mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 w-full bg-gray-100 rounded mb-2" />
                  <div className="h-3 w-20 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/admin/dashboard')
      if (!res.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  if (loading) {
    return (
      <div>
        <h1 className="text-xl font-bold text-gray-800 mb-6">Tổng Quan</h1>
        <LoadingSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-xl font-bold text-gray-800 mb-6">Tổng Quan</h1>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
          {error}
          <button
            onClick={fetchDashboard}
            className="ml-4 underline hover:no-underline"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  // Transform segments for table
  const tableData = data.recentSegments.map((seg, idx) => ({
    stt: idx + 1,
    district: seg.streets?.districts?.name || '-',
    street: seg.streets?.name || '-',
    segmentFrom: seg.segment_from || '-',
    segmentTo: seg.segment_to || '-',
    priceUbnd: formatPrice(seg.government_price),
    priceLow: formatPrice(seg.base_price_min),
    priceHigh: formatPrice(seg.base_price_max),
  }))

  const statCards = [
    { title: 'Tuyến đường', value: formatNumber(data.stats.segments), color: 'green' as const, icon: <LocationIcon /> },
    { title: 'Bộ hệ số', value: formatNumber(data.stats.coefficients), color: 'orange' as const, icon: <CalculatorIcon /> },
    { title: 'Người dùng', value: formatNumber(data.stats.users), color: 'teal' as const, icon: <UsersIcon /> },
    { title: 'Lượt tra cứu', value: formatNumber(data.stats.searches), color: 'blue' as const, icon: <SearchIcon /> },
  ]

  return (
    <div>
      {/* Page title */}
      <h1 className="text-xl font-bold text-gray-800 mb-6">Tổng Quan</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        {statCards.map((stat, idx) => (
          <StatCard
            key={idx}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Table - 2/3 width */}
        <div className="xl:col-span-2">
          <DataTable
            title="Giá Đất Mới Cập Nhật"
            columns={columns}
            data={tableData}
          />
        </div>

        {/* Recent Searches - 1/3 width */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">Tra cứu gần đây</h2>
          </div>
          <div className="p-4">
            {data.recentSearches.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">Chưa có lượt tra cứu nào</p>
            ) : (
              data.recentSearches.map((search) => (
                <ActivityItem
                  key={search.id}
                  icon={<SearchActivityIcon />}
                  color="blue"
                  text={
                    <>
                      <strong className="font-semibold text-gray-800">{search.street_name}</strong>
                      {' - '}
                      <span className="text-gray-600">{search.district_name}</span>
                      {search.area && (
                        <span className="text-gray-500 text-xs ml-1">
                          ({search.area} m²)
                        </span>
                      )}
                    </>
                  }
                  time={formatRelativeTime(search.created_at)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
