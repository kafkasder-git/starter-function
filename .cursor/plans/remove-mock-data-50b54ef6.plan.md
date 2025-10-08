<!-- 50b54ef6-4dc3-4260-8423-04dbeaf17c9d 05e9d6bf-3056-42d8-88a3-6b26f7d031db -->

# TestSprite Test Hatalarını Düzeltme Planı

## Genel Bakış

TestSprite testlerinde 20 testten 16'sı başarısız oldu (%80 fail rate). Bu plan,
tüm hataları öncelik sırasına göre sistematik olarak düzeltir.

## Faz 1: Kritik Güvenlik Sorunları (Öncelik: Yüksek)

### 1.1 CSRF Protection Implementation

**Sorun**: TC014 - Server CSRF token olmadan istekleri kabul ediyor
**Dosyalar**:

- `lib/supabase.ts` - CSRF token yönetimi ekle
- `contexts/SupabaseAuthContext.tsx` - CSRF token state ekle
- Yeni: `hooks/useCSRFToken.ts` - CSRF token hook

**İşlemler**:

1. CSRF token generator ve validator implementasyonu
2. Supabase client'a CSRF header'ı otomatik ekleme
3. Her API isteğinde CSRF token doğrulama
4. Login sonrası CSRF token oluşturma

### 1.2 XSS Prevention - Data Sanitization

**Sorun**: TC014, TC018 - Data tablolarında XSS açıkları **Dosyalar**:

- `components/ui/table.tsx` - Sanitization ekle
- Yeni: `lib/sanitization.ts` - DOMPurify wrapper
- Tüm data display komponentleri

**İşlemler**:

1. DOMPurify kullanarak tüm user input'ları sanitize et
2. Table komponentlerine sanitization middleware ekle
3. innerHTML kullanımlarını temizle veya sanitize et

### 1.3 Role-Based Access Control (RBAC)

**Sorun**: TC003 - Kısıtlı kullanıcılar admin modüllerine erişebiliyor
**Dosyalar**:

- `components/auth/ProtectedRoute.tsx` - Gerçek RBAC implementasyonu
- `contexts/AuthContext.tsx` - Role ve permission management
- `types/auth.ts` - Role definitions

**İşlemler**:

1. ProtectedRoute'da gerçek role checking implementasyonu (şu an dummy)
2. Unauthorized erişimlerde proper error page gösterme
3. Her sayfa için gerekli role/permission tanımlama
4. Navigation guard'ları güçlendirme

### 1.4 Audit Logging System

**Sorun**: TC016 - Kritik aksiyonlar audit log oluşturmuyor **Dosyalar**:

- Yeni: `services/auditService.ts` - Audit logging service
- `lib/supabase.ts` - Audit hooks
- Supabase: `audit_logs` table schema

**İşlemler**:

1. Audit log service oluşturma (create, read, delete, update events)
2. Kritik işlemlere audit logging ekleme
3. Audit log viewer component oluşturma

## Faz 2: UI/Navigasyon Sorunları (Öncelik: Orta-Yüksek)

### 2.1 Unresponsive Button Fix - "Ekle" Buttons

**Sorun**: TC006, TC020 - "Ekle" butonları tıklamaya yanıt vermiyor **Etkilenen
Dosyalar**:

- `components/pages/AidPage.tsx`
- `components/pages/BeneficiariesPageEnhanced.tsx`
- Diğer form sayfaları

**İşlemler**:

1. Event handler'ları kontrol et ve düzelt
2. Button disabled state'lerini kontrol et
3. Form submission logic'ini düzelt
4. Loading state management ekle

### 2.2 Navigation Issues - Sidebar Links

**Sorun**: TC012, TC013 - "İhtiyaç Sahipleri" ve diğer butonlar navigate etmiyor
**Dosyalar**:

- `components/Sidebar.tsx` - Navigation links
- `App.tsx` - Route configuration

**İşlemler**:

1. Sidebar navigation link'lerini kontrol et
2. Route definitions'ı doğrula
3. Link onClick handler'ları düzelt

### 2.3 System Settings Access

**Sorun**: TC011 - "Sistem Ayarları" butonu çalışmıyor **Dosyalar**:

- `components/Sidebar.tsx` veya `components/Header.tsx`
- Yeni: `components/pages/SystemSettingsPage.tsx`

**İşlemler**:

1. Settings sayfası route ekle
2. Settings button navigation düzelt
3. Basic settings UI oluştur

## Faz 3: Performans İyileştirmeleri (Öncelik: Orta)

### 3.1 Timeout Issues - Dashboard & Forms

**Sorun**: TC004, TC010 - 15 dakika sonra timeout **Dosyalar**:

- `components/pages/BeneficiariesPageEnhanced.tsx`
- Dashboard components
- Form components

**İşlemler**:

1. Sonsuz loop'ları tespit ve düzelt
2. useEffect dependency array'leri optimize et
3. Gereksiz re-render'ları önle
4. Loading indicators ekle

### 3.2 Multiple Supabase Instance Warning

