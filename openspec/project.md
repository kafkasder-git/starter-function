# Project Context

## Purpose

Kafkasder Yönetim Sistemi (Kafkasder Management Panel) - Modern, güvenli ve
kullanıcı dostu bir dernek yönetim sistemi. Bağış yönetimi, üye takibi, yardım
başvuruları, kumbara takibi ve raporlama özellikleri içerir.

**Hedefler:**

- Dernek operasyonlarının dijitalleştirilmesi
- Bağış ve yardım süreçlerinin şeffaflaştırılması
- Mobil öncelikli, PWA destekli kullanıcı deneyimi
- Güvenli veri yönetimi ve rol tabanlı erişim kontrolü

## Tech Stack

### Frontend

- **React 18.3** - UI framework
- **TypeScript 5.9** - Type safety
- **Vite 7.1** - Build tool ve dev server
- **TailwindCSS 4.0** - Styling
- **Radix UI** - Accessible component primitives
- **React Hook Form + Zod** - Form validation
- **Zustand** - State management
- **React Query** - Server state management
- **Motion (Framer Motion)** - Animations

### Backend & Database

- **Appwrite** - Backend-as-a-Service
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication
  - Row Level Security (RLS)
  - Storage for files

### PWA & Performance

- **Vite PWA Plugin** - Progressive Web App support
- **Workbox** - Service worker management
- **React Performance Hooks** - Core Web Vitals tracking

### Testing & Quality

- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript strict mode** - Type checking


## Project Conventions

### Code Style

- **TypeScript Strict Mode**: Enabled
- **Naming Conventions**:
  - Components: PascalCase (e.g., `BeneficiaryForm.tsx`)
  - Hooks: camelCase with `use` prefix (e.g., `useBeneficiaries.ts`)
  - Services: camelCase with Service suffix (e.g., `donationsService.ts`)
  - Types: PascalCase (e.g., `Beneficiary`, `DonationStatus`)
  - Constants: UPPER_SNAKE_CASE
- **File Organization**:
  - `components/` - React components
  - `hooks/` - Custom React hooks
  - `services/` - Business logic and API calls
  - `stores/` - Zustand state management
  - `types/` - TypeScript type definitions
  - `lib/` - Utilities and helpers
- **Import Order**: External → Internal → Types → Styles
- **ESLint**: Max complexity 15, max lines per function 100
- **Prettier**: 2 spaces, single quotes, trailing commas

### Architecture Patterns

#### Service Layer Pattern

- Tüm servisler functional pattern ile yazılıyor (class-based değil)
- Her servis kendi domain'ini yönetir (beneficiaries, donations, members, etc.)
- Appwrite client'ı servisler içinde encapsulate edilir
- Type-safe API responses

#### Component Structure

- **Atomic Design**:
  - `components/ui/` - Primitive components (Button, Input, etc.)
  - `components/forms/` - Form components
  - `components/pages/` - Page-level components
  - `components/[feature]/` - Feature-specific components
- **Smart vs Dumb Components**:
  - Smart: Data fetching, state management
  - Dumb: Pure UI, props-based

#### State Management

- **Zustand Stores**: Global state (auth, notifications, UI)
- **React Query**: Server state caching
- **Local State**: Component-level state (useState)
- **Form State**: React Hook Form

#### Security Patterns

- **RLS (Row Level Security)**: Database-level authorization
- **Input Sanitization**: DOMPurify for user inputs
- **CSRF Protection**: Token-based
- **Rate Limiting**: API protection
- **Encryption**: Sensitive data encryption (AES-256)

#### Performance Optimization

- **Code Splitting**: Lazy loading with React.lazy
- **Memoization**: React.memo, useMemo, useCallback
- **Virtual Scrolling**: Infinite scroll for large lists
- **Image Optimization**: WebP format, lazy loading
- **Bundle Optimization**: Tree shaking, minification

### Testing Strategy

#### Unit Tests (Vitest)

- **Coverage Target**: 80%+
- **Test Files**: `*.test.ts`, `*.test.tsx`
- **Location**: `__tests__/` directories or co-located
- **Focus**: Business logic, utilities, hooks

#### Integration Tests

- Component integration tests
- Service layer tests with mock Appwrite

#### E2E Tests (Playwright)

- Critical user flows (login, donations, beneficiary management)
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile viewport testing

#### Performance Tests

- Lighthouse CI for Core Web Vitals
- Bundle size monitoring
- Load testing with k6 (planned)

### Git Workflow

#### Branch Strategy

- **main**: Production-ready code
- **feature/[name]**: New features
- **fix/[name]**: Bug fixes
- **refactor/[name]**: Code refactoring
- **chore/[name]**: Maintenance tasks

