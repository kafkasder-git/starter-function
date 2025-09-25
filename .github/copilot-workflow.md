# GitHub Copilot Optimizasyon Workflow'u

## Kafkasder Yönetim Paneli - Geliştirici Rehberi

Bu doküman, GitHub Copilot'ı projenizde en etkili şekilde kullanmak için
optimize edilmiş bir workflow sunar.

### 🎯 **1. Geliştirme Öncesi Hazırlık**

#### A. Bağlam Dosyalarını Açın

Copilot'a iyi bağlam sağlamak için şu dosyaları yan sekmede açık tutun:

```bash
# Temel mimari dosyaları
lib/supabase.ts          # Supabase konfigürasyonu
services/baseService.ts  # Temel servis yapısı
stores/uiStore.ts        # State yönetimi
types/database.ts        # Veritabanı tipleri

# İlgili servis dosyası (geliştirdiğiniz özelliğe göre)
services/[feature]Service.ts

# İlgili hook dosyası
hooks/use[Feature].ts

# İlgili tip dosyası
types/[feature].ts
```

#### B. Geliştirme Ortamını Hazırlayın

```bash
# Projeyi başlatın
npm run dev

# Linting'i aktif tutun
npm run lint:check

# Type checking'i aktif tutun
npm run type-check:app
```

### 🔄 **2. Planla ve Uygula Metodolojisi**

#### Adım 1: Planlama İsteği

```typescript
// Copilot'a şu şekilde istek yapın:
// Görev: [Özellik adı] için [detaylı açıklama]
// Plan: Bu özelliği eklemek için hangi dosyalarda (servis, hook, bileşen)
// değişiklik yapmam gerektiğini ve hangi adımları izlemem gerektiğini Türkçe olarak listele.
// Her adımı detaylıca açıkla.
```

#### Adım 2: Adım Adım Uygulama

```typescript
// Planın her adımını tek tek isteyin:
// Planın 1. adımı: [Adım açıklaması]
// Bu işlemi yap ve kodunu oluştur.
```

#### Adım 3: İyileştirme İsteği

```typescript
// Üretilen kodu analiz etmesini isteyin:
// Bu kodu analiz et. Olası iyileştirmeleri (refactoring), hata yönetimi eklemeyi
// veya daha verimli hale getirmeyi öner. Türkçe olarak açıkla.
```

### 🏗️ **3. Mimari Kurallara Uygun Geliştirme**

#### Service Katmanı Kullanımı

```typescript
// ✅ DOĞRU: Service katmanı üzerinden
import { membersService } from '@/services/membersService';

// ❌ YANLIŞ: Doğrudan Supabase
import { supabase } from '@/lib/supabase';
```

#### Hook Kullanımı

```typescript
// ✅ DOĞRU: Hook üzerinden veri erişimi
const { members, loading, error } = useMembers();

// ❌ YANLIŞ: Doğrudan servis çağrısı
const members = await membersService.getMembers();
```

#### State Yönetimi

```typescript
// ✅ DOĞRU: UI state için Zustand
const { sidebarCollapsed, toggleSidebar } = useUIStore();

// ✅ DOĞRU: Auth state için Context
const { user, isAuthenticated } = useSupabaseAuth();
```

### 🤖 **4. AI Entegrasyonu**

#### Merkezi AI Hook Kullanımı

```typescript
// ✅ DOĞRU: useAI hook'u kullanın
const { generateText, isLoading } = useAI();

// ❌ YANLIŞ: Doğrudan AI API çağrısı
const response = await fetch('https://api.openai.com/...');
```

#### Türkçe İçerik İsteme

```typescript
// AI'dan Türkçe içerik isterken:
const response = await generateText(
  'Bu veri için Türkçe bir analiz raporu oluştur: ' + JSON.stringify(data),
);
```

### 🧪 **5. Test Yazımı**

#### Kapsamlı Test İsteme

