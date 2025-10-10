# Authentication & Authorization Specification

## ADDED Requirements

### Requirement: User Login
The system SHALL authenticate users using email and password via Supabase Auth.

**Authentication Method**: Supabase Auth (signInWithPassword)
**Session Duration**: 1 hour (3600 seconds) default, extended with remember me
**Rate Limiting**: Maximum 5 login attempts per 15 minutes
**Audit**: All login attempts SHALL be logged

#### Scenario: Successful login with valid credentials
- **WHEN** User submits email "user@example.com" and correct password
- **THEN** Supabase Auth validates credentials
- **AND** System creates session with 1-hour expiration
- **AND** System retrieves user role and permissions from user_metadata
- **AND** System stores session in authStore
- **AND** System redirects to dashboard
- **AND** System logs successful login (user ID, IP, timestamp, device)

#### Scenario: Login with invalid credentials
- **WHEN** User submits email "user@example.com" and incorrect password
- **THEN** Supabase Auth returns "Invalid credentials" error
- **AND** System displays "Email veya şifre hatalı"
- **AND** System increments failed login attempt counter
- **AND** System logs failed attempt (email, IP, timestamp)
- **AND** System does NOT create session

#### Scenario: Login with non-existent account
- **WHEN** User submits email "nonexistent@example.com"
- **THEN** Supabase Auth returns error
- **AND** System displays generic error "Email veya şifre hatalı" (security: no user enumeration)
- **AND** System logs failed attempt

#### Scenario: Login with remember me enabled
- **WHEN** User checks "Beni Hatırla" and logs in successfully
- **THEN** System creates session with extended expiration (30 days)
- **AND** System stores session in persistent storage
- **AND** User remains logged in after browser close

#### Scenario: Account lockout after failed attempts
- **WHEN** User fails login 5 times within 15 minutes
- **THEN** System locks account for 15 minutes
- **AND** System displays "Çok fazla başarısız deneme. 15 dakika sonra tekrar deneyin."
- **AND** System shows countdown timer
- **AND** System logs lockout event
- **WHEN** 15 minutes pass
- **THEN** System automatically unlocks account

---

### Requirement: User Logout
The system SHALL provide secure logout that invalidates sessions.

**Scope**: Client and server-side
**Options**: Single session or all sessions
**Audit**: Logout events SHALL be logged

#### Scenario: Standard logout
- **WHEN** User clicks logout button
- **THEN** System calls supabase.auth.signOut()
- **AND** System invalidates server-side session
- **AND** System clears local session storage
- **AND** System clears authStore state
- **AND** System redirects to login page
- **AND** System logs logout event

#### Scenario: Logout all sessions
- **WHEN** Admin clicks "Logout all devices"
- **THEN** System invalidates ALL sessions for user (all devices)
- **AND** User is logged out from all browsers/devices
- **AND** System requires fresh login on all devices
- **AND** System logs "logout all sessions" event

#### Scenario: Auto-logout on session expiry
- **WHEN** User session expires (1 hour passes without activity)
- **THEN** System automatically logs out user
- **AND** System clears local state
- **AND** System redirects to login page with message "Oturumunuz sona erdi, lütfen tekrar giriş yapın"
- **AND** System remembers intended page for redirect after re-login

---

### Requirement: User Registration
The system SHALL allow new user registration with email verification.

**Email Verification**: Required via Supabase Auth
**Default Role**: Viewer (lowest privilege)
**Approval**: Admin approval required for elevated roles
**Security**: Email confirmation link valid for 24 hours

#### Scenario: New user registration
- **WHEN** User submits registration form with email, password, name
- **THEN** System validates email format and password strength
- **AND** System calls supabase.auth.signUp()
- **AND** Supabase sends verification email
- **AND** System displays "Kayıt başarılı! Lütfen email'inizi kontrol edin."
- **AND** System does NOT log user in (email verification required)

#### Scenario: Email verification
- **WHEN** User clicks verification link in email
- **THEN** Supabase confirms email address
- **AND** System activates user account
- **AND** System assigns default role "Viewer"
- **AND** System sends welcome notification
- **AND** User can now log in

#### Scenario: Registration with existing email
- **WHEN** User attempts to register with email already in system
- **THEN** System returns error "Bu email adresi zaten kayıtlı"
- **AND** System does NOT create duplicate account
- **AND** System suggests password reset if user forgot password

