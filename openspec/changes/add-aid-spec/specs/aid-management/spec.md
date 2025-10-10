# Aid Management Specification

## ADDED Requirements

### Requirement: Aid Application Submission
The system SHALL allow beneficiaries or authorized users to submit aid requests.

**Roles**: Admin, Manager, Operator (submit on behalf)
**Types**: cash, in_kind, education, healthcare, emergency
**Urgency**: low, medium, high, urgent
**Linked To**: Beneficiary (required)

#### Scenario: Submit cash aid application
- **WHEN** User submits aid application for beneficiary with type="cash", amount=2000, urgency="high"
- **THEN** system creates aid application with status="pending"
- **AND** system links to beneficiary record
- **AND** system assigns application number
- **AND** system notifies approvers
- **AND** system logs submission

#### Scenario: Submit emergency aid request
- **WHEN** User submits aid with urgency="urgent" and type="emergency"
- **THEN** system flags for immediate review
- **AND** system sends priority notification to all Admins
- **AND** system sets SLA for response (24 hours)

---

### Requirement: Aid Approval Workflow
The system SHALL implement approval workflow for aid applications.

**Workflow**: pending → under_review → approved | rejected → distributed → completed
**Approvers**: Manager, Admin
**Rejections**: Must include reason
**Notifications**: All status changes notify applicant and beneficiary

#### Scenario: Approve aid application
- **WHEN** Manager approves aid application
- **THEN** system changes status to "approved"
- **AND** system records approver and timestamp
- **AND** system triggers distribution preparation
- **AND** system sends approval notification to beneficiary
- **AND** system logs approval

#### Scenario: Reject aid application
- **WHEN** Admin rejects application with reason="İhtiyaç kriterleri karşılanmıyor"
- **THEN** system changes status to "rejected"
- **AND** system records rejection_reason
- **AND** system sends notification with reason
- **AND** system allows re-application after 30 days

---

### Requirement: Aid Distribution
The system SHALL track distribution of approved aid.

**Types**: Cash (bank transfer, hand delivery), In-kind (inventory items)
**Confirmation**: Beneficiary signature/receipt required
**Tracking**: Distribution date, amount/items, delivery method

#### Scenario: Distribute cash aid
- **WHEN** Operator distributes 2000 TL cash aid
- **THEN** system records distribution_date, amount, method="bank_transfer", IBAN
- **AND** system changes status to "distributed"
- **AND** system generates payment order (if bank transfer)
- **AND** system sends confirmation to beneficiary

#### Scenario: Distribute in-kind aid
- **WHEN** Operator distributes in-kind items (50 kg rice, 10 L oil)
- **THEN** system records items and quantities
- **AND** system deducts from inventory
- **AND** system requires beneficiary signature (digital or scanned)
- **AND** system changes status to "distributed"

---

### Requirement: Case Management
The system SHALL support case management for ongoing aid cases.

**Assignment**: Cases assigned to case workers
**Notes**: Case notes and updates
**Follow-up**: Scheduled follow-ups
**Closure**: Case closure with outcome

#### Scenario: Assign case to case worker
- **WHEN** Manager assigns aid case to case worker
- **THEN** system links case to user
- **AND** system notifies case worker
- **AND** case worker sees case in "My Cases"

#### Scenario: Add case note
- **WHEN** Case worker adds note "Visited family, verified needs"
- **THEN** system stores note with timestamp and author
- **AND** note visible to all authorized users
- **AND** system logs note creation

---

### Requirement: Aid Statistics and Reporting
The system SHALL provide aid statistics and impact reports.

**Metrics**: Total aid, by type, by status, by beneficiary
**Impact**: Beneficiaries helped, total distributed, average per case
**Export**: Excel, PDF reports

#### Scenario: Generate aid statistics
- **WHEN** Admin requests aid statistics dashboard
- **THEN** system calculates:
  - Total applications (by status)
  - Total distributed (amount/items)
  - Beneficiaries helped
  - Average processing time
  - Aid by type breakdown

---

### Requirement: Inventory Management for In-Kind Aid
The system SHALL track inventory of in-kind aid items.

**Items**: Food, clothing, furniture, medical supplies, education materials
**Stock**: Current stock levels
**Expiration**: Track expiration dates (food, medical)
**Alerts**: Low stock alerts

#### Scenario: Add in-kind donation to inventory
- **WHEN** In-kind donation received (100 kg rice)
- **THEN** system adds to inventory with quantity=100, unit="kg", type="food"
- **AND** system records expiration date (if applicable)
- **AND** system updates stock levels

#### Scenario: Deduct from inventory on distribution
- **WHEN** 50 kg rice distributed to beneficiary
- **THEN** system deducts 50 kg from inventory
- **AND** system updates stock level to 50 kg
- **AND** system triggers low stock alert if stock < threshold

---

### Requirement: RBAC for Aid Management
The system SHALL enforce role-based access for aid operations.

**Admin**: Full access
**Manager**: Approve, distribute, manage cases
**Operator**: Submit, view, distribute (cannot approve)
**Viewer**: Read-only

#### Scenario: Manager approves aid
- **WHEN** Manager with APPROVE_AID permission approves application
- **THEN** system allows approval

#### Scenario: Operator cannot approve
- **WHEN** Operator attempts to approve aid
- **THEN** system denies with 403 Forbidden (lacks APPROVE_AID permission)

---

## Summary

- ✅ 8 core requirements
- ✅ 20+ scenarios
- ✅ Workflow documented
- ✅ Inventory integration
- ✅ RBAC
- ✅ Audit trail

**Dependencies**: beneficiary-management, donations-management (funding source)

