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
INSERT INTO districts (code, name, sort_order) VALUES
  ('TPTV', 'TP. Trà Vinh', 1),
  ('CL', 'H. Càng Long', 2),
  ('CK', 'H. Cầu Kè', 3),
  ('TH', 'H. Tiểu Cần', 4),
  ('CC', 'H. Châu Thành', 5),
  ('CB', 'H. Cầu Ngang', 6),
  ('TC', 'H. Trà Cú', 7),
  ('DL', 'H. Duyên Hải', 8),
  ('TXD', 'TX. Duyên Hải', 9)
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- STREETS (Tên đường - TP. Trà Vinh)
-- =============================================================================
-- Get district IDs for reference
DO $$
DECLARE
  tptv_id UUID;
  cl_id UUID;
  ck_id UUID;
BEGIN
  SELECT id INTO tptv_id FROM districts WHERE code = 'TPTV';
  SELECT id INTO cl_id FROM districts WHERE code = 'CL';
  SELECT id INTO ck_id FROM districts WHERE code = 'CK';

  -- TP. Trà Vinh streets
  INSERT INTO streets (district_id, code, name) VALUES
    (tptv_id, 'NVL', 'Nguyễn Văn Linh'),
    (tptv_id, 'NTT', 'Nguyễn Thị Thập'),
    (tptv_id, 'PBP', 'Phạm Bội Pháp'),
    (tptv_id, 'TQD', 'Trần Quý Đức'),
    (tptv_id, 'LVT', 'Lê Văn Tám'),
    (tptv_id, 'NHT', 'Nguyễn Huệ'),
    (tptv_id, 'DHP', 'Điện Biên Phủ'),
    (tptv_id, 'LVD', 'Lý Văn Đào'),
    (tptv_id, 'CTT', 'Cách Mạng Tháng Tám'),
    (tptv_id, 'NDD', 'Nguyễn Đáng'),
    (tptv_id, 'PTD', 'Phạm Thái Đường'),
    (tptv_id, 'LTH', 'Lê Thánh Tôn'),
    (tptv_id, 'TTT', 'Trưng Trắc'),
    (tptv_id, 'NVT', 'Nguyễn Văn Trỗi'),
    (tptv_id, 'HPL', 'Hùng Phú Lợi')
  ON CONFLICT DO NOTHING;

  -- H. Càng Long streets
  INSERT INTO streets (district_id, code, name) VALUES
    (cl_id, 'QL53', 'Quốc Lộ 53'),
    (cl_id, 'QL60', 'Quốc Lộ 60'),
    (cl_id, 'TL', 'Thị Trấn Càng Long'),
    (cl_id, 'AN', 'An Nhơn'),
    (cl_id, 'BH', 'Bình Hòa')
  ON CONFLICT DO NOTHING;

  -- H. Cầu Kè streets
  INSERT INTO streets (district_id, code, name) VALUES
    (ck_id, 'TTCK', 'Thị Trấn Cầu Kè'),
    (ck_id, 'HQ', 'Hòa Quý'),
    (ck_id, 'PT', 'Phong Thịnh'),
    (ck_id, 'NT', 'Ninh Thới'),
    (ck_id, 'TH', 'Tam Hiệp')
  ON CONFLICT DO NOTHING;
END $$;

-- =============================================================================
-- SEGMENTS (Đoạn đường với giá) - TP. Trà Vinh
-- =============================================================================
DO $$
DECLARE
  street_nvl UUID;
  street_ntt UUID;
  street_pbp UUID;
  street_tqd UUID;
  street_lvt UUID;
  street_nht UUID;
  street_dbp UUID;
  street_lvd UUID;
  street_ctt UUID;
  street_ndd UUID;
  street_ptd UUID;
  street_lth UUID;
  street_ttt UUID;
  street_nvt UUID;
  street_hpl UUID;
  -- Càng Long
  street_ql53 UUID;
  street_ql60 UUID;
  -- Cầu Kè
  street_ttck UUID;