#### Scenario: Registration with weak password
- **WHEN** User submits password "123456"
- **THEN** System validates password strength
- **AND** System returns error "Şifre çok zayıf. En az 8 karakter, büyük/küçük harf ve rakam içermeli"
- **AND** System does NOT create account

---

### Requirement: Password Reset
The system SHALL provide secure password reset via email.

**Method**: Email-based reset link
**Token Validity**: 1 hour
**Rate Limiting**: Maximum 3 reset requests per hour per email
**Security**: Reset link single-use only

#### Scenario: Request password reset
- **WHEN** User clicks "Şifremi Unuttum" and enters email
- **THEN** System calls supabase.auth.resetPasswordForEmail()
- **AND** Supabase sends password reset email
- **AND** System displays "Şifre sıfırlama linki email'inize gönderildi"
- **AND** System does NOT disclose whether email exists (security)

#### Scenario: Complete password reset
- **WHEN** User clicks reset link in email
- **THEN** System validates reset token
- **AND** System displays password reset form
- **WHEN** User enters new password and confirms
- **THEN** System validates password strength
- **AND** System updates password in Supabase
- **AND** System invalidates reset token (single-use)
- **AND** System invalidates all existing sessions
- **AND** System displays "Şifreniz başarıyla güncellendi"
- **AND** System redirects to login page

#### Scenario: Expired reset token
- **WHEN** User clicks reset link after 1 hour
- **THEN** System validates token and detects expiration
- **AND** System displays "Bu link süresi dolmuş. Lütfen yeni şifre sıfırlama isteği gönderin."
- **AND** System provides link to request new reset

#### Scenario: Rate limiting on reset requests
- **WHEN** User requests password reset 4 times in 1 hour
- **THEN** System blocks 4th request
- **AND** System displays "Çok fazla şifre sıfırlama isteği. 1 saat sonra tekrar deneyin."
- **AND** System logs rate limit violation

---

### Requirement: Session Management
The system SHALL manage user sessions with automatic refresh and expiration.

**Session Duration**: 3600 seconds (1 hour)
**Refresh Threshold**: 10 minutes before expiry
**Remember Me**: Extends to 30 days
**Storage**: Secure HTTP-only cookies (Supabase default)

#### Scenario: Session creation on login
- **WHEN** User successfully logs in
- **THEN** Supabase creates session with access_token and refresh_token
- **AND** System stores session in authStore
- **AND** System sets session expiration to now + 3600 seconds
- **AND** Session is stored in secure cookie

#### Scenario: Automatic session refresh
- **WHEN** User session is 10 minutes from expiry
- **AND** User is actively using the application
- **THEN** System automatically calls supabase.auth.refreshSession()
- **AND** Supabase issues new access_token
- **AND** System updates session in authStore
- **AND** System extends expiration time
- **AND** User continues working without interruption

#### Scenario: Session expiry without activity
- **WHEN** User is inactive and session expires
- **THEN** System detects expired session
- **AND** System auto-logs out user
- **AND** System clears session from storage
- **AND** System redirects to login with message "Oturumunuz sona erdi"
- **AND** System saves intended URL for post-login redirect

#### Scenario: Concurrent session handling
- **WHEN** User logs in from two different browsers
- **THEN** System allows both sessions (concurrent sessions enabled)
- **AND** Each session has independent expiration
- **WHEN** User logs out from one browser
- **THEN** Only that session is invalidated
- **AND** Other session remains active

---

### Requirement: Role-Based Access Control (RBAC)
The system SHALL enforce role-based permissions using four hierarchical roles.

**Roles**: Admin > Manager > Operator > Viewer
**Permission Model**: Whitelist (explicit grant)
**Enforcement**: Client-side UI + Server-side RLS policies
**Audit**: All permission checks SHALL be logged in debug mode

#### Scenario: Admin role full access
- **WHEN** User with role "Admin" accesses any feature
- **THEN** System grants access to ALL features and data
- **AND** Admin can perform all CRUD operations
- **AND** Admin can manage users and roles
- **AND** Admin can access audit logs
- **AND** Admin can export all data

