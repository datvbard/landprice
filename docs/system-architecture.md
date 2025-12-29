# Land Price App - System Architecture

**Version:** 2.2.0
**Last Updated:** 2025-12-29
**Phase:** Phase 6 - User Search & Price Calculation Complete

## Architecture Overview

Land Price App is built on Next.js 14 with App Router architecture, following a component-driven, mobile-first design pattern with server-client boundary clearly defined.

```
┌──────────────────────────────────────────────────────────────┐
│              Browser / Client Environment                    │
├──────────────────────────────────────────────────────────────┤
│                    Next.js 14 App Router                     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Pages (Server & Client Components)                  │   │
│  │  • Login, Search, Results, History (User)            │   │
│  │  • Dashboard, Settings (Admin)                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  UI Components Library                               │   │
│  │  • Button, Input, Select, Card                       │   │
│  │  • Admin: Sidebar, DataTable, StatCard              │   │
│  │  • User: BottomNav, PriceCard                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Styling Layer                                       │   │
│  │  • Tailwind CSS 3.4 (utility-first)                 │   │
│  │  • Design Tokens: Colors, spacing, animations       │   │
│  │  • Be Vietnam Pro font (300-700 weights)            │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
                      ↓ (HTTPS)
┌──────────────────────────────────────────────────────────────┐
│              Supabase Client Layer                           │
├──────────────────────────────────────────────────────────────┤
│  • lib/supabase/client.ts   (Anon key, public data)         │
│  • lib/supabase/server.ts   (Service role, admin ops)       │
│  • Real-time subscriptions                                   │
│  • Row Level Security (RLS) enforcement                      │
└──────────────────────────────────────────────────────────────┘
                      ↓ (REST/GraphQL)
┌──────────────────────────────────────────────────────────────┐
│           Supabase PostgreSQL Database                       │
├──────────────────────────────────────────────────────────────┤
│  • 11 Tables:                                                │
│    - users, districts, streets, segments                    │
│    - 5 coefficient tables (land_type, location, area...)    │
│    - search_history, brand_settings                         │
│  • Foreign keys & indexes configured                         │
│  • RLS policies for data access control                      │
│  • 9 districts, 60+ segments, sample data seeded            │
└──────────────────────────────────────────────────────────────┘
```

## Layer Structure

### 1. Page Layer (`app/`)

#### Root Layout (`layout.tsx`)
- Wraps entire application
- Loads Be Vietnam Pro font
- Configures viewport and metadata
- Sets theme color
- Language: Vietnamese (lang="vi")

**Server Component:** Renders on server, sends HTML to client

#### Home Page (`page.tsx`)
- Minimal page that redirects to `/login`
- Uses Next.js `redirect()` function
- Server-side redirect (no client-side lag)

#### Login Page (`app/login/page.tsx`)
- **Type:** Client Component (`'use client'`)
- **Responsibility:** User authentication UI
- **State Management:** Local state for password visibility
- **Features:**
  - Email/phone input with icon
  - Password input with toggle
  - Remember me checkbox
  - Forgot password link
  - Social login buttons
  - Animated background elements

### 2. Component Layer (`components/`)

#### Button Component (`components/ui/button.tsx`)
- **Type:** Presentational component (Client component when imported)
- **Props:**
  ```typescript
  interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode
    variant?: 'primary' | 'secondary' | 'outline' | 'social'
    fullWidth?: boolean
  }
  ```
- **Variants:**
  - **primary:** Burgundy gradient with shadow, hover lift
  - **secondary:** Gold gradient for secondary actions
  - **outline:** Transparent with border, fills on hover
  - **social:** White with border, minimal styling
- **Styling:** Inline Tailwind classes, 56px min-height for touch targets

#### Input Component (`components/ui/input.tsx`)
- **Type:** Presentational component with ForwardRef
- **Props:**
  ```typescript
  interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    icon?: ReactNode
    rightElement?: ReactNode
  }
  ```
