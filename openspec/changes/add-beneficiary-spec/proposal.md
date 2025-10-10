# Change Proposal: Add Beneficiary Management Specification

## Why

Beneficiary Management (Yararlanıcı Yönetimi) projenin **core business capability'si** olup, şu anda dokümante edilmemiş durumda. Bu özellik:

- Derneğin yardım ettiği kişilerin (ihtiyaç sahiplerinin) kaydını tutar
- Aile bilgileri, ihtiyaçlar, mali durum gibi hassas kişisel verileri yönetir
- KVKK (Kişisel Verilerin Korunması Kanunu) compliance gerektirir
- Yardım dağıtım süreçlerinin temelini oluşturur
- 9 farklı component ve kapsamlı type sistemi ile projenin en karmaşık özelliğidir

**İhtiyaç**: 
- Onboarding sürecini hızlandırmak
- KVKK compliance'ı dokümante etmek  
- Business kurallarını netleştirmek
- Regression'ları önlemek
- Future development'lar için baseline oluşturmak

## What Changes

Bu change **mevcut bir özelliği dokümante ediyor** (implementation değişikliği içermiyor):

### Dokümante Edilecek Özellikler

1. **Beneficiary Registration**
   - Yeni yararlanıcı kaydı
   - Aile üyesi bilgileri
   - İletişim bilgileri
   - Kimlik doğrulama

2. **Needs Assessment**
   - İhtiyaç türleri (gıda, giyim, barınma, tıbbi, eğitim, vb.)
   - Öncelik seviyeleri (low, medium, high, urgent)
   - İhtiyaç değerlendirme süreci

3. **Financial Information**
   - Aylık gelir/gider
   - Gelir kaynakları
   - IBAN bilgileri
   - Yardım miktarı hesaplaması

4. **Document Management**
   - Kimlik belgesi
   - İkametgah belgesi
   - Gelir durumu belgesi
   - Sağlık raporları
   - Fotoğraflar

5. **Status Workflow**
   - Active → yararlanıcı aktif
   - Completed → yardım tamamlandı
   - Suspended → geçici olarak askıya alındı
   - Deleted → kayıt silindi (soft delete)

6. **Search & Filtering**
   - Multi-field search
   - Status filters
   - Priority filters
   - Date range filters
   - City/district filters

7. **KVKK Compliance**
   - Explicit consent recording
   - Data retention policies (7 years for financial)
   - Right to be forgotten
   - Data anonymization
   - Audit trail

8. **Reporting**
   - Beneficiary statistics
   - Needs analysis
   - Distribution tracking
   - Demographic reports

### Kapsam Dışı (Out of Scope)
- Aid distribution workflow (separate capability)
- Payment processing (separate capability)
- Appointment scheduling (separate capability)
- Legal consultation (separate capability)

## Impact

### Affected Specs
- **NEW**: `beneficiary-management` - Yeni spec oluşturulacak

### Affected Code
**Components** (9 files):
- `components/pages/BeneficiariesPageEnhanced.tsx` - List view
- `components/pages/BeneficiaryDetailPageComprehensive.tsx` - Detail view
- `components/beneficiary/BeneficiaryForm.tsx` - Registration form
- `components/beneficiary/BeneficiaryDocuments.tsx` - Document upload
- `components/beneficiary/BeneficiaryFinancial.tsx` - Financial info
- `components/beneficiary/BeneficiaryFamily.tsx` - Family members
- `components/beneficiary/BeneficiaryNeeds.tsx` - Needs assessment
- `components/beneficiary/BeneficiaryStatus.tsx` - Status management
- `components/beneficiary/BeneficiarySearch.tsx` - Search/filter

**Services**:
- `services/beneficiariesService.ts` - CRUD operations

**Types** (13 definitions):
- `types/beneficiary.ts` - Core types
- `BeneficiaryStatus`, `BeneficiaryPriority`, `NeedType`, `FamilyStatus`

**Hooks**:
- `hooks/useBeneficiaries.ts` - Data fetching

**Database**:
- Table: `ihtiyac_sahipleri` (Turkish field names)
- RLS policies for role-based access

### Breaking Changes
**NONE** - Bu bir documentation change'dir, kod değişikliği içermez.

### Migration Required
**NONE** - Mevcut sistem dokümante ediliyor.

### Performance Impact
**NONE** - Documentation only.

### Security Impact
**POSITIVE** - KVKK compliance requirements dokümante ediliyor.

## Success Criteria

✅ Spec passes `openspec validate --strict`  
✅ Her requirement'ın en az 1 scenario'su var  
✅ KVKK compliance requirements açıkça belirtilmiş  
✅ Status workflow state machine olarak dokümante edilmiş  
✅ Role-based permissions tanımlanmış  
✅ API endpoints dokümante edilmiş  
✅ Error scenarios tanımlanmış  

## Timeline

**Tahmini Süre**: 2-3 gün

- Day 1: Core requirements (registration, CRUD)
- Day 2: Advanced features (documents, financial, workflow)
- Day 3: KVKK compliance, validation, review

## Stakeholders

- **Product Owner**: Business requirements review
- **Tech Lead**: Technical accuracy review
- **Legal/Compliance**: KVKK requirements validation
- **Developers**: Implementation accuracy verification

## References

- Current implementation: `services/beneficiariesService.ts`
- Type definitions: `types/beneficiary.ts`
- KVKK Law: https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=6698
- Related specs: (none - this is first spec)

## Notes

- Bu spec, diğer capability'ler için **template** olarak kullanılacak
- Beneficiary Management, Aid Management ve Donations Management için **prerequisite**
- Turkish-English field mapping patterns burada dokümante edilecek
- RLS policy patterns burada dokümante edilecek