#### Scenario: Manager role limited access
- **WHEN** User with role "Manager" attempts to delete beneficiary
- **THEN** System checks permission DELETE_BENEFICIARY
- **AND** System finds Manager does NOT have DELETE permission
- **AND** System denies access (403 Forbidden)
- **AND** System displays "Bu işlem için yetkiniz bulunmamaktadır"
- **WHEN** Manager attempts to update beneficiary
- **THEN** System checks permission EDIT_BENEFICIARY
- **AND** Manager HAS edit permission
- **AND** System allows update operation

#### Scenario: Operator view-only for sensitive data
- **WHEN** Operator views beneficiary details
- **THEN** System displays basic information (name, needs, status)
- **AND** System masks financial data (income, IBAN)
- **AND** System masks identity number
- **AND** Operator can create and view but NOT edit or delete

#### Scenario: Viewer read-only access
- **WHEN** Viewer accesses donation list
- **THEN** System displays list in read-only mode
- **AND** System hides all action buttons (create, edit, delete)
- **AND** System prevents form submissions
- **WHEN** Viewer attempts to access create donation page directly (URL)
- **THEN** System redirects to unauthorized page (403)

#### Scenario: Role hierarchy enforcement
- **WHEN** System assigns permissions
- **THEN** Admin inherits ALL permissions (no exceptions)
- **AND** Manager inherits Operator permissions + additional permissions
- **AND** Operator inherits Viewer permissions + create permissions
- **AND** Viewer has baseline read-only permissions

---

### Requirement: Permission System
The system SHALL provide granular permission checking with 30+ distinct permissions.

**Categories**: Dashboard, Donations, Members, Aid, Finance, Events, Users, Settings, Reports
**Operations**: VIEW, CREATE, EDIT, DELETE, APPROVE, MANAGE, EXPORT
**Checking Methods**: hasPermission(), hasAnyPermission(), hasAllPermissions()

#### Scenario: Single permission check
- **WHEN** Code calls hasPermission(Permission.CREATE_DONATION)
- **THEN** System checks if user's role includes CREATE_DONATION permission
- **AND** Returns true if permission exists
- **AND** Returns false if permission missing

#### Scenario: OR logic permission check
- **WHEN** Code calls hasAnyPermission([VIEW_DONATIONS, VIEW_FINANCE])
- **THEN** System checks if user has AT LEAST ONE of the permissions
- **AND** Returns true if user has VIEW_DONATIONS OR VIEW_FINANCE
- **AND** Returns false if user has neither

#### Scenario: AND logic permission check
- **WHEN** Code calls hasAllPermissions([CREATE_AID, APPROVE_AID])
- **THEN** System checks if user has ALL specified permissions
- **AND** Returns true only if user has BOTH permissions
- **AND** Returns false if user missing any permission

#### Scenario: Permission matrix lookup
Given permission matrix:
```
Permission             | Admin | Manager | Operator | Viewer
----------------------|-------|---------|----------|--------
VIEW_DASHBOARD        |   ✓   |    ✓    |    ✓     |   ✓
CREATE_DONATION       |   ✓   |    ✓    |    ✓     |   ✗
EDIT_DONATION         |   ✓   |    ✓    |    ✗     |   ✗
DELETE_DONATION       |   ✓   |    ✗    |    ✗     |   ✗
APPROVE_AID           |   ✓   |    ✓    |    ✗     |   ✗
MANAGE_FINANCIAL      |   ✓   |    ✓    |    ✗     |   ✗
EDIT_SETTINGS         |   ✓   |    ✗    |    ✗     |   ✗
```

- **WHEN** Manager checks hasPermission(CREATE_DONATION)
- **THEN** Returns true (Manager has permission)
- **WHEN** Manager checks hasPermission(DELETE_DONATION)
- **THEN** Returns false (Manager lacks permission)

---

### Requirement: Protected Routes
The system SHALL protect routes based on authentication status and required permissions.

**Mechanism**: ProtectedRoute component wrapper
**Redirect**: Unauthenticated users → login page
**Unauthorized**: Insufficient permissions → 403 page
**Remember**: Intended destination for post-login redirect

#### Scenario: Access protected route while unauthenticated
- **WHEN** Unauthenticated user navigates to "/bagislar" (donations page)
- **THEN** ProtectedRoute checks authentication status
- **AND** User is NOT authenticated
- **AND** System saves intended URL "/bagislar"
- **AND** System redirects to "/login"
- **WHEN** User successfully logs in
- **THEN** System redirects to saved URL "/bagislar"

