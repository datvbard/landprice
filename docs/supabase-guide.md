# Hướng Dẫn Kết Nối Supabase

## 1. Tạo Dự Án Supabase

### Bước 1: Đăng ký/Đăng nhập
1. Truy cập https://supabase.com
2. Đăng nhập bằng GitHub hoặc tạo tài khoản mới

### Bước 2: Tạo Project Mới
1. Click **New Project**
2. Điền thông tin:
   - **Name:** `landprice-travinh`
   - **Database Password:** Tạo mật khẩu mạnh (lưu lại!)
   - **Region:** Singapore (gần Việt Nam nhất)
3. Click **Create new project**
4. Đợi 2-3 phút để Supabase khởi tạo

### Bước 3: Lấy API Keys
1. Vào **Project Settings** > **API**
2. Lưu lại các thông tin:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** Dùng cho client-side
   - **service_role key:** Chỉ dùng server-side (BẢO MẬT!)

---

## 2. Cài Đặt Supabase Client

### Bước 1: Cài Package
```bash
npm install @supabase/supabase-js
```

### Bước 2: Tạo File Environment
Tạo file `.env.local` ở thư mục gốc:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

> **Lưu ý:** File `.env.local` đã được thêm vào `.gitignore`, không push lên GitHub!

### Bước 3: Tạo Supabase Client

Tạo file `lib/supabase/client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

Tạo file `lib/supabase/server.ts` (cho Server Components):

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
```

---

## 3. Tạo Database Schema

### Bước 1: Vào SQL Editor
1. Trong Supabase Dashboard, vào **SQL Editor**
2. Click **New query**

### Bước 2: Chạy Migration Script

```sql
-- Bảng Users (người dùng)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng Provinces (tỉnh/thành phố)
CREATE TABLE provinces (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL
);

-- Bảng Districts (quận/huyện)
CREATE TABLE districts (
  id SERIAL PRIMARY KEY,
  province_id INTEGER REFERENCES provinces(id),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL
);

-- Bảng Wards (phường/xã)
CREATE TABLE wards (
  id SERIAL PRIMARY KEY,
  district_id INTEGER REFERENCES districts(id),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL
);

-- Bảng Streets (đường/tuyến đường)
CREATE TABLE streets (
  id SERIAL PRIMARY KEY,
  ward_id INTEGER REFERENCES wards(id),
  name VARCHAR(200) NOT NULL,
  segment VARCHAR(500), -- Đoạn đường (từ... đến...)
  base_price DECIMAL(15,2) NOT NULL, -- Giá đất cơ bản (VND/m²)
  decision_number VARCHAR(50), -- Số quyết định
  effective_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng Coefficients (hệ số điều chỉnh)
CREATE TABLE coefficients (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- land_type, location, area, depth, feng_shui
  name VARCHAR(100) NOT NULL,
  value DECIMAL(5,2) NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Bảng Search History (lịch sử tra cứu)
CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  street_id INTEGER REFERENCES streets(id),
  area DECIMAL(10,2), -- Diện tích (m²)
  land_type_id INTEGER REFERENCES coefficients(id),
  location_id INTEGER REFERENCES coefficients(id),
  area_coef_id INTEGER REFERENCES coefficients(id),
  depth_coef_id INTEGER REFERENCES coefficients(id),
  feng_shui_id INTEGER REFERENCES coefficients(id),
  calculated_price DECIMAL(15,2), -- Giá tính được
  total_price DECIMAL(18,2), -- Tổng giá trị
  searched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_streets_ward ON streets(ward_id);
CREATE INDEX idx_search_history_user ON search_history(user_id);
CREATE INDEX idx_search_history_date ON search_history(searched_at);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view own history" ON search_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history" ON search_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Bước 3: Thêm Dữ Liệu Mẫu

```sql
-- Thêm tỉnh Trà Vinh
INSERT INTO provinces (name, code) VALUES ('Trà Vinh', 'TV');

-- Thêm các huyện (ví dụ)
INSERT INTO districts (province_id, name, code) VALUES
  (1, 'Thành phố Trà Vinh', 'TV-TP'),
  (1, 'Huyện Càng Long', 'TV-CL'),
  (1, 'Huyện Cầu Kè', 'TV-CK'),
  (1, 'Huyện Tiểu Cần', 'TV-TC'),
  (1, 'Huyện Châu Thành', 'TV-CT');

-- Thêm hệ số loại đất
INSERT INTO coefficients (type, name, value, description, sort_order) VALUES
  ('land_type', 'Đất ở tại đô thị', 1.00, 'Đất ở tại đô thị (ODT)', 1),
  ('land_type', 'Đất ở tại nông thôn', 0.80, 'Đất ở tại nông thôn (ONT)', 2),
  ('land_type', 'Đất thương mại dịch vụ', 0.90, 'Đất thương mại, dịch vụ (TMD)', 3),
  ('land_type', 'Đất sản xuất kinh doanh', 0.70, 'Đất sản xuất, kinh doanh phi nông nghiệp', 4),
  ('land_type', 'Đất nông nghiệp', 0.30, 'Đất trồng lúa, cây hàng năm', 5),
  ('land_type', 'Đất nuôi trồng thủy sản', 0.25, 'Đất nuôi trồng thủy sản', 6),
  ('land_type', 'Đất lâm nghiệp', 0.20, 'Đất rừng sản xuất', 7);

