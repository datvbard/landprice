'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { AllCoefficients } from '@/lib/api/coefficients'
import type { SegmentWithLocation } from '@/lib/api/search-data'
import { calculatePrice } from '@/lib/calculations/price-calculator'
import { saveHistory } from '@/lib/api/history'

// Icons
const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
  </svg>
)

const LocationIcon = () => (
  <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
  </svg>
)

const MoneyIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>
)

const CalcIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
  </svg>
)

const CheckIcon = () => (
  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>
)

const SaveIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
  </svg>
)

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
  </svg>
)

const AreaIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
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

function formatNumber(num: number): string {
  return num.toLocaleString('vi-VN')
}

function numberToVietnameseWords(num: number): string {
  if (num >= 1_000_000_000) {
    const billions = Math.floor(num / 1_000_000_000)
    const remainder = num % 1_000_000_000
    const millions = Math.floor(remainder / 1_000_000)
    let result = billions === 1 ? 'Một tỷ' : `${billions} tỷ`
    if (millions > 0) {
      result += ` ${millions} triệu`
    }
    return result + ' đồng'
  } else if (num >= 1_000_000) {
    const millions = Math.floor(num / 1_000_000)
    return `${millions} triệu đồng`
  }
  return formatNumber(num) + ' đồng'
}

function ResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const segmentId = searchParams.get('segmentId')

  // Data state
  const [segment, setSegment] = useState<SegmentWithLocation | null>(null)
  const [coefficients, setCoefficients] = useState<AllCoefficients | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Selection state
  const [selectedPriceType, setSelectedPriceType] = useState<'gov' | 'min' | 'max' | 'avg'>('avg')
  const [landTypeId, setLandTypeId] = useState('')
  const [locationId, setLocationId] = useState('')
  const [areaCoefId, setAreaCoefId] = useState('')
  const [depthId, setDepthId] = useState('')
  const [fengShuiId, setFengShuiId] = useState('')
  const [area, setArea] = useState('100')
  const [showResult, setShowResult] = useState(false)

  // Fetch segment and coefficients
  useEffect(() => {
    if (!segmentId) {
      setError('Không tìm thấy thông tin đoạn đường')
      setLoading(false)
      return
    }

    async function fetchData() {
      try {
        const [segmentRes, coefsRes] = await Promise.all([
          fetch(`/api/segments?segmentId=${segmentId}&withLocation=true`),
          fetch('/api/coefficients')
        ])

        if (!segmentRes.ok) {
          throw new Error('Không tìm thấy đoạn đường')
        }

        const [segmentData, coefsData] = await Promise.all([
          segmentRes.json(),
          coefsRes.json()
        ])

        setSegment(segmentData)
        setCoefficients(coefsData)

        // Set default selections (first option of each)
        if (coefsData.landTypes?.length) setLandTypeId(coefsData.landTypes[0].id)
        if (coefsData.locations?.length) setLocationId(coefsData.locations[0].id)
        if (coefsData.areas?.length) setAreaCoefId(coefsData.areas[0].id)
        if (coefsData.depths?.length) setDepthId(coefsData.depths[0].id)
        if (coefsData.fengShuis?.length) setFengShuiId(coefsData.fengShuis[0].id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [segmentId])

  // Get selected coefficients
  const getSelectedCoef = <T extends { id: string; coefficient: number }>(
    arr: T[] | undefined,
    id: string
  ): number => arr?.find(c => c.id === id)?.coefficient ?? 1

  const getSelectedItem = <T extends { id: string }>(
    arr: T[] | undefined,
    id: string
  ): T | undefined => arr?.find(c => c.id === id)

  // Price data based on segment
  const priceData = segment ? [
    { id: 'gov' as const, label: 'Giá UBND tỉnh', price: segment.government_price },
    { id: 'min' as const, label: 'Giá thấp nhất', price: segment.base_price_min },
    { id: 'max' as const, label: 'Giá cao nhất', price: segment.base_price_max },
    { id: 'avg' as const, label: 'Giá trung bình', price: (segment.base_price_min + segment.base_price_max) / 2 },
  ] : []

  const handleCalculate = () => {
    setShowResult(true)
    setSaved(false) // Reset saved state when recalculating
    setTimeout(() => {
      document.getElementById('valuation-result')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  // Handle save to history
  const handleSaveHistory = async () => {
    if (!segment || !coefficients || saving || saved) return

    const result = getResult()
    if (!result) return

    setSaving(true)
    try {
      const selectedLandType = getSelectedItem(coefficients.landTypes, landTypeId)
      const selectedLocation = getSelectedItem(coefficients.locations, locationId)
      const selectedAreaCoef = getSelectedItem(coefficients.areas, areaCoefId)
      const selectedDepth = getSelectedItem(coefficients.depths, depthId)
      const selectedFengShui = getSelectedItem(coefficients.fengShuis, fengShuiId)

      await saveHistory({
        district_name: segment.street?.district?.name || '',
        street_name: segment.street?.name || '',
        segment_desc: `${segment.segment_from} - ${segment.segment_to}`,
        area: result.areaNum,
        total_price: result.totalPrice.avg,
        segment_id: segmentId || undefined,
        coefficients_json: {
          segmentId: segmentId || null,
          landType: { id: landTypeId, name: selectedLandType?.name, coefficient: result.coefficients.landType },
          location: { id: locationId, name: selectedLocation?.name, coefficient: result.coefficients.location },
          area: { id: areaCoefId, name: selectedAreaCoef?.name, coefficient: result.coefficients.area },
          depth: { id: depthId, name: selectedDepth?.name, coefficient: result.coefficients.depth },
          fengShui: { id: fengShuiId, name: selectedFengShui?.name, coefficient: result.coefficients.fengShui },
          total: result.coefficients.total,
          pricePerM2: result.pricePerM2.avg,
        },
      })
      setSaved(true)
    } catch (err) {
      console.error('Error saving history:', err)
      alert('Không thể lưu kết quả. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  // Calculate result
  const getResult = () => {
    if (!segment || !coefficients) return null

    const areaNum = parseFloat(area) || 100
    const selectedLandType = getSelectedItem(coefficients.landTypes, landTypeId)
    const selectedLocation = getSelectedItem(coefficients.locations, locationId)
    const selectedAreaCoef = getSelectedItem(coefficients.areas, areaCoefId)
    const selectedDepth = getSelectedItem(coefficients.depths, depthId)
    const selectedFengShui = getSelectedItem(coefficients.fengShuis, fengShuiId)

    const result = calculatePrice({
      segment,
      area: areaNum,
      coefficients: {
        landType: getSelectedCoef(coefficients.landTypes, landTypeId),
        location: getSelectedCoef(coefficients.locations, locationId),
        area: getSelectedCoef(coefficients.areas, areaCoefId),
        depth: getSelectedCoef(coefficients.depths, depthId),
        fengShui: getSelectedCoef(coefficients.fengShuis, fengShuiId),
      }
    })

    // Add labels for display
    return {
      ...result,
      areaNum,
      coefficientDetails: [
        {
          label: `Loại đất: ${selectedLandType?.name || '-'}`,
          value: result.coefficients.landType
        },
        {
          label: `Vị trí: ${selectedLocation?.name || '-'}`,
          value: result.coefficients.location
        },
        {
          label: `Hệ số diện tích: ${selectedAreaCoef?.name || '-'}`,
          value: result.coefficients.area
        },
        {
          label: `Chiều sâu: ${selectedDepth?.name || '-'}`,
          value: result.coefficients.depth
        },
        {
          label: `Phong thủy: ${selectedFengShui?.name || '-'}`,
          value: result.coefficients.fengShui
        },
      ]
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !segment) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-5">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-4">{error || 'Không tìm thấy dữ liệu'}</div>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-primary text-white rounded-lg font-semibold"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    )
  }

  const result = getResult()

  return (
    <>
      {/* Header */}
      <header className="bg-gradient-vibrant px-5 py-4 pt-[calc(1rem+env(safe-area-inset-top))] sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-white/15 border-none rounded-lg text-white flex items-center justify-center cursor-pointer transition-all hover:bg-white/25 flex-shrink-0"
          >
            <BackIcon />
          </button>
          <div className="flex-1 text-white">
            <div className="text-lg font-bold">Kết Quả Tra Cứu</div>
            <div className="text-sm opacity-90">Giá đất theo QĐ UBND tỉnh</div>
          </div>
        </div>
      </header>

      {/* Location Info */}
      <section className="bg-gradient-vibrant px-5 pb-6 -mt-px">
        <div className="bg-white/15 backdrop-blur-[10px] rounded-xl p-4 text-white">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <LocationIcon />
            </div>
            <div className="flex-1">
              <div className="text-base font-semibold mb-1">
                Từ {segment.segment_from} đến {segment.segment_to}
              </div>
              <div className="text-sm opacity-90">Đoạn đường đã chọn</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 px-5 py-5 pb-8 -mt-4">
        {/* Price Grid */}
        <section className="bg-white rounded-2xl shadow-lg overflow-hidden mb-5 animate-slideUp">
          <div className="bg-gradient-to-r from-primary/5 to-primary-light/5 px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <span className="text-primary"><MoneyIcon /></span>
              Bảng Giá Đất (nghìn đồng/m²)
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-px bg-gray-100">
            {priceData.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedPriceType(item.id)}
                className={`bg-white p-4 text-center transition-all cursor-pointer border-none ${
                  selectedPriceType === item.id
                    ? 'bg-gradient-to-br from-primary/10 to-primary-light/10'
                    : 'hover:bg-primary/5'
                }`}
              >
                <div className="text-sm text-gray-500 mb-2 flex items-center justify-center gap-1">
                  <span className={`w-4 h-4 border-2 rounded-full inline-flex items-center justify-center transition-all ${
                    selectedPriceType === item.id
                      ? 'border-primary bg-primary'
                      : 'border-gray-300'
                  }`}>
                    {selectedPriceType === item.id && (
                      <span className="w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </span>
                  {item.label}
                </div>
                <div className="text-2xl font-bold text-gray-900">{formatNumber(item.price)}</div>
                <span className="text-sm font-normal text-gray-500 block mt-1">nghìn đồng/m²</span>
              </button>
            ))}
          </div>
        </section>

        {/* Calculation Section */}
        <section className="bg-white rounded-2xl shadow-lg overflow-hidden mb-5 animate-slideUp" style={{ animationDelay: '0.1s' }}>
          <div className="bg-gradient-to-r from-accent/5 to-accent/10 px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <span className="text-accent"><CalcIcon /></span>
              Tính Giá Trị Lô Đất
            </h2>
          </div>
          <div className="p-5">
            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">Loại đất</label>
                <div className="relative">
                  <select
                    value={landTypeId}
                    onChange={(e) => setLandTypeId(e.target.value)}
                    className="w-full py-3 px-4 text-base text-gray-800 bg-white border-2 border-gray-200 rounded-lg appearance-none cursor-pointer transition-all min-h-[48px] focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                  >
                    {coefficients?.landTypes?.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.name} (x{opt.coefficient})</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">Vị trí</label>
                <div className="relative">
                  <select
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                    className="w-full py-3 px-4 text-base text-gray-800 bg-white border-2 border-gray-200 rounded-lg appearance-none cursor-pointer transition-all min-h-[48px] focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                  >
                    {coefficients?.locations?.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.name} (x{opt.coefficient})</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">Hệ số diện tích</label>
                <div className="relative">
                  <select
                    value={areaCoefId}
                    onChange={(e) => setAreaCoefId(e.target.value)}
                    className="w-full py-3 px-4 text-base text-gray-800 bg-white border-2 border-gray-200 rounded-lg appearance-none cursor-pointer transition-all min-h-[48px] focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                  >
                    {coefficients?.areas?.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.name} (x{opt.coefficient})</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">Diện tích (m²)</label>
                <input
                  type="number"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="100"
                  className="w-full py-3 px-4 text-base text-gray-800 bg-white border-2 border-gray-200 rounded-lg transition-all min-h-[48px] focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">Chiều sâu lô đất</label>
                <div className="relative">
                  <select
                    value={depthId}
                    onChange={(e) => setDepthId(e.target.value)}
                    className="w-full py-3 px-4 text-base text-gray-800 bg-white border-2 border-gray-200 rounded-lg appearance-none cursor-pointer transition-all min-h-[48px] focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                  >
                    {coefficients?.depths?.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.name} (x{opt.coefficient})</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">Yếu tố phong thủy</label>
                <div className="relative">
                  <select
                    value={fengShuiId}
                    onChange={(e) => setFengShuiId(e.target.value)}
                    className="w-full py-3 px-4 text-base text-gray-800 bg-white border-2 border-gray-200 rounded-lg appearance-none cursor-pointer transition-all min-h-[48px] focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                  >
                    {coefficients?.fengShuis?.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.name} (x{opt.coefficient})</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Calculate Button */}
            <button
              onClick={handleCalculate}
              className="w-full py-4 px-6 text-lg font-bold text-white bg-gradient-gold border-none rounded-xl cursor-pointer transition-all min-h-[56px] shadow-[0_4px_14px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2 mt-4 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(212,175,55,0.4)] active:translate-y-0"
            >
              <CalcIcon />
              TÍNH GIÁ
            </button>
          </div>
        </section>

        {/* Valuation Result Section */}
        {showResult && result && (
          <section id="valuation-result" className="bg-white rounded-2xl shadow-xl overflow-hidden mb-5 animate-scaleIn">
            {/* Header with Success Indicator */}
            <div className="bg-gradient-vibrant p-5 text-center relative overflow-hidden">
              <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(255,255,255,0.15)_0%,transparent_50%)] animate-pulse" />
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 relative z-10">
                <span className="text-white"><CheckIcon /></span>
              </div>
              <h2 className="text-xl font-bold text-white relative z-10">KẾT QUẢ ĐỊNH GIÁ</h2>
            </div>

            <div className="p-5">
              {/* Location Summary */}
              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-primary/5 to-primary-light/5 rounded-xl mb-5 border border-primary/10">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0 text-white">
                  <LocationIcon />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-gray-800 mb-1">
                    Từ {segment.segment_from} đến {segment.segment_to}
                  </h4>
                  <p className="text-sm text-gray-600 m-0">Đoạn đường đã chọn</p>
                </div>
              </div>

              {/* Coefficients Breakdown */}
              <div className="mb-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <span className="text-primary"><CalcIcon /></span>
                  Các hệ số đã áp dụng:
                </div>
                <div className="flex flex-col gap-2">
                  {result.coefficientDetails.map((coef, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-3 rounded-lg text-sm ${
                      idx % 2 === 0 ? 'bg-primary/5' : 'bg-gray-50'
                    }`}>
                      <span className="text-gray-600">{coef.label}</span>
                      <span className={`font-semibold ${
                        coef.value > 1 ? 'text-green-600' : coef.value < 1 ? 'text-red-500' : 'text-gray-500'
                      }`}>
                        x{coef.value.toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-3 rounded-lg text-sm bg-accent/10 border border-accent/20">
                    <span className="text-gray-700 font-medium">Tổng hệ số</span>
                    <span className="font-bold text-accent">x{result.coefficients.total.toFixed(4)}</span>
                  </div>
                </div>
              </div>

              {/* Adjusted Price Per M2 */}
              <div className="bg-gradient-to-br from-accent/10 to-accent/20 rounded-xl p-4 mb-5 text-center border border-accent/20">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
                  <span className="text-accent"><MoneyIcon /></span>
                  GIÁ SAU ĐIỀU CHỈNH
                </div>
                <div className="text-2xl font-bold text-accent">{formatNumber(result.pricePerM2.avg)}</div>
                <div className="text-sm text-gray-500 mt-1">đồng/m²</div>
              </div>

              {/* Area Display */}
              <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-lg mb-5 text-sm text-gray-600">
                <span className="text-primary"><AreaIcon /></span>
                Diện tích: <strong className="text-gray-800 font-semibold">{formatNumber(result.areaNum)}</strong> m²
              </div>

              {/* Final Total Value */}
              <div className="bg-gradient-vibrant rounded-xl p-6 text-center relative overflow-hidden mb-5">
                <div className="absolute -top-full -left-full w-[300%] h-[300%] bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_40%)] animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 relative z-10">
                  <span className="text-white"><MoneyIcon /></span>
                </div>
                <div className="text-sm text-white/90 mb-2 relative z-10">TỔNG GIÁ TRỊ BẤT ĐỘNG SẢN</div>
                <div className="text-4xl font-bold text-white relative z-10 leading-tight mb-1">
                  {formatNumber(result.totalPrice.avg)}
                </div>
                <div className="text-lg text-white/90 relative z-10">đồng</div>
                <div className="mt-4 py-3 px-4 bg-white/15 backdrop-blur-[10px] rounded-lg text-sm text-white italic relative z-10">
                  ({numberToVietnameseWords(result.totalPrice.avg)})
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleSaveHistory}
                  disabled={saving || saved}
                  className={`flex items-center justify-center gap-2 p-4 rounded-xl text-base font-semibold cursor-pointer transition-all border-none shadow-button ${
                    saved
                      ? 'bg-green-500 text-white cursor-default'
                      : saving
                      ? 'bg-gray-300 text-gray-500 cursor-wait'
                      : 'bg-gradient-primary text-white hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(174,28,62,0.4)]'
                  }`}
                >
                  {saved ? (
                    <>
                      <CheckIcon />
                      Đã lưu
                    </>
                  ) : saving ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <SaveIcon />
                      Lưu kết quả
                    </>
                  )}
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="flex items-center justify-center gap-2 p-4 rounded-xl text-base font-semibold cursor-pointer transition-all bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                >
                  <RefreshIcon />
                  Tính lại
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ResultsContent />
    </Suspense>
  )
}
