# Change Proposal: Add Donations Management Specification

## Why

Donations Management (Bağış Yönetimi) sistemin **kritik revenue stream'i** ve **regulatory compliance** gerektiren core capability. Şu anda implement edilmiş ancak dokümante edilmemiş:

- Nakit ve ayni bağışları yönetir
- Bağışçı takibi ve iletişimi sağlar
- Makbuz ve vergi belgesi üretir
- Kampanya entegrasyonu içerir
- Mali raporlama için temel veri kaynağı
- Recurring donation (tekrarlayan bağış) desteği var

**İhtiyaç**: Yasal gereklilikler, audit trail, ve tax compliance dokümante edilmeli.

## What Changes

Mevcut donation sistemini dokümante ediyoruz:

1. Donation Types (cash, in-kind, services)
2. Donor Management (individual, corporate, foundation)
3. Payment Methods (bank transfer, credit card, cash, check)
4. Status Workflow (pending → approved → completed)
5. Receipt Generation (makbuz)
6. Tax Certificate (vergi belgesi)
7. Campaign Integration
8. Recurring Donations
9. Thank You Communication
10. Reporting & Analytics

## Impact

- **NEW**: `donations-management` spec
- **Components**: DonationsPage.tsx, FinanceIncomePage.tsx
- **Services**: donationsService.ts
- **Database**: donations table

**Stakeholders**: Finance/Muhasebe team, Legal/Compliance

