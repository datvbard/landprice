# Land Price Lookup App - Implementation Plan
**Brand:** Agribank Trà Vinh
**Stack:** Next.js 14 + TypeScript + Tailwind + Supabase
**Approach:** UI-first, incremental, testable phases

---

## Phase 1: Project Setup & Static Login Page ✅ COMPLETED
**Complexity:** Simple | **Test:** Static login page on localhost
**Status:** ✅ Completed on 2025-12-28
**Quality Score:** 100% | **Review:** `plans/reports/code-reviewer-251228-2032-phase1-review.md`

### Tasks:
1. ✅ Initialize Next.js 14 with TypeScript, Tailwind, App Router
2. ✅ Configure Tailwind with Agribank design tokens (#AE1C3E)
3. ✅ Add Be Vietnam Pro font
4. ✅ Convert `mockup/01-login.html` to `app/login/page.tsx`
5. ✅ Create components: `Button.tsx`, `Input.tsx`

### Success Criteria:
- ✅ Login page matches mockup (burgundy branding, gradients)
- ✅ Responsive on mobile (428px)
- ✅ Static UI only, no functionality yet

### Critical Files:
```
app/layout.tsx - Root layout
app/login/page.tsx - Login page
components/ui/Button.tsx
components/ui/Input.tsx
tailwind.config.ts - Design tokens
```

### Build Results:
- ✅ ESLint: No errors or warnings
- ✅ TypeScript: Strict mode passed
- ✅ Build: Successful (90.6 kB login page)
- ✅ Bundle: 879 KB static assets

### Next Actions:
1. Deploy to Vercel preview
2. Optional: Fix 2 accessibility improvements (viewport userScalable, ARIA labels)
3. Proceed to Phase 2

---

## Phase 2: Static User Pages (Home, Results, History) ✅ COMPLETED
**Complexity:** Medium | **Test:** Navigate between 3 user pages
**Status:** ✅ Completed on 2025-12-28

### Tasks:
1. ✅ Convert `02-home-search.html` → `app/(user)/page.tsx`
2. ✅ Convert `03-results.html` → `app/(user)/results/page.tsx`
3. ✅ Convert `04-history.html` → `app/(user)/history/page.tsx`
4. ✅ Create layout `app/(user)/layout.tsx` with bottom navigation
5. ✅ Create components: `Select`, `BottomNav` (Cards embedded in pages)
6. ✅ Add hardcoded mock data (districts, streets, prices)

### Success Criteria:
- ✅ All pages match mockups pixel-perfectly
- ✅ Bottom nav works, highlights active page
- ✅ Dropdowns display mock data
- ✅ Price cards show 4 levels
- ✅ Mobile scrolling smooth

### Critical Files:
```
app/(user)/layout.tsx - Bottom nav layout
app/(user)/page.tsx - Home/search
app/(user)/results/page.tsx - Results
app/(user)/history/page.tsx - History
components/ui/select.tsx
components/bottom-nav.tsx
```

### Build Results:
- ✅ ESLint: No errors
- ✅ TypeScript: Strict mode passed
- ✅ Build: Successful
  - / (Home): 3.32 kB
  - /results: 4.25 kB
  - /history: 2.33 kB

### Next Actions:
1. Deploy to Vercel preview
2. Proceed to Phase 3 (Static Admin Pages)

---

## Phase 3: Static Admin Pages ✅ COMPLETED
**Complexity:** Medium | **Test:** Admin sidebar + data tables
**Status:** ✅ Completed on 2025-12-28

### Tasks:
1. ✅ Convert `05-admin-dashboard.html` → `app/(admin)/dashboard/page.tsx`
2. ✅ Convert `06-admin-settings.html` → `app/(admin)/settings/page.tsx`
3. ✅ Create `app/(admin)/layout.tsx` with sidebar
4. ✅ Create components: `Sidebar`, `DataTable`, `StatCard`, `ActivityItem`
5. ✅ Add mock data tables (prices, activity, stats)

### Success Criteria:
- ✅ Admin sidebar on desktop, collapsible on mobile
- ✅ Data tables render with mock data
- ✅ CRUD buttons visible (non-functional)
- ✅ Brand settings form layout complete

### Critical Files:
```
app/(admin)/layout.tsx - Sidebar layout
app/(admin)/dashboard/page.tsx
app/(admin)/settings/page.tsx
components/admin/Sidebar.tsx
components/admin/DataTable.tsx
components/admin/StatCard.tsx
components/admin/ActivityItem.tsx
```

### Build Results:
- ✅ TypeScript: Strict mode passed
- ✅ Build: Successful
  - /dashboard: 3.51 kB
  - /settings: 3.23 kB
- ✅ Code Review: 82/100

### Next Actions:
1. Deploy to Vercel preview
2. Proceed to Phase 4 (Supabase Setup & Database Schema)

---

## Phase 4: Supabase Setup & Database Schema ✅ COMPLETED
**Complexity:** Medium | **Test:** Query data via Supabase Studio
**Status:** ✅ Completed on 2025-12-28
**Quality Score:** 82/100 | **Code Review:** Critical fixes applied

### Tasks:
1. ✅ Create Supabase project
2. ✅ Design schema (11 tables)
3. ✅ Create tables with foreign keys, indexes
4. ✅ Add Row Level Security policies
5. ✅ Seed with sample data (3 districts, 100+ segments)
6. ✅ Configure Supabase client in Next.js

### Database Schema:
```sql
users (id, email, password_hash, role, full_name, is_active, created_at)
districts (id, code, name, sort_order)
streets (id, district_id, code, name)
segments (id, street_id, segment_from, segment_to, base_price_min, base_price_max, government_price, adjustment_coef_min, adjustment_coef_max)
land_type_coefficients (id, name, coefficient)
location_coefficients (id, name, width_min, width_max, coefficient)
area_coefficients (id, area_min, area_max, coefficient)
depth_coefficients (id, depth_min, depth_max, coefficient)
feng_shui_coefficients (id, name, coefficient)
search_history (id, user_id, district, street, segment, area, total_price, coefficients_json, created_at)
brand_settings (id, key, value)
```

### Success Criteria:
- ✅ All tables created with correct relationships
- ✅ Sample data inserted (viewable in Supabase Studio)
- ✅ Next.js connects to Supabase successfully
- ✅ TypeScript strict mode validation passed
- ✅ Schema validation completed

### Critical Files Created:
```
supabase/migrations/001_initial_schema.sql
supabase/seed.sql
lib/supabase/client.ts
lib/supabase/database.types.ts
.env.local (SUPABASE_URL, SUPABASE_ANON_KEY)
pages/supabase-test.tsx (test connection page)
```

### Build Results:
- ✅ TypeScript: Strict mode passed
- ✅ Build: Successful
- ✅ Supabase client: Connected and functional
- ✅ Database: All 11 tables created and indexed
- ✅ Seed data: 3 districts with 100+ segments loaded

### Critical Fixes Applied:
1. ✅ Added `phone` field to users table (full_name, phone, is_active)
2. ✅ Added `is_active` boolean field for user status management
3. ✅ Cleaned up seed data with consistent formatting
4. ✅ Added proper foreign key constraints
5. ✅ Configured Row Level Security policies

### Next Actions:
1. Proceed to Phase 5 (Authentication System)
2. Implement Better Auth integration
3. Configure login flow and role-based redirects

---

## Phase 5: Authentication System ✅ COMPLETED
**Complexity:** Medium | **Test:** Login → redirects correctly
**Status:** ✅ Completed on 2025-12-29 at 10:05 UTC
**Quality Score:** 85/100 | **Code Review:** `plans/reports/code-reviewer-251229-0958-phase5-auth-review.md`

### Tasks:
1. ✅ Install Better Auth
2. ✅ Configure email/password authentication
3. ✅ Implement login flow with session
4. ✅ Role-based redirect (admin → `/admin/dashboard`, user → `/`)
5. ✅ Create middleware to protect `/admin/*` routes
6. ✅ Add logout functionality
7. ✅ Display user info in header

### Success Criteria:
- ✅ Login validates credentials, creates session
- ✅ Admin users access admin routes
- ✅ Regular users blocked from admin
- ✅ Logout clears session
- ✅ Protected routes redirect to login

### Critical Files Created:
```
lib/auth/auth.ts - Better Auth config (82 lines)
lib/auth/auth-client.ts - Client-side auth (45 lines)
lib/auth/validators.ts - Input validation (38 lines)
app/api/auth/[...all]/route.ts - API route handler (12 lines)
middleware.ts - Route protection (24 lines)
app/login/actions.ts - Login server action (28 lines)
hooks/use-auth.ts - useAuth hook (31 lines)
components/header.tsx - User info + logout (67 lines)
```

### Files Modified:
```
app/login/page.tsx - Integrated auth form
app/(user)/layout.tsx - User auth wrapper
app/(admin)/layout.tsx - Admin auth + role check
package.json - Added better-auth, pg, @types/pg
.env.example - Updated with auth env vars
```

### Build Results:
- ✅ TypeScript: Strict mode PASSED (0 errors)
- ✅ ESLint: 0 errors, 2 warnings (image optimization - low priority)
- ✅ Build: Successful
  - Login: 91.3 kB
  - Middleware: 57.6 kB
  - Total bundle: 212 KB

### Critical Fixes Required Before Production:
1. ⚠️ Generate 32+ char BETTER_AUTH_SECRET (`npx @better-auth/cli secret`)
2. ⚠️ Update password requirement to 8+ chars (currently 6)
3. ⚠️ Add rate limiting on login (prevent brute force)
4. ⚠️ Fix phone normalization (handle `84` prefix without `+`)
5. ⚠️ Use generic error messages (prevent user enumeration)

### Security Audit (OWASP Top 10):
- ✅ A03: Injection - PASS (parameterized queries)
- ✅ A01: Access Control - PASS (role-based middleware)
- ⚠️ A02: Crypto Failures - FIX (weak secret)
- ⚠️ A07: Auth Failures - FIX (weak password, no rate limit)
- **Overall Score:** 7/10 (Good, with fixable issues)

### Next Actions:
1. Apply critical security fixes before deploy
2. Deploy to Vercel preview
3. Test login flow on mobile
4. Proceed to Phase 6 (Search Flow & Price Calculation)

**Status:** Phase 5 READY FOR TESTING (security fixes needed before production)

---

## Phase 6: User Search Flow & Price Calculation ✅ COMPLETED
**Complexity:** Complex | **Test:** Search returns real prices, calculation works
**Status:** ✅ Completed on 2025-12-29 at 19:38 UTC
**Quality Score:** 88/100 | **Code Review:** Search flow + calculation validation passed

### Tasks:
1. ✅ Implement dynamic dropdowns (district → street → segment)
2. ✅ Fetch segment data on search (4 price levels)
3. ✅ Build calculation engine:
   ```
   price = base_price × land_type_coef × location_coef ×
           area_coef × depth_coef × feng_shui_coef
   ```
4. ✅ Display coefficient selection dropdowns
5. ✅ Add area input field
6. ✅ Calculate final total price live
7. ✅ Display calculation breakdown
8. ✅ Add "Save to History" button (UI only)

### Success Criteria:
- ✅ Districts load from database
- ✅ Streets filter by selected district
- ✅ Segments filter by selected street
- ✅ Base prices display accurately
- ✅ Coefficient selection updates calculation live
- ✅ Final price matches formula
- ✅ Breakdown shows each coefficient applied

### Critical Files Created/Modified:
```
app/(user)/page.tsx - Dynamic search dropdowns, segment selection
app/(user)/results/page.tsx - Live calculation display, price breakdown
lib/calculations/price-calculator.ts - Calculation engine (formula implementation)
lib/api/search-data.ts - Database queries for districts, streets, segments
lib/api/coefficients.ts - Coefficient data fetching
app/api/districts/route.ts - Districts API endpoint
app/api/streets/route.ts - Streets API endpoint (filtered by district)
app/api/segments/route.ts - Segments API endpoint (filtered by street)
app/api/coefficients/route.ts - Coefficients API endpoint
```

### Build Results:
- ✅ TypeScript: Strict mode PASSED (0 errors)
- ✅ ESLint: 0 errors, 2 warnings (non-blocking)
- ✅ Build: Successful
  - /search: 5.42 kB
  - /results: 6.87 kB
  - API routes: 12.3 kB (combined)
- ✅ Code Review Score: 88/100
  - Search flow: 90/100 (excellent)
  - Calculation engine: 87/100 (accurate formula, minor optimization opportunities)
  - API endpoints: 85/100 (proper validation, small refactoring suggestion)

### Critical Fixes Applied:
1. ✅ Dynamic dropdown dependency chain (district → street → segment)
2. ✅ Real-time calculation on coefficient selection
3. ✅ Proper null checks for segment price levels
4. ✅ Price rounding to 2 decimal places
5. ✅ Coefficient validation before calculation

### Next Actions:
1. Deploy to Vercel preview
2. Test live calculation on mobile
3. Proceed to Phase 7 (Search History Feature)

**Status:** Phase 6 READY FOR DEPLOYMENT

---

## Phase 7: Search History Feature ✅ COMPLETED
**Complexity:** Simple | **Test:** Searches save, history displays
**Status:** ✅ Completed on 2025-12-29 at 21:35 UTC
**Quality Score:** 92/100 | **Code Review:** Search history implementation validated

### Tasks:
1. ✅ Save search to `search_history` after calculation
2. ✅ Fetch history on history page (newest first)
3. ✅ Display as cards (location, date, price)
4. ✅ "View Details" restores search parameters
5. ✅ Delete button removes record
6. ✅ Paginate if > 20 records

### Success Criteria:
- ✅ Each search saves to database
- ✅ History page loads user's searches
- ✅ Cards show location, date, price
- ✅ Clicking card restores inputs
- ✅ Delete removes record

### Critical Files Created/Modified:
```
NEW: components/history-card.tsx (155 lines)
REFACTORED: app/(user)/history/page.tsx (195 lines)
MODIFIED: app/(user)/results/page.tsx (added segmentId)
NEW: lib/api/history.ts (database queries)
NEW: app/api/history/route.ts (API endpoints)
```

### Build Results:
- ✅ TypeScript: Strict mode PASSED (0 errors)
- ✅ ESLint: 0 errors, 2 warnings (non-blocking, unrelated files)
- ✅ Build: Successful
  - /history: 5.18 kB
  - API routes: 8.2 kB (combined)
- ✅ Code Review Score: 92/100
  - History card UI: 95/100 (clean, responsive)
  - Database queries: 90/100 (efficient pagination)
  - Delete functionality: 90/100 (proper user validation)

### Critical Fixes Applied:
1. ✅ History saved with all calculation context (segmentId, coefficients)
2. ✅ Pagination implemented (20 records per page)
3. ✅ User isolation enforced (only see own history)
4. ✅ Delete button validates user ownership
5. ✅ Timestamps formatted for Vietnamese locale

### Next Actions:
1. Deploy to Vercel preview
2. Test history persistence across sessions
3. Proceed to Phase 8 (Admin User Management)

**Status:** Phase 7 READY FOR DEPLOYMENT

---

## Phase 8: Admin User Management ✅ COMPLETED
**Complexity:** Medium | **Test:** Create, edit, delete users
**Status:** ✅ Completed on 2025-12-29 at 21:55 UTC
**Quality Score:** 87/100 | **Code Review:** 0 critical issues

### Tasks:
1. ✅ Create user table UI (name, email, role, actions)
2. ✅ "Create User" modal form
3. ✅ Hash password, insert into `users`
4. ✅ Edit user (name, email, role)
5. ✅ Delete user with confirmation
6. ✅ Search/filter users

### Success Criteria:
- ✅ User table loads from database
- ✅ Create user validates inputs, saves
- ✅ Edit updates user correctly
- ✅ Delete removes user
- ✅ Search filters list
- ✅ Admin cannot delete self

### Critical Files Created:
```
lib/api/users.ts (113 lines)
app/api/admin/users/route.ts (124 lines)
app/api/admin/users/[id]/route.ts (127 lines)
components/admin/user-form.tsx (210 lines)
app/(admin)/users/page.tsx (246 lines)
```

### Files Modified:
```
lib/auth/auth.ts (added hashPassword, verifyPassword)
components/admin/sidebar.tsx (navigation link)
```

### Build Results:
- ✅ TypeScript: 0 errors
- ✅ ESLint: 2 warnings (unrelated)
- ✅ Build: Successful
  - /users: 3.97 kB
- ✅ Code Review Score: 87/100
  - Security: 95/100 (admin guards, self-deletion prevention)
  - Code quality: 90/100 (clean separation, TypeScript types)
  - UX: 85/100 (loading states, error messages)

### Security Features:
- ✅ Admin role verification on every API call
- ✅ Self-deletion prevention (cannot delete own account)
- ✅ Scrypt password hashing (Better Auth compatible)
- ✅ Input validation (email format, password length ≥8)
- ✅ SQL injection protection (parameterized queries)
- ✅ OWASP Top 10 compliance: 9.5/10

### Next Actions:
1. Deploy to Vercel preview
2. Test user CRUD operations on mobile
3. Proceed to Phase 9 (Admin Price & Coefficient Management)

**Status:** Phase 8 READY FOR DEPLOYMENT

---

## Phase 9: Admin Price & Coefficient Management ✅ COMPLETED
**Complexity:** Medium | **Test:** Edit prices and coefficients
**Status:** Completed on 2025-12-29
**Quality Score:** 90/100
**Code Review:** 0 critical issues

### Tasks:
1. ✅ Price table UI (district, street, segment, prices)
2. ✅ Inline editing for prices
3. ✅ Coefficient tabs (5 types: Land Type, Location, Area, Depth, Feng Shui)
4. ✅ Edit coefficient values
5. ✅ Search/filter by district or street
6. ✅ Validate numeric inputs

### Success Criteria:
- ✅ Price table loads all segments
- ✅ Admin edits base/government prices
- ✅ Coefficient tabs load correct data
- ✅ Values update in database
- ✅ Search filters work
- ✅ Validation prevents invalid inputs

### Critical Files Created:
```
lib/api/admin-prices.ts (96 lines)
lib/api/admin-coefficients.ts (101 lines)
app/api/admin/prices/route.ts (76 lines)
app/api/admin/prices/[id]/route.ts (121 lines)
app/api/admin/coefficients/route.ts (60 lines)
app/api/admin/coefficients/[id]/route.ts (146 lines)
app/(admin)/prices/page.tsx (289 lines)
app/(admin)/coefficients/page.tsx (379 lines)
```

### Files Modified:
```
components/admin/sidebar.tsx (navigation links)
```

### Build Results:
- ✅ TypeScript: 0 errors
- ✅ ESLint: 2 warnings (unrelated)
- ✅ Build: Successful
  - /prices: 2.97 kB
  - /coefficients: 2.95 kB

### Security Features:
- ✅ Admin role verification on all API endpoints
- ✅ Input validation (numeric ranges, min≤max)
- ✅ SQL injection protection (parameterized queries)

### Next Actions:
1. Deploy to Vercel preview
2. Test price/coefficient edits on mobile
3. Proceed to Phase 10 (Excel File Upload & Parsing)

**Status:** Phase 9 READY FOR DEPLOYMENT

---

## Phase 10: Excel File Upload & Parsing
**Complexity:** Complex | **Test:** Upload Excel, data imports

### Tasks:
1. Install `xlsx` library
2. File upload UI on admin settings
3. Parse Excel (9 district sheets + 2 coefficient sheets)
4. Validate structure
5. Show preview before import
6. Import to database (upsert logic)
7. Display progress, success/error messages
8. Add "Download Template" button

### Success Criteria:
- Upload accepts .xlsx only
- File parses 9 + 2 sheets successfully
- Preview shows first 10 rows per sheet
- Data inserts/updates in database
- Duplicates update instead of creating new
- Progress indicator shows during import
- Success message shows row counts

### Critical Files:
```
app/(admin)/settings/page.tsx - Upload UI
lib/excel/parser.ts - Excel parsing
lib/excel/importer.ts - Database import
app/api/admin/upload/route.ts
public/template.xlsx - Sample template
```

**Deploy to Vercel preview after this phase**

---

## Phase 11: Brand Settings Management
**Complexity:** Simple | **Test:** Update app name and logo

### Tasks:
1. Brand settings form (app_name, logo_url)
2. Save to `brand_settings` table
3. Upload logo to Supabase Storage or URL
4. Display logo in headers across all pages
5. Update header/footer with dynamic brand name

### Success Criteria:
- Form loads current settings
- Admin changes app name
- Admin uploads logo or enters URL
- Changes save to database
- App name updates in all headers
- Logo displays in login and headers

### Critical Files:
```
app/(admin)/settings/page.tsx
lib/api/settings.ts
components/Header.tsx - Dynamic branding
app/layout.tsx - Brand metadata
```

**Deploy to Vercel preview after this phase**

---

## Phase 12: Testing, Polish & Production Deployment
**Complexity:** Medium | **Test:** End-to-end on mobile + production

### Tasks:
1. **Testing:**
   - Test all user flows end-to-end
   - Test admin CRUD operations
   - Test on mobile devices (responsive, touch)
   - Test calculation accuracy
   - Test Excel import with real data
   - Fix bugs and edge cases

2. **Polish:**
   - Add loading states for async operations
   - Add error messages for failed API calls
   - Add empty states (no history, no results)
   - Optimize images and fonts
   - Add meta tags for SEO
   - Ensure accessibility (keyboard nav, focus)

3. **Deployment:**
   - Push to GitHub
   - Connect Vercel to GitHub repo
   - Configure environment variables
   - Deploy to production
   - Test on mobile via production URL

### Success Criteria:
- All features work without errors
- Mobile testing confirms responsive design
- Calculations match expected results
- Excel import works with real data
- App deploys to Vercel production
- No console errors
- Loading states provide feedback
- Performance < 3s page loads

### Critical Files:
```
.env.local - Environment variables
vercel.json - Vercel config
package.json - Dependencies
README.md - Deployment instructions
```

---

## Testing Approach Per Phase

After each phase:
1. **Localhost testing:** `npm run dev` → test functionality in browser
2. **Vercel preview:** Push to GitHub → Vercel auto-deploys → test on mobile via preview URL
3. **Feedback loop:** Fix issues → re-test → proceed to next phase

---

## Tech Stack Summary

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Supabase PostgreSQL
- **Auth:** Better Auth (email/password, role-based)
- **File Upload:** `xlsx` library for parsing
- **Hosting:** Vercel (frontend), Supabase (database)
- **Design:** Custom components based on mockups (Agribank branding)

---

## Critical Files Overview

**Most Important Files to Create:**
1. `lib/calculations/price.ts` - Core calculation engine
2. `supabase/migrations/001_initial_schema.sql` - Database schema
3. `lib/excel/parser.ts` - Excel parsing logic
4. `app/(user)/results/page.tsx` - Results with calculation UI
5. `lib/auth/better-auth.ts` - Authentication config

**File Structure:**
```
app/
├── (user)/          # User routes with bottom nav
├── (admin)/         # Admin routes with sidebar
├── login/           # Login page
└── api/             # API routes
components/
├── ui/              # Reusable UI components
└── admin/           # Admin-specific components
lib/
├── auth/            # Authentication
├── supabase/        # Database client
├── api/             # API functions
├── calculations/    # Price calculation
└── excel/           # Excel parsing/import
supabase/
├── migrations/      # Database migrations
└── seed.sql         # Sample data
```

---

## Environment Variables Required

```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Better Auth
BETTER_AUTH_SECRET=xxx

# App
NEXT_PUBLIC_APP_URL=https://landprice.vercel.app
```

---

## Calculation Formula Reference

```typescript
// Price per m² after adjustments
pricePerM2 = basePrice ×
             landTypeCoef ×
             locationCoef ×
             areaCoef ×
             depthCoef ×
             fengShuiCoef

// Total property value
totalPrice = pricePerM2 × area
```

**Coefficient Types:**
- Land Type: 7 types (1.0 to 0.2)
- Location: 9 types based on alley depth/width (1.0 to 0.1)
- Area: 8 tiers based on total area (1.0 to 0.4)
- Depth: 3 tiers based on lot depth (1.0 to 0.25)
- Feng Shui: 4 types (0.7 to 0.8)

---

## Notes

- **YAGNI/KISS/DRY:** Keep code simple, avoid over-engineering
- **Modularization:** Keep files under 200 lines, use kebab-case naming
- **Testing:** Each phase must be testable independently
- **Mobile-first:** All UI must work on 428px mobile screens
- **Vietnamese:** All UI text in Vietnamese language
