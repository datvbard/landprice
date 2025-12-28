-- Land Price App - Initial Database Schema
-- Agribank Trà Vinh - Property Valuation System
-- Created: 2025-12-28

-- =============================================================================
-- 1. USERS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  full_name VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =============================================================================
-- 2. DISTRICTS TABLE (Quận/Huyện)
-- =============================================================================
CREATE TABLE IF NOT EXISTS districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_districts_code ON districts(code);
CREATE INDEX idx_districts_sort ON districts(sort_order);

-- =============================================================================
-- 3. STREETS TABLE (Tên đường)
-- =============================================================================
CREATE TABLE IF NOT EXISTS streets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  code VARCHAR(50),
  name VARCHAR(200) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_streets_district ON streets(district_id);
CREATE INDEX idx_streets_name ON streets(name);

-- =============================================================================
-- 4. SEGMENTS TABLE (Đoạn đường với giá)
-- =============================================================================
CREATE TABLE IF NOT EXISTS segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  street_id UUID NOT NULL REFERENCES streets(id) ON DELETE CASCADE,
  segment_from VARCHAR(200) NOT NULL,
  segment_to VARCHAR(200) NOT NULL,
  base_price_min DECIMAL(15,2) NOT NULL DEFAULT 0,
  base_price_max DECIMAL(15,2) NOT NULL DEFAULT 0,
  government_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  adjustment_coef_min DECIMAL(5,2) DEFAULT 1.0,
  adjustment_coef_max DECIMAL(5,2) DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_segments_street ON segments(street_id);
CREATE INDEX idx_segments_price ON segments(base_price_min, base_price_max);

-- =============================================================================
-- 5. LAND TYPE COEFFICIENTS (Hệ số loại đất)
-- =============================================================================
CREATE TABLE IF NOT EXISTS land_type_coefficients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  coefficient DECIMAL(5,2) NOT NULL DEFAULT 1.0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 6. LOCATION COEFFICIENTS (Hệ số vị trí - hẻm, lộ giới)
-- =============================================================================
CREATE TABLE IF NOT EXISTS location_coefficients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  width_min DECIMAL(5,2) DEFAULT 0,
  width_max DECIMAL(5,2) DEFAULT 999,
  coefficient DECIMAL(5,2) NOT NULL DEFAULT 1.0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 7. AREA COEFFICIENTS (Hệ số diện tích)
-- =============================================================================
CREATE TABLE IF NOT EXISTS area_coefficients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  area_min DECIMAL(10,2) NOT NULL DEFAULT 0,
  area_max DECIMAL(10,2) NOT NULL DEFAULT 999999,
  coefficient DECIMAL(5,2) NOT NULL DEFAULT 1.0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 8. DEPTH COEFFICIENTS (Hệ số chiều sâu)
-- =============================================================================
CREATE TABLE IF NOT EXISTS depth_coefficients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  depth_min DECIMAL(5,2) NOT NULL DEFAULT 0,
  depth_max DECIMAL(5,2) NOT NULL DEFAULT 999,
  coefficient DECIMAL(5,2) NOT NULL DEFAULT 1.0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 9. FENG SHUI COEFFICIENTS (Hệ số phong thủy)
-- =============================================================================
CREATE TABLE IF NOT EXISTS feng_shui_coefficients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  coefficient DECIMAL(5,2) NOT NULL DEFAULT 1.0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 10. SEARCH HISTORY (Lịch sử tra cứu)
-- =============================================================================
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  district_name VARCHAR(100),
  street_name VARCHAR(200),
  segment_desc VARCHAR(400),
  area DECIMAL(10,2),
  total_price DECIMAL(15,2),
  coefficients_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_history_user ON search_history(user_id);
CREATE INDEX idx_history_created ON search_history(created_at DESC);

-- =============================================================================
-- 11. BRAND SETTINGS (Cài đặt thương hiệu)
-- =============================================================================
CREATE TABLE IF NOT EXISTS brand_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(50) UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE streets ENABLE ROW LEVEL SECURITY;
ALTER TABLE segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE land_type_coefficients ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_coefficients ENABLE ROW LEVEL SECURITY;
ALTER TABLE area_coefficients ENABLE ROW LEVEL SECURITY;
ALTER TABLE depth_coefficients ENABLE ROW LEVEL SECURITY;
ALTER TABLE feng_shui_coefficients ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_settings ENABLE ROW LEVEL SECURITY;

-- Public read access for lookup tables (anon + authenticated)
CREATE POLICY "Public read districts" ON districts FOR SELECT USING (true);
CREATE POLICY "Public read streets" ON streets FOR SELECT USING (true);
CREATE POLICY "Public read segments" ON segments FOR SELECT USING (true);
CREATE POLICY "Public read land_type_coefficients" ON land_type_coefficients FOR SELECT USING (true);
CREATE POLICY "Public read location_coefficients" ON location_coefficients FOR SELECT USING (true);
CREATE POLICY "Public read area_coefficients" ON area_coefficients FOR SELECT USING (true);
CREATE POLICY "Public read depth_coefficients" ON depth_coefficients FOR SELECT USING (true);
CREATE POLICY "Public read feng_shui_coefficients" ON feng_shui_coefficients FOR SELECT USING (true);
CREATE POLICY "Public read brand_settings" ON brand_settings FOR SELECT USING (true);

-- Users can read their own data
CREATE POLICY "Users read own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Search history: users can only see their own history
CREATE POLICY "Users read own history" ON search_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own history" ON search_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own history" ON search_history FOR DELETE USING (auth.uid() = user_id);

-- Admin full access (using service role key bypasses RLS)
-- For app-level admin checks, we'll handle in application code

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_segments_updated_at
  BEFORE UPDATE ON segments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_brand_settings_updated_at
  BEFORE UPDATE ON brand_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
