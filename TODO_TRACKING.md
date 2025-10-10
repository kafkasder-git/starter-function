# TODO Tracking Document

This document tracks remaining TODOs and future implementation work.

## Completed ✅
- Mock data removal from core pages
- Logger standardization
- Environment configuration for production

## In Progress 🚧

### Service Layer Creation
- [ ] Legal Consultations Service
- [ ] Events Service
- [ ] Activities/Recent Activity Service
- [ ] Finance Service (if not exists)

### Page Integrations
- [ ] RecentActivity component
- [ ] LegalConsultationPage
- [ ] EventsPage
- [ ] InventoryManagementPage (clarify data model)

## Blocked - Requires Backend Work 🚫

### Security & Authentication
- [ ] JWT validation in security middleware (`middleware/security.ts:92`)
- [ ] Audit logs implementation (`services/monitoringService.ts:42`)

### Analytics & Tracking
- [ ] Analytics tracking implementation (`components/layouts/Header.tsx:80-85`)
- [ ] Advanced analytics data fetching (`components/analytics/AdvancedAnalyticsDashboard.tsx:93`)

### Feature Enhancements
- [ ] Sponsorship type field in partners table (`components/pages/DocumentManagementPage.tsx:116,129`)
- [ ] Donations table calculation for campaigns (`components/pages/CampaignManagementPage.tsx:392`)
- [ ] Projects table calculation for partners (`services/partnersService.ts:179`)

### Internal Messaging
- [ ] Message sending implementation (`components/pages/InternalMessagingPage.tsx:48`)

### Role Management
- [ ] Edit role functionality (`components/pages/RoleManagementPage.tsx:237`)
- [ ] View role details (`components/pages/RoleManagementPage.tsx:246`)

## Future Enhancements 🔮

### Testing
- [ ] Crypto library for 2FA (`lib/__tests__/twoFactor.test.ts:67`)

### Database
- [ ] Database policies migration strategy (`components/pages/BeneficiaryDetailPageComprehensive.tsx:612`)

### Configuration
- [ ] Service configuration parameter usage (`services/index.ts:205`)

## Notes

### Service Creation Priority
1. **High Priority**: Legal Consultations, Events (have collections, need services)
2. **Medium Priority**: Activities (needs data model clarification)
3. **Low Priority**: Finance (may already exist, needs verification)

### Data Model Clarifications Needed
- InventoryManagementPage: Is this for physical inventory or partner associations?
- RecentActivity: Should this aggregate from multiple collections or have dedicated collection?
- Scholarship applications: Use aid_applications with type filter or separate collection?

### Testing Strategy
- Manual testing required after each service integration
- Verify data persistence in Appwrite console
- Test error handling and edge cases
- Validate field mappings