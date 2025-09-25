# GitHub Copilot Kod Kalitesi Kontrol Listesi

## Kafkasder Yönetim Paneli - Geliştirme Standartları

Bu kontrol listesi, GitHub Copilot ile geliştirilen kodun kalitesini ve
tutarlılığını sağlamak için kullanılır.

## 🚀 **Geliştirme Öncesi Kontroller**

### **Bağlam Hazırlığı**

- [ ] İlgili servis dosyası açık mı? (`services/[feature]Service.ts`)
- [ ] İlgili hook dosyası açık mı? (`hooks/use[Feature].ts`)
- [ ] İlgili tip dosyası açık mı? (`types/[feature].ts`)
- [ ] Temel mimari dosyalar açık mı? (`lib/supabase.ts`,
      `services/baseService.ts`)
- [ ] Mevcut benzer özellik dosyaları açık mı? (referans için)

### **Planlama Kontrolleri**

- [ ] Görev detaylı olarak tanımlandı mı?
- [ ] Mimari desen belirlendi mi? (Service → Hook → Component)
- [ ] Gerekli dosyalar listelendi mi?
- [ ] Adım adım plan oluşturuldu mu?

## 🏗️ **Mimari Uygunluk Kontrolleri**

### **Service Katmanı**

- [ ] Service, `BaseService` sınıfından türetildi mi?
- [ ] CRUD operasyonları (getAll, getById, create, update, delete) var mı?
- [ ] Hata yönetimi try-catch ile yapıldı mı?
- [ ] `ApiResponse<T>` tipi kullanıldı mı?
- [ ] Supabase doğrudan çağrılmadı mı? (lib/supabase.ts üzerinden)
- [ ] Logging eklendi mi? (`logger` kullanımı)
- [ ] TypeScript tipleri tanımlandı mı?

### **Hook Katmanı**

- [ ] Hook, ilgili servisi kullanıyor mu?
- [ ] Loading, error, data state'leri yönetiliyor mu?
- [ ] `useCallback` ile optimize edildi mi?
- [ ] Hata yönetimi eklendi mi?
- [ ] Toast bildirimleri eklendi mi? (başarı/hata)
- [ ] TypeScript tipleri tanımlandı mı?
- [ ] Realtime güncellemeler (gerekirse) eklendi mi?

### **Component Katmanı**

- [ ] Component, ilgili hook'u kullanıyor mu?
- [ ] Props interface tanımlandı mı?
- [ ] Loading ve error durumları handle edildi mi?
- [ ] Responsive tasarım uygulandı mı? (Tailwind CSS)
- [ ] Accessibility özellikleri eklendi mi?
- [ ] Türkçe UI metinleri kullanıldı mı?
- [ ] ErrorBoundary ile sarmalandı mı?

## 🔐 **Güvenlik Kontrolleri**

### **Input Validation**

- [ ] Kullanıcı girdileri sanitize edildi mi? (`sanitizeInput`)
- [ ] Email validasyonu yapıldı mı? (`validateEmail`)
- [ ] XSS koruması eklendi mi?
- [ ] SQL injection koruması var mı?
- [ ] CSRF koruması düşünüldü mü?

### **Authentication & Authorization**

- [ ] `useSupabaseAuth` hook'u kullanıldı mı?
- [ ] Kullanıcı yetkilendirmesi kontrol edildi mi?
- [ ] Hassas veriler korundu mu?
- [ ] API anahtarları güvenli şekilde saklandı mı?

### **Data Protection**

- [ ] Hassas veriler loglanmadı mı?
- [ ] Error mesajlarında hassas bilgi yok mu?
- [ ] Client-side'da hassas veri saklanmadı mı?

## 🎨 **UI/UX Kontrolleri**

### **Dil ve Yerelleştirme**

- [ ] Tüm UI metinleri Türkçe mi?
- [ ] Hata mesajları Türkçe mi?
- [ ] Toast bildirimleri Türkçe mi?
- [ ] Form etiketleri Türkçe mi?
- [ ] Buton metinleri Türkçe mi?

