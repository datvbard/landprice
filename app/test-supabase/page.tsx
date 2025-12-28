import { supabaseAdmin } from '@/lib/supabase/server'

interface TableCheck {
  name: string
  exists: boolean
  count: number
  error?: string
}

export default async function TestSupabasePage() {
  const tablesToCheck = [
    'users',
    'districts',
    'streets',
    'segments',
    'land_type_coefficients',
    'location_coefficients',
    'area_coefficients',
    'depth_coefficients',
    'feng_shui_coefficients',
    'search_history',
    'brand_settings',
  ]
  const tableResults: TableCheck[] = []
  let connectionStatus = 'connected'

  // Check each table
  for (const tableName of tablesToCheck) {
    try {
      const { data, error, count } = await supabaseAdmin
        .from(tableName)
        .select('*', { count: 'exact', head: true })

      if (error) {
        tableResults.push({
          name: tableName,
          exists: false,
          count: 0,
          error: error.message,
        })
      } else {
        tableResults.push({
          name: tableName,
          exists: true,
          count: count || 0,
        })
      }
    } catch (err) {
      tableResults.push({
        name: tableName,
        exists: false,
        count: 0,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      connectionStatus = 'error'
    }
  }

  const existingTables = tableResults.filter((t) => t.exists)
  const missingTables = tableResults.filter((t) => !t.exists)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Supabase Connection Test
        </h1>

        {/* Connection Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-4 h-4 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="font-medium text-gray-800">
              Status: {connectionStatus === 'connected' ? 'Kết nối thành công!' : 'Lỗi kết nối'}
            </span>
          </div>
        </div>

        {/* Environment Variables Check */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
          <h2 className="font-semibold text-gray-800 mb-3">Environment Variables</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  process.env.NEXT_PUBLIC_SUPABASE_URL ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <code className="text-gray-600">NEXT_PUBLIC_SUPABASE_URL</code>
              <span className="text-gray-400">
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓' : '✗ Missing'}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <code className="text-gray-600">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
              <span className="text-gray-400">
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓' : '✗ Missing'}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  process.env.SUPABASE_SERVICE_ROLE_KEY ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <code className="text-gray-600">SUPABASE_SERVICE_ROLE_KEY</code>
              <span className="text-gray-400">
                {process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗ Missing'}
              </span>
            </li>
          </ul>
        </div>

        {/* Tables Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
          <h2 className="font-semibold text-gray-800 mb-3">
            Database Tables ({existingTables.length}/{tablesToCheck.length})
          </h2>
          <ul className="space-y-2 text-sm">
            {tableResults.map((table) => (
              <li key={table.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      table.exists ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <code className="text-gray-600">{table.name}</code>
                </div>
                <span className="text-gray-400">
                  {table.exists ? `${table.count} rows` : 'Missing'}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Missing Tables Warning */}
        {missingTables.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
            <h3 className="font-medium text-yellow-800 mb-2">
              Tables chưa tạo ({missingTables.length})
            </h3>
            <p className="text-sm text-yellow-700">
              Chạy migration script trong Supabase SQL Editor để tạo tables.
            </p>
          </div>
        )}

        {/* Success Message */}
        {missingTables.length === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
            <h3 className="font-medium text-green-800">
              ✓ Tất cả tables đã sẵn sàng!
            </h3>
          </div>
        )}

        {/* Back Link */}
        <a
          href="/login"
          className="block text-center mt-6 text-primary hover:underline"
        >
          ← Quay lại trang đăng nhập
        </a>
      </div>
    </div>
  )
}