**Sorun**: Console'da "Multiple GoTrueClient instances" uyarısı **Dosyalar**:

- `lib/supabase.ts`
- `contexts/SupabaseAuthContext.tsx`

**İşlemler**:

1. Singleton pattern ile tek Supabase instance
2. Duplicate initialization'ları temizle

### 3.3 Missing Dialog Descriptions

**Sorun**: Accessibility uyarıları - DialogContent'te description eksik
**Dosyalar**:

- Tüm Dialog kullanan komponentler

**İşlemler**:

1. Dialog.Description ekle
2. aria-describedby attribute'ları ekle

## Faz 4: Eksik Özellikler (Öncelik: Orta-Düşük)

### 4.1 Campaign Management

**Sorun**: TC007 - Kampanya oluşturma özelliği yok **Dosyalar**:

- Yeni: `components/pages/CampaignManagementPage.tsx`
- Yeni: `services/campaignService.ts`

**İşlemler**:

1. Campaign management page oluştur
2. Campaign CRUD operations
3. Progress tracking UI
4. Notification integration

### 4.2 Financial Transaction Module

**Sorun**: TC008 - Finansal işlem bölümü eksik/erişilemiyor **Dosyalar**:

- `components/pages/BankPaymentOrdersPage.tsx` - Genişlet
- Yeni: `components/pages/FinancialTransactionsPage.tsx`

**İşlemler**:

1. Financial transaction list page
2. Dual-signature approval workflow
3. Transaction creation form

### 4.3 Document Upload System

**Sorun**: TC009, TC020 - Doküman yükleme özelliği eksik **Dosyalar**:

- Yeni: `components/forms/DocumentUpload.tsx`
- Yeni: `services/documentService.ts`

**İşlemler**:

1. File upload component (MIME type validation)
2. Virus scanning integration (placeholder)
3. Document management UI
4. Supabase Storage integration

### 4.4 Export Functionality

**Sorun**: TC012 - Export permission enforcement ve audit trail eksik
**Dosyalar**:

- `hooks/useDataExport.ts` - Genişlet
- Export buttons ekle

**İşlemler**:

1. Export permission checking
2. Audit trail logging
3. Export UI buttons ekle

### 4.5 Soft-Delete Implementation

**Sorun**: TC013 - Soft-delete functionality eksik **Dosyalar**:

- Tüm CRUD services
- Database schema updates

**İşlemler**:

1. deleted_at column ekle (Supabase)
2. Soft-delete service functions
3. Restore functionality
4. Deleted items view

### 4.6 Network Failure Retry

**Sorun**: TC019 - Otomatik retry mekanizması eksik **Dosyalar**:

- `lib/supabase.ts`
- Yeni: `lib/networkRetry.ts`

**İşlemler**:

1. Retry interceptor ekle
2. Exponential backoff strategy
3. Retry notification UI
4. Network status monitoring

## Faz 5: Testing & Validation

### 5.1 Re-run TestSprite Tests

**İşlemler**:

1. Tüm düzeltmeleri test et
2. TestSprite ile yeniden test çalıştır
3. Failed test'leri analiz et

### 5.2 Manual Testing

**İşlemler**:

1. Her düzeltilen özelliği manuel test et
2. Edge case'leri kontrol et
3. Cross-browser testing

## Implementasyon Sırası

1. **İlk Gün**: Faz 1 (Güvenlik) - CSRF, XSS, RBAC, Audit
2. **İkinci Gün**: Faz 2 (UI/Navigation) - Button fixes, Navigation, Settings
3. **Üçüncü Gün**: Faz 3 (Performans) - Timeouts, Supabase, Accessibility
4. **Dördüncü Gün**: Faz 4.1-4.3 (Özellikler) - Campaign, Financial, Documents
5. **Beşinci Gün**: Faz 4.4-4.6 (Özellikler) - Export, Soft-delete, Retry
6. **Altıncı Gün**: Faz 5 (Testing) - Re-test ve validation

## Önemli Notlar

- Her düzeltme sonrası commit yapılacak
- Critical security issues production'a öncelikle deploy edilmeli
- Test coverage artırılmalı
- Documentation güncellenecek

### To-dos

- [ ] CSRF token yönetimi ve validasyon implementasyonu
- [ ] XSS prevention - Data sanitization tüm tablolarda
- [ ] Role-Based Access Control gerçek implementasyonu
- [ ] Audit logging system oluşturma
- [ ] Unresponsive Ekle butonlarını düzelt
- [ ] Sidebar navigation link'lerini düzelt
- [ ] System Settings sayfası ekle
- [ ] Dashboard ve form timeout sorunlarını çöz
- [ ] Multiple Supabase instance uyarısını düzelt
- [ ] Dialog description'ları ekle
- [ ] Campaign Management modülü oluştur
- [ ] Financial Transactions modülü genişlet
- [ ] Document Upload sistem oluştur
- [ ] Export permission ve audit trail ekle
- [ ] Soft-delete functionality implementasyonu
- [ ] Network failure retry mekanizması ekle
- [ ] TestSprite ile yeniden test çalıştır
