# Beneficiary Management Specification

## ADDED Requirements

### Requirement: Beneficiary Registration
The system SHALL allow authorized users to register new beneficiaries with complete personal, family, and contact information.

**Roles**: Admin, Moderator
**Permissions**: CREATE_BENEFICIARY
**Privacy**: Processes personal data (KVKK Article 5)
**Validation**: All required fields must be provided and valid

#### Scenario: Successful beneficiary registration
- **WHEN** Admin submits registration form with all required fields (name, surname, phone, address, city)
- **THEN** system creates new beneficiary record with status "active"
- **AND** system generates unique beneficiary ID
- **AND** system records consent timestamp
- **AND** system sends notification to admin
- **AND** system logs creation in audit trail

#### Scenario: Registration with missing required fields
- **WHEN** User submits registration form missing required field (e.g., phone)
- **THEN** system returns validation error "Telefon numarası zorunludur"
- **AND** system does NOT create beneficiary record
- **AND** system highlights missing field in form

#### Scenario: Registration with duplicate ID number
- **WHEN** User submits registration with ID number that already exists
- **THEN** system returns error "Bu kimlik numarası ile kayıtlı bir yararlanıcı bulunmaktadır"
- **AND** system displays link to existing beneficiary record
- **AND** system does NOT create duplicate record

#### Scenario: Registration with invalid phone format
- **WHEN** User submits registration with invalid phone format (e.g., "123")
- **THEN** system returns validation error "Geçerli bir telefon numarası giriniz (05XX XXX XX XX)"
- **AND** system does NOT create beneficiary record

---

### Requirement: Beneficiary Information Retrieval
The system SHALL allow authorized users to retrieve beneficiary information by ID or list all beneficiaries with pagination.

**Roles**: Admin, Moderator, Muhasebe (limited), Üye (limited)
**Permissions**: READ_BENEFICIARY
**Performance**: List view SHALL load in < 2s for 1000 records

#### Scenario: Get single beneficiary by ID
- **WHEN** User requests beneficiary with valid ID
- **THEN** system returns complete beneficiary information
- **AND** system logs access in audit trail
- **AND** system masks sensitive data based on user role

#### Scenario: Get beneficiary with invalid ID
- **WHEN** User requests beneficiary with non-existent ID
- **THEN** system returns 404 Not Found
- **AND** system returns error message "Yararlanıcı bulunamadı"

#### Scenario: List all beneficiaries with pagination
- **WHEN** User requests beneficiary list
- **THEN** system returns first 20 beneficiaries ordered by creation date (newest first)
- **AND** system includes pagination metadata (total count, current page, page size)
- **AND** system response time is < 2s

#### Scenario: Unauthorized access attempt
- **WHEN** Guest user attempts to access beneficiary data
- **THEN** system returns 403 Forbidden
- **AND** system logs unauthorized access attempt
- **AND** system displays "Bu sayfayı görüntüleme yetkiniz bulunmamaktadır"

---

### Requirement: Beneficiary Updates
The system SHALL allow authorized users to update beneficiary information while maintaining audit trail.

**Roles**: Admin, Moderator, Muhasebe (financial only)
**Permissions**: UPDATE_BENEFICIARY
**Audit**: All updates SHALL be logged with user, timestamp, and changed fields

#### Scenario: Update personal information
- **WHEN** Admin updates beneficiary phone number
- **THEN** system saves new phone number
- **AND** system records old and new values in audit trail
- **AND** system updates "updated_at" timestamp
- **AND** system sends notification if phone was primary contact

#### Scenario: Update with invalid data
- **WHEN** User updates beneficiary with invalid IBAN format
- **THEN** system returns validation error "Geçersiz IBAN formatı (TR ile başlamalı, 26 karakter)"
- **AND** system does NOT save changes

#### Scenario: Concurrent update conflict
- **WHEN** Two users attempt to update same beneficiary simultaneously
- **THEN** first update succeeds
- **AND** second update receives conflict error "Bu kayıt başka bir kullanıcı tarafından güncellenmiştir"
- **AND** system displays current data for review

#### Scenario: Muhasebe updates financial information
- **WHEN** Muhasebe user updates monthly income field
- **THEN** system saves financial information
- **AND** system allows update (Muhasebe has financial permissions)
- **WHEN** Muhasebe attempts to update personal information (name)
- **THEN** system returns 403 Forbidden "Bu alanı düzenleme yetkiniz bulunmamaktadır"

---

### Requirement: Beneficiary Deletion
The system SHALL implement soft delete with 7-year retention period and data anonymization.

