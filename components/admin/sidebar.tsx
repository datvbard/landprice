'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Icons using SVG
const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
  </svg>
)

const PriceIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>
)

const CoefficientIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
  </svg>
)

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
  </svg>
)

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
  </svg>
)

const HistoryIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>
)

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
  </svg>
)

const LogoutIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
  </svg>
)

// Nav item type
interface NavItem {
  href: string
  label: string
  icon: () => React.ReactElement
  badge?: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

// Navigation structure
const navSections: NavSection[] = [
  {
    title: 'Menu chính',
    items: [
      { href: '/dashboard', label: 'Tổng quan', icon: HomeIcon },
      { href: '/prices', label: 'Quản lý Giá Đất', icon: PriceIcon },
      { href: '/coefficients', label: 'Quản lý Hệ Số', icon: CoefficientIcon },
      { href: '/users', label: 'Quản lý Users', icon: UsersIcon },
    ]
  },
  {
    title: 'Báo cáo',
    items: [
      { href: '#', label: 'Thống kê', icon: ChartIcon },
      { href: '#', label: 'Lịch sử tra cứu', icon: HistoryIcon },
    ]
  },
  {
    title: 'Cài đặt',
    items: [
      { href: '/settings', label: 'Cài đặt hệ thống', icon: SettingsIcon },
    ]
  }
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-[280px]
        bg-gradient-to-br from-[#1A1A2E] to-[#16213E]
        flex flex-col transition-transform duration-300
        lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 50 50" className="w-8 h-8">
                <path d="M25 5L40 15V35L25 45L10 35V15L25 5Z" fill="#AE1C3E"/>
                <path d="M25 12L33 17V27L25 32L17 27V17L25 12Z" fill="#D4AF37"/>
                <path d="M25 18L29 21V27L25 30L21 27V21L25 18Z" fill="white"/>
              </svg>
            </div>
            <div className="text-white">
              <h1 className="text-lg font-bold">AGRIBANK</h1>
              <p className="text-xs opacity-70">Trà Vinh Admin</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {navSections.map((section, idx) => (
            <div key={idx} className="mb-6">
              <div className="text-xs font-semibold text-white/40 uppercase tracking-wider px-3 mb-3">
                {section.title}
              </div>
              <ul className="space-y-1">
                {section.items.map((item, itemIdx) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon
                  return (
                    <li key={itemIdx}>
                      <Link
                        href={item.href}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-lg
                          transition-all duration-150
                          ${isActive
                            ? 'bg-gradient-to-r from-[#AE1C3E] to-[#C42D4F] text-white shadow-lg'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                          }
                        `}
                        onClick={() => onClose()}
                      >
                        <Icon />
                        <span className="text-sm font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto px-2 py-0.5 bg-[#D4AF37] text-white text-xs font-bold rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer - Admin User */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#FFB800] rounded-full flex items-center justify-center text-white font-bold text-sm">
              AD
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">Admin</div>
              <div className="text-xs text-white/60">Quản trị viên</div>
            </div>
            <button
              className="w-9 h-9 bg-red-500/20 rounded-md flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-colors"
              title="Đăng xuất"
            >
              <LogoutIcon />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
