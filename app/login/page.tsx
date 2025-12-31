'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { validateLoginInput } from './actions'

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const togglePassword = () => setShowPassword(!showPassword)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Step 1: Validate input and get user info
    const validation = await validateLoginInput(identifier, password)
    if (!validation.success) {
      setError(validation.error || 'Đã xảy ra lỗi')
      setIsLoading(false)
      return
    }

    // Step 2: Sign in via direct API fetch (ensures cookies are set)
    try {
      const res = await fetch('/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: validation.email, password }),
        credentials: 'include',
      })

      if (!res.ok) {
        setError('Tên đăng nhập hoặc mật khẩu không chính xác')
        setIsLoading(false)
        return
      }
    } catch {
      setError('Đã xảy ra lỗi, vui lòng thử lại')
      setIsLoading(false)
      return
    }

    // Step 3: Redirect based on role
    router.push(validation.redirectTo || '/')
    router.refresh()
  }

  return (
    <div className="mobile-container">
      <div className="min-h-screen bg-gradient-hero flex flex-col relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-[-30%] right-[-30%] w-[60%] h-[60%] bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_70%)] animate-float" />
        <div className="absolute bottom-[-20%] left-[-20%] w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(255,184,0,0.15)_0%,transparent_70%)] animate-float-reverse" />

        {/* Header with Logo */}
        <header className="flex-none p-10 pb-8 text-center relative z-10">
          <div className="inline-flex flex-col items-center animate-fade-in">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
              {/* Agribank Logo */}
              <svg viewBox="0 0 50 50" fill="none" className="w-[50px] h-[50px]">
                <path d="M25 5L40 15V35L25 45L10 35V15L25 5Z" fill="#00843D"/>
                <path d="M25 12L33 17V27L25 32L17 27V17L25 12Z" fill="#FFB800"/>
                <path d="M25 18L29 21V27L25 30L21 27V21L25 18Z" fill="white"/>
              </svg>
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-bold mb-1 drop-shadow-[0_2px_10px_rgba(0,0,0,0.2)]">
                AGRIBANK TRÀ VINH
              </h1>
              <p className="text-sm opacity-90 font-medium">Tra Cứu Giá Đất</p>
            </div>
          </div>
        </header>

        {/* Login Card */}
        <main className="flex-1 bg-white rounded-t-[32px] p-8 px-6 relative z-10 animate-slide-up">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Đăng Nhập</h2>
          <p className="text-base text-gray-500 mb-6">Chào mừng bạn quay trở lại!</p>

          {/* App Info Banner */}
          <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-[rgba(174,28,62,0.08)] to-[rgba(212,175,55,0.08)] rounded-xl mb-6">
            <div className="w-11 h-11 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-800">
                Tra cứu giá đất tỉnh Trà Vinh
              </div>
              <div className="text-xs text-gray-500">
                Cập nhật theo Quyết định UBND tỉnh
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form className="mb-6" onSubmit={handleLogin}>
            {/* Username/Email/Phone Input */}
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Tên đăng nhập"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={isLoading}
                icon={
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                }
              />
            </div>

            {/* Password Input */}
            <div className="mb-4">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mật khẩu"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                icon={
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                }
                rightElement={
                  <button
                    type="button"
                    onClick={togglePassword}
                    className="p-2 text-gray-400 hover:text-gray-600 flex items-center justify-center"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                      </svg>
                    ) : (
                      <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    )}
                  </button>
                }
              />
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 accent-primary cursor-pointer"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-600">Ghi nhớ đăng nhập</span>
              </label>
              <a href="#" className="text-sm text-primary font-medium hover:text-primary-dark hover:underline transition-colors">
                Quên mật khẩu?
              </a>
            </div>

            {/* Login Button */}
            <Button type="submit" fullWidth className="text-lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <span>Đăng Nhập</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                  </svg>
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="px-4 text-sm text-gray-400">hoặc đăng nhập với</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Social Login */}
          <div className="flex gap-3">
            <Button type="button" variant="social" fullWidth className="flex-1 text-sm font-medium" disabled={isLoading}>
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>
            <Button type="button" variant="social" fullWidth className="flex-1 text-sm font-medium" disabled={isLoading}>
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </Button>
          </div>

          {/* Footer */}
          <footer className="text-center mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-2">
              Chưa có tài khoản? <a href="#" className="text-primary font-semibold">Đăng ký ngay</a>
            </p>
            <p className="text-xs text-gray-400 mt-4">
              Phiên bản 1.0.0 | Agribank Trà Vinh
            </p>
          </footer>
        </main>
      </div>
    </div>
  )
}