**Roles**: Admin only
**Permissions**: DELETE_BENEFICIARY
**Retention**: 7 years for financial records (regulatory requirement)
**Privacy**: Right to erasure (KVKK Article 7)

#### Scenario: Soft delete beneficiary
- **WHEN** Admin deletes beneficiary
- **THEN** system sets status to "deleted"
- **AND** system sets deletion_date to current timestamp
- **AND** system maintains data for 7 years
- **AND** system hides beneficiary from normal list views
- **AND** system logs deletion in audit trail

#### Scenario: KVKK erasure request
- **WHEN** Admin processes erasure request (right to be forgotten)
- **THEN** system anonymizes personal data immediately
- **AND** system retains financial data for 7 years (anonymized: "Anonymous Beneficiary #[ID]")
- **AND** system logs erasure request and completion
- **AND** system generates confirmation document

#### Scenario: Automatic deletion after retention period
- **WHEN** Beneficiary record reaches 7-year retention period
- **THEN** system automatically anonymizes all personal data
- **AND** system archives financial summary (anonymized)
- **AND** system logs automatic deletion

#### Scenario: Unauthorized deletion attempt
- **WHEN** Moderator attempts to delete beneficiary
- **THEN** system returns 403 Forbidden
- **AND** system logs unauthorized deletion attempt
- **AND** system displays "Yararlanıcı silme yetkiniz bulunmamaktadır (Sadece Admin)"

---

### Requirement: Search and Filtering
The system SHALL provide multi-field search and comprehensive filtering options.

**Roles**: Admin, Moderator, Muhasebe, Üye
**Permissions**: READ_BENEFICIARY
**Performance**: Search SHALL return results in < 1s

#### Scenario: Search by name
- **WHEN** User searches for "Ahmet"
- **THEN** system returns all beneficiaries with "Ahmet" in name or surname (case-insensitive)
- **AND** system highlights matching text
- **AND** system returns results in < 1s

#### Scenario: Search by phone number
- **WHEN** User searches for "0555 123 45 67"
- **THEN** system finds beneficiary with matching phone (ignores formatting)
- **AND** system returns exact match

#### Scenario: Filter by status and priority
- **WHEN** User filters by status="active" AND priority="urgent"
- **THEN** system returns only active beneficiaries with urgent priority
- **AND** system displays filter count "32 yararlanıcı bulundu"

#### Scenario: Filter by city and date range
- **WHEN** User filters by city="İstanbul" AND created_date between 2024-01-01 and 2024-12-31
- **THEN** system returns beneficiaries from Istanbul created in 2024
- **AND** system supports pagination for results

#### Scenario: Advanced search with multiple criteria
- **WHEN** User searches with name="Ahmet", city="İstanbul", status="active", need_types includes "food"
- **THEN** system applies AND logic to all criteria
- **AND** system returns beneficiaries matching ALL criteria
- **AND** system displays "AND" operators in active filters

---

### Requirement: Document Management
The system SHALL allow upload, storage, and verification of beneficiary documents.

**Roles**: Admin, Moderator (upload), Admin (verify)
**File Size**: Maximum 5MB per file
**Formats**: PDF, JPG, PNG, HEIC
**Storage**: Supabase Storage with RLS policies
**Retention**: 7 years (same as beneficiary data)

#### Scenario: Upload identity document
- **WHEN** User uploads ID document (PDF, 2MB)
- **THEN** system stores file in Supabase Storage
- **AND** system creates document record linked to beneficiary
- **AND** system sets document type to "identity"
- **AND** system sets verification status to "pending"
- **AND** system generates secure download URL

#### Scenario: Upload oversized file
- **WHEN** User attempts to upload 10MB file
- **THEN** system returns error "Dosya boyutu 5MB'ı aşamaz"
- **AND** system does NOT upload file
- **AND** system displays allowed size limit

#### Scenario: Upload unsupported format
- **WHEN** User attempts to upload .docx file
- **THEN** system returns error "Desteklenen formatlar: PDF, JPG, PNG, HEIC"
- **AND** system does NOT upload file

#### Scenario: Verify uploaded document
- **WHEN** Admin reviews uploaded ID document
- **AND** Admin marks document as "verified"
- **THEN** system updates document verification_status to "verified"
- **AND** system records verifier user ID and timestamp
- **AND** system updates beneficiary completeness score

#### Scenario: Reject uploaded document
- **WHEN** Admin reviews document and finds it invalid
- **AND** Admin marks document as "rejected" with reason "Belge bulanık, okunamıyor"
- **THEN** system updates verification_status to "rejected"
- **AND** system notifies user to re-upload
- **AND** system displays rejection reason

