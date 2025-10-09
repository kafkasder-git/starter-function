# Panel-5 Technical Documentation

## Kafkasder Management System

**Version:** 1.0.0  
**Last Updated:** October 6, 2025  
**License:** MIT

---

## Table of Contents

1. [Introduction](#introduction)
   - 1.1 [Purpose and Scope](#purpose-and-scope)
   - 1.2 [Target Audience](#target-audience)
   - 1.3 [Document Conventions](#document-conventions)
   - 1.4 [How to Use This Documentation](#how-to-use-this-documentation)
   - 1.5 [Quick Start Guide](#quick-start-guide)
2. [Executive Summary](#executive-summary)
3. [Document Information](#document-information)
4. [Architecture Overview](#architecture-overview)
   - 4.1 [System Architecture](#system-architecture)
   - 4.2 [Design Patterns](#design-patterns)
   - 4.3 [Component Architecture](#component-architecture)
   - 4.4 [Data Flow](#data-flow)
5. [Technology Stack](#technology-stack)
   - 5.1 [Frontend Technologies](#frontend-technologies)
   - 5.2 [Backend Services](#backend-services)
   - 5.3 [Development Tools](#development-tools)
   - 5.4 [Third-Party Libraries](#third-party-libraries)
6. [System Components](#system-components)
   - 6.1 [Core Modules](#core-modules)
   - 6.2 [UI Components](#ui-components)
   - 6.3 [State Management](#state-management)
   - 6.4 [Hooks and Utilities](#hooks-and-utilities)
7. [API Reference](#api-reference)
   - 7.1 [Supabase API Integration](#supabase-api-integration)
   - 7.2 [REST Endpoints](#rest-endpoints)
   - 7.3 [Real-time Subscriptions](#real-time-subscriptions)
   - 7.4 [Error Handling](#error-handling)
8. [Data Models](#data-models)
   - 8.1 [Database Schema](#database-schema)
   - 8.2 [Entity Relationships](#entity-relationships)
   - 8.3 [Type Definitions](#type-definitions)
   - 8.4 [Data Validation](#data-validation)
9. [Authentication & Authorization](#authentication--authorization)
   - 9.1 [Authentication Flow](#authentication-flow)
   - 9.2 [User Roles and Permissions](#user-roles-and-permissions)
   - 9.3 [Session Management](#session-management)
   - 9.4 [Token Refresh Strategy](#token-refresh-strategy)
10. [Security](#security)
    - 10.1 [Security Architecture](#security-architecture)
    - 10.2 [Input Sanitization](#input-sanitization)
    - 10.3 [CSRF Protection](#csrf-protection)
    - 10.4 [Rate Limiting](#rate-limiting)
    - 10.5 [API Security](#api-security)
    - 10.6 [Data Encryption](#data-encryption)
11. [Deployment](#deployment)
    - 11.1 [Environment Configuration](#environment-configuration)
    - 11.2 [Build Process](#build-process)
    - 11.3 [Deployment Strategies](#deployment-strategies)
    - 11.4 [CI/CD Pipeline](#cicd-pipeline)
    - 11.5 [Monitoring and Logging](#monitoring-and-logging)
12. [Testing](#testing)
    - 12.1 [Testing Strategy](#testing-strategy)
    - 12.2 [Unit Tests](#unit-tests)
    - 12.3 [Integration Tests](#integration-tests)
    - 12.4 [Accessibility Tests](#accessibility-tests)
    - 12.5 [Performance Tests](#performance-tests)
13. [User Guides](#user-guides)
    - 13.1 [Member Management](#member-management)
    - 13.2 [Donation Tracking](#donation-tracking)
    - 13.3 [Beneficiary Management](#beneficiary-management)
    - 13.4 [Aid Request Processing](#aid-request-processing)
    - 13.5 [Campaign Management](#campaign-management)
    - 13.6 [Financial Transactions](#financial-transactions)
14. [Troubleshooting](#troubleshooting)
    - 14.1 [Common Issues](#common-issues)
    - 14.2 [Error Messages](#error-messages)
    - 14.3 [Debug Mode](#debug-mode)
    - 14.4 [Performance Issues](#performance-issues)
15. [FAQ](#faq)
16. [Glossary](#glossary)
17. [References](#references)
    - 17.1 [External Documentation](#external-documentation)
    - 17.2 [Related Resources](#related-resources)
    - 17.3 [Contributing Guidelines](#contributing-guidelines)

---

## 1. Introduction

### 1.1 Purpose and Scope

Panel-5 is a comprehensive management system designed specifically for
Kafkasder, a non-profit organization dedicated to serving communities in need.
This system provides a centralized platform for managing all aspects of the
organization's operations, including:

- **Member Management**: Track and manage organization members, their roles, and
  contributions
- **Donation Tracking**: Record and monitor financial donations from various
  sources
- **Beneficiary Management**: Maintain detailed records of individuals and
  families receiving aid
- **Aid Request Processing**: Handle and track requests for assistance from
  beneficiaries
- **Campaign Management**: Organize and monitor fundraising campaigns and
  initiatives
- **Financial Transactions**: Manage all financial operations with transparency
  and accountability

The system is built with modern web technologies to ensure scalability,
security, and ease of use across desktop and mobile devices.

**Scope:**

- This documentation covers the technical implementation, architecture, and
  operational aspects of the Panel-5 system
- Includes detailed information for developers, system administrators, and
  end-users
- Provides guidelines for deployment, maintenance, and troubleshooting
- Documents security measures, data models, and API integrations

### 1.2 Target Audience

This technical documentation is intended for:

1. **Software Developers**:
   - Frontend and backend developers working on the system
   - Contributors to the open-source project
   - Developers integrating with the system's APIs

2. **System Administrators**:
   - IT personnel responsible for deployment and maintenance
   - Database administrators managing data integrity
   - Security administrators implementing security policies

3. **Technical Project Managers**:
   - Project leads overseeing development and implementation
   - Technical decision-makers evaluating the system

4. **Quality Assurance Engineers**:
   - Testers validating system functionality
   - Performance analysts optimizing system operations

5. **DevOps Engineers**:
   - Personnel managing CI/CD pipelines
   - Infrastructure engineers handling deployment

### 1.3 Document Conventions

Throughout this documentation, the following conventions are used:

- **Code blocks**: Inline code and file names appear in `monospace font`
- **File paths**: Relative paths are shown as `src/components/Example.tsx`
- **Commands**: Terminal commands are prefixed with `$` for clarity
- **Important notes**: Critical information is highlighted in **bold**
- **Links**: Internal references use [anchor links](#section-name)
- **Version-specific**: Features specific to certain versions are noted as
  `(v1.0.0+)`

**Syntax Highlighting:**

```typescript
// TypeScript code examples use syntax highlighting
const example: string = 'Code example';
```

**Callout Boxes:**

> **Note**: Additional information and tips appear in blockquotes

> **Warning**: Critical warnings about potential issues

> **Best Practice**: Recommended approaches and patterns

### 1.4 How to Use This Documentation

This documentation is organized to serve different needs:

**For New Developers:**

1. Start with the [Executive Summary](#executive-summary) for a high-level
   overview
2. Review the [Technology Stack](#technology-stack) to understand the tools used
3. Follow the [Quick Start Guide](#quick-start-guide) to set up your development
   environment
4. Explore [System Components](#system-components) to understand the codebase
   structure

**For System Administrators:**

1. Begin with [Deployment](#deployment) for setup instructions
2. Review [Security](#security) for security configuration
3. Consult [Monitoring and Logging](#monitoring-and-logging) for operational
   insights
4. Reference [Troubleshooting](#troubleshooting) for common issues

**For API Integration:**

1. Start with [API Reference](#api-reference) for endpoint documentation
2. Review [Authentication & Authorization](#authentication--authorization) for
   access control
3. Consult [Data Models](#data-models) for data structure information
4. Check [Error Handling](#error-handling) for error response formats

**For End Users:**

1. Navigate to [User Guides](#user-guides) for feature-specific instructions
2. Consult [FAQ](#faq) for common questions
3. Reference [Glossary](#glossary) for terminology definitions

### 1.5 Quick Start Guide

**Prerequisites:**

- Node.js 18.x or higher (see [`.nvmrc`](.nvmrc) for exact version)
- npm or yarn package manager
- Git for version control
- Supabase account for backend services

**Installation Steps:**

1. **Clone the repository:**

   ```bash
   $ git clone https://github.com/kafkasder/panel.git
   $ cd panel-5
   ```

2. **Install dependencies:**

   ```bash
   $ npm install
   ```

3. **Configure environment variables:**

   ```bash
   $ cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Start development server:**

   ```bash
   $ npm run dev
   ```

5. **Access the application:**
   - Open your browser to `http://localhost:5173`
   - Default development port is 5173 (Vite default)

**Next Steps:**

- Review [Environment Configuration](#environment-configuration) for detailed
  setup
- Explore [Development Tools](#development-tools) for available commands
- Read [Contributing Guidelines](#contributing-guidelines) if you plan to
  contribute

---

## 2. Executive Summary

Panel-5 is a modern, full-stack web application designed to streamline
operations for Kafkasder, a non-profit organization. Built with cutting-edge
technologies, the system provides a robust, scalable, and secure platform for
managing organizational activities.

### Key Features

**Member Management System**

- Comprehensive member database with detailed profiles
- Role-based access control and permission management
- Member activity tracking and engagement metrics
- Automated member communication tools

**Donation Management**

- Multi-channel donation tracking (online, offline, campaigns)
- Real-time donation processing and receipt generation
- Donor relationship management
- Financial reporting and analytics
- Integration with payment gateways

**Beneficiary Services**

- Detailed beneficiary profiles with needs assessment
- Aid request submission and approval workflow
- Distribution tracking and verification
- Impact measurement and reporting
- Privacy-compliant data management

**Campaign Management**

- Campaign creation and goal tracking
- Multi-channel campaign coordination
- Real-time progress monitoring
- Donor engagement analytics
- Automated campaign reporting

**Financial Operations**

- Comprehensive transaction management
- Budget tracking and allocation
- Financial reporting and compliance
- Audit trail and transparency features
- Export capabilities for accounting systems

### Technical Highlights

**Modern Technology Stack**

- **Frontend**: React 18.3.1 with TypeScript 5.9.2 for type-safe development
- **Build Tool**: Vite 7.1.8 for lightning-fast development and optimized builds
- **Backend**: Supabase 2.57.4 providing PostgreSQL database, authentication,
  and real-time capabilities
- **Styling**: Tailwind CSS 4.0.0 for responsive, utility-first design
- **State Management**: Zustand for lightweight, efficient state management

**Performance Optimizations**

- Lazy loading and code splitting for optimal load times
- Infinite scroll and pagination for large datasets
- Background sync for offline capability
- Performance monitoring and optimization hooks
- Mobile-optimized components and interactions

**Security Features**

- Multi-layer security architecture
- Input sanitization and validation
- CSRF protection and rate limiting
- API security middleware
- Encrypted data transmission
- Role-based access control (RBAC)

**Accessibility & UX**

- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Responsive design for all devices
- Progressive Web App (PWA) capabilities
- Contextual tooltips and onboarding flows

### System Architecture

The application follows a modern, component-based architecture:

- **Presentation Layer**: React components with TypeScript for type safety
- **Business Logic Layer**: Custom hooks and services for reusable logic
- **Data Layer**: Supabase integration with real-time subscriptions
- **State Management**: Zustand stores for global state
- **Security Layer**: Middleware and sanitization for data protection

### Deployment & Operations

- **Continuous Integration**: Automated testing and quality checks
- **Continuous Deployment**: Streamlined deployment pipeline
- **Monitoring**: Performance and error tracking
- **Logging**: Comprehensive logging system for debugging
- **Scalability**: Cloud-native architecture for horizontal scaling

---

## 3. Document Information

### Version History

| Version | Date            | Author           | Changes                                    |
| ------- | --------------- | ---------------- | ------------------------------------------ |
| 1.0.0   | October 6, 2025 | Development Team | Initial release of technical documentation |

### Document Metadata

- **Document Title**: Panel-5 Technical Documentation
- **Project Name**: Kafkasder Management System
- **Project Version**: 1.0.0
- **Documentation Version**: 1.0.0
- **Last Updated**: October 6, 2025
- **Status**: Active
- **Classification**: Internal/Public (MIT License)

### Authors and Contributors

**Primary Authors:**

- Development Team - Kafkasder Organization

**Contributors:**

- Open-source community contributors
- Technical reviewers and editors

### Review and Approval

This documentation is maintained by the development team and updated regularly
to reflect system changes and improvements.

**Review Schedule:**

- Major updates: With each major version release
- Minor updates: With significant feature additions
- Patch updates: As needed for corrections and clarifications

### Feedback and Contributions

We welcome feedback and contributions to improve this documentation:

- **Issues**: Report documentation issues on GitHub
- **Pull Requests**: Submit improvements via pull requests
- **Contact**: Reach out to the development team for major changes

### Related Documents

- [`README.md`](README.md) - Project overview and quick start
- [`CONTRIBUTING.md`](CONTRIBUTING.md) - Contribution guidelines
- [`.env.example`](.env.example) - Environment configuration template
- [`package.json`](package.json) - Project dependencies and scripts

### License

This documentation is released under the MIT License, consistent with the
project license.

---

## 4. Architecture Overview

### 4.1 System Architecture

Panel-5 follows a modern **3-tier architecture** with clear separation of
concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  React Components + TypeScript + Tailwind CSS + Radix UI    │
│                  (Client-Side Rendering)                     │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                      │
│   Custom Hooks + Services + State Management (Zustand)      │
│        Context Providers + Middleware + Utilities            │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│  Supabase (PostgreSQL + Auth + Storage + Real-time)         │
│         TanStack Query (Caching + Sync)                      │
└─────────────────────────────────────────────────────────────┘
```

**Key Architectural Principles:**

1. **Component-Based Architecture**: Modular React components with single
   responsibility
2. **Separation of Concerns**: Clear boundaries between UI, business logic, and
   data
3. **Offline-First**: Progressive Web App with background sync capabilities
4. **Real-time Updates**: WebSocket connections for live data synchronization
5. **Type Safety**: Full TypeScript coverage for compile-time error detection
6. **Security-First**: Multi-layer security with input sanitization and CSRF
   protection

### 4.2 Design Patterns

**Implemented Design Patterns:**

1. **Container/Presenter Pattern**
   - Smart containers handle logic and state
   - Presentational components focus on UI rendering
   - Example:
     [`components/beneficiary/BeneficiaryHeader.tsx`](components/beneficiary/BeneficiaryHeader.tsx:1)

2. **Custom Hooks Pattern**
   - Reusable logic encapsulated in custom hooks
   - Examples: [`hooks/useMembers.ts`](hooks/useMembers.ts:1),
     [`hooks/useDonations.ts`](hooks/useDonations.ts:1)

3. **Service Layer Pattern**
   - Business logic isolated in service modules
   - Examples: [`services/membersService.ts`](services/membersService.ts:1),
     [`services/donationsService.ts`](services/donationsService.ts:1)

4. **Observer Pattern**
   - Zustand stores with subscriptions
   - Real-time Supabase subscriptions
   - Example: [`stores/authStore.ts`](stores/authStore.ts:1)

5. **Middleware Pattern**
   - Security middleware for request/response processing
   - Examples: [`middleware/security.ts`](middleware/security.ts:1),
     [`middleware/csrf.ts`](middleware/csrf.ts:1)

6. **Factory Pattern**
   - Service factories for dependency injection
   - Configuration managers for environment-specific settings

7. **Singleton Pattern**
   - Supabase client instance: [`lib/supabase.ts`](lib/supabase.ts:1)
   - Security managers and loggers

### 4.3 Component Architecture

**Component Hierarchy:**

```
App.tsx (Root)
├── ErrorBoundary
├── SupabaseAuthProvider
│   └── NavigationProvider
│       ├── Header
│       │   ├── UserMenu
│       │   ├── NotificationCenter
│       │   └── QuickActions
│       ├── Sidebar
│       │   ├── NavigationMenu
│       │   └── ModuleLinks
│       └── PageRenderer
│           ├── Dashboard
│           ├── Members Module
│           ├── Donations Module
│           ├── Beneficiaries Module
│           ├── Campaigns Module
│           └── Settings Module
```

**Component Categories:**

1. **Core Application Components**
   - [`App.tsx`](App.tsx:1) - Root application component
   - [`components/app/NavigationManager.tsx`](components/app/NavigationManager.tsx:1) -
     Navigation state management
   - [`components/app/PageRenderer.tsx`](components/app/PageRenderer.tsx:1) -
     Dynamic page rendering

2. **Layout Components**
   - [`components/Header.tsx`](components/Header.tsx:1) - Top navigation bar
   - [`components/Sidebar.tsx`](components/Sidebar.tsx:1) - Side navigation menu
   - [`components/MobileNavigation.tsx`](components/MobileNavigation.tsx:1) -
     Mobile-optimized navigation

3. **Feature Components**
   - Authentication: [`components/auth/`](components/auth/)
   - Beneficiaries: [`components/beneficiary/`](components/beneficiary/)
   - Analytics: [`components/analytics/`](components/analytics/)

4. **Shared Components**
   - [`components/ErrorBoundary.tsx`](components/ErrorBoundary.tsx:1) - Error
     handling wrapper
   - [`components/EmptyState.tsx`](components/EmptyState.tsx:1) - Empty state
     displays
   - [`components/AnimatedContainer.tsx`](components/AnimatedContainer.tsx:1) -
     Animation wrapper

### 4.4 Data Flow

**Unidirectional Data Flow:**

```
User Action → Event Handler → Service/Hook → API Call → Supabase
                                    ↓
                            State Update (Zustand)
                                    ↓
                            Component Re-render
                                    ↓
                              UI Update
```

**Real-time Data Flow:**

```
Supabase Real-time Event → Subscription Handler → State Update → UI Update
```

**Offline Data Flow:**

```
User Action → Local Storage → Background Sync Queue → Sync on Reconnect → Supabase
```

**Key Data Flow Patterns:**

1. **Query Pattern**: TanStack Query for data fetching with automatic caching
2. **Mutation Pattern**: Optimistic updates with rollback on error
3. **Subscription Pattern**: Real-time updates via Supabase subscriptions
4. **Sync Pattern**: Background sync for offline operations

---

## 5. Technology Stack

### 5.1 Frontend Technologies

**Core Framework:**

- **React 18.3.1** - Component-based UI library with concurrent features
  - Hooks API for state and lifecycle management
  - Suspense for code splitting and lazy loading
  - Concurrent rendering for improved performance
  - Server Components ready (future enhancement)

- **TypeScript 5.9.2** - Type-safe JavaScript superset
  - Strict mode enabled for maximum type safety
  - Advanced type inference and generics
  - Interface-based architecture
  - Configuration: [`tsconfig.json`](tsconfig.json:1)

- **Vite 7.1.8** - Next-generation build tool
  - Lightning-fast HMR (Hot Module Replacement)
  - Optimized production builds with tree-shaking
  - Native ES modules support
  - Plugin ecosystem for extensibility
  - Configuration: [`vite.config.ts`](vite.config.ts:1)

### 5.2 UI Framework & Components

**Styling:**

- **Tailwind CSS 4.0.0** - Utility-first CSS framework
  - Custom design system configuration
  - JIT (Just-In-Time) compilation
  - Dark mode support
  - Responsive design utilities
  - Configuration: [`tailwind.config.ts`](tailwind.config.ts:1)

- **PostCSS** - CSS transformation pipeline
  - Autoprefixer for browser compatibility
  - CSS optimization and minification

**Component Library:**

- **Radix UI** - Unstyled, accessible component primitives
  - `@radix-ui/react-dialog` - Modal dialogs
  - `@radix-ui/react-dropdown-menu` - Dropdown menus
  - `@radix-ui/react-select` - Select inputs
  - `@radix-ui/react-tabs` - Tab navigation
  - `@radix-ui/react-tooltip` - Tooltips
  - Full WCAG 2.1 Level AA compliance
  - Keyboard navigation support

**UI Utilities:**

- **class-variance-authority** - Type-safe component variants
- **clsx** & **tailwind-merge** - Conditional class name utilities
- **lucide-react** - Icon library with 1000+ icons
- **motion** (Framer Motion) - Animation library
- **recharts** - Chart and data visualization library

### 5.3 Backend Services

**Supabase 2.57.4** - Backend-as-a-Service platform

1. **PostgreSQL Database**
   - Relational database with full SQL support
   - Row Level Security (RLS) for data protection
   - Real-time subscriptions via WebSockets
   - Automatic API generation

2. **Authentication**
   - Email/password authentication
   - OAuth providers support
   - JWT-based session management
   - Role-based access control (RBAC)
   - Token refresh mechanism

3. **Storage**
   - File upload and management
   - Image optimization and transformation
   - Access control policies
   - CDN integration

4. **Real-time**
   - WebSocket connections for live updates
   - Broadcast channels for pub/sub
   - Presence tracking
   - Rate limiting and throttling

5. **Edge Functions** (Future)
   - Serverless function execution
   - Custom business logic
   - Third-party API integrations

### 5.4 State Management

**Zustand 5.0.3** - Lightweight state management

**Store Architecture:**

- [`stores/authStore.ts`](stores/authStore.ts:1) - Authentication state
  - User session management
  - Permission checking
  - Token refresh logic
  - Login/logout actions

- [`stores/notificationStore.ts`](stores/notificationStore.ts:1) - Notification
  state
  - Toast notifications
  - Alert management
  - Notification history

- [`stores/uiStore.ts`](stores/uiStore.ts:1) - UI state
  - Theme preferences
  - Sidebar state
  - Modal visibility
  - Loading states

**Middleware:**

- **persist** - LocalStorage persistence
- **devtools** - Redux DevTools integration
- **immer** - Immutable state updates
- **subscribeWithSelector** - Selective subscriptions

### 5.5 Data Layer

**TanStack Query 5.59.20** - Data fetching and caching

**Features:**

- Automatic background refetching
- Optimistic updates
- Request deduplication
- Pagination and infinite scroll
- Cache invalidation strategies
- Offline support with persistence

**Query Patterns:**

- `useQuery` - Data fetching with caching
- `useMutation` - Data mutations with optimistic updates
- `useInfiniteQuery` - Infinite scroll pagination
- `useQueryClient` - Manual cache management

**Custom Hooks:**

- [`hooks/useMembers.ts`](hooks/useMembers.ts:1) - Member data management
- [`hooks/useDonations.ts`](hooks/useDonations.ts:1) - Donation data management
- [`hooks/useBeneficiaries.ts`](hooks/useBeneficiaries.ts:1) - Beneficiary data
  management
- [`hooks/useSupabaseData.ts`](hooks/useSupabaseData.ts:1) - Generic Supabase
  queries

### 5.6 Forms & Validation

**React Hook Form 7.55.0** - Form state management

- Uncontrolled components for performance
- Built-in validation
- Error handling
- Field arrays and nested forms

**Zod 3.25.76** - Schema validation

- Type-safe validation schemas
- Runtime type checking
- Custom validation rules
- Integration with React Hook Form via `@hookform/resolvers`

**Validation Utilities:**

- [`lib/validation.ts`](lib/validation.ts:1) - Custom validation functions
- [`services/validation.ts`](services/validation.ts:1) - Business logic
  validation

### 5.7 Security Stack

**Input Sanitization:**

- **DOMPurify 3.2.6** - XSS protection
- **isomorphic-dompurify** - Universal sanitization
- [`lib/security/InputSanitizer.ts`](lib/security/InputSanitizer.ts:1) - Custom
  sanitization layer

**Security Middleware:**

- [`middleware/security.ts`](middleware/security.ts:1) - Security headers and
  policies
- [`middleware/csrf.ts`](middleware/csrf.ts:1) - CSRF token management
- [`middleware/rateLimit.ts`](middleware/rateLimit.ts:1) - Rate limiting

**Encryption:**

- **crypto-js 4.2.0** - Client-side encryption
- Secure token storage
- Password hashing (server-side via Supabase)

**Security Services:**

- [`lib/security/apiSecurity.ts`](lib/security/apiSecurity.ts:1) - API security
  layer
- [`lib/security/SecurityMiddleware.ts`](lib/security/SecurityMiddleware.ts:1) -
  Request/response security
- [`lib/security/PermissionManager.ts`](lib/security/PermissionManager.ts:1) -
  Permission checking

### 5.8 Development Tools

**Code Quality:**

- **ESLint 9.36.0** - JavaScript/TypeScript linting
  - Configuration: [`eslint.config.js`](eslint.config.js:1)
  - Plugins: React, React Hooks, Security, Unused Imports
  - Custom rules for project standards

- **Prettier 3.6.2** - Code formatting
  - Configuration: [`prettier.config.cjs`](prettier.config.cjs:1)
  - Tailwind CSS plugin for class sorting
  - Consistent code style across team

- **TypeScript ESLint** - TypeScript-specific linting
  - Strict type checking
  - No implicit any
  - Unused variable detection

**Git Hooks:**

- **Husky 9.1.7** - Git hooks management
  - Pre-commit: Lint and format staged files
  - Pre-push: Run tests
  - Configuration: [`.husky/`](.husky/)

- **lint-staged 16.1.6** - Run linters on staged files
  - Automatic code formatting
  - Lint error prevention

**Editor Configuration:**

- [`.editorconfig`](.editorconfig:1) - Consistent editor settings
- [`.nvmrc`](.nvmrc:1) - Node.js version specification

### 5.9 Testing Framework

**Unit Testing:**

- **Vitest 3.2.4** - Fast unit test runner
  - Vite-native testing
  - Jest-compatible API
  - Coverage reporting with c8
  - Configuration: [`tests/setup.ts`](tests/setup.ts:1)

- **@testing-library/react 14.3.1** - React component testing
  - User-centric testing approach
  - Accessibility-focused queries
  - Integration with Vitest

- **@testing-library/user-event 14.6.1** - User interaction simulation

**E2E Testing:**

- **Playwright 1.55.1** - End-to-end testing
  - Cross-browser testing (Chromium, Firefox, WebKit)
  - Visual regression testing
  - Network interception
  - Parallel test execution

**Accessibility Testing:**

- **@axe-core/react 4.10.2** - Automated accessibility testing
- **jest-axe 10.0.0** - Accessibility assertions
- Custom accessibility test suite:
  [`tests/accessibility/`](tests/accessibility/)

**Mocking:**

- **MSW 2.11.2** - API mocking for tests
  - Service worker-based mocking
  - Request interception
  - Configuration: [`tests/mocks/handlers.ts`](tests/mocks/handlers.ts:1)

### 5.10 Build & Deployment

**Build Tools:**

- **Vite 7.1.8** - Production build optimization
  - Code splitting and lazy loading
  - Asset optimization
  - Tree shaking
  - Minification with Terser

- **Vite Plugin PWA 1.0.3** - Progressive Web App support
  - Service worker generation
  - Offline caching with Workbox
  - App manifest generation
  - Configuration:
    [`public/manifest.webmanifest`](public/manifest.webmanifest:1)

**Deployment Platforms:**

- **Netlify** - Primary deployment platform
  - Automatic deployments from Git
  - Preview deployments for PRs
  - Edge functions support
  - Scripts: `netlify:build`, `netlify:deploy`

- **Cloudflare Pages** - Alternative deployment
  - Global CDN distribution
  - Serverless functions
  - DDoS protection
  - Scripts: `cloudflare:build`, `cloudflare:deploy`

**CI/CD:**

- **GitHub Actions** - Automated workflows
  - Configuration: [`.github/workflows/`](.github/workflows/)
  - Automated testing on PR
  - Code quality checks
  - Deployment automation

**Performance Monitoring:**

- **Lighthouse CI** - Performance auditing
  - Configuration: [`.lighthouserc.json`](.lighthouserc.json:1)
  - Performance budgets
  - Accessibility audits
  - SEO checks

### 5.11 Additional Libraries

**Date & Time:**

- **date-fns 3.6.0** - Date manipulation and formatting
  - Lightweight alternative to Moment.js
  - Tree-shakeable functions
  - Immutable operations

**Data Processing:**

- **csv-parse 5.5.2** - CSV parsing for data import
- **immer 10.1.1** - Immutable state updates

**UI Enhancements:**

- **sonner 2.0.3** - Toast notifications
- **cmdk 1.1.1** - Command palette (⌘K)
- **embla-carousel-react 8.6.0** - Carousel component
- **react-resizable-panels 2.1.7** - Resizable panel layouts
- **vaul 1.1.2** - Drawer component

**OCR & Document Processing:**

- **tesseract.js 6.0.1** - Optical character recognition
- Service: [`services/ocrService.ts`](services/ocrService.ts:1)

**Theming:**

- **next-themes 0.4.6** - Theme management
  - Dark/light mode switching
  - System preference detection
  - Persistent theme storage

---

## 6. System Components

### 6.1 Core Application Components

**Root Application:**

- **[`App.tsx`](App.tsx:1)** - Main application component
  - **Purpose**: Root component orchestrating the entire application
  - **Responsibilities**:
    - Authentication state management
    - Global error boundary
    - Provider composition (Auth, Navigation, Toast)
    - Layout structure (Header, Sidebar, Main Content)
    - Keyboard shortcuts initialization
    - Theme management
  - **Key Features**:
    - Offline mode detection
    - Mobile sidebar toggle
    - Quick action handlers
    - Performance optimizations with React.memo
  - **Dependencies**: ErrorBoundary, SupabaseAuthProvider, NavigationProvider

**Navigation System:**

- **[`components/app/NavigationManager.tsx`](components/app/NavigationManager.tsx:1)** -
  Navigation state management
  - **Purpose**: Centralized navigation state and routing logic
  - **Responsibilities**:
    - Active module tracking
    - Sub-page navigation
    - Loading state management
    - Navigation history
  - **API**:
    - `useNavigation()` hook for accessing navigation state
    - `setActiveModule(module)` - Switch between modules
    - `setCurrentSubPage(path)` - Navigate to sub-pages
    - `navigateToProfile()`, `navigateToSettings()` - Special navigation

- **[`components/app/PageRenderer.tsx`](components/app/PageRenderer.tsx:1)** -
  Dynamic page rendering
  - **Purpose**: Render appropriate page based on navigation state
  - **Responsibilities**:
    - Module-based page selection
    - Lazy loading of page components
    - Error handling for missing pages
  - **Supported Modules**:
    - Dashboard (`genel`)
    - Members (`uye`)
    - Donations (`bagis`)
    - Beneficiaries (`yardim`)
    - Campaigns (`kampanya`)
    - Settings (`ayarlar`)

**Layout Components:**

- **[`components/Header.tsx`](components/Header.tsx:1)** - Top navigation bar
  - **Features**:
    - User profile menu
    - Notification center
    - Quick action buttons
    - Search functionality (⌘K)
    - Mobile menu toggle
  - **Props**: Navigation callbacks, current module, quick action handler

- **[`components/Sidebar.tsx`](components/Sidebar.tsx:1)** - Side navigation
  menu
  - **Features**:
    - Module navigation links
    - Sub-page navigation
    - Collapsible sections
    - Mobile responsive drawer
    - Active state indicators
  - **Props**: Active module, navigation callbacks, mobile state

- **[`components/MobileNavigation.tsx`](components/MobileNavigation.tsx:1)** -
  Mobile-optimized navigation
  - **Features**:
    - Bottom navigation bar
    - Touch-optimized interactions
    - Swipe gestures
    - Compact module icons

### 6.2 Feature Modules

**Authentication Module:**

- **[`components/auth/LoginPage.tsx`](components/auth/LoginPage.tsx:1)** - Login
  interface
  - Email/password authentication
  - Remember me functionality
  - Password reset link
  - Error handling and validation

- **[`components/auth/ProtectedRoute.tsx`](components/auth/ProtectedRoute.tsx:1)** -
  Route protection
  - Authentication requirement enforcement
  - Redirect to login for unauthenticated users
  - Loading state during auth check

- **[`components/auth/PermissionGuard.tsx`](components/auth/PermissionGuard.tsx:1)** -
  Permission-based access control
  - Role-based component rendering
  - Permission checking
  - Fallback UI for unauthorized access

- **[`components/auth/UnauthorizedPage.tsx`](components/auth/UnauthorizedPage.tsx:1)** -
  403 error page

**Beneficiary Module:**

- **[`components/beneficiary/BeneficiaryHeader.tsx`](components/beneficiary/BeneficiaryHeader.tsx:1)** -
  Beneficiary profile header
- **[`components/beneficiary/BeneficiaryFamily.tsx`](components/beneficiary/BeneficiaryFamily.tsx:1)** -
  Family information
- **[`components/beneficiary/BeneficiaryFinancial.tsx`](components/beneficiary/BeneficiaryFinancial.tsx:1)** -
  Financial details
- **[`components/beneficiary/BeneficiaryDocuments.tsx`](components/beneficiary/BeneficiaryDocuments.tsx:1)** -
  Document management
- **[`components/beneficiary/BeneficiaryAidHistory.tsx`](components/beneficiary/BeneficiaryAidHistory.tsx:1)** -
  Aid history tracking

**Analytics Module:**

- **[`components/analytics/AdvancedAnalyticsDashboard.tsx`](components/analytics/AdvancedAnalyticsDashboard.tsx:1)** -
  Analytics dashboard
  - Real-time statistics
  - Chart visualizations
  - Data export functionality
  - Customizable date ranges

**Automation Module:**

- **[`components/automation/SmartAutomationSystem.tsx`](components/automation/SmartAutomationSystem.tsx:1)** -
  Automation workflows
  - Automated task scheduling
  - Rule-based actions
  - Notification triggers

### 6.3 Shared Components

**Error Handling:**

- **[`components/ErrorBoundary.tsx`](components/ErrorBoundary.tsx:1)** - Error
  boundary wrapper
  - **Purpose**: Catch and handle React component errors
  - **Features**:
    - Error logging
    - Fallback UI
    - Error recovery
    - Development vs production error display

**UI Components:**

- **[`components/EmptyState.tsx`](components/EmptyState.tsx:1)** - Empty state
  displays
  - Customizable icon and message
  - Call-to-action buttons
  - Consistent empty state UX

- **[`components/AnimatedContainer.tsx`](components/AnimatedContainer.tsx:1)** -
  Animation wrapper
  - Fade-in animations
  - Slide transitions
  - Configurable animation timing

- **[`components/QuickStats.tsx`](components/QuickStats.tsx:1)** - Statistics
  cards
  - Metric display
  - Trend indicators
  - Loading skeletons

**Accessibility:**

- **[`components/accessibility/AccessibilityEnhancements.tsx`](components/accessibility/AccessibilityEnhancements.tsx:1)**
  - Keyboard navigation improvements
  - Screen reader announcements
  - Focus management
  - ARIA attributes

### 6.4 Context Providers

**Authentication Context:**

- **[`contexts/SupabaseAuthContext.tsx`](contexts/SupabaseAuthContext.tsx:1)** -
  Supabase authentication
  - **Purpose**: Manage Supabase authentication state
  - **Provides**:
    - `user` - Current authenticated user
    - `session` - Active session
    - `isLoading` - Authentication loading state
    - `signIn()`, `signOut()`, `signUp()` - Auth methods
  - **Usage**: `const { user, isLoading } = useSupabaseAuth()`

- **[`contexts/AuthContext.tsx`](contexts/AuthContext.tsx:1)** - Legacy auth
  context (deprecated)

**Notification Context:**

- **[`contexts/NotificationContext.tsx`](contexts/NotificationContext.tsx:1)** -
  Notification management
  - **Purpose**: Global notification system
  - **Provides**:
    - `notifications` - Active notifications
    - `addNotification()` - Create notification
    - `removeNotification()` - Dismiss notification
    - `clearAll()` - Clear all notifications
  - **Types**: Success, error, warning, info

**Sidebar Context:**

- **[`contexts/SidebarContext.tsx`](contexts/SidebarContext.tsx:1)** - Sidebar
  state
  - **Purpose**: Manage sidebar visibility and state
  - **Provides**:
    - `isOpen` - Sidebar open state
    - `toggle()` - Toggle sidebar
    - `open()`, `close()` - Explicit control

**Form Contexts:**

- **[`contexts/FormContexts.tsx`](contexts/FormContexts.tsx:1)** - Form state
  management
  - Multi-step form state
  - Form validation context
  - Shared form data

### 6.5 Service Layer

**Core Services:**

- **[`services/baseService.ts`](services/baseService.ts:1)** - Base service
  class
  - Common CRUD operations
  - Error handling
  - Request/response transformation

**Data Services:**

- **[`services/membersService.ts`](services/membersService.ts:1)** - Member
  management
  - CRUD operations for members
  - Member search and filtering
  - Role assignment

- **[`services/donationsService.ts`](services/donationsService.ts:1)** -
  Donation management
  - Donation recording
  - Receipt generation
  - Donation analytics

- **[`services/beneficiariesService.ts`](services/beneficiariesService.ts:1)** -
  Beneficiary management
  - Beneficiary registration
  - Needs assessment
  - Aid distribution tracking

- **[`services/aidRequestsService.ts`](services/aidRequestsService.ts:1)** - Aid
  request processing
  - Request submission
  - Approval workflow
  - Status tracking

- **[`services/kumbaraService.ts`](services/kumbaraService.ts:1)** - Savings box
  management
  - Kumbara (savings box) tracking
  - Collection management

**Utility Services:**

- **[`services/fileStorageService.ts`](services/fileStorageService.ts:1)** -
  File upload/download
  - Supabase Storage integration
  - Image optimization
  - File validation

- **[`services/exportService.ts`](services/exportService.ts:1)** - Data export
  - CSV export
  - PDF generation
  - Excel export

- **[`services/emailSMSService.ts`](services/emailSMSService.ts:1)** -
  Communication
  - Email sending
  - SMS notifications
  - Template management

- **[`services/ocrService.ts`](services/ocrService.ts:1)** - OCR processing
  - Document scanning
  - Text extraction
  - Data parsing

**Performance Services:**

- **[`services/cachingService.ts`](services/cachingService.ts:1)** - Caching
  layer
  - In-memory caching
  - Cache invalidation
  - TTL management

- **[`services/performanceMonitoringService.ts`](services/performanceMonitoringService.ts:1)** -
  Performance tracking
  - Metrics collection
  - Performance analysis
  - Bottleneck detection

- **[`services/backgroundSyncService.ts`](services/backgroundSyncService.ts:1)** -
  Offline sync
  - Queue management
  - Sync on reconnect
  - Conflict resolution

**Advanced Services:**

- **[`services/intelligentStatsService.ts`](services/intelligentStatsService.ts:1)** -
  Smart statistics
- **[`services/queryOptimizationService.ts`](services/queryOptimizationService.ts:1)** -
  Query optimization
- **[`services/indexManagementService.ts`](services/indexManagementService.ts:1)** -
  Database indexing
- **[`services/connectionPoolingService.ts`](services/connectionPoolingService.ts:1)** -
  Connection pooling
- **[`services/reportingService.ts`](services/reportingService.ts:1)** - Report
  generation
- **[`services/internationalizationService.ts`](services/internationalizationService.ts:1)** -
  i18n support

### 6.6 Custom Hooks

**Data Hooks:**

- **[`hooks/useMembers.ts`](hooks/useMembers.ts:1)** - Member data management
- **[`hooks/useDonations.ts`](hooks/useDonations.ts:1)** - Donation data
  management
- **[`hooks/useBeneficiaries.ts`](hooks/useBeneficiaries.ts:1)** - Beneficiary
  data management
- **[`hooks/useKumbara.ts`](hooks/useKumbara.ts:1)** - Kumbara data management
- **[`hooks/useSupabaseData.ts`](hooks/useSupabaseData.ts:1)** - Generic
  Supabase queries

**Form Hooks:**

- **[`hooks/useFormValidation.ts`](hooks/useFormValidation.ts:1)** - Form
  validation logic
- **[`hooks/useMobileForm.ts`](hooks/useMobileForm.ts:1)** - Mobile-optimized
  forms
- **[`hooks/useMobileFormOptimized.ts`](hooks/useMobileFormOptimized.ts:1)** -
  Enhanced mobile forms

**UI Hooks:**

- **[`hooks/use-toast.ts`](hooks/use-toast.ts:1)** - Toast notifications
- **[`hooks/use-sidebar.ts`](hooks/use-sidebar.ts:1)** - Sidebar state
- **[`hooks/use-form-field.ts`](hooks/use-form-field.ts:1)** - Form field
  utilities

**Performance Hooks:**

- **[`hooks/useDebounce.ts`](hooks/useDebounce.ts:1)** - Debounced values
- **[`hooks/useLazyLoading.tsx`](hooks/useLazyLoading.tsx:1)** - Lazy loading
- **[`hooks/useInfiniteScroll.ts`](hooks/useInfiniteScroll.ts:1)** - Infinite
  scroll pagination
- **[`hooks/usePerformanceMonitoring.ts`](hooks/usePerformanceMonitoring.ts:1)** -
  Performance metrics
- **[`hooks/usePerformanceOptimization.ts`](hooks/usePerformanceOptimization.ts:1)** -
  Performance optimization
- **[`hooks/usePerformanceEnhanced.ts`](hooks/usePerformanceEnhanced.ts:1)** -
  Enhanced performance

**Mobile Hooks:**

- **[`hooks/useAdvancedMobile.ts`](hooks/useAdvancedMobile.ts:1)** - Advanced
  mobile features
- **[`hooks/useMobilePerformance.ts`](hooks/useMobilePerformance.ts:1)** -
  Mobile performance
- **[`hooks/useSafeMobile.ts`](hooks/useSafeMobile.ts:1)** - Safe mobile
  operations
- **[`hooks/useTouchDevice.ts`](hooks/useTouchDevice.ts:1)** - Touch device
  detection

**Utility Hooks:**

- **[`hooks/useLocalStorage.ts`](hooks/useLocalStorage.ts:1)** - LocalStorage
  persistence
- **[`hooks/useSearch.ts`](hooks/useSearch.ts:1)** - Search functionality
- **[`hooks/usePagination.ts`](hooks/usePagination.ts:1)** - Pagination logic
- **[`hooks/useKeyboard.ts`](hooks/useKeyboard.ts:1)** - Keyboard shortcuts
- **[`hooks/useExport.ts`](hooks/useExport.ts:1)** - Data export
- **[`hooks/useDataExport.ts`](hooks/useDataExport.ts:1)** - Enhanced data
  export
- **[`hooks/useDataImport.ts`](hooks/useDataImport.ts:1)** - Data import

**Authentication Hooks:**

- **[`hooks/usePermissions.ts`](hooks/usePermissions.ts:1)** - Permission
  checking
- **[`hooks/useTokenRefresh.ts`](hooks/useTokenRefresh.ts:1)** - Token refresh
- **[`hooks/useUserManagement.ts`](hooks/useUserManagement.ts:1)** - User
  management

**Connection Hooks:**

- **[`hooks/useSupabaseConnection.ts`](hooks/useSupabaseConnection.ts:1)** -
  Supabase connection status
- **[`hooks/useBackgroundSync.ts`](hooks/useBackgroundSync.ts:1)** - Background
  sync
- **[`hooks/usePushNotifications.ts`](hooks/usePushNotifications.ts:1)** - Push
  notifications

### 6.7 State Management Stores

**Zustand Stores:**

- **[`stores/authStore.ts`](stores/authStore.ts:1)** - Authentication state
  - **State**: user, session, isAuthenticated, isLoading, error
  - **Actions**: login(), logout(), register(), resetPassword(), updateProfile()
  - **Helpers**: hasPermission(), hasRole(), hasAnyPermission()
  - **Middleware**: persist, devtools, immer, subscribeWithSelector

- **[`stores/notificationStore.ts`](stores/notificationStore.ts:1)** -
  Notification state
  - **State**: notifications array, unreadCount
  - **Actions**: addNotification(), removeNotification(), markAsRead(),
    clearAll()
  - **Features**: Auto-dismiss, priority levels, grouping

- **[`stores/uiStore.ts`](stores/uiStore.ts:1)** - UI state
  - **State**: theme, sidebarOpen, modalStates, loadingStates
  - **Actions**: setTheme(), toggleSidebar(), openModal(), closeModal()
  - **Persistence**: Theme and sidebar preferences

**Store Utilities:**

- **[`stores/safeInit.ts`](stores/safeInit.ts:1)** - Safe store initialization
  - Prevents hydration errors
  - SSR compatibility
  - Error recovery

### 6.8 Middleware

**Security Middleware:**

- **[`middleware/security.ts`](middleware/security.ts:1)** - Security headers
  - Content Security Policy (CSP)
  - X-Frame-Options
  - X-Content-Type-Options
  - Referrer-Policy
  - Permissions-Policy

- **[`middleware/csrf.ts`](middleware/csrf.ts:1)** - CSRF protection
  - Token generation
  - Token validation
  - Double-submit cookie pattern
  - SameSite cookie configuration

- **[`middleware/rateLimit.ts`](middleware/rateLimit.ts:1)** - Rate limiting
  - Request throttling
  - IP-based limiting
  - Endpoint-specific limits
  - Sliding window algorithm

**Security Layer:**

- **[`lib/security/SecurityMiddleware.ts`](lib/security/SecurityMiddleware.ts:1)** -
  Request/response security
- **[`lib/security/apiSecurityMiddleware.ts`](lib/security/apiSecurityMiddleware.ts:1)** -
  API security
- **[`lib/security/InputSanitizer.ts`](lib/security/InputSanitizer.ts:1)** -
  Input sanitization
- **[`lib/security/PermissionManager.ts`](lib/security/PermissionManager.ts:1)** -
  Permission management

### 6.9 Utilities

**Core Utilities:**

- **[`lib/utils.ts`](lib/utils.ts:1)** - General utilities
  - Class name merging
  - String formatting
  - Date formatting
  - Number formatting

- **[`lib/validation.ts`](lib/validation.ts:1)** - Validation utilities
  - Email validation
  - Phone validation
  - Turkish ID validation
  - Custom validators

- **[`lib/errorHandling.ts`](lib/errorHandling.ts:1)** - Error handling
  - Error logging
  - Error transformation
  - User-friendly error messages
  - Sentry integration ready

- **[`lib/performance.ts`](lib/performance.ts:1)** - Performance utilities
  - Performance measurement
  - Metrics collection
  - Optimization helpers

**Configuration:**

- **[`lib/config.ts`](lib/config.ts:1)** - Application configuration
- **[`lib/environment.ts`](lib/environment.ts:1)** - Environment management
- **[`services/config.ts`](services/config.ts:1)** - Service configuration

**Logging:**

- **[`lib/logging/logger.ts`](lib/logging/logger.ts:1)** - Logging system
  - Structured logging
  - Log levels (debug, info, warn, error)
  - Context-aware logging
  - Production log filtering

**Enhanced Notifications:**

- **[`lib/enhancedNotifications.tsx`](lib/enhancedNotifications.tsx:1)** -
  Advanced notification system
  - Rich notifications
  - Action buttons
  - Progress indicators
  - Notification queuing

---

## 7. API Reference

_This section will provide complete API documentation including endpoints,
request/response formats, and examples._

**Coming Soon**: API reference documentation.

---

## 8. Data Models

_This section will document the database schema, entity relationships, and data
structures._

**Coming Soon**: Data model documentation and ER diagrams.

---

## 9. Authentication & Authorization

_This section will explain the authentication flow, user roles, permissions, and
session management._

**Coming Soon**: Authentication and authorization documentation.

---

## 10. Security

_This section will detail all security measures, best practices, and security
architecture._

**Coming Soon**: Security documentation and guidelines.

---

## 11. Deployment

_This section will provide deployment instructions, configuration guides, and
operational procedures._

**Coming Soon**: Deployment documentation and guides.

---

## 12. Testing

_This section will document the testing strategy, test suites, and quality
assurance processes._

**Coming Soon**: Testing documentation and guidelines.

---

## 13. User Guides

_This section will provide end-user documentation for all major features and
workflows._

**Coming Soon**: User guides and tutorials.

---

## 14. Troubleshooting

_This section will help diagnose and resolve common issues and errors._

**Coming Soon**: Troubleshooting guides and solutions.

---

## 15. FAQ

_This section will answer frequently asked questions about the system._

**Coming Soon**: FAQ entries.

---

## 16. Glossary

_This section will define technical terms and acronyms used throughout the
documentation._

**Coming Soon**: Glossary of terms.

---

## 17. References

_This section will provide links to external documentation, resources, and
related materials._

**Coming Soon**: Reference links and resources.

---

## Appendices

### Appendix A: Configuration Files

Reference to key configuration files:

- [`tsconfig.json`](tsconfig.json) - TypeScript configuration
- [`vite.config.ts`](vite.config.ts) - Vite build configuration
- [`tailwind.config.ts`](tailwind.config.ts) - Tailwind CSS configuration
- [`eslint.config.js`](eslint.config.js) - ESLint configuration
- [`.editorconfig`](.editorconfig) - Editor configuration

### Appendix B: Project Structure

```
panel-5/
├── components/          # React components
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── middleware/         # Security middleware
├── services/           # Business logic services
├── stores/             # State management stores
├── styles/             # Global styles
├── supabase/           # Supabase configuration
├── tests/              # Test suites
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

### Appendix C: Environment Variables

See [`.env.example`](.env.example) for required environment variables and
configuration options.

---

**End of Document**

_This is a living document that will be continuously updated as the project
evolves. For the latest version, please refer to the project repository._
