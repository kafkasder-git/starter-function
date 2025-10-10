# Change Proposal: Add Aid Management Specification

## Why

Aid Management (Yardım Yönetimi) derneğin primary mission'ını gerçekleştiren core capability. Kompleks workflow ve approval süreçleri içerir:

- Yardım başvuruları (application workflow)
- Durum takibi ve onay süreçleri
- Nakit ve ayni yardım dağıtımı
- Inventory management
- Distribution tracking
- Case management

**İhtiyaç**: Kompleks workflow, approval logic, ve distribution tracking dokümante edilmeli.

## What Changes

Mevcut aid management sistemini dokümante ediyoruz (9 sayfa + servis).

## Impact

- **NEW**: `aid-management` spec
- **Components**: 9 pages (AidPage, AidApplicationsPage, CaseManagementPage, vb.)
- **Services**: aidRequestsService.ts
- **Depends On**: beneficiary-management (beneficiaries receive aid)

