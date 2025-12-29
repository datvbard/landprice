'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { SearchHistory } from '@/lib/supabase/database.types'
import { getHistory, deleteHistory, type PaginationInfo } from '@/lib/api/history'
import { HistoryCard } from '@/components/history-card'

// Icons
const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
  </svg>
)

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
  </svg>
)

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
    </svg>
  </div>
)

export default function HistoryPage() {
  const router = useRouter()
  const [history, setHistory] = useState<SearchHistory[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Fetch history data
  const fetchHistory = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      setError(null)
      const result = await getHistory(page, 20)
      setHistory(result.data)
      setPagination(result.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải lịch sử')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  // Handle view details - navigate to results with saved data
  const handleView = (item: SearchHistory) => {
    // Get segment_id from coefficients_json if available (try both formats)
    const coefs = item.coefficients_json as Record<string, unknown> | null
    const segmentId = (coefs?.segmentId ?? coefs?.segment_id) as string | undefined

    if (segmentId) {
      router.push(`/results?segmentId=${segmentId}`)
    } else {
      // If no segment_id, show alert with basic info
      alert(`Kết quả: ${item.street_name || ''}\nGiá: ${item.total_price?.toLocaleString('vi-VN')} đồng`)
    }
  }

  // Handle share
  const handleShare = async (item: SearchHistory) => {
    const text = `Tra cứu giá đất: ${item.street_name || ''} - ${item.district_name || ''}\nGiá: ${item.total_price?.toLocaleString('vi-VN')} đồng`
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
      alert('Đã sao chép thông tin vào clipboard!')
    }
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id)
      await deleteHistory(id)
      setHistory(prev => prev.filter(h => h.id !== id))
      if (pagination) {
        setPagination({ ...pagination, total: pagination.total - 1 })
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể xóa')
    } finally {
      setDeletingId(null)
    }
  }

  // Handle pagination
  const handleLoadMore = () => {
    if (pagination?.hasMore) {
      fetchHistory(pagination.page + 1)
    }
  }

  return (
    <>
      {/* Header */}
      <header className="bg-gradient-vibrant px-5 py-4 pt-[calc(1rem+env(safe-area-inset-top))] sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="w-10 h-10 bg-white/15 border-none rounded-lg text-white flex items-center justify-center cursor-pointer transition-all hover:bg-white/25 flex-shrink-0"
            >
              <BackIcon />
            </button>
            <div className="text-white">
              <div className="text-lg font-bold">Lịch Sử Tra Cứu</div>
              <div className="text-sm opacity-90">Các tìm kiếm gần đây</div>
            </div>
          </div>
          <button className="w-10 h-10 bg-white/15 border-none rounded-lg text-white flex items-center justify-center cursor-pointer transition-all hover:bg-white/25">
            <SearchIcon />
          </button>
        </div>
      </header>

      {/* Stats Summary */}
      <section className="bg-gradient-vibrant px-5 pb-6 -mt-px">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/15 backdrop-blur-[10px] rounded-xl p-4 text-center text-white">
            <div className="text-2xl font-bold mb-1">{pagination?.total || 0}</div>
            <div className="text-xs opacity-90">Lượt tra cứu</div>
          </div>
          <div className="bg-white/15 backdrop-blur-[10px] rounded-xl p-4 text-center text-white">
            <div className="text-2xl font-bold mb-1">{new Set(history.map(h => h.district_name)).size}</div>
            <div className="text-xs opacity-90">Quận/Huyện</div>
          </div>
          <div className="bg-white/15 backdrop-blur-[10px] rounded-xl p-4 text-center text-white">
            <div className="text-2xl font-bold mb-1">{history.length}</div>
            <div className="text-xs opacity-90">Hiển thị</div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 px-5 py-5 pb-[calc(6rem+env(safe-area-inset-bottom))] -mt-4">
        {loading && history.length === 0 ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-500 mb-4">{error}</div>
            <button onClick={() => fetchHistory()} className="px-4 py-2 bg-primary text-white rounded-lg">
              Thử lại
            </button>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-5xl mb-4">📋</div>
            <div className="text-gray-600 font-medium mb-2">Chưa có lịch sử tra cứu</div>
            <div className="text-gray-400 text-sm mb-4">Hãy thực hiện tra cứu đầu tiên</div>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-gradient-primary text-white rounded-lg font-semibold"
            >
              Tra cứu ngay
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {history.map((item, idx) => (
              <HistoryCard
                key={item.id}
                item={item}
                index={idx}
                onView={handleView}
                onShare={handleShare}
                onDelete={handleDelete}
                isDeleting={deletingId === item.id}
              />
            ))}
            {pagination?.hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="mt-4 py-3 px-6 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                {loading ? 'Đang tải...' : 'Xem thêm'}
              </button>
            )}
          </div>
        )}
      </main>
    </>
  )
}
