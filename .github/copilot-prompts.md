# GitHub Copilot Prompt Şablonları

## Kafkasder Yönetim Paneli - Optimize Edilmiş İstekler

Bu doküman, GitHub Copilot ile etkili çalışmak için hazırlanmış prompt
şablonlarını içerir.

### 🚀 **1. Yeni Özellik Geliştirme**

#### A. Planlama İsteği

```typescript
// Görev: [Özellik Adı] özelliği eklemek istiyorum.
// Bu özellik [detaylı açıklama] yapmalı ve [kullanıcı hikayesi].
//
// Plan: Bu özelliği eklemek için hangi dosyalarda (servis, hook, bileşen)
// değişiklik yapmam gerektiğini ve hangi adımları izlemem gerektiğini Türkçe olarak listele.
// Her adımı detaylıca açıkla ve mevcut mimariye uygun olarak (Service -> Hook -> Component) yapılandır.
//
// Mevcut proje yapısını dikkate al:
// - services/ dizininde ilgili servis dosyası
// - hooks/ dizininde ilgili hook dosyası
// - components/ dizininde ilgili bileşen dosyası
// - types/ dizininde ilgili tip tanımları
```

#### B. Adım Adım Uygulama

```typescript
// Planın 1. adımı: [Adım açıklaması]
// Bu işlemi yap ve kodunu oluştur. Mevcut proje standartlarına uygun olarak:
// - TypeScript tiplerini kullan
// - Hata yönetimi ekle
// - Türkçe yorumlar yaz
// - Mevcut servis yapısını takip et
```

#### C. İyileştirme İsteği

```typescript
// Bu kodu analiz et ve iyileştirme önerileri sun:
// [Kod bloğu]
//
// Özellikle şunları kontrol et:
// - Performans optimizasyonu fırsatları
// - Hata yönetimi eksiklikleri
// - Kod tekrarı (DRY prensibi ihlalleri)
// - TypeScript tip güvenliği
// - Güvenlik açıkları
// - Mevcut proje mimarisine uygunluk
//
// İyileştirmeleri Türkçe olarak açıkla ve optimize edilmiş kodu sun.
```

### 🏗️ **2. Servis Katmanı Geliştirme**

#### A. Yeni Servis Oluşturma

```typescript
// [EntityName] için yeni bir servis oluştur.
//
// Gereksinimler:
// - services/[entityName]Service.ts dosyasında
// - BaseService sınıfından türet
// - CRUD operasyonları (getAll, getById, create, update, delete)
// - Filtreleme ve arama özellikleri
// - Pagination desteği
// - Hata yönetimi
// - TypeScript tipleri
//
// Mevcut membersService.ts yapısını referans al.
// Supabase tablosu: [table_name]
// Entity interface: [EntityName] (id, name, created_at, updated_at, vb.)
```

#### B. Servis Metodları Ekleme

```typescript
// [ServiceName] servisine [methodName] metodunu ekle.
//
// Metod özellikleri:
// - Parametreler: [parametre listesi]
// - Dönüş tipi: [return type]
// - İşlev: [detaylı açıklama]
// - Hata yönetimi: try-catch ile
// - Logging: başarı ve hata durumları için
//
// Mevcut servis yapısını takip et ve tutarlılığı koru.
```

### 🎣 **3. Hook Geliştirme**

#### A. Yeni Hook Oluşturma

```typescript
// [EntityName] için yeni bir React hook oluştur.
//
// Gereksinimler:
// - hooks/use[EntityName].ts dosyasında
// - [entityName]Service'i kullan
// - Loading, error, data durumlarını yönet
// - CRUD operasyonları için metodlar
// - Filtreleme ve arama desteği
// - Realtime güncellemeler (opsiyonel)
// - TypeScript tipleri
//
// Mevcut useDonations.ts yapısını referans al.
// Hook adı: use[EntityName]
// Servis: [entityName]Service
```

#### B. Hook Metodları Ekleme

```typescript
// use[EntityName] hook'una [methodName] metodunu ekle.
//
// Metod özellikleri:
// - useCallback ile optimize et
// - Hata yönetimi ekle
// - Toast bildirimleri ekle (başarı/hata)
// - Loading state yönetimi
// - Parametreler: [parametre listesi]
//
// Mevcut hook yapısını takip et ve tutarlılığı koru.
```

