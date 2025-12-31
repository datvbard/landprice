-- Land Price App - Seed Data
-- Agribank Trà Vinh - Property Valuation System
-- Created: 2025-12-28

-- =============================================================================
-- BRAND SETTINGS
-- =============================================================================
INSERT INTO brand_settings (key, value) VALUES
  ('app_name', 'Tra Cứu Giá Đất'),
  ('bank_name', 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam'),
  ('branch_name', 'Chi nhánh Trà Vinh'),
  ('slogan', 'Mang phồn thịnh đến khách hàng'),
  ('logo_url', '/images/agribank-logo.png'),
  ('primary_color', '#AE1C3E'),
  ('secondary_color', '#00843D')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =============================================================================
-- DISTRICTS (Quận/Huyện tỉnh Trà Vinh)
-- =============================================================================
-- NOTE: Districts are now imported from Excel template via admin UI.
-- Seed data removed to avoid conflict with imported data.
-- Old seed data had: TP. Trà Vinh, H. Càng Long, H. Cầu Kè, etc.

-- =============================================================================
-- STREETS (Tên đường)
-- =============================================================================
-- NOTE: Streets are now imported from Excel template via admin UI.
-- Seed data removed to avoid conflict with imported data.

-- =============================================================================
-- SEGMENTS (Đoạn đường với giá)
-- =============================================================================
-- NOTE: Segments are now imported from Excel template via admin UI.
-- Seed data removed to avoid conflict with imported data.

-- =============================================================================
-- LAND TYPE COEFFICIENTS (Hệ số loại đất)
-- =============================================================================
INSERT INTO land_type_coefficients (code, name, description, coefficient, sort_order) VALUES
  ('ODT', 'Đất ở đô thị', 'Đất ở tại đô thị, có sổ đỏ', 1.0, 1),
  ('ONT', 'Đất ở nông thôn', 'Đất ở tại nông thôn, có sổ đỏ', 0.85, 2),
  ('TMD', 'Đất thương mại dịch vụ', 'Đất sử dụng cho mục đích thương mại', 0.9, 3),
  ('SXK', 'Đất sản xuất kinh doanh', 'Đất sử dụng cho sản xuất, kinh doanh', 0.75, 4),
  ('CLN', 'Đất trồng cây lâu năm', 'Đất nông nghiệp trồng cây lâu năm', 0.35, 5),
  ('LUA', 'Đất trồng lúa', 'Đất nông nghiệp trồng lúa', 0.25, 6),
  ('NTS', 'Đất nuôi trồng thủy sản', 'Đất nuôi trồng thủy sản', 0.2, 7)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  coefficient = EXCLUDED.coefficient;

-- =============================================================================
-- LOCATION COEFFICIENTS (Hệ số vị trí - hẻm, lộ giới)
-- =============================================================================
INSERT INTO location_coefficients (code, name, description, width_min, width_max, coefficient, sort_order) VALUES
  ('VT1', 'Mặt tiền', 'Mặt tiền đường chính', 6.0, 999, 1.0, 1),
  ('VT2', 'Hẻm > 5m', 'Hẻm rộng trên 5m', 5.0, 6.0, 0.85, 2),
  ('VT3', 'Hẻm 4-5m', 'Hẻm rộng từ 4m đến 5m', 4.0, 5.0, 0.75, 3),
  ('VT4', 'Hẻm 3-4m', 'Hẻm rộng từ 3m đến 4m', 3.0, 4.0, 0.65, 4),
  ('VT5', 'Hẻm 2-3m', 'Hẻm rộng từ 2m đến 3m', 2.0, 3.0, 0.55, 5),
  ('VT6', 'Hẻm 1.5-2m', 'Hẻm rộng từ 1.5m đến 2m', 1.5, 2.0, 0.45, 6),
  ('VT7', 'Hẻm 1-1.5m', 'Hẻm rộng từ 1m đến 1.5m', 1.0, 1.5, 0.35, 7),
  ('VT8', 'Hẻm < 1m', 'Hẻm hẹp dưới 1m', 0.5, 1.0, 0.25, 8),
  ('VT9', 'Hẻm cụt', 'Hẻm cụt, không thông', 0.0, 0.5, 0.1, 9)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  coefficient = EXCLUDED.coefficient;

-- =============================================================================
-- AREA COEFFICIENTS (Hệ số diện tích)
-- =============================================================================
INSERT INTO area_coefficients (code, name, area_min, area_max, coefficient, sort_order) VALUES
  ('DT1', 'Dưới 36m²', 0, 36, 1.0, 1),
  ('DT2', '36-50m²', 36, 50, 0.95, 2),
  ('DT3', '50-100m²', 50, 100, 0.9, 3),
  ('DT4', '100-200m²', 100, 200, 0.85, 4),
  ('DT5', '200-500m²', 200, 500, 0.75, 5),
  ('DT6', '500-1000m²', 500, 1000, 0.65, 6),
  ('DT7', '1000-5000m²', 1000, 5000, 0.5, 7),
  ('DT8', 'Trên 5000m²', 5000, 999999, 0.4, 8)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  coefficient = EXCLUDED.coefficient;

-- =============================================================================
-- DEPTH COEFFICIENTS (Hệ số chiều sâu)
-- =============================================================================
INSERT INTO depth_coefficients (code, name, depth_min, depth_max, coefficient, sort_order) VALUES
  ('CS1', 'Chiều sâu ≤ 20m', 0, 20, 1.0, 1),
  ('CS2', 'Chiều sâu 20-50m', 20, 50, 0.85, 2),
  ('CS3', 'Chiều sâu > 50m', 50, 999, 0.7, 3)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  coefficient = EXCLUDED.coefficient;

-- =============================================================================
-- FENG SHUI COEFFICIENTS (Hệ số phong thủy)
-- =============================================================================
INSERT INTO feng_shui_coefficients (code, name, description, coefficient, sort_order) VALUES
  ('PT1', 'Bình thường', 'Không có yếu tố phong thủy đặc biệt', 1.0, 1),
  ('PT2', 'Gần nghĩa trang', 'Gần khu vực nghĩa trang, nhà tang lễ', 0.85, 2),
  ('PT3', 'Ngã ba, ngã tư đâm thẳng', 'Đất nằm ở vị trí ngã ba, ngã tư đâm thẳng vào nhà', 0.8, 3),
  ('PT4', 'Cạnh trạm điện/cột điện cao thế', 'Gần trạm biến áp hoặc đường dây điện cao thế', 0.9, 4),
  ('PT5', 'Đất tam giác/méo mó', 'Hình dạng đất không vuông vắn, tam giác hoặc méo mó', 0.85, 5),
  ('PT6', 'Gần rạch/kênh ô nhiễm', 'Gần nguồn nước ô nhiễm, rạch bẩn', 0.75, 6)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  coefficient = EXCLUDED.coefficient;

-- =============================================================================
-- SAMPLE USERS (placeholder - passwords will be set via application)
-- Note: DO NOT use these in production. Use proper password hashing via Better Auth.
-- These are placeholder records for testing database structure only.
-- =============================================================================
-- Users will be created through the authentication system in Phase 5
-- Uncomment below only for local testing with temporary passwords
-- INSERT INTO users (email, phone, password_hash, role, full_name, is_active) VALUES
--   ('admin@agribank.com.vn', '0901234567', 'PLACEHOLDER_HASH', 'admin', 'Quản trị viên', true),
--   ('user@agribank.com.vn', '0909876543', 'PLACEHOLDER_HASH', 'user', 'Nhân viên thử nghiệm', true)
-- ON CONFLICT (email) DO NOTHING;

-- =============================================================================
-- VERIFICATION QUERIES (run to check data)
-- =============================================================================
-- SELECT COUNT(*) as district_count FROM districts;
-- SELECT COUNT(*) as street_count FROM streets;
-- SELECT COUNT(*) as segment_count FROM segments;
-- SELECT COUNT(*) as land_type_count FROM land_type_coefficients;
-- SELECT COUNT(*) as location_count FROM location_coefficients;
-- SELECT COUNT(*) as area_count FROM area_coefficients;
-- SELECT COUNT(*) as depth_count FROM depth_coefficients;
-- SELECT COUNT(*) as feng_shui_count FROM feng_shui_coefficients;