### **Responsive Design**

- [ ] Mobil cihazlar için optimize edildi mi?
- [ ] Tablet görünümü test edildi mi?
- [ ] Desktop görünümü optimize edildi mi?
- [ ] Touch-friendly interface var mı?

### **Accessibility**

- [ ] ARIA etiketleri eklendi mi?
- [ ] Keyboard navigation destekleniyor mu?
- [ ] Screen reader uyumluluğu var mı?
- [ ] Color contrast yeterli mi?
- [ ] Focus indicators var mı?

## 🧪 **Test Kontrolleri**

### **Unit Tests**

- [ ] Servis metodları test edildi mi?
- [ ] Hook'lar test edildi mi?
- [ ] Utility fonksiyonlar test edildi mi?
- [ ] Başarılı senaryolar test edildi mi?
- [ ] Hata durumları test edildi mi?
- [ ] Kenar durumlar (edge cases) test edildi mi?

### **Component Tests**

- [ ] Component render testi yazıldı mı?
- [ ] Props testleri yazıldı mı?
- [ ] User interaction testleri yazıldı mı?
- [ ] Loading state testleri yazıldı mı?
- [ ] Error state testleri yazıldı mı?

### **Integration Tests**

- [ ] Service-Hook-Component entegrasyonu test edildi mi?
- [ ] API entegrasyonu test edildi mi?
- [ ] State management test edildi mi?

## 📊 **Performance Kontrolleri**

### **Code Performance**

- [ ] Gereksiz re-render'lar önlendi mi? (`React.memo`, `useMemo`,
      `useCallback`)
- [ ] Lazy loading kullanıldı mı? (gerekirse)
- [ ] Bundle size optimize edildi mi?
- [ ] Memory leak'ler önlendi mi?

### **Network Performance**

- [ ] API çağrıları optimize edildi mi?
- [ ] Caching stratejisi uygulandı mı?
- [ ] Debouncing/throttling kullanıldı mı? (gerekirse)
- [ ] Pagination uygulandı mı? (büyük veri setleri için)

### **User Experience**

- [ ] Loading states eklendi mi?
- [ ] Skeleton loaders kullanıldı mı?
- [ ] Error boundaries eklendi mi?
- [ ] Offline handling düşünüldü mü?

## 🤖 **AI Entegrasyonu Kontrolleri**

### **AI Hook Kullanımı**

- [ ] `useAI` hook'u kullanıldı mı?
- [ ] Doğrudan AI API çağrısı yapılmadı mı?
- [ ] AI prompt'ları Türkçe mi?
- [ ] AI hata yönetimi eklendi mi?
- [ ] AI loading state'leri handle edildi mi?

### **AI Content Quality**

- [ ] AI çıktıları doğrulandı mı?
- [ ] AI çıktıları sanitize edildi mi?
- [ ] AI çıktıları kullanıcı dostu mu?
- [ ] AI fallback stratejisi var mı?

## 📱 **Mobil Optimizasyon Kontrolleri**

### **Mobile Performance**

- [ ] `useTouchDevice` hook'u kullanıldı mı?
- [ ] `useMobilePerformance` hook'u kullanıldı mı?
- [ ] Touch events optimize edildi mi?
- [ ] Mobile-specific optimizations uygulandı mı?

### **PWA Features**

- [ ] Offline functionality düşünüldü mü?
- [ ] Push notifications entegrasyonu var mı?
- [ ] App manifest güncellendi mi?

## 🔍 **Code Quality Kontrolleri**

### **TypeScript**

- [ ] Tüm tipler tanımlandı mı?
- [ ] `any` tipi kullanılmadı mı?
- [ ] Generic tipler doğru kullanıldı mı?
- [ ] Interface'ler export edildi mi?

### **Code Style**