#### Scenario: Access route with insufficient permissions
- **WHEN** Viewer user navigates to "/yonetim/kullanicilar" (user management)
- **THEN** ProtectedRoute checks required permission VIEW_USERS
- **AND** Viewer does NOT have VIEW_USERS permission
- **AND** System redirects to "/yetkisiz" (unauthorized page)
- **AND** System displays "Bu sayfayı görüntüleme yetkiniz bulunmamaktadır"
- **AND** System logs unauthorized access attempt

#### Scenario: Access route with required permissions
- **WHEN** Manager navigates to "/bagislar/yeni" (create donation)
- **THEN** ProtectedRoute checks authentication (✓ authenticated)
- **AND** ProtectedRoute checks permission CREATE_DONATION (✓ Manager has it)
- **AND** System allows access to route
- **AND** Page renders normally

#### Scenario: Session expired during navigation
- **WHEN** User session expires while user is on protected page
- **AND** User attempts to navigate or perform action
- **THEN** System detects expired session
- **AND** System logs out user
- **AND** System redirects to login with message "Oturumunuz sona erdi"

---

### Requirement: Role Definitions
The system SHALL define four hierarchical roles with distinct permission sets.

**Roles**: admin, manager, operator, viewer
**Hierarchy**: admin > manager > operator > viewer
**Storage**: role stored in Supabase user.app_metadata.role or user_metadata.role
**Default**: New users assigned "viewer" role

#### Scenario: Admin role capabilities
- **WHEN** User has role "admin"
- **THEN** User has ALL 30+ permissions
- **AND** User can access ALL pages
- **AND** User can perform ALL operations (CRUD)
- **AND** User can manage other users
- **AND** User can assign/change roles
- **AND** User can view audit logs

#### Scenario: Manager role capabilities
- **WHEN** User has role "manager"
- **THEN** User has permissions:
  - VIEW_DASHBOARD, VIEW_DONATIONS, CREATE_DONATION, EDIT_DONATION
  - VIEW_MEMBERS, CREATE_MEMBER, EDIT_MEMBER
  - VIEW_AID, CREATE_AID, EDIT_AID, APPROVE_AID
  - VIEW_FINANCE, CREATE_FINANCE, EDIT_FINANCE, MANAGE_FINANCIAL
  - VIEW_MESSAGES, SEND_MESSAGES
  - VIEW_EVENTS, CREATE_EVENT, EDIT_EVENT
  - VIEW_REPORTS, EXPORT_REPORTS
- **AND** User CANNOT delete records (no DELETE permissions)
- **AND** User CANNOT manage users (no user management permissions)
- **AND** User CANNOT change system settings

#### Scenario: Operator role capabilities
- **WHEN** User has role "operator"
- **THEN** User has permissions:
  - VIEW_DASHBOARD
  - VIEW_DONATIONS, CREATE_DONATION
  - VIEW_MEMBERS, CREATE_MEMBER
  - VIEW_AID, CREATE_AID
  - VIEW_FINANCE, VIEW_MESSAGES, SEND_MESSAGES
  - VIEW_EVENTS, VIEW_REPORTS
- **AND** User can VIEW and CREATE only
- **AND** User CANNOT edit or delete
- **AND** User CANNOT approve aid applications
- **AND** User CANNOT manage financial data

#### Scenario: Viewer role capabilities
- **WHEN** User has role "viewer"
- **THEN** User has read-only permissions:
  - VIEW_DASHBOARD, VIEW_DONATIONS, VIEW_MEMBERS
  - VIEW_AID, VIEW_FINANCE, VIEW_MESSAGES
  - VIEW_EVENTS, VIEW_REPORTS
- **AND** User CANNOT create, edit, or delete anything
- **AND** User CANNOT send messages
- **AND** User CANNOT export reports
- **AND** All forms and action buttons are hidden

---

### Requirement: Permission Checking Helpers
The system SHALL provide utility functions for checking user permissions.

**Functions**: hasPermission(), hasAnyPermission(), hasAllPermissions(), hasRole()
**Performance**: Permission checks SHALL complete in < 1ms
**Caching**: Permission list cached in authStore

#### Scenario: Check single permission
```typescript
const canCreateDonation = hasPermission(Permission.CREATE_DONATION);
```
- **WHEN** Manager calls hasPermission(CREATE_DONATION)
- **THEN** System looks up Manager permissions in ROLE_PERMISSIONS
- **AND** Returns true (Manager has CREATE_DONATION)