-- Thêm hệ số vị trí
INSERT INTO coefficients (type, name, value, description, sort_order) VALUES
  ('location', 'Vị trí 1 - Mặt tiền', 1.00, 'Mặt tiền đường chính', 1),
  ('location', 'Vị trí 2 - Hẻm >= 5m', 0.80, 'Hẻm xe hơi, rộng >= 5m', 2),
  ('location', 'Vị trí 3 - Hẻm 3-5m', 0.60, 'Hẻm xe hơi, rộng 3-5m', 3),
  ('location', 'Vị trí 4 - Hẻm < 3m', 0.40, 'Hẻm nhỏ, rộng < 3m', 4),
  ('location', 'Vị trí 5 - Hẻm sâu', 0.30, 'Hẻm sâu > 100m', 5);

-- Thêm hệ số diện tích
INSERT INTO coefficients (type, name, value, description, sort_order) VALUES
  ('area', 'Dưới 36m²', 0.90, 'Diện tích < 36m²', 1),
  ('area', '36-50m²', 1.00, 'Diện tích 36-50m²', 2),
  ('area', '50-100m²', 0.95, 'Diện tích 50-100m²', 3),
  ('area', '100-200m²', 0.90, 'Diện tích 100-200m²', 4),
  ('area', '200-500m²', 0.85, 'Diện tích 200-500m²', 5),
  ('area', 'Trên 500m²', 0.80, 'Diện tích > 500m²', 6);
```

---

## 4. Sử Dụng Trong Next.js

### Ví dụ: Lấy Danh Sách Huyện

```typescript
// app/api/districts/route.ts
import { supabaseAdmin } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('districts')
    .select('id, name, code')
    .order('name')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
```

### Ví dụ: Tra Cứu Giá Đất

```typescript
// lib/services/land-price.ts
import { supabase } from '@/lib/supabase/client'

export async function searchLandPrice(streetId: number) {
  const { data, error } = await supabase
    .from('streets')
    .select(`
      id,
      name,
      segment,
      base_price,
      decision_number,
      wards (
        name,
        districts (
          name,
          provinces (name)
        )
      )
    `)
    .eq('id', streetId)
    .single()

  if (error) throw error
  return data
}
```

### Ví dụ: Lưu Lịch Sử Tra Cứu

```typescript
// lib/services/search-history.ts
import { supabase } from '@/lib/supabase/client'

interface SearchRecord {
  userId: string
  streetId: number
  area: number
  coefficients: {
    landType: number
    location: number
    areaCoef: number
    depth: number
    fengShui: number
  }
  calculatedPrice: number
  totalPrice: number
}

export async function saveSearchHistory(record: SearchRecord) {
  const { data, error } = await supabase
    .from('search_history')
    .insert({
      user_id: record.userId,
      street_id: record.streetId,
      area: record.area,
      land_type_id: record.coefficients.landType,
      location_id: record.coefficients.location,
      area_coef_id: record.coefficients.areaCoef,
      depth_coef_id: record.coefficients.depth,
      feng_shui_id: record.coefficients.fengShui,
      calculated_price: record.calculatedPrice,
      total_price: record.totalPrice,
    })
    .select()
    .single()

  if (error) throw error
  return data
}
```

---

## 5. Kiểm Tra Kết Nối

### Tạo Test Page

```typescript
// app/test-supabase/page.tsx
import { supabaseAdmin } from '@/lib/supabase/server'

export default async function TestSupabasePage() {
  const { data, error } = await supabaseAdmin
    .from('provinces')
    .select('*')

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Supabase Connection Test</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
```

Truy cập `http://localhost:3000/test-supabase` để kiểm tra.

---

## 6. Bảo Mật

### Row Level Security (RLS)
- Luôn bật RLS cho các bảng chứa dữ liệu người dùng
- Tạo policies phù hợp với logic ứng dụng

### API Keys
- **anon key:** Chỉ có quyền hạn theo RLS policies
- **service_role key:** Bypass RLS, chỉ dùng server-side
- **Không bao giờ** expose service_role key ở client!

### Environment Variables
- Dùng `NEXT_PUBLIC_` prefix cho biến dùng ở client
- Không dùng prefix cho biến chỉ dùng server-side

---

## 7. Troubleshooting

### Lỗi "Invalid API key"
- Kiểm tra lại API key trong `.env.local`
- Restart dev server sau khi thay đổi `.env.local`

### Lỗi "relation does not exist"
- Chưa chạy migration script
- Kiểm tra tên bảng có đúng không (case-sensitive)

### Lỗi RLS
- Kiểm tra user đã đăng nhập chưa
- Kiểm tra policies có đúng không
- Dùng `supabaseAdmin` để test bypass RLS

---

## Tài Liệu Tham Khảo

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Next.js with Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