- **Features:**
  - Left icon support (password icons, phone icons, etc)
  - Right element support (visibility toggle, clear button)
  - Focus states with shadow ring
  - Placeholder styling
  - 56px min-height for touch
- **Styling:** Gray background, primary color focus state

### 3. Styling Layer

#### Global Styles (`app/globals.css`)
```css
@tailwind base;        /* Tailwind base styles */
@tailwind components;  /* Component classes */
@tailwind utilities;   /* Utility classes */

@layer utilities {
  /* Custom animations */
  @keyframes fadeIn { ... }
  @keyframes slideUp { ... }
  @keyframes float { ... }

  /* Animation utility classes */
  .animate-fade-in { ... }
  .animate-slide-up { ... }
  .animate-float { ... }
  .animate-float-reverse { ... }
}
```

#### Design Tokens (`tailwind.config.ts`)
- **Colors:** Primary, secondary, accent palette
- **Backgrounds:** Gradient definitions
- **Typography:** Font family extension (Be Vietnam Pro)
- **Border Radius:** Custom radius values
- **Spacing:** 8px-based scale
- **Box Shadows:** Button-specific shadows

#### Font System (`app/layout.tsx`)
```typescript
const beVietnamPro = Be_Vietnam_Pro({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['vietnamese', 'latin'],
  variable: '--font-be-vietnam-pro',
  display: 'swap',
})
```

### 4. Supabase Integration (`lib/supabase/`)

#### Client Configuration (`lib/supabase/client.ts`)
- Anonymous key for public data access
- Automatic session refresh
- Real-time subscription support
- Browser localStorage for session persistence

#### Server Configuration (`lib/supabase/server.ts`)
- Service role key for admin operations
- Server-side authentication
- User management capabilities
- Admin CRUD operations on protected tables

#### Database Types (`lib/supabase/database.types.ts`)
```typescript
export interface Database {
  public: {
    Tables: {
      users: { Row: User, Insert, Update }
      districts: { Row: District, Insert, Update }
      streets: { Row: Street, Insert, Update }
      segments: { Row: Segment, Insert, Update }
      land_type_coefficients: { Row, Insert, Update }
      location_coefficients: { Row, Insert, Update }
      area_coefficients: { Row, Insert, Update }
      depth_coefficients: { Row, Insert, Update }
      feng_shui_coefficients: { Row, Insert, Update }
      search_history: { Row, Insert, Update }
      brand_settings: { Row, Insert, Update }
    }
  }
}
```

### 5. Build & Dev Tools

#### TypeScript Configuration (`tsconfig.json`)
- **Target:** ES2020
- **Strict Mode:** Enabled
- **Module Resolution:** Node
- **Path Aliases:** `@/*` for imports

#### Tailwind Configuration (`tailwind.config.ts`)
- **Content:** Scans app, components, pages directories
- **Theme:** Extended with custom tokens
- **Plugins:** None in Phase 1

#### PostCSS Configuration (`postcss.config.mjs`)
- Processes Tailwind CSS
- Autoprefixes vendor prefixes
- Minifies in production

#### ESLint Configuration (`.eslintrc.json`)
- Extends Next.js recommended rules
- Enforces code quality standards

## Data Flow

### Authentication Flow (Phase 5)

```
User Browser
    ↓
[Next.js Server]
    ↓
middleware.ts
    ├─ Check session cookie
    ├─ Public routes (/login, /api/auth/*) → Allow
    └─ Protected routes → Require session
    ↓
Login Page (Client Component)
    ├─ User enters email/phone + password
    ├─ Form submission via loginAction (server action)
    └─ Server validation & Better Auth integration
    ↓
Better Auth Authentication
    ├─ Password verification (scrypt)
    ├─ Session creation (7 days)
    ├─ Set secure httpOnly cookie
    └─ Return user with role
    ↓
Role-Based Routing
    ├─ Admin (role='admin') → /admin/dashboard
    └─ User (role='user') → / (user search page)
    ↓
Protected Layout
    ├─ Render Header with user info
    ├─ Check session via useAuth hook
    └─ Display role badge for admin
    ↓
Protected Page
    ├─ useAuth hook returns user + session
    ├─ Can access protected data
    └─ Logout via Header component
```