#### Scenario: Check any of multiple permissions (OR)
```typescript
const canViewFinancial = hasAnyPermission([
  Permission.VIEW_FINANCE,
  Permission.MANAGE_FINANCIAL
]);
```
- **WHEN** Operator calls hasAnyPermission([VIEW_FINANCE, MANAGE_FINANCIAL])
- **THEN** System checks if user has AT LEAST ONE permission
- **AND** Returns true (Operator has VIEW_FINANCE)

#### Scenario: Check all permissions required (AND)
```typescript
const canFullyManageAid = hasAllPermissions([
  Permission.CREATE_AID,
  Permission.EDIT_AID,
  Permission.APPROVE_AID
]);
```
- **WHEN** Manager calls hasAllPermissions([CREATE_AID, EDIT_AID, APPROVE_AID])
- **THEN** System checks if user has ALL three permissions
- **AND** Returns true (Manager has all three)
- **WHEN** Operator calls same function
- **THEN** Returns false (Operator lacks EDIT_AID and APPROVE_AID)

#### Scenario: Check user role
```typescript
const isAdmin = hasRole(UserRole.ADMIN);
```
- **WHEN** Any user calls hasRole(ADMIN)
- **THEN** System compares user.role with ADMIN
- **AND** Returns true only if exact match

---

### Requirement: Password Policy
The system SHALL enforce password strength requirements.

**Minimum Length**: 8 characters
**Complexity**: Must contain uppercase, lowercase, and number
**Common Passwords**: Block common/weak passwords
**Validation**: Real-time strength indicator
**Storage**: Hashed with bcrypt (Supabase default)

#### Scenario: Strong password accepted
- **WHEN** User sets password "MyP@ssw0rd123"
- **THEN** System validates:
  - Length ≥ 8 ✓
  - Contains uppercase ✓
  - Contains lowercase ✓
  - Contains number ✓
- **AND** System accepts password
- **AND** System displays strength indicator "Güçlü"

#### Scenario: Weak password rejected
- **WHEN** User sets password "password"
- **THEN** System validates:
  - Length ≥ 8 ✓
  - Contains uppercase ✗
  - Contains number ✗
- **AND** System rejects password
- **AND** System displays error "Şifre büyük harf ve rakam içermelidir"
- **AND** System shows strength indicator "Zayıf"

#### Scenario: Common password blocked
- **WHEN** User sets password "12345678"
- **THEN** System checks against common password list
- **AND** System rejects password
- **AND** System displays "Bu şifre çok yaygın kullanılıyor, daha güvenli bir şifre seçin"

#### Scenario: Too short password
- **WHEN** User sets password "Abc123"
- **THEN** System validates length
- **AND** System rejects (only 6 characters)
- **AND** System displays "Şifre en az 8 karakter olmalıdır"

---

### Requirement: Account Security
The system SHALL protect accounts from unauthorized access.

**Login Throttling**: Max 5 attempts per 15 minutes
**Lockout Duration**: 15 minutes
**IP Tracking**: Log IP addresses for security monitoring
**Device Tracking**: Track login devices

#### Scenario: Login attempt tracking
- **WHEN** User fails login attempt
- **THEN** System increments failed_attempts counter for email
- **AND** System records IP address and timestamp
- **AND** System displays "Kalan deneme hakkı: 4"

#### Scenario: Account lockout
- **WHEN** User reaches 5 failed attempts within 15 minutes
- **THEN** System locks account temporarily
- **AND** System records lockout event with IP
- **AND** System displays "Hesabınız 15 dakika süreyle kilitlendi"
- **AND** System shows countdown timer
- **AND** All login attempts during lockout return same error

#### Scenario: Automatic lockout release
- **WHEN** 15 minutes pass since lockout
- **THEN** System automatically releases lock
- **AND** System resets failed_attempts to 0
- **AND** User can attempt login again
- **AND** System logs lockout release

#### Scenario: Successful login resets counter
- **WHEN** User logs in successfully after 2 failed attempts
- **THEN** System resets failed_attempts to 0
- **AND** System clears lockout timer

---

### Requirement: User Profile Management
The system SHALL allow users to view and update their own profile.

**Editable Fields**: name, avatar
**Read-Only Fields**: email, role, permissions, created_at
**Restrictions**: Users cannot change own role or permissions
**Audit**: Profile updates SHALL be logged

