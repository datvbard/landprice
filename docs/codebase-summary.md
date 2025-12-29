# Land Price App - Codebase Summary

**Version:** 1.7.0
**Last Updated:** 2025-12-29
**Status:** Phase 7 Complete (Search History Feature)
**Overall Progress:** 58% - 7 of 12 phases complete

## Overview

Land Price App is a Next.js 14 application for property valuation queries in Trà Vinh province, Vietnam. Built with Agribank brand identity and optimized for mobile-first experience.

## Project Structure

```
landprice/
├── app/
│   ├── layout.tsx           # Root layout with Be Vietnam Pro font
│   ├── page.tsx             # Home redirect to /login
│   ├── globals.css          # Global styles and animations
│   ├── login/
│   │   ├── page.tsx         # Login form with Better Auth
│   │   └── actions.ts       # Server action for login validation
│   ├── api/
│   │   └── auth/[...all]/
│   │       └── route.ts     # Better Auth API handler
│   ├── (user)/              # User route group (protected)
│   │   ├── layout.tsx       # User layout with header
│   │   ├── page.tsx         # Search page
│   │   ├── results/
│   │   │   └── page.tsx     # Results page
│   │   └── history/
│   │       └── page.tsx     # History page
│   └── (admin)/             # Admin route group (protected)
│       ├── layout.tsx       # Admin layout with sidebar
│       ├── dashboard/
│       │   └── page.tsx     # Admin dashboard with stats & activity
│       └── settings/
│           └── page.tsx     # Admin settings page
├── components/
│   ├── ui/
│   │   ├── button.tsx       # Reusable button component
│   │   ├── input.tsx        # Input component with icon support
│   │   └── select.tsx       # Select dropdown component
│   ├── header.tsx           # Header with logout (protected pages)
│   ├── history-card.tsx     # Search history card component
│   └── admin/
│       ├── sidebar.tsx      # Admin navigation sidebar
│       ├── stat-card.tsx    # Statistic card component
│       ├── data-table.tsx   # Admin data table component
│       └── activity-item.tsx # Activity list item component
├── hooks/
│   └── use-auth.ts          # useAuth custom hook with role checks
├── docs/
│   ├── codebase-summary.md          # This file
│   ├── project-overview-pdr.md      # Product overview and requirements
│   ├── code-standards.md            # Code standards and patterns
│   ├── system-architecture.md       # System architecture
│   └── design-guidelines.md         # Design tokens and guidelines
├── lib/
│   ├── auth/
│   │   ├── auth.ts                # Better Auth config with PostgreSQL
│   │   ├── auth-client.ts         # Client-side auth client
│   │   └── validators.ts          # Email/phone/password validation
│   ├── supabase/
│   │   ├── client.ts              # Supabase client (anon key)
│   │   ├── server.ts              # Supabase server (service role)
│   │   └── database.types.ts      # Generated types (461 lines)
│   ├── api/
│   │   ├── search-data.ts         # Database queries for districts/streets/segments
│   │   ├── coefficients.ts        # Coefficient data aggregation
│   │   └── history.ts             # History API client (CRUD operations + formatting)
│   ├── calculations/
│   │   └── price-calculator.ts    # Price calculation engine with 5 coefficients
│   └── mock-data/
│       └── admin-data.ts          # Mock data for admin pages
├── middleware.ts            # Route protection middleware
├── mockup/                   # Design mockups and HTML prototypes
│   ├── css/design-system.css
│   └── *.html               # 6 screen mockups
├── .claude/                 # Claude Code workflows and agents
├── next.config.js           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS with Agribank design tokens
├── tsconfig.json            # TypeScript configuration
├── postcss.config.mjs       # PostCSS configuration
├── package.json             # Project dependencies
└── .eslintrc.json           # ESLint rules

```

## Core Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 14.2.18 | React framework with App Router |
| React | 18.3.1 | UI library |
| TypeScript | 5.7.2 | Type safety |
| Tailwind CSS | 3.4.17 | Utility-first CSS framework |
| Be Vietnam Pro | Google Fonts | Vietnamese-optimized typeface |
| Supabase | Latest | PostgreSQL database |
| Supabase JS SDK | Latest | Database client for Next.js |
| Better Auth | Latest | Authentication framework |
| pg | Latest | PostgreSQL driver for Better Auth |

## Key Components