---

### Requirement: Status Workflow
The system SHALL enforce a state machine for beneficiary status transitions.

**States**: pending, active, completed, suspended, deleted
**Audit**: All status changes SHALL be logged
**Notifications**: Status changes SHALL trigger notifications

#### Scenario: New registration starts as pending
- **WHEN** New beneficiary is registered
- **THEN** system sets initial status to "pending"
- **AND** system requires approval before status can change to "active"

#### Scenario: Approve pending beneficiary
- **WHEN** Admin approves pending beneficiary
- **THEN** system changes status from "pending" to "active"
- **AND** system records approval timestamp and approver user
- **AND** system sends notification "Kaydınız onaylandı"
- **AND** system allows aid applications for this beneficiary

#### Scenario: Complete aid for beneficiary
- **WHEN** Admin marks beneficiary assistance as completed
- **THEN** system changes status from "active" to "completed"
- **AND** system records completion_date
- **AND** system calculates total assistance provided
- **AND** system archives beneficiary (still viewable)

#### Scenario: Suspend beneficiary for policy violation
- **WHEN** Admin suspends beneficiary with reason
- **THEN** system changes status from "active" to "suspended"
- **AND** system records suspension reason
- **AND** system blocks new aid applications
- **AND** system sends notification with reason

#### Scenario: Invalid status transition
- **WHEN** User attempts to change status from "completed" to "pending"
- **THEN** system returns error "Geçersiz durum değişikliği: completed → pending desteklenmiyor"
- **AND** system lists valid transitions: "completed → active (reactivate)"

#### Scenario: Status transition state machine
Valid transitions:
- pending → active (approval)
- pending → deleted (rejection)
- active → completed (assistance finished)
- active → suspended (policy violation)
- active → deleted (manual deletion)
- suspended → active (reinstatement)
- suspended → deleted (permanent removal)
- completed → active (reactivation if needed)

---

### Requirement: Needs Assessment
The system SHALL support classification and prioritization of beneficiary needs.

**Need Types**: food, clothing, shelter, medical, education, transportation, utilities, other
**Priority Levels**: low, medium, high, urgent
**Reassessment**: Every 3 months for active beneficiaries

#### Scenario: Register beneficiary with multiple needs
- **WHEN** User registers beneficiary with needs [food, medical, shelter]
- **THEN** system stores all need types
- **AND** system calculates initial priority based on need count and types
- **AND** system sets priority to "high" (3+ critical needs)

#### Scenario: Single need with low income
- **WHEN** Beneficiary has single need "food" AND monthly income < 5000 TL
- **THEN** system calculates priority as "medium"
- **AND** system flags for periodic reassessment

#### Scenario: Urgent need escalation
- **WHEN** Beneficiary has need "medical" AND has chronic condition
- **OR** Beneficiary has need "shelter" AND is homeless
- **THEN** system automatically escalates priority to "urgent"
- **AND** system sends immediate notification to admins
- **AND** system flags for priority handling

#### Scenario: Periodic reassessment
- **WHEN** 3 months have passed since last assessment
- **THEN** system flags beneficiary for reassessment
- **AND** system sends reminder to assigned case worker
- **AND** system displays "Reassessment Due" badge
- **WHEN** Reassessment is completed
- **THEN** system updates needs, priority, and assessment_date

---

### Requirement: Financial Information Tracking
The system SHALL track income, expenses, and financial eligibility.

**Fields**: monthly_income, income_source, monthly_expenses, debts, assets, IBAN
**Validation**: IBAN format (TR + 24 digits), amounts must be positive
**Privacy**: Financial data visible only to Admin and Muhasebe roles

#### Scenario: Record monthly income
- **WHEN** User enters monthly income 8000 TL with source "Part-time job"
- **THEN** system stores income information
- **AND** system calculates eligibility ratio (income vs expenses)
- **AND** system determines eligibility for assistance

#### Scenario: Validate IBAN format
- **WHEN** User enters IBAN "TR33 0006 1005 1978 6457 8413 26"
- **THEN** system validates format (TR + 26 characters)
- **AND** system stores IBAN
- **WHEN** User enters invalid IBAN "TR12345"
- **THEN** system returns error "Geçersiz IBAN formatı"

#### Scenario: Calculate financial eligibility
- **WHEN** Beneficiary has monthly_income 6000 TL AND monthly_expenses 8000 TL
- **THEN** system calculates deficit: -2000 TL
- **AND** system marks as "eligible" for assistance
- **AND** system suggests assistance amount based on deficit