#### Scenario: View own profile
- **WHEN** User navigates to "/profil"
- **THEN** System displays user information:
  - Email (read-only)
  - Name (editable)
  - Role (read-only, display as badge)
  - Avatar (editable)
  - Last login timestamp
  - Account creation date
  - Active sessions count

#### Scenario: Update profile name
- **WHEN** User changes name from "Ali Yılmaz" to "Ali Yılmaz Özkan"
- **AND** User saves profile
- **THEN** System validates name (not empty, max 100 chars)
- **AND** System updates user_metadata.name in Supabase
- **AND** System updates local authStore
- **AND** System displays "Profil güncellendi"
- **AND** System logs profile update

#### Scenario: Attempt to change own role
- **WHEN** User manipulates DOM to change role field
- **AND** User submits form
- **THEN** System ignores role field (not in allowed update fields)
- **AND** System does NOT update role
- **AND** System logs suspicious activity

---

### Requirement: Admin User Management
The system SHALL allow Admins to manage all users.

**Roles**: Admin only
**Permissions**: CREATE_USER, EDIT_USER, DELETE_USER, VIEW_USERS
**Operations**: Create, read, update, suspend, delete users
**Restriction**: Cannot delete last Admin user

#### Scenario: Admin creates new user
- **WHEN** Admin creates user with email, password, name, role="operator"
- **THEN** System validates email is unique
- **AND** System validates password strength
- **AND** System creates user via Supabase Auth
- **AND** System assigns specified role "operator"
- **AND** System sends verification email
- **AND** System logs user creation (creator_id, new_user_id, role)

#### Scenario: Admin changes user role
- **WHEN** Admin changes user role from "operator" to "manager"
- **THEN** System updates user_metadata.role or app_metadata.role
- **AND** System invalidates user's active sessions (force re-login)
- **AND** User gets new permissions on next login
- **AND** System logs role change (admin_id, user_id, old_role, new_role)

#### Scenario: Admin suspends user
- **WHEN** Admin suspends user account
- **THEN** System sets user is_active to false
- **AND** System invalidates all user sessions
- **AND** User is immediately logged out from all devices
- **AND** User cannot log in (error: "Hesabınız askıya alınmış")
- **AND** System logs suspension (admin_id, user_id, reason)

#### Scenario: Cannot delete last admin
- **WHEN** Admin attempts to delete user
- **AND** User is the LAST remaining Admin
- **THEN** System prevents deletion
- **AND** System displays "Son admin kullanıcısı silinemez. Önce başka bir kullanıcıyı admin yapın."
- **AND** System does NOT delete user

#### Scenario: Admin lists all users
- **WHEN** Admin navigates to user management page
- **THEN** System displays list of all users with:
  - Name, email, role (badge)
  - Status (active/suspended)
  - Last login
  - Actions (edit, suspend, delete)
- **AND** System supports filtering by role
- **AND** System supports search by name/email
- **AND** System implements pagination

---

### Requirement: Audit Trail for Auth Events
The system SHALL log all authentication and authorization events.

**Events**: Login, logout, failed attempts, role changes, permission denials
**Data Logged**: user_id, event_type, timestamp, IP address, user_agent
**Retention**: Audit logs retained for 1 year
**Access**: Admin only

#### Scenario: Log successful login
- **WHEN** User logs in successfully
- **THEN** System creates audit log entry:
  ```json
  {
    "event_type": "login_success",
    "user_id": "uuid",
    "email": "user@example.com",
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0...",
    "timestamp": "2024-10-10T10:00:00Z",
    "metadata": {
      "remember_me": true,
      "session_id": "session_uuid"
    }
  }
  ```

#### Scenario: Log failed login attempt
- **WHEN** User fails login
- **THEN** System logs:
  ```json
  {
    "event_type": "login_failed",
    "email": "user@example.com",
    "ip_address": "192.168.1.1",
    "timestamp": "2024-10-10T10:00:00Z",
    "error_reason": "invalid_credentials",
    "attempt_number": 3
  }
  ```

#### Scenario: Log permission denial
- **WHEN** User attempts action without permission
- **THEN** System logs:
  ```json
  {
    "event_type": "permission_denied",
    "user_id": "uuid",
    "required_permission": "DELETE_BENEFICIARY",
    "user_role": "manager",
    "resource_type": "beneficiary",
    "resource_id": "beneficiary_uuid",
    "timestamp": "2024-10-10T10:00:00Z"
  }
  ```

