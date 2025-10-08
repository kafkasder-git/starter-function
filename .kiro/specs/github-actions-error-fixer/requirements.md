# Requirements Document

## Introduction

Bu özellik, GitHub push ve Cloudflare deploy işlemleri sırasında GitHub
Actions'tan gelen hataları otomatik olarak tespit edip analiz eden ve düzeltme
önerileri sunan bir sistem geliştirecektir. Sistem, CI/CD pipeline'larında
oluşan hataları yakalar, kategorize eder ve geliştiricilere anlaşılır çözüm
önerileri sunar.

## Requirements

### Requirement 1: GitHub Actions Hata Tespiti

**User Story:** Geliştirici olarak, GitHub Actions workflow'larımda oluşan
hataları otomatik olarak tespit edebilmek istiyorum, böylece hangi adımda ne tür
bir hata oluştuğunu hızlıca görebilirim.

#### Acceptance Criteria

1. WHEN bir GitHub Actions workflow başarısız olduğunda THEN sistem hata
   loglarını otomatik olarak toplamalıdır
2. WHEN hata logları toplandığında THEN sistem hataları kategorilere ayırmalıdır
   (lint, type-check, build, deploy, security)
3. WHEN bir hata tespit edildiğinde THEN sistem hatanın oluştuğu dosya ve satır
   numarasını belirlemelidir
4. IF birden fazla hata varsa THEN sistem hataları öncelik sırasına göre
   sıralamalıdır
5. WHEN hata analizi tamamlandığında THEN sistem sonuçları yapılandırılmış bir
   formatta sunmalıdır

### Requirement 2: Hata Kategorilendirme ve Analiz

**User Story:** Geliştirici olarak, tespit edilen hataların türlerini ve
nedenlerini anlayabilmek istiyorum, böylece hangi tür sorunlarla karşılaştığımı
görebilirim.

#### Acceptance Criteria

1. WHEN bir ESLint hatası tespit edildiğinde THEN sistem hatanın kuralını ve
   açıklamasını göstermelidir
2. WHEN bir TypeScript type hatası tespit edildiğinde THEN sistem tip
   uyumsuzluğunu ve beklenen tipi göstermelidir
3. WHEN bir build hatası tespit edildiğinde THEN sistem eksik bağımlılıkları
   veya yapılandırma sorunlarını belirlemelidir
4. WHEN bir Cloudflare deploy hatası tespit edildiğinde THEN sistem API token,
   account ID veya proje yapılandırma sorunlarını kontrol etmelidir
5. IF bir güvenlik hatası tespit edilirse THEN sistem güvenlik açığının
   ciddiyetini ve etkilenen paketleri göstermelidir

### Requirement 3: Otomatik Düzeltme Önerileri

**User Story:** Geliştirici olarak, tespit edilen hatalar için otomatik düzeltme
önerileri almak istiyorum, böylece hataları hızlıca çözebilirim.

#### Acceptance Criteria

1. WHEN bir lint hatası tespit edildiğinde THEN sistem otomatik düzeltme komutu
   önermelidir (örn: npm run lint:fix)
2. WHEN bir format hatası tespit edildiğinde THEN sistem otomatik format komutu
   önermelidir (örn: npm run format)
3. WHEN bir bağımlılık hatası tespit edildiğinde THEN sistem eksik paketlerin
   kurulum komutlarını önermelidir
4. WHEN bir environment variable hatası tespit edildiğinde THEN sistem eksik
   değişkenleri ve örnek değerleri göstermelidir
5. IF hata otomatik düzeltilebilirse THEN sistem düzeltme scriptini çalıştırma
   seçeneği sunmalıdır

### Requirement 4: Workflow Yapılandırma Kontrolü

**User Story:** Geliştirici olarak, GitHub Actions workflow dosyalarımın doğru
yapılandırıldığından emin olmak istiyorum, böylece deploy öncesi potansiyel
sorunları tespit edebilirim.

#### Acceptance Criteria

1. WHEN workflow dosyaları kontrol edildiğinde THEN sistem gerekli secret'ların
   tanımlı olup olmadığını kontrol etmelidir
2. WHEN Cloudflare deploy yapılandırması kontrol edildiğinde THEN sistem
   CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID ve projectName değerlerini
   doğrulamalıdır
3. WHEN build adımı kontrol edildiğinde THEN sistem environment variable'ların
   doğru şekilde geçildiğini kontrol etmelidir
4. IF continue-on-error: true kullanılıyorsa THEN sistem bu adımların başarısız
   olabileceği konusunda uyarı vermelidir
5. WHEN Node.js versiyonu kontrol edildiğinde THEN sistem tüm workflow'larda
   aynı versiyonun kullanıldığını doğrulamalıdır

### Requirement 5: Hata Raporlama ve İzleme

**User Story:** Geliştirici olarak, geçmiş hataları ve düzeltmeleri görebilmek
istiyorum, böylece tekrarlayan sorunları tespit edebilirim.

#### Acceptance Criteria

1. WHEN bir hata düzeltildiğinde THEN sistem düzeltme işlemini kaydetmelidir
2. WHEN hata geçmişi sorgulandığında THEN sistem en sık karşılaşılan hataları
   göstermelidir
3. WHEN bir workflow başarısız olduğunda THEN sistem benzer geçmiş hataları ve
   çözümlerini önermelidir
4. IF aynı hata tekrar ediyorsa THEN sistem bu durumu vurgulamalı ve kalıcı
   çözüm önermelidir
5. WHEN raporlama yapıldığında THEN sistem hata trendlerini ve iyileşme
   metriklerini göstermelidir

### Requirement 6: Cloudflare Pages Özel Kontroller

**User Story:** Geliştirici olarak, Cloudflare Pages deploy işlemlerine özel
hata kontrolü yapmak istiyorum, böylece Cloudflare'e özgü sorunları hızlıca
çözebilirim.

#### Acceptance Criteria

1. WHEN Cloudflare deploy başarısız olduğunda THEN sistem API token
   geçerliliğini kontrol etmelidir
2. WHEN build output kontrol edildiğinde THEN sistem dist/ klasörünün doğru
   oluşturulduğunu doğrulamalıdır
3. WHEN Cloudflare Pages yapılandırması kontrol edildiğinde THEN sistem proje
   adının doğru olduğunu kontrol etmelidir
4. IF \_headers veya \_redirects dosyası varsa THEN sistem bu dosyaların geçerli
   olduğunu kontrol etmelidir
5. WHEN deploy tamamlandığında THEN sistem deploy URL'ini ve önizleme linkini
   göstermelidir

### Requirement 7: Entegrasyon ve Bildirimler

**User Story:** Geliştirici olarak, hata tespiti ve düzeltme sürecini IDE
içinden yönetebilmek istiyorum, böylece farklı araçlar arasında geçiş yapmama
gerek kalmasın.

#### Acceptance Criteria

1. WHEN bir GitHub Actions hatası tespit edildiğinde THEN sistem IDE içinde
   bildirim göstermelidir
2. WHEN bildirime tıklandığında THEN sistem hata detaylarını ve düzeltme
   önerilerini göstermelidir
3. WHEN düzeltme önerileri sunulduğunda THEN sistem tek tıkla düzeltme uygulama
   seçeneği sunmalıdır
4. IF düzeltme başarılı olursa THEN sistem otomatik commit ve push seçeneği
   sunmalıdır
5. WHEN işlem tamamlandığında THEN sistem özet rapor göstermelidir