#### Scenario: Muhasebe access to financial data
- **WHEN** Muhasebe user views beneficiary details
- **THEN** system displays financial information (income, expenses, IBAN)
- **AND** system allows editing financial fields
- **WHEN** Üye user views beneficiary details
- **THEN** system masks financial information
- **AND** system displays "Mali bilgiler gizlidir"

---

### Requirement: Family Information Management
The system SHALL track family members and household composition.

**Fields**: family_status, children_count, family_members_count, family_members[]
**Validation**: children_count ≤ family_members_count

#### Scenario: Add family members
- **WHEN** User adds family member with name, age, relationship
- **THEN** system creates family member record linked to beneficiary
- **AND** system increments family_members_count
- **AND** system recalculates household need score

#### Scenario: Family status change
- **WHEN** Beneficiary family status changes from "married" to "widowed"
- **THEN** system updates family_status
- **AND** system may trigger priority reassessment
- **AND** system logs change in audit trail

#### Scenario: Children count validation
- **WHEN** User enters children_count 5 AND family_members_count 3
- **THEN** system returns error "Çocuk sayısı toplam aile birey sayısından fazla olamaz"

---

### Requirement: KVKK Compliance
The system SHALL comply with Turkish Personal Data Protection Law (KVKK).

**Consent**: Explicit consent required before registration
**Rights**: Access, rectification, erasure, portability
**Retention**: 7 years for financial, immediate erasure for non-financial on request
**Audit**: All data access SHALL be logged

#### Scenario: Record explicit consent
- **WHEN** User registers new beneficiary
- **THEN** system displays KVKK consent form
- **AND** user MUST check "Kişisel verilerimin işlenmesine onay veriyorum"
- **AND** system records consent timestamp, IP address, and user who recorded consent
- **AND** system does NOT allow registration without consent

#### Scenario: Data subject access request
- **WHEN** Beneficiary requests their personal data
- **THEN** system generates complete data export (JSON or PDF)
- **AND** system includes all personal, family, financial data
- **AND** system includes audit log (who accessed, when)
- **AND** system provides download within 30 days (KVKK requirement)

#### Scenario: Right to erasure request
- **WHEN** Beneficiary submits erasure request
- **THEN** system immediately anonymizes non-financial personal data
- **AND** system retains financial data for 7 years (legal requirement) with name anonymized
- **AND** system generates erasure confirmation document
- **AND** system logs erasure in audit trail

#### Scenario: Data portability request
- **WHEN** Beneficiary requests data portability
- **THEN** system generates machine-readable export (JSON)
- **AND** system includes all personal data in structured format
- **AND** system provides download link valid for 48 hours

#### Scenario: Audit trail for data access
- **WHEN** Any user accesses beneficiary data
- **THEN** system logs: user_id, beneficiary_id, timestamp, fields_accessed, IP address, purpose
- **AND** Admin can view complete audit log
- **AND** Beneficiary can request their own audit log (KVKK Article 11)

---

### Requirement: Role-Based Access Control
The system SHALL enforce role-based permissions using PostgreSQL RLS policies.

**Roles**: admin, moderator, muhasebe, uye, guest
**Mechanism**: Row Level Security (RLS) policies on database
**Audit**: Access denied attempts SHALL be logged

#### Scenario: Admin full access
- **WHEN** Admin user queries beneficiaries table
- **THEN** RLS policy allows access to ALL records
- **AND** Admin can perform CREATE, READ, UPDATE, DELETE operations

#### Scenario: Moderator limited access
- **WHEN** Moderator queries beneficiaries table
- **THEN** RLS policy allows access to ALL records for READ, UPDATE
- **AND** Moderator can CREATE new beneficiaries
- **AND** RLS policy DENIES DELETE operations
- **WHEN** Moderator attempts DELETE
- **THEN** system returns 403 Forbidden

#### Scenario: Muhasebe financial-only access
- **WHEN** Muhasebe queries beneficiaries table
- **THEN** RLS policy allows READ access to financial fields only
- **AND** Personal information fields are masked
- **AND** Muhasebe can UPDATE financial fields (monthly_income, iban, etc.)
- **AND** RLS policy DENIES UPDATE on personal fields (name, phone, etc.)

#### Scenario: Üye read-only access
- **WHEN** Üye user queries beneficiaries table
- **THEN** RLS policy allows READ access to approved beneficiaries only (status = 'active')
- **AND** Sensitive fields are masked (iban, identity_number, financial details)
- **AND** RLS policy DENIES all write operations

#### Scenario: Guest no access
- **WHEN** Guest user attempts to query beneficiaries table
- **THEN** RLS policy DENIES access
- **AND** System returns empty result set (not 403, to prevent info disclosure)