BEGIN
  -- Get street IDs for TP. Trà Vinh
  SELECT id INTO street_nvl FROM streets WHERE code = 'NVL';
  SELECT id INTO street_ntt FROM streets WHERE code = 'NTT';
  SELECT id INTO street_pbp FROM streets WHERE code = 'PBP';
  SELECT id INTO street_tqd FROM streets WHERE code = 'TQD';
  SELECT id INTO street_lvt FROM streets WHERE code = 'LVT';
  SELECT id INTO street_nht FROM streets WHERE code = 'NHT';
  SELECT id INTO street_dbp FROM streets WHERE code = 'DHP';
  SELECT id INTO street_lvd FROM streets WHERE code = 'LVD';
  SELECT id INTO street_ctt FROM streets WHERE code = 'CTT';
  SELECT id INTO street_ndd FROM streets WHERE code = 'NDD';
  SELECT id INTO street_ptd FROM streets WHERE code = 'PTD';
  SELECT id INTO street_lth FROM streets WHERE code = 'LTH';
  SELECT id INTO street_ttt FROM streets WHERE code = 'TTT';
  SELECT id INTO street_nvt FROM streets WHERE code = 'NVT';
  SELECT id INTO street_hpl FROM streets WHERE code = 'HPL';
  -- Càng Long
  SELECT id INTO street_ql53 FROM streets WHERE code = 'QL53';
  SELECT id INTO street_ql60 FROM streets WHERE code = 'QL60';
  -- Cầu Kè
  SELECT id INTO street_ttck FROM streets WHERE code = 'TTCK';

  -- Nguyễn Văn Linh segments (main street, high prices)
  INSERT INTO segments (street_id, segment_from, segment_to, base_price_min, base_price_max, government_price, adjustment_coef_min, adjustment_coef_max) VALUES
    (street_nvl, 'Ngã tư Nguyễn Huệ', 'Ngã tư Lê Văn Tám', 25000000, 35000000, 18000000, 1.0, 1.2),
    (street_nvl, 'Ngã tư Lê Văn Tám', 'Ngã ba Điện Biên Phủ', 22000000, 30000000, 16000000, 0.95, 1.15),
    (street_nvl, 'Ngã ba Điện Biên Phủ', 'Cầu Long Bình', 18000000, 25000000, 14000000, 0.9, 1.1),
    (street_nvl, 'Cầu Long Bình', 'Ranh giới huyện', 15000000, 20000000, 12000000, 0.85, 1.05);

  -- Nguyễn Thị Thập segments
  INSERT INTO segments (street_id, segment_from, segment_to, base_price_min, base_price_max, government_price, adjustment_coef_min, adjustment_coef_max) VALUES
    (street_ntt, 'Chợ Trà Vinh', 'Ngã tư Phạm Bội Pháp', 20000000, 28000000, 15000000, 1.0, 1.2),
    (street_ntt, 'Ngã tư Phạm Bội Pháp', 'Công viên Trà Vinh', 18000000, 24000000, 13500000, 0.95, 1.15),
    (street_ntt, 'Công viên Trà Vinh', 'Bệnh viện Đa khoa', 16000000, 22000000, 12000000, 0.9, 1.1);

  -- Phạm Bội Pháp segments
  INSERT INTO segments (street_id, segment_from, segment_to, base_price_min, base_price_max, government_price, adjustment_coef_min, adjustment_coef_max) VALUES
    (street_pbp, 'Ngã tư Nguyễn Thị Thập', 'Trường THPT Trà Vinh', 17000000, 23000000, 13000000, 0.95, 1.15),
    (street_pbp, 'Trường THPT Trà Vinh', 'Cầu Phạm Bội Pháp', 14000000, 19000000, 11000000, 0.9, 1.1),
    (street_pbp, 'Cầu Phạm Bội Pháp', 'Khu công nghiệp', 12000000, 16000000, 9500000, 0.85, 1.05);

  -- Trần Quý Đức segments
  INSERT INTO segments (street_id, segment_from, segment_to, base_price_min, base_price_max, government_price, adjustment_coef_min, adjustment_coef_max) VALUES
    (street_tqd, 'Ngã tư Nguyễn Huệ', 'Chùa Vĩnh Trường', 19000000, 26000000, 14500000, 0.95, 1.15),
    (street_tqd, 'Chùa Vĩnh Trường', 'Trường ĐH Trà Vinh', 16000000, 22000000, 12500000, 0.9, 1.1),
    (street_tqd, 'Trường ĐH Trà Vinh', 'Ranh giới phường', 13000000, 18000000, 10000000, 0.85, 1.05);

  -- Lê Văn Tám segments
  INSERT INTO segments (street_id, segment_from, segment_to, base_price_min, base_price_max, government_price, adjustment_coef_min, adjustment_coef_max) VALUES
    (street_lvt, 'Ngã tư Nguyễn Văn Linh', 'Chợ Long Bình', 21000000, 29000000, 16000000, 1.0, 1.2),
    (street_lvt, 'Chợ Long Bình', 'Cầu Lê Văn Tám', 17000000, 23000000, 13000000, 0.95, 1.15),
    (street_lvt, 'Cầu Lê Văn Tám', 'Khu dân cư mới', 14000000, 19000000, 10500000, 0.9, 1.1);

  -- Nguyễn Huệ segments
  INSERT INTO segments (street_id, segment_from, segment_to, base_price_min, base_price_max, government_price, adjustment_coef_min, adjustment_coef_max) VALUES
    (street_nht, 'Trung tâm hành chính', 'Ngã tư Nguyễn Văn Linh', 28000000, 38000000, 22000000, 1.05, 1.25),
    (street_nht, 'Ngã tư Nguyễn Văn Linh', 'Công an tỉnh', 24000000, 32000000, 19000000, 1.0, 1.2),
    (street_nht, 'Công an tỉnh', 'Kho bạc Nhà nước', 20000000, 27000000, 15500000, 0.95, 1.15);

  -- Điện Biên Phủ segments
  INSERT INTO segments (street_id, segment_from, segment_to, base_price_min, base_price_max, government_price, adjustment_coef_min, adjustment_coef_max) VALUES
    (street_dbp, 'Ngã ba Nguyễn Văn Linh', 'Trường Tiểu học 1', 16000000, 22000000, 12000000, 0.95, 1.15),
    (street_dbp, 'Trường Tiểu học 1', 'Chợ Điện Biên', 14000000, 19000000, 10500000, 0.9, 1.1),
    (street_dbp, 'Chợ Điện Biên', 'Cầu Điện Biên', 12000000, 16000000, 9000000, 0.85, 1.05);

  -- Lý Văn Đào segments
  INSERT INTO segments (street_id, segment_from, segment_to, base_price_min, base_price_max, government_price, adjustment_coef_min, adjustment_coef_max) VALUES
    (street_lvd, 'Chợ Trà Vinh', 'Ngã tư Cách Mạng Tháng Tám', 18000000, 25000000, 14000000, 0.95, 1.15),
    (street_lvd, 'Ngã tư Cách Mạng Tháng Tám', 'Bưu điện tỉnh', 15000000, 21000000, 11500000, 0.9, 1.1);

  -- Cách Mạng Tháng Tám segments
  INSERT INTO segments (street_id, segment_from, segment_to, base_price_min, base_price_max, government_price, adjustment_coef_min, adjustment_coef_max) VALUES
    (street_ctt, 'Quảng trường', 'Ngã tư Lý Văn Đào', 23000000, 31000000, 18000000, 1.0, 1.2),
    (street_ctt, 'Ngã tư Lý Văn Đào', 'Trường Cao đẳng', 19000000, 26000000, 14500000, 0.95, 1.15),
    (street_ctt, 'Trường Cao đẳng', 'Cầu Cách Mạng', 15000000, 21000000, 11000000, 0.9, 1.1);

  -- Nguyễn Đáng segments
  INSERT INTO segments (street_id, segment_from, segment_to, base_price_min, base_price_max, government_price, adjustment_coef_min, adjustment_coef_max) VALUES
    (street_ndd, 'Ngã tư Trưng Trắc', 'Trường THCS Nguyễn Đáng', 14000000, 19000000, 10500000, 0.9, 1.1),
    (street_ndd, 'Trường THCS Nguyễn Đáng', 'Khu dân cư', 11000000, 15000000, 8500000, 0.85, 1.05);

  -- Phạm Thái Đường segments
  INSERT INTO segments (street_id, segment_from, segment_to, base_price_min, base_price_max, government_price, adjustment_coef_min, adjustment_coef_max) VALUES
    (street_ptd, 'Bệnh viện Y học Cổ truyền', 'Ngã tư Lê Thánh Tôn', 13000000, 18000000, 10000000, 0.9, 1.1),
    (street_ptd, 'Ngã tư Lê Thánh Tôn', 'Khu dân cư Long Đức', 10000000, 14000000, 7500000, 0.85, 1.0);

  -- Lê Thánh Tôn segments
  INSERT INTO segments (street_id, segment_from, segment_to, base_price_min, base_price_max, government_price, adjustment_coef_min, adjustment_coef_max) VALUES
    (street_lth, 'Ngã tư Phạm Thái Đường', 'Chợ Lê Thánh Tôn', 12000000, 17000000, 9000000, 0.9, 1.1),
    (street_lth, 'Chợ Lê Thánh Tôn', 'Cầu Long Đức', 9500000, 13000000, 7000000, 0.85, 1.0);

  -- Trưng Trắc segments
  INSERT INTO segments (street_id, segment_from, segment_to, base_price_min, base_price_max, government_price, adjustment_coef_min, adjustment_coef_max) VALUES
    (street_ttt, 'Ngã tư Nguyễn Huệ', 'Trường Mầm non Trưng Trắc', 17000000, 23000000, 13000000, 0.95, 1.15),
    (street_ttt, 'Trường Mầm non Trưng Trắc', 'Ngã tư Nguyễn Đáng', 14000000, 19000000, 10500000, 0.9, 1.1),
    (street_ttt, 'Ngã tư Nguyễn Đáng', 'Ranh giới phường', 11000000, 15000000, 8000000, 0.85, 1.05);

  -- Nguyễn Văn Trỗi segments
  INSERT INTO segments (street_id, segment_from, segment_to, base_price_min, base_price_max, government_price, adjustment_coef_min, adjustment_coef_max) VALUES
    (street_nvt, 'Trung tâm thành phố', 'Siêu thị Co.op', 20000000, 27000000, 15500000, 1.0, 1.2),
    (street_nvt, 'Siêu thị Co.op', 'Bến xe Trà Vinh', 16000000, 22000000, 12000000, 0.95, 1.15),
    (street_nvt, 'Bến xe Trà Vinh', 'Ranh giới', 12000000, 17000000, 9000000, 0.9, 1.1);

  -- Hùng Phú Lợi segments
  INSERT INTO segments (street_id, segment_from, segment_to, base_price_min, base_price_max, government_price, adjustment_coef_min, adjustment_coef_max) VALUES
    (street_hpl, 'Khu công nghiệp', 'Cầu Hùng Phú', 11000000, 15000000, 8500000, 0.85, 1.05),
    (street_hpl, 'Cầu Hùng Phú', 'Ranh giới huyện', 8500000, 12000000, 6500000, 0.8, 1.0);

  -- Quốc Lộ 53 (Càng Long) segments
  INSERT INTO segments (street_id, segment_from, segment_to, base_price_min, base_price_max, government_price, adjustment_coef_min, adjustment_coef_max) VALUES
    (street_ql53, 'Ngã ba Càng Long', 'Chợ Càng Long', 8000000, 12000000, 6000000, 0.9, 1.1),
    (street_ql53, 'Chợ Càng Long', 'Cầu Càng Long', 6500000, 9500000, 5000000, 0.85, 1.05),
    (street_ql53, 'Cầu Càng Long', 'Ranh giới xã', 5000000, 7500000, 4000000, 0.8, 1.0);

  -- Quốc Lộ 60 (Càng Long) segments
  INSERT INTO segments (street_id, segment_from, segment_to, base_price_min, base_price_max, government_price, adjustment_coef_min, adjustment_coef_max) VALUES
    (street_ql60, 'Ngã tư QL53', 'Trung tâm xã An Nhơn', 6000000, 9000000, 4500000, 0.85, 1.05),
    (street_ql60, 'Trung tâm xã An Nhơn', 'Cầu An Nhơn', 4500000, 7000000, 3500000, 0.8, 1.0);

  -- Thị Trấn Cầu Kè segments
  INSERT INTO segments (street_id, segment_from, segment_to, base_price_min, base_price_max, government_price, adjustment_coef_min, adjustment_coef_max) VALUES
    (street_ttck, 'Chợ Cầu Kè', 'UBND thị trấn', 7500000, 11000000, 5500000, 0.9, 1.1),
    (street_ttck, 'UBND thị trấn', 'Trường THPT Cầu Kè', 6000000, 9000000, 4500000, 0.85, 1.05),
    (street_ttck, 'Trường THPT Cầu Kè', 'Ranh giới xã', 4500000, 7000000, 3500000, 0.8, 1.0);

END $$;

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