- [ ] ESLint kurallarına uyuldu mu?
- [ ] Prettier formatlaması uygulandı mı?
- [ ] Import sıralaması doğru mu?
- [ ] Unused imports temizlendi mi?

### **Documentation**

- [ ] JSDoc yorumları eklendi mi?
- [ ] README güncellendi mi?
- [ ] API dokümantasyonu eklendi mi?
- [ ] Code comments eklendi mi?

## 🚫 **Yasaklı Desenler Kontrolleri**

### **Mimari İhlalleri**

- [ ] Doğrudan Supabase kullanımı yok mu?
- [ ] Mock data kullanımı yok mu?
- [ ] Console.log kullanımı yok mu?
- [ ] Hardcoded değerler yok mu?

### **Güvenlik İhlalleri**

- [ ] Hassas veri exposure'ı yok mu?
- [ ] XSS açıkları yok mu?
- [ ] CSRF açıkları yok mu?
- [ ] SQL injection açıkları yok mu?

### **Performance İhlalleri**

- [ ] Memory leak'ler yok mu?
- [ ] Infinite loop'lar yok mu?
- [ ] Gereksiz API çağrıları yok mu?
- [ ] Büyük bundle size'lar yok mu?

## 📋 **Final Kontroller**

### **Pre-commit Kontrolleri**

- [ ] `npm run lint:check` başarılı mı?
- [ ] `npm run type-check:app` başarılı mı?
- [ ] `npm run test` başarılı mı?
- [ ] `npm run build` başarılı mı?

### **Code Review Hazırlığı**

- [ ] Tüm değişiklikler commit edildi mi?
- [ ] Commit mesajları açıklayıcı mı?
- [ ] PR açıklaması yazıldı mı?
- [ ] Test sonuçları eklendi mi?

### **Deployment Hazırlığı**

- [ ] Environment variables güncellendi mi?
- [ ] Database migrations hazır mı?
- [ ] Feature flags ayarlandı mı?
- [ ] Monitoring alerts ayarlandı mı?

## 🎯 **Başarı Metrikleri**

### **Kod Kalitesi**

- [ ] Test coverage > 90%
- [ ] TypeScript strict mode uyumluluğu
- [ ] ESLint warnings = 0
- [ ] Performance score > 90

### **Geliştirme Hızı**

- [ ] İlk denemede doğru kod üretme oranı > 80%
- [ ] Prompt başına ortalama düzeltme sayısı < 2
- [ ] Mimari kurallara uygunluk oranı > 95%

### **Kullanıcı Deneyimi**

- [ ] Loading time < 3 saniye
- [ ] Error rate < 1%
- [ ] Accessibility score > 95
- [ ] Mobile performance score > 90

## 📝 **Kontrol Listesi Kullanımı**

### **Geliştirme Sırasında**

1. Her adımda ilgili kontrolleri yapın
2. Eksik olan maddeleri not alın
3. Tamamlanan maddeleri işaretleyin
4. Sorunları hemen düzeltin

### **Code Review Öncesi**

1. Tüm kontrolleri gözden geçirin
2. Eksik maddeleri tamamlayın
3. Test sonuçlarını kontrol edin
4. Dokümantasyonu güncelleyin

### **Deployment Öncesi**

1. Final kontrolleri yapın
2. Performance testleri çalıştırın
3. Security scan yapın
4. Backup planını hazırlayın

---

## 💡 **İpuçları**

### **Etkili Kullanım**

- Bu listeyi her geliştirme sürecinde kullanın
- Eksik maddeleri takım arkadaşlarınızla paylaşın
- Sürekli iyileştirme için feedback toplayın
- Yeni maddeler ekleyin (proje ihtiyaçlarına göre)

### **Otomasyon**

- Pre-commit hook'ları kurun
- CI/CD pipeline'ına entegre edin
- Automated testing ekleyin
- Code quality gates ayarlayın

Bu kontrol listesi, GitHub Copilot ile geliştirilen kodun kalitesini ve
tutarlılığını garanti eder.