### 🧩 **4. Bileşen Geliştirme**

#### A. Yeni Bileşen Oluşturma

```typescript
// [ComponentName] adında yeni bir React bileşeni oluştur.
//
// Gereksinimler:
// - components/[feature]/[ComponentName].tsx dosyasında
// - TypeScript ile yazılmış
// - Props interface tanımla
// - Responsive tasarım (Tailwind CSS)
// - Loading ve error durumları
// - Accessibility desteği
// - Türkçe UI metinleri
//
// Mevcut bileşen yapısını takip et:
// - components/ui/ dizinindeki bileşenleri kullan
// - useUIStore hook'unu kullan
// - ErrorBoundary ile sarmala
```

#### B. Bileşen Özellikleri Ekleme

```typescript
// [ComponentName] bileşenine [feature] özelliğini ekle.
//
// Özellik gereksinimleri:
// - [detaylı açıklama]
// - Kullanıcı etkileşimi: [etkileşim türü]
// - State yönetimi: [state türü]
// - Validation: [doğrulama kuralları]
// - Hata yönetimi: [hata durumları]
//
// Mevcut bileşen yapısını koru ve tutarlılığı sağla.
```

### 🤖 **5. AI Entegrasyonu**

#### A. AI Özelliği Ekleme

```typescript
// [Feature] için AI entegrasyonu ekle.
//
// Gereksinimler:
// - useAI hook'unu kullan
// - [AI function] metodunu çağır
// - Loading ve error durumlarını yönet
// - Türkçe prompt'lar kullan
// - Sonuçları kullanıcı dostu şekilde göster
// - Hata durumunda fallback sağla
//
// Mevcut AI yapısını takip et:
// - components/ai/EnhancedAIProvider.tsx
// - hooks/useAIController.ts
```

#### B. AI Prompt Optimizasyonu

```typescript
// Bu AI prompt'unu optimize et:
// [Mevcut prompt]
//
// Optimizasyon kriterleri:
// - Daha spesifik ve net ol
// - Türkçe çıktı garantisi ekle
// - Context bilgisi ekle
// - Hata durumları için talimat ekle
// - Format belirt (JSON, markdown, vb.)
//
// Optimize edilmiş prompt'u sun.
```

### 🧪 **6. Test Yazımı**

#### A. Servis Testleri

```typescript
// [ServiceName] servisi için kapsamlı testler yaz.
//
// Test senaryoları:
// - Başarılı CRUD operasyonları
// - Hata durumları (network, validation, vb.)
// - Kenar durumları (boş veri, geçersiz ID, vb.)
// - Filtreleme ve arama işlevleri
// - Pagination işlevleri
//
// Vitest ve MSW kullan.
// Mock'ları uygun şekilde ayarla.
// Her test case'i Türkçe açıklama ile yaz.
```

#### B. Hook Testleri

```typescript
// use[EntityName] hook'u için testler yaz.
//
// Test senaryoları:
// - Hook'un doğru state'leri döndürmesi
// - Loading durumları
// - Error durumları
// - CRUD operasyonları
// - Filtreleme işlevleri
// - Realtime güncellemeler
//
// React Testing Library ve Vitest kullan.
// Servisleri mock'la.
// Her test case'i Türkçe açıklama ile yaz.
```

#### C. Bileşen Testleri

```typescript
// [ComponentName] bileşeni için testler yaz.
//
// Test senaryoları:
// - Bileşenin doğru render edilmesi
// - Props'ların doğru işlenmesi
// - Kullanıcı etkileşimleri
// - Loading ve error durumları
// - Accessibility testleri
// - Responsive davranış
//
// React Testing Library, Vitest ve jest-axe kullan.
// Her test case'i Türkçe açıklama ile yaz.
```

### 🔧 **7. Hata Ayıklama ve İyileştirme**

#### A. Performans İyileştirme

```typescript
// Bu kodu analiz et ve performans iyileştirmeleri öner:
// [Kod bloğu]
//
// Kontrol etmen gerekenler:
// - Gereksiz re-render'lar
// - Memory leak'ler
// - Büyük veri setleri için optimizasyon
// - Lazy loading fırsatları
// - Memoization fırsatları
// - Bundle size optimizasyonu
//
// İyileştirmeleri Türkçe olarak açıkla ve optimize edilmiş kodu sun.
```

