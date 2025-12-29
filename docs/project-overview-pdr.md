# Land Price App - Project Overview & Product Development Requirements

**Version:** 1.6.0
**Last Updated:** 2025-12-29 (Phase 7 Complete)
**Status:** Phase 7 Complete - 58% Overall (7 of 12 phases)
**Client:** Agribank Trà Vinh

## Executive Summary

Land Price App is a mobile-first web application for querying property valuations in Trà Vinh province, Vietnam. The application provides a user-friendly interface aligned with Agribank's brand identity for searching, calculating, and tracking property valuations based on government-mandated pricing decisions.

## Project Vision

Empower citizens and real estate professionals to quickly access accurate property valuation data for Trà Vinh province through a trustworthy, branded interface backed by official government pricing decisions.

## Business Objectives

1. **Accessibility:** Provide 24/7 access to property valuation data
2. **Brand Awareness:** Strengthen Agribank's digital presence
3. **Efficiency:** Reduce manual inquiry workload
4. **Accuracy:** Ensure official pricing data is easily accessible
5. **User Experience:** Create intuitive interface for diverse user groups

## Target Users

1. **Primary:** Property owners and real estate agents
2. **Secondary:** Government officials, appraisers
3. **Tertiary:** General public researching property values

## Product Phases

### Phase 1: UI Foundation (COMPLETE)
**Status:** Complete (as of 2025-12-28)

**Deliverables:**
- Root layout with Vietnamese font support
- Login page with Agribank branding
- Reusable button component system
- Reusable input component system
- Global styling with animations
- Design system implementation
- Tailwind configuration with brand tokens

**Timeline:** Q4 2024
**Team:** UI/Design, Frontend Development

### Phase 2: Static User Pages (COMPLETE)
**Status:** Complete (as of 2025-12-28)

**Deliverables:**
- Home/search screen interface with dropdowns
- Results page with 4-level price card display
- History page with mock search history
- Bottom navigation component with active state tracking
- Select dropdown component for location filtering
- Responsive mobile-first design

**Timeline:** Q4 2024
**Team:** Frontend Development

### Phase 3: Static Admin Pages (COMPLETE)
**Status:** Complete (as of 2025-12-28)

**Deliverables:**
- Admin dashboard with statistics and activity feed
- Admin settings page with form layouts
- Sidebar navigation component with responsive collapse
- Data table component for CRUD UI
- Stat card component for metrics display
- Activity item component for activity logs
- Mock data for users, prices, coefficients, and activity

**Timeline:** Q4 2024
**Team:** Frontend Development

### Phase 4: Supabase Setup & Database (COMPLETE)
**Status:** Complete (as of 2025-12-29)

**Deliverables:**
- Supabase PostgreSQL database configured
- 11-table relational schema with foreign keys and indexes
- Row Level Security (RLS) policies implemented
- Database type definitions (database.types.ts - 461 lines)
- Supabase client configuration (client.ts, server.ts)
- Initial data migration (001_initial_schema.sql - 11 tables)
- Seed data script (seed.sql - 9 districts, 60+ segments, coefficients)
- Test page for Supabase connectivity verification

**Database Tables:**
- users, districts, streets, segments
- land_type_coefficients, location_coefficients, area_coefficients
- depth_coefficients, feng_shui_coefficients, search_history, brand_settings

**Timeline:** Q4 2024 - Q1 2025
**Team:** Backend & Database Development


### Phase 5: Authentication System (COMPLETE)

**Status:** Complete (as of 2025-12-29)

**Deliverables:**
- Better Auth integration with PostgreSQL (Supabase)
- Email/phone + password authentication
- User role management (admin/user)
- Session management with secure cookies (7-day expiry)
- Route protection middleware
- Login validation and error handling
- Server action for secure form submission
- Header component with logout functionality
- useAuth hook for client-side auth state
- Password complexity validation (8+ chars, uppercase, lowercase, number)
- Vietnamese phone number support
- User enumeration prevention