#### Scenario: Admin views audit logs
- **WHEN** Admin accesses audit log page
- **THEN** System displays filterable list of auth events
- **AND** Admin can filter by:
  - Event type (login, logout, failed_login, permission_denied)
  - User
  - Date range
  - IP address
- **AND** Admin can export audit logs to CSV
- **AND** System logs audit log access (meta-audit)

---

### Requirement: Error Handling and Messages
The system SHALL provide clear, localized error messages for auth failures.

**Language**: Turkish
**Security**: Generic errors for sensitive operations (no user enumeration)
**Format**: Consistent error structure
**User-Friendly**: Non-technical language

#### Scenario: Invalid credentials error
- **WHEN** Login fails due to wrong password
- **THEN** System displays "Email veya şifre hatalı" (generic, no specifics)
- **AND** System does NOT reveal which field was wrong
- **AND** System does NOT reveal if email exists

#### Scenario: Account locked error
- **WHEN** User attempts login on locked account
- **THEN** System displays "Çok fazla başarısız deneme. Hesabınız 15 dakika süreyle kilitlendi."
- **AND** System shows countdown "Kalan süre: 14:32"

#### Scenario: Email not verified error
- **WHEN** User with unverified email attempts login
- **THEN** System displays "Email adresiniz henüz doğrulanmamış. Lütfen gelen kutunuzu kontrol edin."
- **AND** System provides "Doğrulama emailini tekrar gönder" button

#### Scenario: Insufficient permissions error
- **WHEN** User attempts unauthorized action
- **THEN** System displays "Bu işlem için yetkiniz bulunmamaktadır"
- **AND** System shows required permission or role
- **AND** System suggests contacting administrator

#### Scenario: Session expired error
- **WHEN** User's session expires during operation
- **THEN** System displays "Oturumunuz sona erdi. Lütfen tekrar giriş yapın."
- **AND** System provides "Giriş Yap" button
- **AND** System remembers current page for redirect

---

### Requirement: Security Best Practices
The system SHALL implement OWASP Top 10 security controls.

**HTTPS Only**: All auth operations over HTTPS
**Secure Cookies**: HTTP-only, Secure, SameSite flags
**CSRF Protection**: Token-based CSRF protection
**XSS Prevention**: Input sanitization and output encoding
**Rate Limiting**: Protect against brute force

#### Scenario: HTTPS enforcement
- **WHEN** User attempts to access login page over HTTP
- **THEN** System redirects to HTTPS version
- **AND** System enforces HTTPS for all auth operations

#### Scenario: Secure cookie configuration
- **WHEN** System creates session
- **THEN** Supabase sets cookies with flags:
  - HttpOnly: true (prevent JavaScript access)
  - Secure: true (HTTPS only)
  - SameSite: Lax (CSRF protection)

#### Scenario: CSRF token validation
- **WHEN** User submits login form
- **THEN** System validates CSRF token
- **AND** System rejects request if token missing or invalid
- **AND** System displays "Güvenlik hatası. Lütfen sayfayı yenileyin."

#### Scenario: XSS prevention in user input
- **WHEN** User enters name with script tag "<script>alert('xss')</script>"
- **THEN** System sanitizes input before storage
- **AND** System stores escaped version
- **AND** System displays safely on UI

---

### Requirement: Session Persistence
The system SHALL maintain sessions across page refreshes and browser restarts.

**Storage**: Supabase handles session storage
**Remember Me**: Optional 30-day session extension
**Refresh**: Automatic token refresh
**Expiration**: Graceful expiry handling

#### Scenario: Session persists across page refresh
- **WHEN** User is logged in and refreshes page
- **THEN** System calls supabase.auth.getSession()
- **AND** Supabase returns active session
- **AND** System restores user state in authStore
- **AND** User remains logged in

#### Scenario: Session persists across browser restart with remember me
- **WHEN** User logs in with "Beni Hatırla" checked
- **AND** User closes browser
- **AND** User reopens browser 1 day later
- **THEN** System retrieves persistent session
- **AND** User is automatically logged in
- **AND** Session valid for 30 days

#### Scenario: Session expires after browser restart without remember me
- **WHEN** User logs in without "Beni Hatırla"
- **AND** User closes browser
- **AND** User reopens browser after 2 hours
- **THEN** System finds no valid session
- **AND** User must log in again