### Request/Response Flow

```
1. Form Submit
   Client → POST /api/auth/sign-in/email
   ├─ Email/Phone: validated
   ├─ Password: validated
   └─ User lookup: database

2. Server Action Validation
   loginAction()
   ├─ Email/phone format check
   ├─ Password complexity check
   ├─ User existence check
   ├─ User active status check
   └─ Better Auth credential verification

3. Session Creation
   Better Auth
   ├─ Password hash comparison
   ├─ Session token generation
   ├─ Cookie secure flags (httpOnly, secure, sameSite)
   └─ 5-minute cache enabled

4. Response
   Server → Client
   ├─ Redirect path (/admin/dashboard or /)
   └─ Session cookie (automatic, httpOnly)

5. Subsequent Requests
   Client → Protected Route
   ├─ middleware.ts checks cookie
   ├─ No database lookup (cookie cache)
   └─ Session valid → Allow access
```

### Protected Route Access

```
Request → middleware.ts
    ↓
Session Cookie Check
    ├─ Session exists → Allow (NextResponse.next())
    └─ No session → Redirect to /login

Layout Component
    ↓
useAuth Hook
    ├─ Calls getSessionCookie()
    ├─ Renders loading state
    └─ Returns user + isAdmin flag

Component
    ↓
Display role-based UI
    ├─ Admin badge if isAdmin
    ├─ User name/email
    └─ Logout button
```

## Mobile-First Responsive Design

### Container Strategy
```html
<div class="mobile-container">
  <!-- Max-width: 428px -->
  <!-- Centers on larger screens -->
  <!-- Shadow for visual distinction -->
</div>
```

### Touch Target Standards
- **Minimum:** 44x44px
- **Button min-height:** 56px
- **Input min-height:** 56px
- **Padding:** Adequate spacing between interactive elements

### Viewport Configuration
```typescript
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,           // Prevent user zoom
  userScalable: false,       // Disable pinch zoom
  themeColor: '#AE1C3E',     // Address bar color
}
```

## Component Composition Pattern

### Example: Login Form
```tsx
<form onSubmit={handleLogin}>
  <Input
    icon={<PhoneIcon />}
    placeholder="Number or Email"
  />
  <Input
    type={showPassword ? 'text' : 'password'}
    icon={<LockIcon />}
    rightElement={<ToggleButton />}
  />
  <Button variant="primary" fullWidth>
    Login
  </Button>
</form>
```

## Authentication Layer (Phase 5)

### Better Auth Integration
```
Application
    ↓
lib/auth/auth.ts (Server)
├─ PostgreSQL/Supabase Pool
├─ Email/password strategy
├─ 7-day session expiry
├─ 5-minute cookie cache
└─ Custom user fields (role, phone, full_name, is_active)

lib/auth/auth-client.ts (Client)
├─ createAuthClient()
├─ signIn/signOut methods
├─ useSession hook
└─ Base URL configuration

lib/auth/validators.ts
├─ Email regex validation
├─ Vietnamese phone format
├─ Password complexity rules
└─ Input normalization
```

### Session Management
- **Storage:** Secure httpOnly cookies
- **Expiration:** 7 days (configurable)
- **Cache:** 5-minute memory cache for performance
- **Flags:** httpOnly, secure, sameSite=Strict
- **Validation:** Middleware checks on every request

### Route Protection Strategy
```
middleware.ts (Request Level)
├─ Parse request pathname
├─ Check public routes (/login, /api/auth/*)
├─ Verify session cookie for protected routes
├─ Redirect to /login if no session
└─ Fast check (no database query)

Layout Components (Component Level)
├─ useAuth hook for client state
├─ Conditional rendering based on isAuthenticated
├─ Role-based UI rendering (isAdmin flag)
└─ Loading states during session check
```

