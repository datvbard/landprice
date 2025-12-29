# Land Price App - Code Standards & Development Guidelines

**Version:** 1.1.0
**Last Updated:** 2025-12-29
**Status:** Active (Phase 6 Complete)

## Overview

This document defines code standards, naming conventions, and architectural patterns for the Land Price App project. All team members must adhere to these standards to ensure consistency, maintainability, and scalability.

## Table of Contents

1. [File Structure](#file-structure)
2. [Naming Conventions](#naming-conventions)
3. [TypeScript Standards](#typescript-standards)
4. [React Component Patterns](#react-component-patterns)
5. [Styling Standards](#styling-standards)
6. [Code Organization](#code-organization)
7. [Testing Standards](#testing-standards)
8. [Documentation Standards](#documentation-standards)
9. [Git & Commit Standards](#git--commit-standards)
10. [Performance Standards](#performance-standards)

## File Structure

### Project Root Structure

```
landprice/
├── app/                           # Next.js App Router pages
│   ├── layout.tsx                # Root layout (server component)
│   ├── page.tsx                  # Home page (server component)
│   ├── globals.css               # Global styles
│   ├── login/
│   │   └── page.tsx              # Login page (client component)
│   ├── search/                   # Future: Search feature
│   ├── results/                  # Future: Results feature
│   ├── dashboard/                # Future: User dashboard
│   └── admin/                    # Future: Admin panel
├── components/
│   ├── ui/                       # Reusable UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── [component].tsx
│   ├── features/                 # Feature-specific components
│   │   ├── login/
│   │   ├── search/
│   │   └── [feature]/
│   └── layout/                   # Layout components
│       └── [layout].tsx
├── hooks/                        # Custom React hooks (future)
│   └── [hook].ts
├── lib/                          # Utility functions
│   ├── constants.ts
│   ├── utils.ts
│   └── [utility].ts
├── types/                        # TypeScript types & interfaces
│   ├── index.ts
│   └── [domain].types.ts
├── services/                     # API & external services (future)
│   ├── api.ts
│   └── [service].ts
├── docs/                         # Documentation
│   ├── codebase-summary.md
│   ├── system-architecture.md
│   ├── code-standards.md
│   ├── project-overview-pdr.md
│   └── design-guidelines.md
├── .claude/                      # Claude Code workflows
│   ├── workflows/
│   ├── agents/
│   ├── skills/
│   └── commands/
├── public/                       # Static assets
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── package.json
└── .eslintrc.json
```

### App Directory Conventions

```
app/
├── (auth)/                       # Route group for auth pages
│   ├── login/
│   │   └── page.tsx
│   └── signup/
│       └── page.tsx
├── (app)/                        # Route group for main app
│   ├── search/
│   │   └── page.tsx
│   └── dashboard/
│       └── page.tsx
├── api/                          # API routes (future)
│   └── [route].ts
├── layout.tsx
├── page.tsx
└── globals.css
```

**Rationale:** Route groups organize pages logically without affecting URL structure. Use route groups for pages with shared layouts.

## Naming Conventions

### Files & Directories

| Type | Convention | Example | Notes |
|------|-----------|---------|-------|
| Page files | lowercase | `page.tsx` | Always named `page.tsx` in App Router |
| Layout files | lowercase | `layout.tsx` | Always named `layout.tsx` in App Router |
| Component files | PascalCase | `Button.tsx` | Preferred: one component per file |
| Hook files | camelCase | `usePasswordToggle.ts` | Prefix with `use` for custom hooks |
| Utility files | camelCase | `formatPrice.ts` | Lowercase for utility modules |
| Type files | camelCase | `auth.types.ts` | Suffix with `.types.ts` |
| Directory names | lowercase | `components/ui/` | Use hyphens for multi-word dirs |
| Constants files | UPPERCASE | `CONSTANTS.ts` | Export const instead of default |

### Component Naming

```typescript
// Good: Descriptive, reflects purpose
<Button />
<LoginForm />
<PropertyCard />

// Avoid: Generic names
<Component1 />
<UI />
<Page />

// Props interface naming
interface ButtonProps {
  // ...
}

// Event handler naming
const handleClick = () => {}
const handleFormSubmit = (e: FormEvent) => {}
const handlePasswordToggle = () => {}
```

### Variable & Function Naming

```typescript
// Variables: camelCase
const userName = 'John Doe'
const isLoading = false
const propertyPrice = 500000

// Boolean variables: prefix with is/has/can
const isLoggedIn = true
const hasError = false
const canSubmit = true

// Functions: camelCase, use verbs
const formatPrice = (price: number) => {}
const validateEmail = (email: string) => {}
const calculateTotal = (items: Item[]) => {}

// Event handlers: handle + action
const handleSubmit = () => {}
const handleChange = () => {}
const handleClick = () => {}

// Async functions: include async in name or be clear
const fetchPropertyData = async () => {}
const getUserData = async () => {}
```

### Constants

```typescript
// File: lib/constants.ts
export const API_BASE_URL = 'https://api.example.com'
export const MAX_LOGIN_ATTEMPTS = 5
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000

// Enum naming (PascalCase)
export enum PropertyType {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  AGRICULTURAL = 'agricultural',
}

export const AGRIBANK_PRIMARY = '#AE1C3E'
export const AGRIBANK_DARK = '#8B1631'
```

## Database Standards

### SQL Naming Conventions

#### Tables & Fields
```sql
-- Table names: lowercase, plural, snake_case
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Foreign keys: {table_name}_id
CREATE TABLE search_history (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  district_id UUID NOT NULL REFERENCES districts(id),
  created_at TIMESTAMP DEFAULT now()
);

-- Coefficient tables: {attribute}_coefficients
CREATE TABLE land_type_coefficients (
  id UUID PRIMARY KEY,
  land_type VARCHAR(50) NOT NULL,
  coefficient_value DECIMAL(4,3) NOT NULL
);

-- Boolean columns: is_, has_, can_
CREATE TABLE users (
  is_active BOOLEAN,
  has_verified_email BOOLEAN,
  can_admin BOOLEAN
);

-- Decimal for prices: DECIMAL(12, 2) for VND
CREATE TABLE segments (
  base_price_4_level DECIMAL(12, 2),
  base_price_3_level DECIMAL(12, 2),
  base_price_2_level DECIMAL(12, 2),
  base_price_1_level DECIMAL(12, 2)
);
```

#### Indexes & Constraints
```sql
-- Index foreign keys
CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_search_history_district_id ON search_history(district_id);

-- Unique constraints
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_districts_name ON districts(name);

-- Composite indexes for common queries
CREATE INDEX idx_segments_district_street
  ON segments(district_id, street_id);
```

#### Type Definitions in TypeScript
```typescript
// Map database types to TypeScript
export interface User {
  id: string        // UUID from database
  email: string
  phone_number: string | null
  password_hash: string
  is_active: boolean
  created_at: string  // ISO 8601 from database
  updated_at: string
}

export interface Segment {
  id: string
  district_id: string
  street_id: string
  base_price_4_level: number  // From DECIMAL
  base_price_3_level: number
  base_price_2_level: number
  base_price_1_level: number
}

// Coefficient value is decimal: number 0.0 to 1.5
export interface LandTypeCoefficient {
  id: string
  land_type: string
  coefficient_value: number  // e.g., 0.7, 1.0, 1.2
}
```

#### Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can see public search history from others
CREATE POLICY "Search history is readable by all"
  ON search_history FOR SELECT
  USING (true);

-- Users can only insert their own search history
CREATE POLICY "Users can insert own search history"
  ON search_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin can perform all operations
CREATE POLICY "Admin can do all operations"
  ON users FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
```

## TypeScript Standards

### Type Definitions

```typescript
// Always use explicit types
// Good
const userName: string = 'John'
const count: number = 5
const active: boolean = true

// Acceptable (obvious from assignment)
const userName = 'John'

// Define props as interfaces
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'social'
  fullWidth?: boolean
  children: ReactNode
}

// Use union types for enums
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'social'
type Severity = 'info' | 'warning' | 'error' | 'success'

// Generic types for reusable patterns
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Avoid any - use unknown or more specific types
// Bad
const data: any = response

// Good
const data: unknown = response
const data = response as PropertyData
```

### Strict Mode Requirements

```json
{
  "compilerOptions": {
    "strict": true,                    // All strict checks enabled
    "noImplicitAny": true,             // Disallow any types
    "strictNullChecks": true,          // Null/undefined checking
    "strictFunctionTypes": true,       // Function type checking
    "strictPropertyInitialization": true, // Property initialization
    "alwaysStrict": true               // Strict mode in all files
  }
}
```

### Type Organization

```typescript
// File: types/auth.types.ts

// General types first
export type UUID = string & { readonly __brand: 'UUID' }

// Domain-specific interfaces
export interface User {
  id: UUID
  email: string
  phone: string
  createdAt: Date
  updatedAt: Date
}

export interface LoginCredentials {
  emailOrPhone: string
  password: string
  rememberMe?: boolean
}

export interface AuthResponse {
  user: User
  token: string
  expiresIn: number
}

// Utility types
export type Optional<T> = T | undefined
export type Nullable<T> = T | null
export type Result<T> = { success: true; data: T } | { success: false; error: string }
```

## React Component Patterns

### Functional Components

```typescript
// Good: Clear purpose, typed props
interface GreetingProps {
  name: string
  age?: number
}

export default function Greeting({ name, age }: GreetingProps) {
  return (
    <div>
      <p>Hello, {name}!</p>
      {age && <p>You are {age} years old</p>}
    </div>
  )
}

// Alternative: Named export for reusability
export function Greeting({ name, age }: GreetingProps) {
  // ...
}
```

### Server vs Client Components

```typescript
// Server Component (default) - no 'use client'
// Can access database, process secret keys, keep tokens safe
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}

// Client Component - interactive, state management
'use client'

import { useState } from 'react'

export default function InteractiveForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)

  return (
    <form onSubmit={() => setIsSubmitted(true)}>
      {/* Interactive UI */}
    </form>
  )
}
```

### Component Structure

```typescript
'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { LoginFormProps } from '@/types/auth.types'

// 1. Type imports and declarations
interface FormState {
  email: string
  password: string
}

// 2. Component definition
export default function LoginForm({ onSubmit }: LoginFormProps) {
  // 3. State declarations
  const [formState, setFormState] = useState<FormState>({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // 4. Event handlers
  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      // Handle submission
    } finally {
      setIsLoading(false)
    }
  }, [formState])

  // 5. Render
  return (
    <form onSubmit={handleSubmit}>
      {/* JSX */}
    </form>
  )
}
```

### Props Drilling Prevention

```typescript
// Use composition for prop drilling
// Instead of drilling props down multiple levels

// Good: Pass composed components
function Parent() {
  return (
    <Layout>
      <Header />
      <Content />
      <Footer />
    </Layout>
  )
}

// Future: Use context for deeply nested state
const ThemeContext = createContext<Theme | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  )
}
```

## Styling Standards

### Tailwind CSS

```typescript
// Always use Tailwind utilities, not inline styles
// Good
<div className="flex items-center gap-2 p-4 rounded-lg bg-white shadow-sm">
  <Icon />
  <span className="text-base font-medium text-gray-900">Label</span>
</div>

// Avoid
<div style={{ display: 'flex', gap: '8px', padding: '16px' }}>
  ...
</div>

// Use clsx for conditional classes (install if needed)
import clsx from 'clsx'

<button className={clsx(
  'px-4 py-2 rounded-lg transition-colors',
  isActive ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'
)}>
  Click me
</button>

// Or use template literals
<button className={`
  px-4 py-2 rounded-lg transition-colors
  ${isActive ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'}
`}>
  Click me
</button>
```

### Global CSS

```css
/* Only use global CSS for: */

/* 1. Tailwind directives */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 2. Custom animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 3. Base element styles */
@layer base {
  body {
    @apply antialiased;
  }
}

/* 4. Utility classes not in Tailwind */
@layer utilities {
  .truncate-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

/* Never use ID or class selectors for component styles */
```

### Design Tokens Usage

```typescript
// Use design tokens from Tailwind config
// Colors
<div className="bg-primary text-primary-light">
<button className="hover:bg-primary-dark">

// Spacing (8px base)
<div className="p-4 gap-2 mt-6">

// Border radius
<div className="rounded-lg rounded-xl rounded-2xl">

// Shadows
<div className="shadow-sm shadow-button">

// Typography
<p className="text-base font-medium text-gray-900">
<h1 className="text-3xl font-bold">
```

## Code Organization

### Imports Organization

```typescript
// 1. External dependencies
import React, { useState, useCallback } from 'react'
import type { ReactNode, FormEvent } from 'react'
import clsx from 'clsx'

// 2. Next.js
import { redirect } from 'next/navigation'
import Link from 'next/link'

// 3. Internal absolute imports (@/)
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { validateEmail } from '@/lib/validation'
import type { User } from '@/types/auth.types'

// 4. Styles
import '@/app/globals.css'

// 5. Type imports last
import type { LoginFormProps } from './types'
```

### Function Export Patterns

```typescript
// Preferred: Default export for page components
export default function LoginPage() {
  // ...
}

// Use named exports for reusable components
export function Button({ children, variant }: ButtonProps) {
  // ...
}

// Utilities: Named exports
export const formatPrice = (price: number): string => {
  // ...
}

export const validateEmail = (email: string): boolean => {
  // ...
}

// Avoid: Default export for utility functions
// Bad: export default const formatPrice = ...
```

## Testing Standards

### Unit Testing (Future)

```typescript
// File: components/ui/button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from './button'

describe('Button Component', () => {
  it('renders with primary variant by default', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toHaveClass('bg-gradient-primary')
  })

  it('renders with secondary variant', () => {
    render(<Button variant="secondary">Click me</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-gradient-gold')
  })

  it('renders fullWidth when specified', () => {
    render(<Button fullWidth>Click me</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('w-full')
  })
})
```

### Testing Best Practices

```typescript
// 1. Test user behavior, not implementation
// Good
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText(/email/i)

// Avoid
screen.getByTestId('submit-btn')
screen.getByClassName('email-input')

// 2. Arrange, Act, Assert pattern
it('submits form with valid data', () => {
  // Arrange
  render(<LoginForm />)
  const emailInput = screen.getByLabelText(/email/i)
  const submitButton = screen.getByRole('button', { name: /submit/i })

  // Act
  userEvent.type(emailInput, 'test@example.com')
  userEvent.click(submitButton)

  // Assert
  expect(mockSubmit).toHaveBeenCalled()
})
```

## Documentation Standards

### Code Comments

```typescript
// Use comments sparingly - code should be self-explanatory
// Good function names eliminate need for comments

// Good
const calculateDiscount = (price: number, percentage: number): number => {
  return price * (1 - percentage / 100)
}

// Bad (comment explains obvious code)
// Multiply price by 1 minus percentage divided by 100
const calculateDiscount = (price: number, percentage: number): number => {
  return price * (1 - percentage / 100)
}

// Use comments for WHY, not WHAT
// Good: Explains business logic
// Per government mandate, residential properties increase by 5% annually
const getResidentialMultiplier = (year: number): number => {
  return 1 + (0.05 * year)
}

// JSDoc for exported functions
/**
 * Calculates property valuation based on location and characteristics
 * @param property - The property to valuate
 * @param factors - Environmental factors affecting price
 * @returns Calculated property value
 */
export function valuateProperty(property: Property, factors: PriceFactors): number {
  // Implementation
}
```

### README Requirements

Each module should have clear documentation in markdown files.

```markdown
# Module Name

## Overview
Brief description of module purpose.

## Usage
```typescript
import { functionName } from '@/path'

functionName(arg1, arg2)
```

## API
- `function(arg1: Type1, arg2: Type2): ReturnType` - Description

## Examples
Practical examples of common use cases.

## Notes
Any important considerations or limitations.
```

## Git & Commit Standards

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `style:` Code style changes (no logic)
- `refactor:` Code refactoring
- `perf:` Performance improvement
- `test:` Adding tests
- `chore:` Build/dependency updates

**Examples:**
```
feat(login): Add password visibility toggle
fix(input): Correct icon positioning on focus
docs: Update component API documentation
refactor(button): Simplify variant logic
```

### Branch Naming

```
feature/description        # New features
fix/description           # Bug fixes
refactor/description      # Code refactoring
docs/description          # Documentation
```

### Pull Request Standards

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation update

## Checklist
- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] No new console warnings
- [ ] Documentation updated

## Testing
How to test these changes.

## Screenshots (if UI changes)
Attach before/after screenshots.
```

## API Route Patterns (Phase 6)

### API Route Structure

```typescript
// File: app/api/[resource]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import type { ApiResponse } from '@/types/api.types'

// Explicit HTTP method handler
export async function GET(request: NextRequest) {
  try {
    // Validate query parameters
    const params = request.nextUrl.searchParams
    const districtId = params.get('districtId')

    if (!districtId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Missing districtId parameter' },
        { status: 400 }
      )
    }

    // Query database
    const data = await supabase
      .from('streets')
      .select('*')
      .eq('district_id', districtId)

    return NextResponse.json<ApiResponse<typeof data>>({
      success: true,
      data,
    })
  } catch (error) {
    console.error('[API Error]:', error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Response Type Pattern

```typescript
// File: types/api.types.ts
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Usage in routes
const response: ApiResponse<District[]> = {
  success: true,
  data: districts,
}
```

## Calculation Patterns (Phase 6)

### Price Calculator Implementation

```typescript
// File: lib/calculations/price-calculator.ts
interface CalculationInput {
  basePrice: number
  landTypeCoef: number
  locationCoef: number
  areaCoef: number
  depthCoef: number
  fengShuiCoef: number
  area: number
}

interface CalculationResult {
  pricePerSqm: number
  totalPrice: number
  breakdown: {
    base: number
    afterLandType: number
    afterLocation: number
    afterArea: number
    afterDepth: number
    afterFengShui: number
  }
}

export function calculatePrice(input: CalculationInput): CalculationResult {
  // Apply coefficients sequentially
  let price = input.basePrice
  const breakdown = { base: price }

  price *= input.landTypeCoef
  breakdown.afterLandType = price

  price *= input.locationCoef
  breakdown.afterLocation = price

  price *= input.areaCoef
  breakdown.afterArea = price

  price *= input.depthCoef
  breakdown.afterDepth = price

  price *= input.fengShuiCoef
  breakdown.afterFengShui = price

  const totalPrice = price * input.area

  return {
    pricePerSqm: price,
    totalPrice,
    breakdown,
  }
}
```

### Currency Formatting

```typescript
// Format Vietnamese currency (₫ VND)
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Usage
const formatted = formatCurrency(50000000) // "50,000,000 ₫"
```

## Performance Standards

### Bundle Size

| Metric | Target | Max |
|--------|--------|-----|
| JS Bundle | <150KB | 200KB |
| CSS Bundle | <50KB | 75KB |
| Images | Optimized | - |
| Fonts | Subset + swap | - |

### Rendering Performance

```typescript
// Avoid unnecessary re-renders
// Use useCallback for event handlers
const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
  setInput(e.target.value)
}, [])

// Memoize expensive components (if needed)
import { memo } from 'react'

const MemoizedCard = memo(function Card({ data }: CardProps) {
  return <div>{data.name}</div>
})

// Lazy load heavy components
const HeavyComponent = dynamic(() => import('./Heavy'), {
  loading: () => <LoadingPlaceholder />
})
```

### Image Optimization

```typescript
// Use next/image for automatic optimization
import Image from 'next/image'

<Image
  src="/property.jpg"
  alt="Property photo"
  width={800}
  height={600}
  priority={false}
  quality={80}
/>

// Or use semantic HTML for SVGs
<svg viewBox="0 0 24 24" className="w-6 h-6">
  <path d="..." />
</svg>
```

## Linting & Formatting

### ESLint Configuration

```json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "@next/next/no-html-link-for-pages": "off"
  }
}
```

### Pre-commit Checks

```bash
# Run before committing
npm run lint           # ESLint
npm run type-check    # TypeScript
npm run build         # Next.js build
```

## Accessibility Standards

### HTML Semantics

```typescript
// Use semantic HTML
<button onClick={handleSubmit}>Submit</button>  // Good
<div onClick={handleSubmit}>Submit</div>       // Bad

<input type="email" />                         // Good
<input type="text" />                          // Bad (loses email semantics)

<label htmlFor="email">Email</label>          // Good
<span>Email</span>                             // Bad
<input id="email" />

<header>, <nav>, <main>, <footer>             // Use semantic containers
```

### Keyboard Navigation

```typescript
// All interactive elements must be keyboard accessible
<button>Click me</button>              // ✓ Native button
<a href="/page">Link</a>               // ✓ Native link
<input />                              // ✓ Native input

<div role="button" tabIndex={0}>      // Avoid - use native elements
  Click me
</div>
```

### ARIA Labels

```typescript
// Use ARIA only when semantic HTML insufficient
<button aria-label="Close menu">
  <CloseIcon />
</button>

<div role="status" aria-live="polite">
  Loading...
</div>

<form aria-labelledby="form-title">
  <h2 id="form-title">Login</h2>
</form>
```

## Code Review Checklist

- [ ] Code follows naming conventions
- [ ] TypeScript types are explicit
- [ ] No `any` types used
- [ ] Components are properly exported
- [ ] Props are typed with interfaces
- [ ] No unnecessary console.logs
- [ ] Accessibility requirements met
- [ ] Performance optimizations applied
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] ESLint passes
- [ ] TypeScript compiles without errors

---

**Last Updated:** 2025-12-28
**Maintained By:** Development Team
**Next Review:** 2025-01-31 (Phase 2 start)