**Key Features Implemented:**
- Email/password login with role-based routing
- Middleware-protected routes
- Session caching (5-minute TTL)
- Secure httpOnly cookies
- Login error messages (Vietnamese)
- Header with user info and logout

**Timeline:** Q4 2024 - Q1 2025
**Team:** Backend & Authentication Development

### Phase 6: User Search & Calculation (COMPLETE)

**Status:** Complete (as of 2025-12-29)

**Deliverables:**
- Dynamic cascading dropdowns (district → street → segment)
- Real database queries for all three dropdown levels
- Price calculation engine with 5 coefficient types
- 4 price level display (government, min, max, avg)
- Calculation breakdown showing each coefficient applied
- Vietnamese currency formatting (₫ VND)
- API routes for districts, streets, segments, and coefficients
- Live calculation updates on input changes
- Area input field for property size calculation

**Key Features Implemented:**
- GET /api/districts - Returns all 9 Trà Vinh districts
- GET /api/streets?districtId=x - Returns filtered streets
- GET /api/segments?streetId=x - Returns segments with price data
- GET /api/coefficients - Returns all 5 coefficient types
- Price calculator with formula: base_price × land_type × location × area × depth × feng_shui
- Results page displays all 4 price levels calculated

**Timeline:** 2025-12-29
**Team:** Full-Stack Development

### Phase 7: Search History Feature (COMPLETE)

**Status:** Complete (as of 2025-12-29)

**Deliverables:**
- Search history storage in database (search_history table)
- HistoryCard component for displaying search entries
- History page with paginated list view
- Delete functionality with confirmation
- Share functionality (copy to clipboard)
- View details navigation to results
- Loading, error, and empty states
- Pagination support (20 items per page)
- History API client (lib/api/history.ts)
- Price/date formatting utilities (Vietnamese locale)
- Stats summary (total searches, districts, displayed count)

**Key Features Implemented:**
- GET /api/history?page=x&limit=y - Returns paginated history with stats
- POST /api/history - Saves new search with coefficients_json
- DELETE /api/history/:id - Deletes single record
- segmentId stored in coefficients_json for results navigation
- Gradient card styling with land type/location badges
- Vietnamese price formatting ("X tỷ", "X triệu")
- Relative date formatting ("Hôm nay", "Hôm qua", "DD/MM")

**Timeline:** 2025-12-29
**Team:** Full-Stack Development

### Phase 8-12: Future Phases (PLANNED)

Detailed planning for phases 8-12 in project roadmap

## Functional Requirements

### Phase 1 - UI Foundation