### User Roles
- **user:** Default role, access to search functionality
- **admin:** Access to /admin/* routes, user/price management
- **Role Assignment:** Set at user creation, checked on login

### Security Features
- **Password Hashing:** Scrypt (Better Auth default)
- **Password Validation:** Min 8 chars, uppercase, lowercase, number
- **User Enumeration Prevention:** Generic error messages on login failure
- **Active Status Check:** Disabled users cannot login
- **Session Binding:** Cookie tied to user session
- **CSRF Protection:** Next.js built-in (form action)

## Performance Characteristics

### Font Loading
- Be Vietnam Pro loaded via Google Fonts
- Font display: `swap` (show fallback immediately)
- Vietnamese + Latin subsets only

### CSS Processing
- Tailwind CSS purges unused styles
- No external CSS files needed
- Inline styles generated per variant

### JavaScript Bundle
- Client components only in interactive areas
- Server components render on server
- Minimal JS needed for Phase 1

### Build Artifacts
- Static HTML from server components
- Hydrated interactive components
- CSS inlined in HTML

## Security Considerations (Phase 1)

- No sensitive data stored locally
- Password fields use HTML native input
- Form submission currently disabled (Phase 5)
- No API calls in Phase 1
- Content Security Policy ready (Phase 5)

## Accessibility Features

- Semantic HTML structure
- Form labels associated with inputs
- Keyboard navigation support
- Focus states clearly visible
- Icons as SVG with ARIA labels (future)
- Color contrast meets WCAG AA standards

## Development Workflow

### File Structure Organization
```
app/
  ├── layout.tsx          # Root server component
  ├── globals.css         # Global styles
  ├── page.tsx            # Home page
  └── login/
      └── page.tsx        # Login client component

components/
  └── ui/
      ├── button.tsx      # Reusable button
      └── input.tsx       # Reusable input
```

### Import Strategy
- Absolute imports using `@/` alias
- Components imported from `@/components/`
- Styles imported from `@/app/`

### Hot Module Replacement
- Fast Refresh enabled by default
- Changes reflect immediately in browser
- State preserved during edits

## Future Architecture Evolution

### Phase 6: Search & Calculation
- Price calculation engine with coefficients
- Results display with 4-level pricing
- Search integration with districts/streets/segments

### Phase 7: Search History
- History persistence to database
- User search tracking and retrieval
- History filtering and export

### Phase 8: Admin User Management
- User CRUD operations
- Role assignment (admin/user)
- User activation/deactivation

### Phase 9: Admin Price Management
- Coefficient CRUD for all types
- Bulk price updates
- Price audit trail

### Phase 10: Excel Upload & Parsing
- Excel import functionality
- Data validation and transformation
- Batch price updates

### Phase 11: Brand Settings
- App branding customization
- Settings persistence
- Feature flags

### Phase 12: Testing & Deployment
- End-to-end testing suite
- Performance optimization
- Vercel deployment configuration

## Dependencies & Versions

| Package | Version | Why |
|---------|---------|-----|
| next | ^14.2.18 | Latest stable with App Router |
| react | ^18.3.1 | Latest stable React |
| react-dom | ^18.3.1 | Latest stable ReactDOM |
| tailwindcss | ^3.4.17 | Latest utility CSS framework |
| typescript | ^5.7.2 | Type safety |
| postcss | ^8.4.49 | CSS preprocessing |
| autoprefixer | ^10.4.20 | Vendor prefix support |
| eslint | ^8.57.1 | Code linting |

## Monitoring & Debugging (Phase 1)

- ESLint for code quality
- TypeScript for type checking
- Browser DevTools for component inspection
- Console logging for form submissions
- Build-time error detection

## Scalability Notes

- Component library pattern allows easy expansion
- Design tokens centralized in Tailwind config
- Page-based routing scales with feature additions
- CSS-in-JS (via Tailwind) avoids specificity issues
- TypeScript prevents runtime errors