```typescript
// Copilot'a şu şekilde test yazdırın:
// [Fonksiyon adı] için testler yaz. Başarılı veri dönüşünü, bulunamayan ID için
// null dönüşünü ve veritabanı hatası durumunda fırlatılan hatayı test et.
// Vitest ve React Testing Library kullan.
```

### 🔍 **6. Kod Kalitesi Kontrolü**

#### Geliştirme Sonrası Kontrol Listesi

- [ ] Service katmanı kullanıldı mı?
- [ ] Hook'lar doğru şekilde kullanıldı mı?
- [ ] TypeScript tipleri tanımlandı mı?
- [ ] Hata yönetimi eklendi mi?
- [ ] Türkçe UI metinleri kullanıldı mı?
- [ ] Console.log'lar temizlendi mi?
- [ ] Mock data kullanılmadı mı?
- [ ] Güvenlik kontrolleri yapıldı mı?

### 📝 **7. Prompt Şablonları**

#### Yeni Özellik Geliştirme

```
// Görev: [Özellik adı] özelliği eklemek istiyorum.
// Bu özellik [detaylı açıklama] yapmalı.
// Plan: Bu özelliği eklemek için hangi dosyalarda değişiklik yapmam gerektiğini
// ve hangi adımları izlemem gerektiğini Türkçe olarak listele.
// Mevcut mimariye uygun olarak (Service -> Hook -> Component) yapılandır.
```

#### Mevcut Kodu İyileştirme

```
// Bu kodu analiz et ve iyileştirme önerileri sun:
// [Kod bloğu]
//
// Özellikle şunları kontrol et:
// - Performans optimizasyonu
// - Hata yönetimi
// - Kod tekrarı (DRY prensibi)
// - TypeScript tip güvenliği
// - Güvenlik açıkları
```

#### Test Yazımı

```
// [Fonksiyon/Hook adı] için kapsamlı testler yaz.
// Test etmen gereken senaryolar:
// - Başarılı durumlar
// - Hata durumları
// - Kenar durumları (edge cases)
// - Geçersiz girdiler
//
// Vitest ve React Testing Library kullan.
// Mock'ları uygun şekilde ayarla.
```

### 🚨 **8. Yaygın Hatalar ve Çözümleri**

#### Hata: Doğrudan Supabase Kullanımı

```typescript
// ❌ YANLIŞ
import { supabase } from '@/lib/supabase';
const { data } = await supabase.from('members').select('*');

// ✅ DOĞRU
import { membersService } from '@/services/membersService';
const { data } = await membersService.getAll();
```

#### Hata: Mock Data Kullanımı

```typescript
// ❌ YANLIŞ
const mockMembers = [{ id: 1, name: 'Test User' }];

// ✅ DOĞRU
// Supabase bağlantısı olmadığında zaten zarif davranacak şekilde tasarlanmış
```

#### Hata: Console.log Kullanımı

```typescript
// ❌ YANLIŞ
console.log('Debug:', data);

// ✅ DOĞRU
import { logger } from '@/lib/logging/logger';
logger.debug('Debug:', data);
```

### 📊 **9. Performans İzleme**

#### Copilot Kullanım İstatistikleri

- Hangi özellikler için daha çok yardım alıyorsunuz?
- Hangi prompt'lar daha etkili sonuç veriyor?
- Hangi alanlarda daha fazla düzeltme yapıyorsunuz?

#### Sürekli İyileştirme

- Prompt'larınızı sürekli geliştirin
- Başarılı pattern'leri not alın
- Zorlandığınız alanları belirleyin

### 🎉 **10. Başarı Metrikleri**

Bu workflow'u takip ettiğinizde:

- ✅ Daha tutarlı kod yapısı
- ✅ Daha az hata
- ✅ Daha hızlı geliştirme
- ✅ Daha iyi kod kalitesi
- ✅ Daha az tekrar

---

**Not:** Bu workflow, GitHub Copilot kılavuzundaki tüm prensipleri uygular ve
projenizin mimarisine uygun olarak optimize edilmiştir.