#### Commit Conventions

- Follow Conventional Commits
- Format: `type(scope): message`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`
- Example: `feat(donations): add recurring donation support`

#### Pull Request Process

- Husky pre-commit hooks run linting and type-checking
- PR requires code review
- All tests must pass
- No merge conflicts

## Domain Context

### Dernek Yönetimi (Association Management)

- **Üyeler (Members)**: Dernek üyeleri ve sponsorlar
- **Bağışlar (Donations)**: Nakit ve ayni bağışlar
- **Yardım Başvuruları (Aid Applications)**: İhtiyaç sahipleri başvuruları
- **Yararlanıcılar (Beneficiaries)**: Yardım alan kişiler/aileler
- **Kumbara Sistemi**: Bağış toplama kumbaraları ve QR kod takibi
- **Mali Raporlar**: Gelir-gider raporları, bütçe takibi

### Roller ve İzinler (Roles & Permissions)

- **Admin**: Tüm yetkilere sahip
- **Moderator**: İçerik yönetimi ve onay süreçleri
- **Muhasebe**: Mali işlemler ve raporlar
- **Üye**: Sınırlı erişim (kendi bilgileri)
- **Misafir**: Sadece okuma yetkisi

### İş Süreçleri

1. **Bağış Akışı**: Bağış → Onay → Makbuz → Mali kayıt
2. **Yardım Akışı**: Başvuru → İnceleme → Onay → Dağıtım → Takip
3. **Üyelik**: Başvuru → Belge kontrolü → Onay → Aktivasyon
4. **Kumbara**: Kumbara oluştur → QR kod → Dağıtım → Toplama → Sayım

### Türkçe-İngilizce Mapping

- Kategori/Category mapping (EnglishToTurkish)
- Notification priority mapping (low→dusuk, high→yuksek, etc.)
- Database field names (Turkish) vs UI labels (Turkish)

## Important Constraints

### Technical Constraints

- **Appwrite Free Tier Limits**:
  - Database: 500MB
  - Storage: 1GB
  - Bandwidth: 2GB/month
  - Realtime connections: 200 concurrent
- **Browser Support**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- **Mobile-First**: Must work on mobile devices (iOS, Android)
- **Offline Support**: Limited PWA offline functionality
- **Performance**: LCP < 2.5s, FID < 100ms, CLS < 0.1

### Business Constraints

- **Data Privacy**: KVKK (Turkish GDPR) compliance required
- **Audit Trail**: All critical operations must be logged
- **Multi-tenancy**: Single tenant (dernek-specific)
- **User Roles**: Role-based access control (RBAC)
- **Data Retention**: Minimum 7 years for financial records

### Regulatory Constraints

- **Financial Transparency**: Bağış makbuzları yasal gereklilik
- **Data Protection**: Kişisel verilerin korunması
- **Audit Requirements**: Mali raporların denetlenebilir olması

## External Dependencies

### Primary Services

- **Appwrite** (appwrite.io):
  - PostgreSQL database
  - Authentication (email/password, magic link)
  - Real-time subscriptions
  - Storage API
  - Edge Functions (planned)

### Third-Party Libraries

- **Sonner**: Toast notifications
- **Recharts**: Charts and data visualization
- **date-fns**: Date manipulation (Turkish locale)
- **crypto-js**: Client-side encryption
- **DOMPurify**: XSS protection
- **Tesseract.js**: OCR for document scanning (planned)

### Development Tools

- **Sentry** (planned): Error tracking
- **PostHog** (planned): Analytics

### APIs and Integrations

- **Email Service** (planned): SendGrid or similar
- **SMS Service** (planned): For OTP and notifications
- **Payment Gateway** (planned): For online donations
- **OCR API** (planned): Document processing

## Development Guidelines

### Performance Best Practices

1. Use React.memo for expensive components
2. Lazy load routes and heavy components
3. Optimize images (WebP, compression)
4. Minimize bundle size (tree shaking)
5. Use Core Web Vitals as KPIs

### Security Best Practices

1. Never store sensitive data in localStorage
2. Always sanitize user inputs
3. Use RLS for database security
4. Implement rate limiting
5. Regular security audits

### Accessibility Best Practices

1. Use semantic HTML
2. Proper ARIA labels
3. Keyboard navigation support
4. Screen reader compatibility
5. Color contrast compliance (WCAG AA)

### Code Review Checklist

- [ ] TypeScript errors resolved
- [ ] No console.logs in production
- [ ] Tests written for new features
- [ ] Documentation updated
- [ ] Performance impact considered
- [ ] Security implications reviewed
- [ ] Accessibility validated