### Root Layout (`app/layout.tsx`)
- Loads Be Vietnam Pro font with Vietnamese support
- Sets metadata and viewport configuration
- Theme color: Agribank Burgundy (#AE1C3E)
- Supports Vietnamese language

### Login Page (`app/login/page.tsx`)
- Full-screen login interface with Agribank branding
- Email/phone and password input fields
- Password visibility toggle
- "Remember me" checkbox and forgot password link
- Social login buttons (Google, Facebook)
- Decorative animated background elements
- Client-side state management for password toggle

### UI Components

#### Button Component (`components/ui/button.tsx`)
- **Variants:** primary, secondary, outline, social
- **Props:** children, variant, fullWidth, className, ...HTMLAttributes
- **Styling:** Tailwind CSS with custom gradients
- **Hover Effects:** Lift animation with shadow enhancement
- **Min Height:** 56px (touch-friendly)

#### Input Component (`components/ui/input.tsx`)
- **Features:** Icon support, right element support, icon positioning
- **Styling:** 56px height, 12px border radius, focus states
- **Props:** icon, rightElement, ...HTMLAttributes
- **ForwardRef:** Compatible with form libraries
- **Focus State:** Primary color border with shadow ring

### User Components

#### History Card Component (`components/history-card.tsx`)
- **Purpose:** Display individual search history entries as clickable cards
- **Features:**
  - Gradient background (cycling through 3 color schemes)
  - Land type and location badge extraction from coefficients_json
  - View, share, and delete action buttons
  - Price and date formatting with Vietnamese locale
  - Delete confirmation with disabled state
  - Click handler for viewing full results
- **Props:** item, index, onView, onShare, onDelete, isDeleting
- **Styling:** White card with shadow, hover effects, animated entry
- **Data Flow:** Extracts coefficients from SearchHistory type

#### Select Component (`components/ui/select.tsx`)
- **Features:** Dropdown select with custom styling
- **Props:** options, value, onChange, placeholder
- **Styling:** Matches input styling for consistency
- **Accessibility:** Semantic select element

### Admin Components

#### Sidebar Component (`components/admin/sidebar.tsx`)
- **Purpose:** Admin navigation menu
- **Features:** Link navigation, active state indicators
- **Styling:** Dark background with hover effects
- **Routes:** Dashboard, Settings, User Management, Price Management

#### Stat Card Component (`components/admin/stat-card.tsx`)
- **Purpose:** Display key metrics on dashboard
- **Props:** title, value, change, icon
- **Styling:** Card layout with icon and metrics
- **Variations:** Support for different stat types

#### Data Table Component (`components/admin/data-table.tsx`)
- **Purpose:** Display tabular admin data
- **Features:** Headers, rows, sorting, pagination ready
- **Columns:** Configurable table structure
- **Styling:** Professional admin table layout

#### Activity Item Component (`components/admin/activity-item.tsx`)
- **Purpose:** Display activity logs
- **Props:** timestamp, user, action, details
- **Styling:** List item format with icons
- **Usage:** Recent activity widget on dashboard

### Header Component (`components/header.tsx`)
- **Purpose:** User header with logout (protected pages)
- **Type:** Client Component (`'use client'`)
- **Features:**
  - Displays user avatar with initial
  - Shows user name/email
  - Admin role badge
  - Logout button with API integration
  - Loading skeleton state
- **Styling:** White background, border-bottom, responsive layout
- **Usage:** Included in (user) and (admin) layouts

## Authentication System (Phase 5)

### Better Auth Configuration (`lib/auth/auth.ts`)
- **Database:** PostgreSQL via Supabase connection string
- **Features:**
  - Email/password authentication with scrypt hashing
  - 7-day session expiration
  - 5-minute cookie cache
  - Custom user fields: role, phone, full_name, is_active
- **Type Exports:** Session and User types for TypeScript

### Auth Client (`lib/auth/auth-client.ts`)
- **Purpose:** Client-side authentication methods
- **Methods:** signIn, signOut, useSession hook
- **Base URL:** Configurable via NEXT_PUBLIC_APP_URL

### Validation Utilities (`lib/auth/validators.ts`)
- **Email Validation:** Standard email format
- **Phone Validation:** Vietnamese format (10-11 digits)
- **Password Validation:** Min 8 chars, uppercase + lowercase + number
- **Normalization:** Email/phone format detection and normalization

### Login Server Action (`app/login/actions.ts`)
- **Type:** Server Action (`'use server'`)
- **Validation:**
  - Input format checks (email/phone)
  - Password complexity verification
  - User existence and active status
- **Security:**
  - Generic error messages (prevent user enumeration)
  - Better Auth integration for credential verification
- **Response:** Returns success status and redirect path based on role

### Route Protection Middleware (`middleware.ts`)
- **Public Routes:** /login, /api/auth/*
- **Protected Routes:** /, /admin/*
- **Method:** Cookie-based session check (no DB call)
- **Redirect:** Unauthenticated users to /login
- **Role-based Routing:** Checked in layout components

### useAuth Hook (`hooks/use-auth.ts`)
- **Purpose:** Custom hook wrapping Better Auth's useSession
- **Returns:** user, session, isLoading, isAuthenticated, isAdmin, error
- **Type:** UserWithRole with custom fields
- **Usage:** Client components needing authentication state

### Auth API Handler (`app/api/auth/[...all]/route.ts`)
- **Purpose:** Better Auth endpoint router
- **Endpoints:**
  - POST /api/auth/sign-in/email
  - POST /api/auth/sign-out
  - GET /api/auth/session
- **Handler:** Proxies all auth requests to Better Auth

### User Pages (Phase 6: Dynamic & Functional)

#### User Search Page (`app/(user)/page.tsx`)
- **Features:** Dynamic cascading dropdowns (district → street → segment)
- **Data Source:** Real database queries for districts, streets, segments
- **Components:** Select dropdowns with real-time filtering
- **Area Input:** Text field for property area calculation
- **Integration:** Calls API routes for data fetching
- **Lines of Code:** 358 lines (functional with multiple features)

#### User Results Page (`app/(user)/results/page.tsx`)
- **Purpose:** Display price calculation results with full breakdown
- **Features:**
  - 4 price levels (government, min, max, avg)
  - Calculation breakdown showing each coefficient applied
  - Vietnamese currency formatting (₫ VND)
  - Live updates when selections change
  - Saves search to history with segmentId in coefficients_json
- **Calculation Formula:**
  ```
  price = base_price × land_type_coef × location_coef ×
          area_coef × depth_coef × feng_shui_coef
  ```
- **Lines of Code:** 570 lines (comprehensive calculation display)

#### User History Page (`app/(user)/history/page.tsx`)
- **Purpose:** Display user's past searches with pagination and management
- **Features:**
  - Stats summary (total queries, districts, displayed items)
  - Paginated history card list (20 items per page)
  - Loading spinner, error handling, empty state
  - Share functionality (copy to clipboard)
  - Delete with confirmation
  - View details navigation (routes to results with segmentId)
  - Real-time pagination state updates
- **Data Flow:** Uses getHistory(), deleteHistory() from history.ts
- **State Management:** React useState/useCallback for pagination + CRUD
- **Lines of Code:** 195 lines (comprehensive history management)

### Admin Pages

#### Admin Dashboard (`app/(admin)/dashboard/page.tsx`)
- **Components:** Stats display, activity feed, quick actions
- **Data Source:** Mock data from `lib/mock-data/admin-data.ts`
- **Layout:** Responsive grid with sidebar navigation
- **Features:** Overview of system metrics and activity

#### Admin Settings (`app/(admin)/settings/page.tsx`)
- **Sections:** System settings, user preferences
- **Form Controls:** Input fields, select dropdowns, toggles
- **Save Actions:** Settings persistence (Phase 4)

#### Admin Layout (`app/(admin)/layout.tsx`)
- **Structure:** Sidebar + main content area
- **Navigation:** Persistent sidebar across admin pages
- **Styling:** Dark theme with Agribank branding

## Design System

### Color Palette
- **Primary Burgundy:** #AE1C3E (Agribank Red)
- **Primary Dark:** #8B1631 (hover states)
- **Primary Light:** #C42D4F (accents)
- **Secondary Beige:** #F0E5E7 (backgrounds)
- **Accent Gold:** #D4AF37 (premium elements)

### Gradients
- `gradient-primary`: Primary burgundy with fade
- `gradient-primary-solid`: Solid burgundy blend
- `gradient-vibrant`: Multi-color blend
- `gradient-gold`: Gold gradient for secondary actions
- `gradient-hero`: Hero section gradient
- `gradient-dark`: Dark gradient for admin UI

### Animations
- `fadeInUp`: 0.8s entry animation for cards
- `slideUp`: 0.6s entry animation for modals
- `float`: 8s floating animation for decorative elements
- `float-reverse`: 6s reverse floating animation

### Spacing System (8px base)
- space-1: 4px
- space-2: 8px
- space-3: 12px
- space-4: 16px
- space-5: 20px
- space-6: 24px
- space-8: 32px
- space-10: 40px
- space-12: 48px

## Typography

**Font:** Be Vietnam Pro (Google Fonts)
- Weights: 300, 400, 500, 600, 700
- Subsets: Vietnamese, Latin
- CSS Variable: `--font-be-vietnam-pro`

**Font Sizes:**
- xs: 12px (captions)
- sm: 14px (secondary text)
- base: 16px (body)
- lg: 18px (section titles)
- xl: 20px (subtitles)
- 2xl: 24px (headings)
- 3xl: 30px (page titles)
- 4xl: 36px (hero headings)

## Development Patterns

### Component Naming
- UI components: PascalCase in `components/ui/`
- Pages: lowercase in `app/[route]/`
- TypeScript interfaces: Descriptive names with Props suffix

### Styling Approach
- **Primary:** Tailwind CSS utility classes
- **Components:** Gradient backgrounds for buttons
- **Animations:** CSS keyframes in globals.css
- **Responsive:** Mobile-first, max-width 428px constraint

### State Management
- **Client Components:** `'use client'` directive for interactive features
- **Login Page:** useState for password visibility toggle
- **Future:** Phase 5 will implement authentication

### Form Handling
- HTML form elements with semantic structure
- Custom Input component with icon support
- Button variants for different form actions

## Dependencies Overview

### Production
- **next:** Next.js 14 framework
- **react:** React 18 library
- **react-dom:** React DOM library

### Development
- **TypeScript:** Type checking and development
- **Tailwind CSS:** Styling framework
- **PostCSS:** CSS preprocessing with autoprefixer
- **ESLint:** Code linting with Next.js config

## Configuration Files

### next.config.js
- Next.js App Router configuration
- Image optimization settings
- Build output configuration

### tailwind.config.ts
- Extended theme configuration
- Custom colors matching Agribank brand
- Custom border radius values
- Custom spacing tokens
- Custom box shadow for buttons

### tsconfig.json
- Strict mode enabled
- Path alias: `@/*` for absolute imports
- Target: ES2020
- Module: esnext

### postcss.config.mjs
- Tailwind CSS processing
- Autoprefixer for vendor prefixes

## Mobile-First Design

- **Max-width:** 428px (iPhone 14 Pro Max)
- **Touch Targets:** Minimum 44x44px
- **Spacing:** Adequate padding for thumb interaction
- **Container:** `.mobile-container` class with shadow

## Completed Phases

- **Phase 1:** Project setup & static login page
- **Phase 2:** Static user pages (Home, Results, History)
- **Phase 3:** Static admin pages with components
- **Phase 4:** Supabase setup & database integration
- **Phase 5:** Authentication system with Better Auth
- **Phase 6:** User search flow & price calculation
- **Phase 7:** Search history feature with pagination

### Phase 5 Details: Authentication System

**Better Auth Integration**
- PostgreSQL/Supabase database backend
- Email/password authentication with scrypt hashing
- 7-day session management with secure cookies
- Custom user fields (role, phone, full_name, is_active)
- Session caching (5-minute TTL for performance)

**Input Validation**
- Email format validation
- Vietnamese phone number support (10-11 digits, various prefixes)
- Password complexity (min 8 chars, uppercase, lowercase, number)
- Email/phone normalization and format detection

**Route Protection**
- Middleware-based session verification
- Public routes: /login, /api/auth/*
- Protected routes: /, /admin/*
- Role-based redirects (user vs admin)
- Cookie-based checks (no DB overhead)

**Client-Side Integration**
- useAuth hook for auth state in components
- signIn/signOut methods via authClient
- useSession hook from Better Auth
- Loading states and error handling

**Server Action Validation**
- Form submission via server action (loginAction)
- User existence verification
- Active status checks
- Generic error messages (security)
- Role-based redirect paths

### Phase 4 Details: Database Integration

**Supabase Structure (11 Tables)**
```
Core Tables:
├── users (id, email, phone, password_hash, role, is_active)
├── districts (9 Trà Vinh districts)
├── streets (30+ streets per district)
└── segments (60+ with 4 price levels each)

Coefficient Tables (5):
├── land_type_coefficients (7 types, 0.2-1.0)
├── location_coefficients (9 types, 0.1-1.0)
├── area_coefficients (8 tiers, 0.4-1.0)
├── depth_coefficients (3 tiers, 0.25-1.0)
└── feng_shui_coefficients (4 types, 0.7-0.8)

Feature Tables:
├── search_history (user searches with timestamps)
└── brand_settings (app branding configuration)
```

**TypeScript Integration**
- database.types.ts: 461 lines of auto-generated types
- client.ts: Supabase client initialization with anon key
- server.ts: Server-side operations with service role key
- All 11 tables fully typed with Row, Insert, Update interfaces

**Security**
- Row Level Security (RLS) policies configured
- User data isolation: users see only own profile
- Admin operations protected with role checks
- Public read access to districts, streets, segments

### Phase 6 Details: User Search Flow & Price Calculation

**Dynamic Dropdowns & Data Fetching**
- Districts dropdown loads all 9 Trà Vinh districts from database
- Streets filtered by selected district
- Segments filtered by selected street
- Real-time dependent data loading

**Price Calculation Engine** (`lib/calculations/price-calculator.ts`)
- Formula: `price = base_price × land_type_coef × location_coef × area_coef × depth_coef × feng_shui_coef`
- Applies 5 coefficient types:
  - Land Type (7 types: 1.0 to 0.2)
  - Location (9 types: 1.0 to 0.1)
  - Area (8 tiers: 1.0 to 0.4)
  - Depth (3 tiers: 1.0 to 0.25)
  - Feng Shui (4 types: 0.7 to 0.8)
- Calculates all 4 price levels (government, min, max, avg)
- Returns detailed breakdown for display

**API Routes** (`app/api/districts|streets|segments|coefficients/route.ts`)
- GET /api/districts - Returns all districts
- GET /api/streets?districtId=x - Returns streets for district
- GET /api/segments?streetId=x - Returns segments with all price data
- GET /api/coefficients - Returns all coefficient types

**Search Data Queries** (`lib/api/search-data.ts`)
- Database queries for cascading dropdown data
- Efficient joins with related coefficient tables
- Vietnamese transliteration support

**Calculation Display**
- 4 price cards (government, min, max, avg) in Vietnamese
- Currency formatting with ₫ symbol and thousand separators
- Coefficient breakdown showing each factor applied
- Live recalculation on input changes

### Phase 7 Details: Search History Feature

**Search History Component** (`components/history-card.tsx`)
- Displays individual search records as gradient-styled cards
- Extracts land type/location from coefficients_json via helper functions
- Price formatted as "X tỷ" (billions) or "X triệu" (millions)
- Date formatted as "HH:MM - Hôm nay/Hôm qua/DD/MM"
- Action buttons: View (navigate to results), Share (copy text), Delete (with confirm)

**History API Client** (`lib/api/history.ts`)
- `getHistory(page, limit)` - Returns paginated search records
- `saveHistory(input)` - Creates new history record with coefficients
- `deleteHistory(id)` - Removes record by ID
- `getHistoryById(id)` - Retrieves single record
- Price/date formatting functions for Vietnamese locale
- Error handling with custom HistoryApiError class

**History Page** (`app/(user)/history/page.tsx`)
- Stats cards: total searches, districts, displayed items
- Paginated card list with "Load more" button
- States: Loading, Error (with retry), Empty (with CTA)
- Actions: View (→ results), Share (clipboard), Delete (with confirm)
- Navigation: segmentId from coefficients_json routes to /results page

## Future Development Phases

- **Phase 8:** Admin user management
- **Phase 9:** Admin price management
- **Phase 10:** Excel upload & parsing
- **Phase 11:** Brand settings management
- **Phase 12:** Testing & production deployment

## Performance Considerations

- Font display: `swap` (Be Vietnam Pro)
- Dynamic imports for code splitting (future)
- Image optimization (next/image)
- CSS purging via Tailwind
- Static generation where possible

## Notes for Developers

1. All interactive components use `'use client'` for client-side hydration
2. Authentication system (Phase 5) fully implemented with Better Auth
3. Protected routes use middleware for session validation
4. Login uses server action for secure form handling
5. useAuth hook available in all client components for auth state
6. Role-based routing: admin users redirected to /admin/dashboard, regular users to /
7. Environment variables needed: DATABASE_URL, BETTER_AUTH_SECRET, NEXT_PUBLIC_APP_URL
8. Design system is comprehensive; reference `design-guidelines.md` for specifics
9. Component library pattern established for future expansion