---

### Requirement: Reporting and Analytics
The system SHALL provide statistics, analytics, and export capabilities.

**Statistics**: Count by status, priority, city, need type
**Analytics**: Trends, demographics, financial analysis
**Export**: Excel, PDF, CSV formats
**Performance**: Reports SHALL generate in < 5s for 10,000 records

#### Scenario: Generate beneficiary statistics
- **WHEN** Admin requests dashboard statistics
- **THEN** system calculates:
  - Total beneficiaries by status (active: 150, completed: 45, suspended: 5)
  - Total by priority (urgent: 20, high: 50, medium: 80, low: 50)
  - Total by top 10 cities
  - Total by need type
- **AND** system caches results for 5 minutes
- **AND** system returns statistics in < 1s

#### Scenario: Export beneficiaries to Excel
- **WHEN** Admin exports beneficiary list to Excel
- **THEN** system generates .xlsx file with all fields (based on role permissions)
- **AND** system includes filters and formatting
- **AND** system completes export in < 5s for 1000 records
- **AND** system logs export action (KVKK audit requirement)

#### Scenario: Generate demographic report
- **WHEN** Admin generates demographic report
- **THEN** system analyzes:
  - Age distribution
  - Family size distribution
  - Income distribution
  - Need type distribution
- **AND** system generates charts (bar, pie)
- **AND** system exports as PDF

#### Scenario: Trend analysis
- **WHEN** Admin requests monthly trend report
- **THEN** system shows:
  - New registrations per month (last 12 months)
  - Completed cases per month
  - Average assistance amount per month
- **AND** system displays line chart
- **AND** system allows export to Excel

---

### Requirement: Performance Requirements
The system SHALL meet specified performance SLAs.

**List View**: < 2s for 1000 records
**Search**: < 1s for any query
**Detail View**: < 500ms
**Export**: < 5s for 10,000 records
**Monitoring**: Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)

#### Scenario: List view performance
- **WHEN** User loads beneficiary list with 1000 records
- **THEN** system returns first page (20 records) in < 2s
- **AND** system implements pagination to limit data transfer
- **AND** system uses database indexing on frequently queried fields

#### Scenario: Search performance
- **WHEN** User searches across 5000 beneficiaries
- **THEN** system returns results in < 1s
- **AND** system uses full-text search indexes
- **AND** system implements query optimization

#### Scenario: Export performance
- **WHEN** Admin exports 10,000 beneficiary records to Excel
- **THEN** system completes export in < 5s
- **AND** system uses streaming approach (not loading all in memory)
- **AND** system shows progress indicator

---

### Requirement: Error Handling and Validation
The system SHALL provide clear error messages in Turkish and handle all error scenarios gracefully.

**Language**: All user-facing errors in Turkish
**Format**: Consistent error structure (code, message, details)
**Logging**: All errors SHALL be logged for debugging

#### Scenario: Required field validation error
- **WHEN** User submits form without required field "phone"
- **THEN** system returns error:
  ```json
  {
    "code": "VALIDATION_ERROR",
    "message": "Zorunlu alanlar eksik",
    "details": {
      "phone": "Telefon numarası zorunludur"
    }
  }
  ```
- **AND** system highlights field in red
- **AND** system does NOT submit form

#### Scenario: Database connection error
- **WHEN** Database connection fails during query
- **THEN** system returns error "Veritabanı bağlantısı kurulamadı. Lütfen tekrar deneyin."
- **AND** system logs full error details for debugging
- **AND** system displays user-friendly message (not technical details)

#### Scenario: Concurrent modification conflict
- **WHEN** Two users update same record simultaneously
- **THEN** system detects version conflict
- **AND** system returns error "Bu kayıt başka bir kullanıcı tarafından güncellenmiştir"
- **AND** system displays current data for review
- **AND** system allows user to retry with latest data

---

## Summary

This specification documents the **Beneficiary Management** capability, covering:

- ✅ 15 core requirements
- ✅ 60+ scenarios (covering happy paths, validations, errors)
- ✅ KVKK compliance requirements
- ✅ Role-based access control
- ✅ Performance SLAs
- ✅ State machine workflows
- ✅ Error handling patterns

**Total Scenarios**: 60+
**Total Requirements**: 15
**KVKK Compliant**: ✅
**RLS Policies**: ✅
**Performance SLAs**: ✅

**Related Capabilities**:
- Aid Management (depends on Beneficiary Management)
- Donations Management (linked via assistance tracking)
- Reporting & Analytics (uses beneficiary data)

