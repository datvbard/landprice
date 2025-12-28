# Hướng Dẫn Deploy Lên Vercel

## 1. Chuẩn Bị

### Yêu Cầu
- Tài khoản GitHub với repository đã push code
- Tài khoản Vercel (đăng ký miễn phí tại vercel.com)

### Kiểm Tra Trước Khi Deploy
```bash
# Chạy build local để đảm bảo không có lỗi
npm run build

# Kiểm tra type errors
npm run type-check
```

---

## 2. Kết Nối Vercel với GitHub

### Bước 1: Đăng Nhập Vercel
1. Truy cập https://vercel.com
2. Click **Sign Up** hoặc **Log In**
3. Chọn **Continue with GitHub**
4. Authorize Vercel để truy cập GitHub

### Bước 2: Import Project
1. Tại Dashboard, click **Add New...** > **Project**
2. Chọn **Import Git Repository**
3. Tìm repository `landprice` trong danh sách
4. Click **Import**

### Bước 3: Cấu Hình Project
1. **Project Name:** `landprice-travinh` (hoặc tên tùy chọn)
2. **Framework Preset:** Next.js (tự động detect)
3. **Root Directory:** `.` (mặc định)
4. **Build Command:** `npm run build` (mặc định)
5. **Output Directory:** `.next` (mặc định)
6. **Install Command:** `npm install` (mặc định)

---

## 3. Cấu Hình Environment Variables

### Bước 1: Thêm Variables
Tại màn hình Import hoặc **Project Settings** > **Environment Variables**:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | All |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | All |
| `BETTER_AUTH_SECRET` | `random-string-32-chars` | All |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` | All |

### Bước 2: Lưu Ý Quan Trọng
- Variables với prefix `NEXT_PUBLIC_` sẽ được expose ở client
- `SUPABASE_SERVICE_ROLE_KEY` phải được bảo mật (không có prefix)
- Sau khi thêm variables, cần redeploy để apply

### Bước 3: Generate Auth Secret
```bash
# Linux/Mac
openssl rand -base64 32

# Hoặc dùng online generator
# https://generate-secret.vercel.app/32
```

---

## 4. Deploy

### Deploy Tự Động (Recommended)
1. Click **Deploy** sau khi cấu hình xong
2. Vercel sẽ:
   - Clone repository
   - Install dependencies
   - Build project
   - Deploy lên edge network
3. Đợi 1-2 phút cho build hoàn tất

### Deploy URL
Sau khi deploy thành công:
- **Production:** `https://landprice-travinh.vercel.app`
- **Preview:** `https://landprice-travinh-xxx.vercel.app` (cho mỗi commit)

---

## 5. Custom Domain (Tùy Chọn)

### Bước 1: Thêm Domain
1. Vào **Project Settings** > **Domains**
2. Click **Add**
3. Nhập domain: `giadat.agribank-travinh.vn` (ví dụ)

### Bước 2: Cấu Hình DNS
Thêm record tại nhà cung cấp domain:

**Option A: CNAME (Subdomain)**
```
Type: CNAME
Name: giadat
Value: cname.vercel-dns.com
```

**Option B: A Record (Root Domain)**
```
Type: A
Name: @
Value: 76.76.21.21
```

### Bước 3: Verify
- Vercel sẽ tự động verify DNS
- SSL certificate được cấp tự động (Let's Encrypt)
- Thường mất 5-10 phút để hoàn tất

---

## 6. CI/CD Tự Động

### Git Integration
Vercel tự động deploy khi:
- **Push to main/master:** Production deployment
- **Push to other branches:** Preview deployment
- **Pull Request:** Preview deployment với comment

### Cấu Hình Branch
Tại **Project Settings** > **Git**:
- **Production Branch:** `main`
- **Preview Branches:** Tất cả branches khác

### Ignore Build Step (Tùy Chọn)
Tạo file `vercel.json` để skip build cho một số paths:

```json
{
  "git": {
    "deploymentEnabled": {
      "main": true,
      "dev": true
    }
  },
  "ignoreCommand": "git diff HEAD^ HEAD --quiet -- . ':!docs' ':!*.md'"
}
```

---

## 7. Monitoring & Analytics

### Vercel Analytics (Free)
1. Vào **Project Settings** > **Analytics**
2. Enable **Web Analytics**
3. Thêm component vào `app/layout.tsx`:

```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Speed Insights
```typescript
import { SpeedInsights } from '@vercel/speed-insights/next'

// Thêm vào layout.tsx
<SpeedInsights />
```

### Logs
- **Build Logs:** Chi tiết quá trình build
- **Runtime Logs:** Log từ API routes, server components
- Xem tại **Project** > **Deployments** > chọn deployment > **Logs**

---

## 8. Troubleshooting

### Build Failed

**Lỗi TypeScript:**
```
Type error: ...
```
→ Chạy `npm run type-check` local và fix lỗi

**Lỗi Missing Dependencies:**
```
Module not found: ...
```
→ Kiểm tra package.json, chạy `npm install`

**Lỗi Environment Variables:**
```
Error: Missing environment variable
```
→ Thêm variable trong Vercel Settings

### 404 Error Sau Deploy

Kiểm tra:
- File `next.config.js` có cấu hình đúng
- Route paths có chính xác không
- Build output có page được generate

### API Routes Không Hoạt Động

Kiểm tra:
- Environment variables đã set
- API route syntax đúng (app router)
- CORS nếu gọi từ domain khác

---

## 9. Redeploy

### Manual Redeploy
1. Vào **Deployments**
2. Click **...** trên deployment cần redeploy
3. Chọn **Redeploy**

### Force Redeploy (Clear Cache)
1. Click **...** > **Redeploy**
2. Check **Use existing Build Cache** = OFF
3. Click **Redeploy**

### Redeploy via CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## 10. Rollback

### Rollback Production
1. Vào **Deployments**
2. Tìm deployment ổn định trước đó
3. Click **...** > **Promote to Production**

### Instant Rollback
- Vercel giữ tất cả deployments
- Rollback là instant, không cần rebuild

---

## 11. Performance Tips

### Edge Functions
Sử dụng Edge Runtime cho API routes nhanh hơn:

```typescript
// app/api/example/route.ts
export const runtime = 'edge'

export async function GET() {
  return Response.json({ message: 'Hello from Edge!' })
}
```

### Image Optimization
Next.js Image component tự động optimize:

```typescript
import Image from 'next/image'

<Image
  src="/logo.png"
  alt="Logo"
  width={80}
  height={80}
  priority // Preload for LCP
/>
```

### Caching
```typescript
// Static data - cache 1 hour
export const revalidate = 3600

// Dynamic data per request
export const dynamic = 'force-dynamic'
```

---

## 12. Checklist Deploy Production

- [ ] Build local thành công (`npm run build`)
- [ ] Type check pass (`npm run type-check`)
- [ ] ESLint pass (`npm run lint`)
- [ ] Environment variables đã set trên Vercel
- [ ] Supabase RLS policies đã cấu hình
- [ ] Custom domain đã verify (nếu có)
- [ ] Analytics đã enable
- [ ] Test production URL sau deploy

---

## Tài Liệu Tham Khảo

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/environment-variables)
- [Custom Domains](https://vercel.com/docs/custom-domains)
- [Vercel CLI](https://vercel.com/docs/cli)
