# Land Price App - Agribank Trà Vinh

A mobile-first web application for property valuation queries in Trà Vinh province, Vietnam.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check
```

Open http://localhost:3000 to view the app.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5.7 (strict mode) |
| Styling | Tailwind CSS 3.4 |
| Font | Be Vietnam Pro (Vietnamese support) |
| Database | Supabase (planned) |
| Auth | Better Auth (planned) |

## Project Structure

```
landprice/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home (redirects to /login)
│   ├── login/              # Login page
│   ├── (user)/             # User route group
│   │   ├── page.tsx        # Search page
│   │   ├── results/        # Results page
│   │   └── history/        # History page
│   ├── (admin)/            # Admin route group
│   │   ├── layout.tsx      # Sidebar layout
│   │   ├── dashboard/      # Dashboard page
│   │   └── settings/       # Settings page
│   ├── test-supabase/      # DB connection test
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── button.tsx      # Button (4 variants)
│   │   ├── input.tsx       # Input with icons
│   │   └── select.tsx      # Select dropdown
│   ├── admin/              # Admin-specific components
│   │   ├── sidebar.tsx
│   │   ├── stat-card.tsx
│   │   ├── data-table.tsx
│   │   └── activity-item.tsx
│   └── bottom-nav.tsx      # User navigation
├── lib/
│   ├── supabase/           # Supabase client config
│   │   ├── client.ts       # Client Supabase
│   │   ├── server.ts       # Server Supabase
│   │   └── database.types.ts # TypeScript types (461 lines)
│   └── mock-data/          # Mock data
├── supabase/               # Database migrations & seed
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── seed.sql
├── docs/                   # Project documentation
├── mockup/                 # HTML/CSS mockups
└── plans/                  # Implementation plans
```

## Design System

### Brand Colors (Agribank)
- **Primary:** `#AE1C3E` (Burgundy)
- **Primary Dark:** `#8B1631`
- **Primary Light:** `#C42D4F`
- **Accent:** `#D4AF37` (Gold)

### Typography
- Font: Be Vietnam Pro
- Weights: 300-700 (light to bold)
- Vietnamese character support

### Mobile-First
- Max-width: 428px (iPhone 14 Pro Max)
- Min touch target: 56px height
- Bottom navigation pattern

## Development Phases

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Project Setup & Static Login | ✅ Complete |
| 2 | Static User Pages (Home, Results, History) | ✅ Complete |
| 3 | Static Admin Pages | ✅ Complete |
| 4 | Supabase Setup & Database | ✅ Complete |
| 5 | Authentication System | ✅ Complete |
| 6 | User Search & Calculation | ✅ Complete |
| 7 | Search History | ⏳ Pending |
| 8 | Admin User Management | ⏳ Pending |
| 9 | Admin Price Management | ⏳ Pending |
| 10 | Excel Upload & Parsing | ⏳ Pending |
| 11 | Brand Settings | ⏳ Pending |
| 12 | Testing & Production | ⏳ Pending |

## Scripts

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run ESLint
npm run type-check  # Run TypeScript checking
```

## Documentation

- [Project Overview & PDR](docs/project-overview-pdr.md)
- [Codebase Summary](docs/codebase-summary.md)
- [System Architecture](docs/system-architecture.md)
- [Code Standards](docs/code-standards.md)
- [Design Guidelines](docs/design-guidelines.md)
- [Project Roadmap](docs/project-roadmap.md)
- [Supabase Guide](docs/supabase-guide.md) - Hướng dẫn kết nối database
- [Vercel Deployment](docs/vercel-deployment-guide.md) - Hướng dẫn deploy

## Environment Variables

```env
# Supabase (Phase 4)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Better Auth (Phase 5)
BETTER_AUTH_SECRET=

# App
NEXT_PUBLIC_APP_URL=
```

## Calculation Formula

```
Price per m² = base_price × land_type_coef × location_coef ×
               area_coef × depth_coef × feng_shui_coef

Total = Price per m² × area
```

### Coefficient Types
- **Land Type:** 7 types (1.0 to 0.2)
- **Location:** 9 types based on alley depth/width (1.0 to 0.1)
- **Area:** 8 tiers based on total area (1.0 to 0.4)
- **Depth:** 3 tiers based on lot depth (1.0 to 0.25)
- **Feng Shui:** 4 types (0.7 to 0.8)

## Contributing

1. Follow code standards in `docs/code-standards.md`
2. Use conventional commit format
3. Run type-check and lint before committing
4. Keep files under 200 lines

## License

Private - Agribank Trà Vinh