#### B. Hata Ayıklama

```typescript
// Bu hata ile ilgili yardım et:
// [Hata mesajı]
// [Kod bloğu]
//
// Hata analizi:
// - Hatanın kök nedenini bul
// - Çözüm önerileri sun
// - Benzer hataları önleme yöntemleri
// - Test case'leri ekle
//
// Çözümü Türkçe olarak açıkla ve düzeltilmiş kodu sun.
```

### 📊 **8. Veri Analizi ve Raporlama**

#### A. Veri Analizi

```typescript
// [Veri seti] için analiz yap ve rapor oluştur.
//
// Analiz gereksinimleri:
// - [Analiz türü] (trend, karşılaştırma, vb.)
// - Görselleştirme (grafik, tablo, vb.)
// - Önemli bulgular
// - Öneriler
// - Türkçe rapor formatı
//
// useAI hook'unu kullan ve sonuçları kullanıcı dostu şekilde sun.
```

#### B. Rapor Oluşturma

```typescript
// [Rapor türü] raporu oluştur.
//
// Rapor gereksinimleri:
// - Veri kaynağı: [veri kaynağı]
// - Zaman aralığı: [tarih aralığı]
// - Rapor formatı: [format türü]
// - İçerik: [içerik gereksinimleri]
// - Türkçe dil desteği
//
// Mevcut raporlama yapısını kullan ve AI entegrasyonu ekle.
```

### 🔒 **9. Güvenlik ve Validasyon**

#### A. Input Validasyonu

```typescript
// [Form/Input] için güvenlik validasyonu ekle.
//
// Validasyon gereksinimleri:
// - XSS koruması
// - SQL injection koruması
// - Input sanitization
// - Türkçe karakter desteği
// - Hata mesajları (Türkçe)
//
// lib/validation.ts ve utils/sanitization.ts kullan.
```

#### B. Güvenlik Kontrolü

```typescript
// Bu kodu güvenlik açısından analiz et:
// [Kod bloğu]
//
// Kontrol etmen gerekenler:
// - XSS açıkları
// - CSRF koruması
// - Authentication/Authorization
// - Data exposure
// - Input validation
//
// Güvenlik açıklarını Türkçe olarak açıkla ve güvenli kodu sun.
```

### 📱 **10. Mobil Optimizasyon**

#### A. Mobil Bileşen

```typescript
// [ComponentName] bileşenini mobil cihazlar için optimize et.
//
// Optimizasyon gereksinimleri:
// - Touch-friendly interface
// - Responsive tasarım
// - Performance optimizasyonu
// - Offline desteği
// - PWA uyumluluğu
//
// Mevcut mobil yapısını takip et:
// - components/mobile/ dizini
// - hooks/useMobilePerformance.ts
// - hooks/useTouchDevice.ts
```

---

## 💡 **Prompt Kullanım İpuçları**

### ✅ **Etkili Prompt Yazma**

1. **Spesifik olun**: Ne istediğinizi net belirtin
2. **Bağlam sağlayın**: İlgili dosyaları açık tutun
3. **Örnekler verin**: Mevcut kod yapısından örnekler kullanın
4. **Türkçe kullanın**: UI metinleri ve açıklamalar için
5. **Adım adım ilerleyin**: Büyük görevleri parçalara bölün

### ❌ **Kaçınılması Gerekenler**

1. **Belirsiz istekler**: "bir fonksiyon yaz" gibi
2. **Mimari ihlalleri**: Doğrudan Supabase kullanımı
3. **Mock data**: Gerçek veri yerine sahte veri
4. **Console.log**: Production kodunda debug mesajları
5. **Güvenlik açıkları**: Hassas veri exposure'ı

### 🎯 **Başarı Metrikleri**

- Prompt başına ortalama düzeltme sayısı < 2
- İlk denemede doğru kod üretme oranı > 80%
- Mimari kurallara uygunluk oranı > 95%
- Test coverage > 90%

---

**Not:** Bu prompt şablonları, GitHub Copilot kılavuzundaki tüm prensipleri
uygular ve projenizin mimarisine uygun olarak optimize edilmiştir.
