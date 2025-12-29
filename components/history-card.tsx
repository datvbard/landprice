'use client'

import type { SearchHistory } from '@/lib/supabase/database.types'
import { formatHistoryPrice, formatHistoryDate } from '@/lib/api/history'

// Icons
const LocationIcon = () => (
  <svg className="w-[26px] h-[26px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
  </svg>
)

const ShareIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
  </svg>
)

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
  </svg>
)

// Get gradient based on index for visual variety
function getGradient(index: number): string {
  const gradients = [
    'bg-gradient-primary',
    'bg-gradient-gold',
    'bg-gradient-to-br from-teal-500 to-cyan-600',
  ]
  return gradients[index % gradients.length]
}

// Extract land type from coefficients JSON
function getLandType(coefficients: unknown): string {
  if (!coefficients || typeof coefficients !== 'object') return 'Đất'
  const coefs = coefficients as Record<string, unknown>
  if (coefs.landType && typeof coefs.landType === 'object') {
    const lt = coefs.landType as Record<string, unknown>
    return (lt.name as string) || 'Đất'
  }
  return 'Đất'
}

// Extract location from coefficients JSON
function getLocation(coefficients: unknown): string {
  if (!coefficients || typeof coefficients !== 'object') return ''
  const coefs = coefficients as Record<string, unknown>
  if (coefs.location && typeof coefs.location === 'object') {
    const loc = coefs.location as Record<string, unknown>
    return (loc.name as string) || ''
  }
  return ''
}

interface HistoryCardProps {
  item: SearchHistory
  index: number
  onView: (item: SearchHistory) => void
  onShare: (item: SearchHistory) => void
  onDelete: (id: string) => void
  isDeleting?: boolean
}

export function HistoryCard({
  item,
  index,
  onView,
  onShare,
  onDelete,
  isDeleting = false,
}: HistoryCardProps) {
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    onShare(item)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isDeleting && confirm('Bạn có chắc muốn xóa mục này?')) {
      onDelete(item.id)
    }
  }

  const gradient = getGradient(index)
  const landType = getLandType(item.coefficients_json)
  const location = getLocation(item.coefficients_json)
  const price = item.total_price ? formatHistoryPrice(item.total_price) : '0'
  const date = formatHistoryDate(item.created_at)
  const area = item.area ? `${item.area}m²` : ''

  return (
    <div
      onClick={() => onView(item)}
      className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all cursor-pointer animate-fadeInUp hover:shadow-md hover:translate-x-1 ${
        isDeleting ? 'opacity-50 pointer-events-none' : ''
      }`}
      style={{ animationDelay: `${0.05 * index}s` }}
    >
      <div className="flex items-center p-4 gap-4">
        <div className={`w-[52px] h-[52px] ${gradient} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <span className="text-white"><LocationIcon /></span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-base font-semibold text-gray-800 mb-1 truncate">
            {item.street_name || 'Không xác định'}
          </div>
          <div className="text-sm text-gray-500 truncate">
            {item.district_name} {item.segment_desc ? `- ${item.segment_desc}` : ''}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-base font-bold text-primary mb-1">{price}</div>
          <div className="text-xs text-gray-400">{date}</div>
        </div>
      </div>
      <div className="flex items-center justify-between py-3 px-4 bg-gray-50 border-t border-gray-100">
        <div className="flex gap-2">
          <span className="py-1 px-2 bg-primary/10 border border-primary/20 rounded text-xs text-primary">
            {landType}
          </span>
          {location && (
            <span className="py-1 px-2 bg-white border border-gray-200 rounded text-xs text-gray-600">
              {location}
            </span>
          )}
          {area && (
            <span className="py-1 px-2 bg-white border border-gray-200 rounded text-xs text-gray-600">
              {area}
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={handleShare}
            className="w-8 h-8 bg-white border border-gray-200 rounded-md flex items-center justify-center cursor-pointer transition-all text-gray-500 hover:border-primary hover:text-primary"
            title="Chia sẻ"
          >
            <ShareIcon />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-8 h-8 bg-white border border-gray-200 rounded-md flex items-center justify-center cursor-pointer transition-all text-gray-500 hover:border-red-500 hover:text-red-500 disabled:opacity-50"
            title="Xóa"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </div>
  )
}