---

### Requirement: Authorization Middleware
The system SHALL use PostgreSQL RLS policies for server-side authorization.

**Mechanism**: Supabase Row Level Security (RLS)
**Policy Based On**: auth.uid() and user role from user_profiles
**Enforcement**: Database-level (cannot bypass)
**Fallback**: Client-side checks for UI only (not security)

#### Scenario: RLS policy prevents unauthorized read
- **WHEN** Viewer user queries beneficiaries table
- **THEN** PostgreSQL RLS policy evaluates:
  ```sql
  auth.uid() = beneficiaries.created_by
  OR
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  ```
- **AND** Policy allows read only for:
  - Records created by viewer
  - OR user is admin/manager
- **AND** Viewer sees limited dataset
- **AND** Database-level enforcement (client cannot bypass)

#### Scenario: RLS policy prevents unauthorized write
- **WHEN** Viewer attempts to insert beneficiary record
- **THEN** PostgreSQL RLS policy evaluates INSERT policy
- **AND** Policy checks if user role allows INSERT
- **AND** Policy DENIES operation (Viewer lacks CREATE_BENEFICIARY)
- **AND** Supabase returns permission error
- **AND** Client displays "Bu işlem için yetkiniz bulunmamaktadır"

#### Scenario: Admin bypasses all RLS restrictions
- **WHEN** Admin queries any table
- **THEN** RLS policy detects role = 'admin'
- **AND** Policy allows ALL operations (SELECT, INSERT, UPDATE, DELETE)
- **AND** Admin has unrestricted access

---

### Requirement: Multi-User Scenarios
The system SHALL handle concurrent users with different roles safely.

**Isolation**: User sessions isolated
**Concurrent**: Multiple users can work simultaneously
**Consistency**: Role changes propagate on next login
**Audit**: Cross-user actions logged

#### Scenario: Admin modifies user while user is logged in
- **WHEN** Admin changes User A's role from "operator" to "viewer"
- **AND** User A is currently logged in
- **THEN** System updates role in database
- **AND** User A's current session remains unchanged (until next login or refresh)
- **WHEN** User A performs action requiring "operator" permission
- **THEN** System checks current session permissions (still has operator permissions)
- **AND** Action succeeds (session not yet refreshed)
- **WHEN** User A logs out and logs in again
- **THEN** System loads new role "viewer"
- **AND** User A now has reduced permissions

#### Scenario: Admin suspends user while user is active
- **WHEN** Admin suspends User B
- **THEN** System sets user is_active = false
- **AND** System invalidates User B's active sessions
- **WHEN** User B attempts any operation
- **THEN** Supabase session validation fails
- **AND** User B is auto-logged out
- **AND** User B sees "Hesabınız askıya alınmıştır" on next request

---

### Requirement: Performance Requirements
The system SHALL meet authentication performance SLAs.

**Login**: < 2s
**Logout**: < 500ms
**Session Check**: < 100ms
**Permission Check**: < 1ms (in-memory lookup)
**Token Refresh**: < 1s

#### Scenario: Login performance
- **WHEN** User submits valid credentials
- **THEN** System completes login in < 2s:
  - Supabase Auth validation: ~500ms
  - User profile fetch: ~300ms
  - Permission loading: ~100ms
  - UI update: ~100ms

#### Scenario: Permission check performance
- **WHEN** Code performs 100 permission checks
- **THEN** Each check completes in < 1ms
- **AND** Total time < 100ms
- **AND** Uses cached permission list (no database query)

---

## Summary

This specification documents **Authentication & Authorization**, covering:

- ✅ 15 core requirements
- ✅ 50+ scenarios
- ✅ 4 roles (Admin, Manager, Operator, Viewer)
- ✅ 30+ permissions documented
- ✅ Security best practices (OWASP Top 10)
- ✅ Session management lifecycle
- ✅ Password policy
- ✅ Audit trail
- ✅ RLS policies
- ✅ Performance SLAs

**Total Scenarios**: 50+
**Total Requirements**: 15
**Security Compliant**: ✅ OWASP Top 10
**RLS Policies**: ✅ Database-level enforcement
**Performance SLAs**: ✅ Defined

**Related Capabilities**:
- Beneficiary Management (uses RBAC)
- All other capabilities (depend on auth)