**FR1.1: Root Application Layout**
- Load Vietnamese-optimized font (Be Vietnam Pro)
- Set application metadata and viewport
- Configure theme color (#AE1C3E)
- Render language as Vietnamese

**FR1.2: Home Page**
- Redirect unauthenticated users to login page
- Implement server-side redirect

**FR1.3: Login Page UI**
- Display Agribank logo and branding
- Render email/phone input field
- Render password input field
- Provide password visibility toggle
- Display "Remember me" checkbox
- Display "Forgot password?" link
- Display "Sign up" link
- Render social login buttons (Google, Facebook)
- Implement form structure with submit button

**FR1.4: Reusable Components**
- **Button Component:**
  - Support 4 variants (primary, secondary, outline, social)
  - Implement fullWidth option
  - Support icon and text content
  - Provide hover and active states
  - Ensure 44px minimum touch target

- **Input Component:**
  - Support text, password input types
  - Display left-side icons
  - Support right-side elements (toggle buttons)
  - Provide focus states with visual feedback
  - Ensure 44px minimum touch target
  - Implement ref forwarding

**FR1.5: Design System**
- Define color palette matching Agribank brand
- Create gradient definitions
- Establish spacing system (8px base)
- Define typography scale
- Create animation keyframes
- Configure Tailwind design tokens

### Phase 5 - Authentication System

**FR5.1: User Authentication**
- Support email and Vietnamese phone number login
- Validate email format and phone format
- Implement password complexity rules (8+ chars, upper, lower, number)
- Store passwords securely (scrypt hashing)
- Create user sessions with 7-day expiry

**FR5.2: Session Management**
- Create secure httpOnly cookies
- Cache sessions for 5 minutes (performance)
- Validate sessions on protected routes
- Support user logout

**FR5.3: Route Protection**
- Redirect unauthenticated users to /login
- Protect user routes (/, /results, /history)
- Protect admin routes (/admin/*)
- Allow public access to /login and /api/auth/*

**FR5.4: Role-Based Routing**
- Support admin and user roles
- Redirect admins to /admin/dashboard on login
- Redirect users to / on login
- Display admin badge in header for admin users

**FR5.5: User Management**
- Support user profile fields (name, email, phone, role)
- Enable user activation/deactivation
- Track user creation date

**FR5.6: Error Handling**
- Display generic error messages (prevent user enumeration)
- Validate user exists and is active
- Provide Vietnamese error messages
- Log authentication failures

### Phase 6 - User Search & Calculation

**FR6.1: Search Interface**
- Render cascading dropdowns (district → street → segment)
- Load district list from database
- Filter streets by selected district
- Filter segments by selected street
- Support area input field
- Display calculated prices on selection change

**FR6.2: Price Calculation**
- Calculate price using 5 coefficient types
- Display 4 price levels (government, min, max, avg)
- Show coefficient breakdown details
- Format prices as Vietnamese currency (₫)
- Update calculations on input change

### Phase 7 - Search History

**FR7.1: History Display**
- Load user's search history from database
- Display history cards with street name, district, price, date
- Show land type and location badges extracted from coefficients
- Support pagination (20 items per page)
- Display loading, error, and empty states

**FR7.2: History Management**
- Support view action (navigate to results with segmentId)
- Support share action (copy result to clipboard)
- Support delete action (with confirmation)
- Update pagination state after delete
- Show stats (total searches, districts, displayed items)

**FR7.3: Data Storage**
- Save search results to search_history table
- Store coefficients_json with segmentId
- Store street_name, district_name, segment_desc, area, total_price
- Timestamp creation automatically

**FR7.4: Formatting**
- Format prices as "X tỷ" (billions) or "X triệu" (millions)
- Format dates as relative ("Hôm nay", "Hôm qua") or "DD/MM"
- Extract land type from coefficients_json.landType.name
- Extract location from coefficients_json.location.name

### Phase 8+ (Future Requirements Listed in Phase Documents)

## Non-Functional Requirements

### Performance Requirements

| Metric | Target | Phase |
|--------|--------|-------|
| First Contentful Paint | <2s | 1 |
| Largest Contentful Paint | <3s | 1 |
| Cumulative Layout Shift | <0.1 | 1 |
| Time to Interactive | <3.5s | 2 |
| Bundle Size (JS) | <150KB | 2 |
| Lighthouse Score | >90 | 2 |

### Scalability Requirements

- Support 10,000+ concurrent users
- Handle 100,000+ property records
- API response time <500ms
- Database query time <200ms
- Cache strategy for property data

### Security Requirements

**Phase 1:**
- No sensitive data handling
- HTTPS enforcement (deployment)

**Phase 5 (COMPLETE):**
- Password encryption (scrypt hashing via Better Auth)
- Secure httpOnly cookies with sameSite=Strict
- User enumeration prevention (generic error messages)
- Active status validation
- Input validation (email, phone, password)
- Vietnamese phone format support
- Session expiry (7 days)
- CSRF protection (Next.js form action)
- Next.js built-in security headers

**Phase 5+ (FUTURE):**
- Rate limiting (login attempts)
- Password reset flow
- Email verification
- Two-factor authentication (optional)
- Audit logging
- Session invalidation on logout

### Accessibility Requirements

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Color contrast ratio ≥4.5:1
- Screen reader compatibility
- Touch target minimum 44x44px
- Reduced motion support

### Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)
- Responsive design from 320px to 1920px width

### Reliability Requirements

- 99.5% uptime SLA (future)
- Automated backups (daily)
- Disaster recovery plan
- Error monitoring and alerting
- Health check endpoints

## Technical Constraints

### Architecture Constraints
- Must use Next.js 14 with App Router
- Server-side rendering by default
- Client components only where interactive
- Mobile-first responsive design
- Max-width constraint: 428px (mobile container)

### Technology Stack Constraints
- React 18.3+ for UI components
- Tailwind CSS for styling (no custom CSS except animations)
- TypeScript strict mode enabled
- Be Vietnam Pro font required
- No external UI component libraries (custom components only)

### Data Constraints
- Property data to be sourced from government decisions
- Pricing updates quarterly or as needed
- Historical data retention: minimum 5 years
- Data consistency across all users

## Acceptance Criteria (Phase 1)

### AC1.1: Login Page Display
- **Given:** User navigates to root URL
- **When:** Page loads
- **Then:** User is redirected to /login route
- **And:** Login page displays Agribank logo, branding, and form fields

### AC1.2: Form Interaction
- **Given:** Login page is displayed
- **When:** User clicks password visibility toggle
- **Then:** Password field type toggles between password and text
- **And:** Icon changes to reflect current state

### AC1.3: Component Rendering
- **Given:** Login page is rendered
- **When:** Page loads
- **Then:** All buttons render with correct variants
- **And:** All inputs render with correct icons
- **And:** Animations play smoothly

### AC1.4: Design System Accuracy
- **Given:** Design tokens are defined
- **When:** Components render
- **Then:** Colors match Agribank brand specifications
- **And:** Spacing follows 8px base unit
- **And:** Font is Be Vietnam Pro

### AC1.5: Mobile Optimization
- **Given:** Page loads on mobile device (428px width)
- **When:** User interacts with form
- **Then:** Touch targets are minimum 44x44px
- **And:** Layout is responsive
- **And:** No horizontal scrolling

### AC1.6: Typography
- **Given:** Page renders
- **When:** Text displays
- **Then:** Be Vietnam Pro font is loaded
- **And:** Vietnamese characters render correctly
- **And:** Font display strategy is 'swap'

## Success Metrics (Phase 1)

- [ ] Login page loads in <2 seconds
- [ ] All components render without console errors
- [ ] TypeScript build completes without errors
- [ ] ESLint checks pass
- [ ] Lighthouse accessibility score >90
- [ ] Lighthouse performance score >80
- [ ] Mobile device testing passes on iOS and Android
- [ ] Design tokens match brand specifications
- [ ] Animations perform smoothly (60 FPS)

## Dependencies & Integration Points

### Phase 1 Dependencies
- Google Fonts API (Be Vietnam Pro)
- Tailwind CSS framework
- TypeScript compiler
- Next.js build system

### Phase 2 Dependencies
- Property data API/Database
- Search functionality
- Geolocation services

### Phase 5+ Dependencies
- Authentication service
- User database
- Email service (password reset)
- OAuth providers (Google, Facebook)

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Font loading delays | Low | Medium | Font display: swap strategy |
| Browser compatibility | Low | Medium | Test on multiple browsers |
| Performance regression | Medium | High | Implement performance monitoring |
| Data accuracy issues | Medium | High | Validate with government source |
| User adoption | Medium | High | User research and feedback |
| Mobile optimization gaps | Low | Medium | Comprehensive mobile testing |

## Deployment Strategy

### Phase 1 Deployment
- **Platform:** Vercel (recommended for Next.js)
- **Environment:** Staging and Production
- **Domain:** landprice.agribank.vn (proposed)
- **SSL:** Required for all environments
- **CDN:** Automatic via Vercel Edge Network

### Future Deployments
- Blue-green deployment strategy
- Automated testing before deployment
- Rollback capability
- Feature flags for gradual rollout
- Monitoring and alerting

## Success Criteria (Long-term)

### User Engagement
- 10,000+ monthly active users (by Month 6)
- Average session duration >3 minutes
- Property search completion rate >75%
- Return user rate >40%

### Technical Metrics
- >99.5% uptime
- <500ms average response time
- <100ms client-side interaction latency
- >95% Lighthouse score

### Business Metrics
- Reduce phone inquiries by 50%
- Positive user feedback (>4/5 stars)
- Zero security breaches
- Full ROI within 12 months

## Maintenance & Support

### Phase 1 Support
- Bug fixes within 24 hours
- Security updates within 48 hours
- Monthly performance review

### Ongoing Support (Phases 2+)
- 24/7 monitoring and alerting
- Weekly backup verification
- Monthly security audits
- Quarterly performance optimization
- Annual disaster recovery testing

## Documentation Requirements

### Phase 1 Documentation (COMPLETED)
- [x] Codebase summary
- [x] System architecture
- [x] Design guidelines
- [x] API documentation (N/A - no API yet)
- [x] Deployment guide (stub)
- [x] Development setup guide
- [x] Code standards

### Future Documentation
- API documentation (Phase 2)
- Admin user guide (Phase 6)
- End-user manual
- System administration guide
- Troubleshooting guide

## Team Structure

### Phase 1 Team
- **Project Manager:** 1 (planning, coordination)
- **UI/UX Designer:** 1 (design system, mockups)
- **Frontend Developer:** 1-2 (implementation)
- **QA/Testing:** 1 (testing, validation)

### Phases 2-6 Team Expansion
- Backend developers
- Database administrator
- DevOps engineer
- Business analyst
- Product manager

## Budget Estimate (Indicative)

| Phase | Duration | Effort (Dev-Months) | Cost Range |
|-------|----------|-------------------|------------|
| Phase 1 | 4 weeks | 1-2 | $5K-$10K |
| Phase 2 | 6 weeks | 2-3 | $10K-$15K |
| Phase 3 | 6 weeks | 2-3 | $10K-$15K |
| Phase 4 | 4 weeks | 1-2 | $5K-$10K |
| Phase 5 | 8 weeks | 3-4 | $15K-$20K |
| Phase 6 | 6 weeks | 2-3 | $10K-$15K |
| **Total** | **34 weeks** | **11-17** | **$55K-$85K** |

## Roadmap Timeline

```
Q4 2024 → Phase 1 (Complete)
         ├─ Week 1-2: Design System & Mockups
         ├─ Week 3-4: UI Implementation

Q1 2025 → Phase 2: Search Interface
         ├─ Week 1-3: Backend API Setup
         ├─ Week 4-6: Search UI & Integration

Q2 2025 → Phase 3: Calculations
         ├─ Week 1-3: Calculation Engine
         ├─ Week 4-6: UI & Export Features

Q3 2025 → Phase 4: History & Phase 5 Planning
         ├─ Week 1-2: History Feature
         ├─ Week 3-4: Auth System Design
         ├─ Week 5-8: Authentication Implementation

Q4 2025 → Phase 6: Admin Dashboard
         ├─ Week 1-3: Admin Interface
         ├─ Week 4-6: Data Management

2026 → Launch & Optimization
      ├─ User feedback incorporation
      ├─ Performance optimization
      └─ Additional features based on usage
```

## Version History

| Version | Date | Status | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-28 | Active | Phase 1 completion - UI foundation complete |
| 0.1.0 | 2024-12-01 | Archived | Initial project setup and planning |

## Approval & Sign-off

**Document Owner:** Project Manager / Tech Lead
**Last Reviewed:** 2025-12-28
**Next Review:** 2025-01-31 (Phase 2 completion)

---

**Note:** This PDR document is a living document and will be updated as the project evolves through each phase. All changes must be documented with version updates and review dates.
