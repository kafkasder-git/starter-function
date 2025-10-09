# 🚀 GitHub Actions ile Otomatik Cloudflare Deployment

Bu rehber, GitHub commit'leriniz sonrası otomatik olarak Cloudflare Pages'e
deploy edilmesi için gerekli yapılandırmayı açıklar.

## 📋 Ön Gereksinimler

- [x] GitHub repository
- [x] Cloudflare hesabı
- [x] Cloudflare API Token
- [x] Supabase projesi

---

## 🔧 Adım 1: Cloudflare API Token Alma

### 1.1 Cloudflare Dashboard'a Gidin

1. https://dash.cloudflare.com adresine gidin
2. Hesabınızla giriş yapın

### 1.2 API Token Oluşturun

1. Sağ üst köşeden profil ikonuna tıklayın
2. **"My Profile"** > **"API Tokens"** sayfasına gidin
3. **"Create Token"** butonuna tıklayın
4. **"Create Custom Token"** seçin

### 1.3 Token Permissions Ayarlayın

**Token Adı:** `github-actions-kafkasder-panel`

**Permissions:**

- **Account** → Cloudflare Pages → **Edit**
- **Account** → Account Settings → **Read**

**Account Resources:**

- Include → **All accounts** (veya spesifik hesabınızı seçin)

5. **"Continue to summary"** butonuna tıklayın
6. **"Create Token"** ile onaylayın
7. **Token'ı kopyalayın** - Bu token sadece bir kez gösterilir!

### 1.4 Account ID'yi Alın

1. Cloudflare Dashboard ana sayfasında
2. Sağ tarafta **"Account ID"** gösterilir
3. Bu ID'yi kopyalayın

---

## 🔐 Adım 2: GitHub Secrets Ayarlama

### 2.1 GitHub Repository'ye Gidin

1. GitHub'da projenizin repository sayfasına gidin
2. **"Settings"** sekmesine tıklayın
3. Sol menüden **"Secrets and variables"** > **"Actions"** seçin

### 2.2 Secrets Ekleyin

**"New repository secret"** butonuna tıklayarak aşağıdaki secrets'ları ekleyin:

#### Cloudflare Secrets

**Secret 1:**

```
Name: CLOUDFLARE_API_TOKEN
Value: [Yukarıda aldığınız API token]
```

**Secret 2:**

```
Name: CLOUDFLARE_ACCOUNT_ID
Value: [Cloudflare Account ID]
```

#### Supabase Secrets

**Secret 3:**

```
Name: VITE_SUPABASE_URL
Value: https://gyburnfaszhxcxdnwogj.supabase.co
```

**Secret 4:**

```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5YnVybmZhc3poeGN4ZG53b2dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4ODI2ODMsImV4cCI6MjA3MzQ1ODY4M30.R-AD4ABGXGI1v_VoVqeRDVs9Wio-GJ0HUVRrP0iGG4k
```

#### Application Secrets (Opsiyonel)

**Secret 5:**

```
Name: VITE_APP_NAME
Value: Kafkasder Management System
```

**Secret 6:**

```
Name: VITE_APP_VERSION
Value: 1.0.0
```

### 2.3 Secrets'ları Kaydedin

Her secret'ı ekledikten sonra **"Add secret"** butonuna tıklayın.

---

## 📁 Adım 3: GitHub Actions Workflow Dosyası

### 3.1 Workflow Dosyası Oluşturuldu

`.github/workflows/deploy.yml` dosyası otomatik oluşturuldu. Bu dosya:

- ✅ Her `main` branch push'unda otomatik deploy yapar
- ✅ Pull request'lerde preview deploy yapar
- ✅ Supabase environment variables'ları kullanır
- ✅ Cloudflare Pages'e deploy eder

### 3.2 Workflow Özellikleri

```yaml
# Otomatik tetikleme
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

# Build environment variables
env:
  VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
  VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
  # ... diğer değişkenler
```

---

## 🚀 Adım 4: İlk Deployment

### 4.1 Kodu Commit ve Push Edin

```bash
git add .
git commit -m "feat: add GitHub Actions for automatic Cloudflare deployment"
git push origin main
```

### 4.2 GitHub Actions'ı İzleyin

1. GitHub repository sayfasında **"Actions"** sekmesine gidin
2. **"Deploy to Cloudflare Pages"** workflow'unu göreceksiniz
3. Workflow'un çalışmasını izleyin (2-3 dakika sürer)

### 4.3 Deployment URL'ini Alın

Workflow tamamlandığında:

1. **"Deploy to Cloudflare Pages"** job'una tıklayın
2. **"Deploy to Cloudflare Pages"** step'ine tıklayın
3. Deployment URL'ini göreceksiniz: `https://kafkasderpanel.pages.dev`

---

## ✅ Adım 5: Deployment Doğrulama

### 5.1 Uygulamayı Test Edin

1. Deployment URL'ini açın: `https://kafkasderpanel.pages.dev`
2. **F12** → Console
3. Supabase bağlantısını test edin:

```javascript
console.log(import.meta.env.VITE_SUPABASE_URL);
// Beklenen: https://gyburnfaszhxcxdnwogj.supabase.co
```

### 5.2 Login Test Edin

1. Login sayfasına gidin
2. Test kullanıcısı ile giriş yapmayı deneyin
3. Dashboard'un yüklendiğini kontrol edin

---

## 🔄 Otomatik Deployment Akışı

### Her Commit'te:

1. **GitHub** → Kod push edilir
2. **GitHub Actions** → Workflow tetiklenir
3. **Build** → `npm run build` çalışır (environment variables ile)
4. **Deploy** → `dist/` klasörü Cloudflare Pages'e yüklenir
5. **Live** → Uygulama otomatik güncellenir

### Pull Request'lerde:

- Preview deployment oluşturulur
- Ana site etkilenmez
- Test edilebilir

---

## 🐛 Sorun Giderme

### Hata 1: "Secrets not found"

**Çözüm:**

1. GitHub → Settings → Secrets and variables → Actions
2. Tüm secrets'ların eklendiğini kontrol edin
3. Secret isimlerinin doğru olduğunu kontrol edin

### Hata 2: "Cloudflare API token invalid"

**Çözüm:**

1. Cloudflare Dashboard'da yeni token oluşturun
2. GitHub secrets'ı güncelleyin
3. Workflow'u yeniden çalıştırın

### Hata 3: "Build failed"

**Çözüm:**

1. Actions sekmesinde build loglarını kontrol edin
2. Environment variables'ların doğru olduğunu kontrol edin
3. Local'de `npm run build` çalıştırıp test edin

### Hata 4: "Supabase connection failed"

**Çözüm:**

1. Supabase secrets'larının doğru olduğunu kontrol edin
2. Build loglarında environment variables'ların yüklendiğini kontrol edin
3. Supabase projesinin aktif olduğunu kontrol edin

---

## 📊 Deployment Durumu

### GitHub Actions'da İzleme:

1. **Repository** → **Actions** sekmesi
2. **"Deploy to Cloudflare Pages"** workflow'u
3. **Yeşil tik** = Başarılı deployment
4. **Kırmızı X** = Hata (logları kontrol edin)

### Cloudflare Dashboard'da İzleme:

1. **Workers & Pages** → **kafkasderpanel** projesi
2. **Deployments** sekmesi
3. Son deployment'ı görebilirsiniz

---

## 🔗 Faydalı Linkler

- **GitHub Actions Docs:** https://docs.github.com/en/actions
- **Cloudflare Pages Action:** https://github.com/cloudflare/pages-action
- **Supabase Environment Variables:**
  https://supabase.com/docs/guides/environment-variables

---

## 💡 İpuçları

1. **Environment Variables:** GitHub secrets'ları değiştirdikten sonra workflow
   otomatik yeniden çalışır

2. **Preview Deployments:** Pull request'lerde otomatik preview oluşturulur

3. **Build Cache:** Node.js dependencies cache'lenir, daha hızlı build

4. **Security:** Secrets'lar GitHub'da şifrelenir, güvenli

5. **Monitoring:** Her deployment'ın loglarını GitHub Actions'da görebilirsiniz

---

## 🎉 Başarılı Kurulum Checklist

- [ ] Cloudflare API token alındı
- [ ] Cloudflare Account ID alındı
- [ ] GitHub secrets eklendi (6 adet)
- [ ] `.github/workflows/deploy.yml` oluşturuldu
- [ ] Kod commit edildi ve push edildi
- [ ] GitHub Actions workflow çalıştı
- [ ] Cloudflare Pages'de deployment oluştu
- [ ] Uygulama açıldı ve test edildi
- [ ] Supabase bağlantısı çalışıyor ✅
- [ ] Login fonksiyonu test edildi ✅

---

**Sonraki Adım:** Kodunuzu commit edip push edin, otomatik deployment
başlayacak! 🚀

**Deployment URL:** `https://kafkasderpanel.pages.dev`

---

**Son Güncelleme:** Ekim 2025  
**Versiyon:** 1.0.0  
**Durum:** Production Ready ✅
