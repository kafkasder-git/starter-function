# Donations Management Specification

## ADDED Requirements

### Requirement: Donation Registration
The system SHALL allow authorized users to register donations with donor information, amount, type, and payment details.

**Roles**: Admin, Manager, Operator
**Permissions**: CREATE_DONATION
**Types**: cash, in_kind, services, other
**Currency**: TL (primary), USD, EUR supported

#### Scenario: Register cash donation
- **WHEN** User registers cash donation with donor_name="Ahmet Yılmaz", amount=1000, currency="TL", payment_method="bank_transfer"
- **THEN** system creates donation record with status="pending"
- **AND** system generates unique donation ID
- **AND** system records transaction timestamp
- **AND** system sends confirmation notification to Admin
- **AND** system logs creation in audit trail

#### Scenario: Register in-kind donation
- **WHEN** User registers in-kind donation with description="50 kg rice", donor_type="corporate"
- **THEN** system creates donation with donation_type="in_kind"
- **AND** system records estimated value
- **AND** system links to inventory (if applicable)
- **AND** system marks for valuation

#### Scenario: Register with campaign link
- **WHEN** User registers donation with campaign_id="ramazan-2024"
- **THEN** system links donation to campaign
- **AND** system updates campaign progress
- **AND** system includes campaign in receipt

---

### Requirement: Donation Status Workflow
The system SHALL enforce status workflow with approval process.

**States**: pending → approved | rejected → processing → completed
**Approval**: Manager or Admin required
**Audit**: All status changes logged

#### Scenario: Approve pending donation
- **WHEN** Manager approves pending donation
- **THEN** system changes status to "approved"
- **AND** system records approval_date and approver user_id
- **AND** system triggers receipt generation
- **AND** system sends thank you message to donor

#### Scenario: Reject donation with reason
- **WHEN** Admin rejects donation with reason="Duplicate entry"
- **THEN** system changes status to "rejected"
- **AND** system records rejection_reason
- **AND** system notifies submitter
- **AND** system does NOT generate receipt

---

### Requirement: Receipt Generation
The system SHALL automatically generate donation receipts.

**Trigger**: Donation status → approved
**Numbering**: Sequential (YYYY-SEQ format)
**Content**: Donor info, amount, date, organization info, tax deductible status
**Delivery**: Email (PDF) and/or printed

#### Scenario: Generate receipt on approval
- **WHEN** Donation is approved
- **THEN** system generates receipt with number "2024-00123"
- **AND** system includes donor name, amount, date, organization details
- **AND** system marks tax_deductible=true if eligible
- **AND** system sends PDF via email to donor_email
- **AND** system records receipt_issued=true and receipt_date

---

### Requirement: Tax Certificate Generation
The system SHALL generate tax deduction certificates for eligible donations.

**Eligibility**: Cash donations ≥ 100 TL
**Legal**: Complies with Turkish tax law
**Numbering**: Annual sequence
**Delivery**: Email and registered mail option

#### Scenario: Generate tax certificate
- **WHEN** Donation amount ≥ 100 TL AND tax_deductible=true
- **THEN** system generates tax certificate
- **AND** system assigns certificate number "VB-2024-00045"
- **AND** system includes legal text and organization tax ID
- **AND** system delivers via email
- **AND** system records delivery in audit trail

---

### Requirement: Recurring Donations
The system SHALL support recurring donations with automated processing.

**Frequencies**: monthly, quarterly, yearly
**Processing**: Automatic on schedule
**End Date**: Optional, continues until cancelled
**Notifications**: Remind donor before each charge

#### Scenario: Setup monthly recurring donation
- **WHEN** Donor opts for monthly recurring donation of 500 TL
- **THEN** system creates recurring donation record
- **AND** system sets is_recurring=true, recurring_frequency="monthly"
- **AND** system schedules first charge for next month
- **AND** system sends confirmation email

#### Scenario: Process recurring donation automatically
- **WHEN** Scheduled recurring donation date arrives
- **THEN** system automatically creates new donation record
- **AND** system processes payment
- **AND** system generates receipt
- **AND** system sends notification to donor

---

### Requirement: Donor Management
The system SHALL track donors and their donation history.

**Donor Types**: individual, corporate, foundation, government
**History**: All donations per donor
**Analytics**: Lifetime value, frequency, last donation
**Communication**: Preferences and opt-outs

#### Scenario: View donor history
- **WHEN** User views donor "Ahmet Yılmaz"
- **THEN** system displays all donations from this donor
- **AND** system shows total donated amount
- **AND** system shows donation count
- **AND** system shows last donation date
- **AND** system shows average donation amount

---

### Requirement: Payment Method Support
The system SHALL support multiple payment methods with verification.

**Methods**: bank_transfer, credit_card, cash, check, online, other
**Verification**: Payment reference validation
**Tracking**: Transaction IDs where applicable

#### Scenario: Bank transfer donation
- **WHEN** Donation via bank_transfer with payment_reference="REF123456"
- **THEN** system stores payment method and reference
- **AND** system allows verification against bank statement
- **AND** system marks as "processing" until verified

---

### Requirement: Search and Filtering
The system SHALL provide comprehensive donation search and filtering.

**Search Fields**: donor_name, donor_email, payment_reference
**Filters**: status, type, payment method, date range, amount range
**Performance**: < 1s for any query

#### Scenario: Search donations by donor name
- **WHEN** User searches "Ahmet"
- **THEN** system returns all donations with "Ahmet" in donor_name (case-insensitive)
- **AND** system returns results in < 1s

#### Scenario: Filter by date and amount range
- **WHEN** User filters by date 2024-01-01 to 2024-12-31 AND amount 1000-5000 TL
- **THEN** system returns matching donations
- **AND** system supports pagination

---

### Requirement: Reporting and Analytics
The system SHALL provide donation statistics and financial reports.

**Statistics**: Total, average, by type, by donor type, by payment method
**Trends**: Monthly, quarterly, yearly
**Export**: Excel, PDF, CSV

#### Scenario: Generate donation statistics
- **WHEN** Admin requests dashboard statistics
- **THEN** system calculates:
  - Total donations count and amount
  - Average donation amount
  - Donations by type (cash, in-kind)
  - Donations by status
- **AND** system returns in < 1s

---

### Requirement: RBAC for Donations
The system SHALL enforce role-based access for donation operations.

**Admin**: Full CRUD
**Manager**: Create, read, update, approve
**Operator**: Create, read
**Viewer**: Read-only (masked financial data)

#### Scenario: Manager approves donation
- **WHEN** Manager with APPROVE_DONATION permission approves donation
- **THEN** system allows approval operation
- **WHEN** Operator attempts to approve
- **THEN** system denies with 403 Forbidden

---

### Requirement: Audit Trail
The system SHALL log all donation operations for compliance.

**Logged**: Create, update, status change, approval, receipt generation
**Data**: user_id, timestamp, old/new values, IP address
**Retention**: 7 years (legal requirement)

#### Scenario: Log donation creation
- **WHEN** Donation is created
- **THEN** system logs: user_id, donation_id, timestamp, IP, all field values
- **WHEN** Donation is updated
- **THEN** system logs: user_id, donation_id, timestamp, changed_fields (old → new values)

---

## Summary

- ✅ 11 core requirements
- ✅ 20+ scenarios
- ✅ Financial compliance
- ✅ Tax requirements
- ✅ RBAC
- ✅ Audit trail

**Related**: beneficiary-management, aid-management, financial-management

