<!-- 9c112d47-5879-4ac7-993c-f253bf8cc334 a829e73d-f000-428a-9c20-15ce6aaf2efc -->

# Type Merkezileştirme ve Organizasyon Planı

## Strateji

**Yaklaşım:** Domain-driven type organization

- Services, hooks ve components'teki export edilen shared type'ları taşı
- UI component prop type'larını yerinde bırak (ButtonProps, CardProps vb.)
- Domain bazlı dosyalara organize et (donation.ts, file.ts, notification.ts)
- Duplicate type'ları tespit edip birleştir
- Merkezi types/index.ts oluştur

**Kapsam:** ~94 service + ~35 hook type'ı (toplam ~130 önemli type) **Component
type'lar:** Sadece business logic type'ları taşınacak

## Yeni Type Dosyaları

### 1. types/services.ts (YENİ)

**Kaynak:** services/config.ts

Taşınacaklar:

- `ApiResponse<T>` - Genel API response wrapper
- `PaginatedResponse<T>` - Sayfalandırma response
- `ServiceResult<T>` - Success/error result union
- `ValidationResult` - Validation sonuçları
- `ServiceErrorCode` enum

### 2. types/file.ts (YENİ)

**Kaynak:** services/fileStorageService.ts

Taşınacaklar:

- `FileMetadata` - Dosya bilgileri
- `FileUploadOptions` - Upload seçenekleri
- `FileUploadResult` - Upload sonucu
- `FileListOptions` - Listeleme filtreleri
- `FileListResult` - Liste sonucu
- `FileDownloadOptions` - Download seçenekleri
- `StorageConfig` - Storage yapılandırması

### 3. types/export.ts (GÜNCELLENECEKTypes/data.ts ile birleştirilecek)

**Kaynak:** services/exportService.ts, services/exportUtils.ts,
hooks/useDataExport.ts

Taşınacaklar/Birleştirilecekler:

- `MemberData` - Üye export verisi
- `DonationData` - Bağış export verisi
- `AidData` - Yardım export verisi
- `ExportableData` union type
- Export utilities types

### 4. types/notification.ts (YENİ)

**Kaynak:** services/notificationService.ts,
services/pushNotificationService.ts, hooks/usePushNotifications.ts

Taşınacaklar:

- Notification type'ları
- Push notification config
- Notification preferences

### 5. types/user.ts (YENİ)

**Kaynak:** services/userManagementService.ts, hooks/useUserManagement.ts

Taşınacaklar:

- User management types
- Role types
- Permission types

### 6. types/performance.ts (YENİ)

**Kaynak:** services/performanceMonitoringService.ts, hooks/usePerformance.ts,
hooks/useMobilePerformance.ts

Taşınacaklar:

- `PerformanceMetrics`
- `PerformanceAlert`
- `PerformanceReport`
- `PerformanceConfig`

### 7. types/form.ts (YENİ)

**Kaynak:** hooks/useFormValidation.ts, hooks/useMobileForm.ts,
components/forms/\*.tsx

Taşınacaklar:

- Form validation types
- Form field types
- Form state types

### 8. types/pagination.ts (YENİ)

**Kaynak:** hooks/usePagination.ts, hooks/useInfiniteScroll.ts

Taşınacaklar:

- Pagination state
- Infinite scroll types

### 9. Mevcut Dosyaları Güncellenecek

**types/donation.ts** - services/donationsService.ts type'larını ekle
**types/kumbara.ts** - hooks/useKumbara.ts type'larını ekle
**types/search.ts** - hooks/useSearch.ts type'larını ekle

## İmplementasyon Adımları

### Faz 1: Services Type'larını Taşı

1. types/services.ts oluştur (config.ts'den)
2. types/file.ts oluştur (fileStorageService.ts'den)
3. types/performance.ts oluştur
4. types/user.ts oluştur
5. types/notification.ts oluştur
6. Service dosyalarındaki importları güncelle

### Faz 2: Hooks Type'larını Taşı

1. types/form.ts oluştur
2. types/pagination.ts oluştur
3. types/export.ts'yi güncelle
4. Mevcut type dosyalarını güncelle (donation, kumbara, search)
5. Hook dosyalarındaki importları güncelle

### Faz 3: Component Business Type'larını Taşı

1. Component'lardaki business logic type'larını tespit et
2. Uygun domain dosyalarına taşı
3. Component importlarını güncelle

### Faz 4: Merkezileştirme

1. **types/index.ts oluştur** - Tüm type'ları re-export et
2. Duplicate type'ları tespit et ve birleştir
3. Tüm importları `from '@/types'` formatına güncelle

### Faz 5: Temizlik

1. Boş kalan inline type tanımlamalarını temizle
2. Kullanılmayan type'ları kaldır
3. Type documentation ekle
4. Lint kontrolü

## Duplicate Type'lar (Tespit Edilecek)

Muhtemel duplicate'ler:

- `ApiResponse` vs `ServiceResult`
- Pagination related types (farklı service'lerde)
- User/Member types (farklı yerlerde)
- File upload types
- Form validation types

## Avantajlar

1. **Tek Kaynak:** Tüm type'lar merkezi konumda
2. **Kolay Bakım:** Type değişiklikleri tek yerden
3. **Type Güvenliği:** Tutarlı type kullanımı
4. **Daha Az Kod:** Duplicate'ler kaldırılacak
5. **Daha İyi IDE Support:** Autocomplete ve type hints
6. **Dokümantasyon:** Merkezi type documentation

## Riskler ve Dikkat Edilecekler

- Breaking changes: Import path'leri değişecek
- Circular dependency riski: Dikkatli import organization
- Component prop types: Sadece business logic type'ları taşı
- Generic types: Doğru type parameter'ları koru
- Type re-exports: index.ts'de düzgün organize et

### To-dos

- [ ] types/services.ts oluştur ve config.ts'deki genel servis type'larını taşı
- [ ] types/file.ts oluştur ve fileStorageService.ts'deki type'ları taşı
- [ ] types/performance.ts oluştur ve performans ile ilgili type'ları taşı
- [ ] types/user.ts oluştur ve user management type'larını taşı
- [ ] types/notification.ts oluştur ve notification type'larını taşı
- [ ] Service dosyalarındaki type importlarını yeni lokasyonlara güncelle
- [ ] types/form.ts oluştur ve form validation type'larını taşı
- [ ] types/pagination.ts oluştur ve pagination type'larını taşı
- [ ] Mevcut type dosyalarını güncelle (donation, kumbara, search)
- [ ] Hook dosyalarındaki type importlarını güncelle
- [ ] Component'lardaki business logic type'larını uygun domain dosyalarına taşı
- [ ] types/index.ts oluştur ve tüm type'ları re-export et
- [ ] Duplicate type'ları tespit et ve birleştir
- [ ] Kullanılmayan type'ları kaldır ve lint kontrolü yap
