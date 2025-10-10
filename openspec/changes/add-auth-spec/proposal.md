# Change Proposal: Add Authentication & Authorization Specification

## Why

Authentication & Authorization sistemi **güvenliğin temeli** olup kritik bir capability. Şu anda mevcut ve çalışıyor ancak dokümante edilmemiş durumda:

- Tüm sistem erişimini kontrol eder
- Role-based access control (RBAC) ile granular permissions sağlar
- Appwrite Auth entegrasyonu kullanır
- Session management ve token refresh içerir
- 4 farklı rol (Admin, Manager, Operator, Viewer) ve 30+ permission tanımlı

**İhtiyaç**:
- Güvenlik requirement'larını netleştirmek
- Role-permission matrix'i dokümante etmek
- Session management kurallarını belirlemek
- Password policy'sini tanımlamak
- Security best practices'i dokümante etmek

## What Changes

Bu change **mevcut auth sistemini dokümante ediyor** (implementation değişikliği içermiyor):

### Dokümante Edilecek Özellikler

1. **User Authentication**
   - Email/password login
   - Session management
   - Token refresh
   - Remember me functionality
   - Auto logout on session expiry

2. **User Registration**
   - New user signup
   - Email verification (Appwrite)
   - Initial role assignment
   - Welcome email

3. **Password Management**
   - Password reset flow
   - Password strength requirements
   - Password change
   - Password recovery

4. **Session Management**
   - Session creation
   - Session refresh (10 min before expiry)
   - Session expiration (1 hour default)
   - Concurrent session handling
   - Logout (local and server-side)

5. **Role-Based Access Control (RBAC)**
   - 4 roles: Admin, Manager, Operator, Viewer
   - 30+ granular permissions
   - Role-permission mapping
   - Role hierarchy

6. **Permission Checking**
   - hasPermission() - single permission
   - hasAnyPermission() - OR logic
   - hasAllPermissions() - AND logic
   - hasRole() - role check

7. **Protected Routes**
   - Route-level protection
   - Component-level protection
   - Automatic redirect to login
   - Remember intended destination

8. **Security Features**
   - Login attempt throttling (max 5 attempts)
   - Account lockout (15 min after 5 failed attempts)
   - CSRF protection
   - XSS protection
   - Rate limiting

9. **Audit Trail**
   - Login/logout events
   - Failed login attempts
   - Permission checks
   - Session activities

### Kapsam Dışı
- Two-factor authentication (2FA) - Future capability
- OAuth providers (Google, GitHub) - Future capability
- LDAP/Active Directory - Future capability
- Magic link authentication - Future (Appwrite supports)

## Impact

### Affected Specs
- **NEW**: `authentication-authorization` - Yeni spec oluşturulacak

### Affected Code
**Components** (4 files):
- `components/auth/LoginPage.tsx` - Login UI
- `components/auth/ProtectedRoute.tsx` - Route protection
- `components/auth/UnauthorizedPage.tsx` - 403 page
- `components/auth/RegisterPage.tsx` - Registration UI

**Stores**:
- `stores/authStore.ts` - Auth state management (651 lines)

**Services**:
- `services/userManagementService.ts` - User CRUD
- `services/rolesService.ts` - Role/permission management (518 lines)

**Types**:
- `types/auth.ts` - Auth types
- `types/user.ts` - User types

**Hooks**:
- `hooks/usePermission.ts` - Permission checking (121 lines)

**Database**:
- Appwrite Auth (built-in)
- Tables: `user_profiles`, `roles`, `permissions`, `user_permissions`
- RLS policies for role-based access

### Breaking Changes
**NONE** - Documentation only.

### Security Impact
**POSITIVE** - Security requirements and best practices documented.

## Success Criteria

✅ Spec passes `openspec validate --strict`
✅ All 4 roles documented with permission matrix
✅ All 30+ permissions listed and explained
✅ Session lifecycle fully documented
✅ Password policy clearly defined
✅ Security features documented
✅ Audit trail requirements specified
✅ Error scenarios covered

## Timeline

**Tahmini Süre**: 2 gün

- Day 1: Core auth requirements (login, logout, session)
- Day 2: RBAC, permissions, security features, validation

## References

- Supabase Auth Docs: https://supabase.com/docs/guides/auth
- Current implementation: `stores/authStore.ts`, `services/rolesService.ts`
- Type definitions: `types/auth.ts`, `types/user.ts`
- Related specs: `beneficiary-management` (uses RBAC from this spec)

