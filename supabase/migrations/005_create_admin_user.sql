-- Migration: Create admin user quantrivba
-- Created: 2025-12-31

-- Xóa account cũ nếu có (để tránh conflict)
DELETE FROM account WHERE "userId" = 'admin-quantrivba-001';

-- Xóa user cũ nếu có
DELETE FROM "user" WHERE id = 'admin-quantrivba-001' OR email = 'admin@landprice.vn' OR username = 'quantrivba';

-- Tạo admin user
INSERT INTO "user" (id, email, name, username, role, full_name, is_active, "emailVerified", "createdAt", "updatedAt")
VALUES (
  'admin-quantrivba-001',
  'admin@landprice.vn',
  'Quản Trị Viên',
  'quantrivba',
  'admin',
  'Quản Trị Viên Hệ Thống',
  true,
  true,
  NOW(),
  NOW()
);

-- Tạo account với password đã hash (Quantri@2025)
INSERT INTO account (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
VALUES (
  'account-quantrivba-001',
  'admin@landprice.vn',
  'credential',
  'admin-quantrivba-001',
  '0d58e922c39e5777f6feab9278579aeb:6c1ebf0d5106e94aa49c9d42a0afafc99046d416d1a3c6a8196603f189301a18d77887606f8c24a8b667f41be42650c07774278712a3f3127c6dcd211bc5fe46',
  NOW(),
  NOW()
);
