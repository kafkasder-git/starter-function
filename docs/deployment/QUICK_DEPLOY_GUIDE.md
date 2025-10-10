# 🚀 Hızlı Deployment Rehberi

Kafkasder Management System için kapsamlı Cloudflare Pages deployment rehberi.

## 📋 İçindekiler

1. [Deployment Yöntemleri](#deployment-yöntemleri)
2. [Environment Variables](#environment-variables)
3. [Custom Domain Setup](#custom-domain-setup)
4. [SSL/TLS Configuration](#ssltls-configuration)
5. [Test ve Doğrulama](#test-ve-doğrulama)
6. [Troubleshooting](#troubleshooting)
7. [Deployment Checklist](#deployment-checklist)
8. [Faydalı Linkler](#faydalı-linkler)

---

## Deployment Yöntemleri

### Yöntem 1: GitHub + Cloudflare Pages (ÖNERİLEN)

Bu yöntem en kolay ve otomatik deployment sağlar.

#### Adım 1: GitHub'a Push

```bash
git add .
git commit -m "Deploy to Cloudflare Pages"
git push origin main
```

#### Adım 2: Cloudflare Pages'de Proje Oluştur

1. **Cloudflare Pages'e gidin:** https://dash.cloudflare.com/pages
2. **"Create a project"** butonuna tıklayın
3. **"Connect to Git"** seçeneğini seçin
4. **GitHub'ı bağlayın** (authorize edin)
5. **Repository seçin:** `panel-7`
6. **Build ayarları:**

```
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: /
Node version: 20
```

7. **Environment variables ekleyin:** (detaylı liste aşağıda)

8. **"Save and Deploy"** butonuna tıklayın

#### Adım 3: Deployment Bekleme

- ⏱️ Build süresi: ~2-5 dakika
- 🔗 Deploy URL: `https://kafkasder-panel.pages.dev`
- ✅ Her Git push otomatik deploy olacak

---

### Yöntem 2: Wrangler CLI ile Deploy

#### API Token Gereksinimleri

Token şu izinlere sahip olmalı:

1. **Account → Cloudflare Pages → Edit** ✅
2. **User → User Details → Read** ✅

#### Doğru Token Oluşturma

1. https://dash.cloudflare.com/profile/api-tokens
2. "Create Token"
3. "Create Custom Token"
4. **Token name:** `pages-deploy`
5. **Permissions:**
   - Account → Cloudflare Pages → Edit
   - User → User Details → Read
6. **Account Resources:** All accounts
7. "Continue to summary" → "Create Token"
8. Token'ı kopyalayın

#### Deploy Komutu

```bash
# Terminal'de
export CLOUDFLARE_API_TOKEN="your_new_token_here"
cd /Users/mac/panel-7
npm run deploy:prod
```

---

### Yöntem 3: Drag & Drop (Manuel)

En basit ama manuel yöntem:

1. **Build yapın:**

```bash
cd /Users/mac/panel-7
npm run build
```

2. **Cloudflare Pages'e gidin:** https://dash.cloudflare.com/pages

3. **"Upload assets"** seçeneğini seçin

4. **`dist` klasörünü** sürükle-bırak yapın

5. **Project name:** `kafkasder-panel`

6. **Deploy!**

---

## 🎯 Hangi Yöntemi Seçmeliyim?

### Git Integration (Yöntem 1) - ⭐ ÖNERİLEN

**Artıları:**

- ✅ Otomatik deployment (her push'ta)
- ✅ Preview deployments (her PR için)
- ✅ Rollback kolay
- ✅ CI/CD entegrasyonu
- ✅ Token gerekmez

**Eksileri:**

- ❌ GitHub repository gerekli

### Wrangler CLI (Yöntem 2)

**Artıları:**

- ✅ Komut satırından hızlı deploy
- ✅ CI/CD pipeline'lara entegre edilebilir
- ✅ Preview ve production ortamları

**Eksileri:**

- ❌ API token gerekli
- ❌ Manuel deployment

### Drag & Drop (Yöntem 3)

**Artıları:**

- ✅ En basit
- ✅ Token gerekmez

**Eksileri:**

- ❌ Tamamen manuel
- ❌ Otomatik deployment yok
- ❌ Her güncelleme için tekrar upload

---

## Environment Variables

### Dashboard Üzerinden Ayarlama

1. Cloudflare Pages Dashboard'da projenizi açın
2. **"Settings"** > **"Environment variables"** sayfasına gidin
3. Her environment variable için:
   - Variable name girin
   - Value girin
   - Environment seçin (Production, Preview, veya Both)
4. **"Save"** butonuna tıklayın

### Zorunlu Environment Variables

#### Supabase Configuration

```env
# Zorunlu - Supabase Connection
VITE_SUPABASE_URL=https://gyburnfaszhxcxdnwogj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Application Configuration

```env
# Application Info
VITE_APP_NAME=Kafkasder Management System
VITE_APP_VERSION=1.0.0
VITE_APP_DEBUG=false
```

### Feature Flags

```env
# Features
VITE_ENABLE_OCR=true
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_OFFLINE_MODE=true
```

### Security Settings

```env
# Security
VITE_SESSION_TIMEOUT=3600
VITE_RATE_LIMIT=100
```

### Opsiyonel - Sentry Configuration

```env
# Error Monitoring (Opsiyonel)
VITE_SENTRY_DSN=your_sentry_dsn
```

**⚠️ Önemli:** Environment variable değiştirdikten sonra mutlaka yeniden deploy
edin!

---

## Custom Domain Setup

### Adım 1: Domain Ekleyin

1. Cloudflare Pages Dashboard'da projenizi açın
2. **"Custom domains"** sekmesine gidin
3. **"Set up a custom domain"** butonuna tıklayın
4. Domain adınızı girin (örn: `panel.kafkasder.org`)
5. **"Continue"** butonuna tıklayın

### Adım 2: DNS Ayarları

Cloudflare otomatik olarak DNS kayıtlarını oluşturacaktır:

**A Record:**

```
Type: A
Name: panel
IPv4: Cloudflare Pages IP
Proxy: ✅ Proxied
```

**CNAME Record:**

```
Type: CNAME
Name: panel
Target: kafkasder-panel.pages.dev
Proxy: ✅ Proxied
```

### Adım 3: Doğrulama

1. DNS propagation bekleyin (2-48 saat)
2. `https://panel.kafkasder.org` adresini test edin
3. SSL sertifikası otomatik oluşturulacak

---

## SSL/TLS Configuration

### Adım 1: SSL/TLS Mode Ayarlayın

1. Cloudflare Dashboard > **SSL/TLS** > **Overview** sayfasına gidin
2. SSL/TLS encryption mode'u seçin:
   - **Full (strict)** - ✅ Önerilen
   - Full - Alternatif
   - Flexible - Önerilmez

### Adım 2: Edge Certificates Ayarları

1. **SSL/TLS** > **Edge Certificates** sayfasına gidin
2. Aşağıdaki ayarları aktif edin:
   - ✅ **Always Use HTTPS:** ON
   - ✅ **Automatic HTTPS Rewrites:** ON
   - ✅ **Minimum TLS Version:** 1.2 veya 1.3

### Adım 3: HSTS (Opsiyonel)

1. **SSL/TLS** > **Edge Certificates** sayfasında
2. **HTTP Strict Transport Security (HSTS)** bölümünü genişletin
3. HSTS'i aktif edin:
   - Max Age: 6 months
   - Include subdomains: ✅
   - Preload: ✅

**⚠️ Dikkat:** HSTS'i aktif etmeden önce tüm içeriğin HTTPS olduğundan emin
olun!

---

## Test ve Doğrulama

### Build Test

```bash
# Yerel build testi
npm run build
npm run preview
```

### Deployment Test

```bash
# Production deploy
npm run deploy:prod

# Deployment URL'i test edin
curl https://kafkasder-panel.pages.dev
```

### Functionality Test

#### 1. Authentication Test

- Login sayfasını açın
- Test kullanıcısı ile giriş yapın
- Dashboard'un yüklendiğini kontrol edin

#### 2. API Connection Test

- Browser console'u açın (F12)
- Network tab'ını kontrol edin
- Supabase API çağrılarının başarılı olduğunu doğrulayın

#### 3. PWA Test

- Chrome DevTools'u açın
- Application > Service Workers
- Service Worker'ın aktif olduğunu kontrol edin

### Performance Test

```bash
# Lighthouse audit
npm run lighthouse

# Bundle size analizi
npm run analyze
```

---

## Troubleshooting

### Build Hataları

#### Hata: "Cannot find module"

**Çözüm:**

```bash
# Dependencies yeniden yükleyin
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Hata: "Out of memory"

**Çözüm:**

```bash
# Node memory limit artırın
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Deployment Hataları

#### Hata: "Unauthorized" veya "Invalid API Token"

**Çözüm:**

1. API Token'ın doğru olduğunu kontrol edin
2. Token'ın expire olmadığını kontrol edin
3. Token permissions'larını kontrol edin
4. Yeni token oluşturun ve tekrar deneyin

```bash
# Token'ı tekrar ayarlayın
export CLOUDFLARE_API_TOKEN="new_token"
npm run deploy:prod
```

#### Hata: "Project not found"

**Çözüm:**

1. Cloudflare Dashboard'da proje adını kontrol edin
2. `wrangler.toml` dosyasında proje adını güncelleyin
3. Veya deploy komutunda proje adını belirtin

```bash
npx wrangler pages deploy dist --project-name=your-project-name
```

### Environment Variables Sorunları

#### Değişkenler Çalışmıyor

**Çözüm:**

1. Değişken adlarının `VITE_` ile başladığını kontrol edin
2. Cloudflare Dashboard'da environment variables'ları kontrol edin
3. Production/Preview environment'ı doğru seçin
4. Değişkenleri ekledikten sonra yeniden deploy edin

```bash
# Yeniden deploy
npm run deploy:prod
```

### Supabase Bağlantı Sorunları

#### Hata: "Failed to fetch" veya "CORS error"

**Çözüm:**

1. Supabase Dashboard > Settings > API
2. URL ve Keys'leri kontrol edin
3. CORS ayarlarını kontrol edin
4. Cloudflare'de environment variables'ları kontrol edin

#### Hata: "Invalid JWT" veya "JWT expired"

**Çözüm:**

1. Supabase anon key'i yenileyin
2. `.env.local` ve Cloudflare environment variables'ları güncelleyin
3. Yeniden deploy edin

### 404 Errors on Refresh

#### SPA Routing Sorunu

**Çözüm:** `wrangler.toml` dosyasında redirect kuralı tanımlı. Eğer
çalışmıyorsa:

1. Cloudflare Dashboard > Pages > Settings > Redirects/Rewrites
2. Aşağıdaki rule'u ekleyin:

```
Source path: /*
Destination: /index.html
Status: 200
```

### Performance Sorunları

#### Büyük Bundle Size

```bash
# Bundle analizi
npm run analyze

# Optimize et
npm run build
```

#### Yavaş Loading

**Çözüm:**

1. Cloudflare Cache ayarlarını optimize edin
2. Service Worker caching'i aktif edin
3. Image optimization kullanın
4. Code splitting yapın

---

## 🔍 Deployment Status Kontrol

### Cloudflare Dashboard'dan

1. https://dash.cloudflare.com/pages
2. Projenizi seçin
3. "Deployments" tab'ında status görün:
   - 🟢 Success
   - 🔴 Failed
   - 🟡 Building

### Build Logs

1. Failed deployment'a tıklayın
2. "View build logs" linkine tıklayın
3. Hata mesajlarını inceleyin

---

## Deployment Checklist

### Pre-Deployment Checklist

Deployment öncesi kontrol listesi:

- [ ] Supabase projesi oluşturuldu
- [ ] API keys alındı
- [ ] `.env.local` dosyası yapılandırıldı
- [ ] Build başarılı (`npm run build`)
- [ ] Cloudflare hesabı oluşturuldu
- [ ] API Token alındı (Wrangler CLI için)
- [ ] Environment variables Cloudflare'de ayarlandı
- [ ] Test ve doğrulama yapıldı

### Post-Deployment Verification

Deploy başarılı olduysa:

- [ ] Deployment status: Success ✅
- [ ] URL erişilebilir: https://kafkasder-panel.pages.dev
- [ ] Login sayfası açılıyor
- [ ] Supabase bağlantısı çalışıyor
- [ ] Dashboard yükleniyor
- [ ] PWA aktif (Service Worker)
- [ ] Custom domain eklendi (opsiyonel)
- [ ] SSL/TLS aktif ve çalışıyor

---

## Faydalı Linkler

### Cloudflare Resources

- **Cloudflare Pages Dashboard:** https://dash.cloudflare.com/pages
- **API Tokens:** https://dash.cloudflare.com/profile/api-tokens
- **Cloudflare Pages Docs:** https://developers.cloudflare.com/pages/
- **Git Integration Guide:**
  https://developers.cloudflare.com/pages/get-started/git-integration/
- **Wrangler CLI Docs:** https://developers.cloudflare.com/workers/wrangler/
- **Custom Domains:**
  https://developers.cloudflare.com/pages/how-to/custom-domains/
- **Environment Variables:**
  https://developers.cloudflare.com/pages/configuration/build-configuration/

### Supabase Resources

- **Supabase Docs:** https://supabase.com/docs
- **Supabase JavaScript Client:**
  https://supabase.com/docs/reference/javascript/introduction

### API Token Oluşturma

- **Create Token:**
  https://developers.cloudflare.com/fundamentals/api/get-started/create-token/
- **API Token Management:** https://dash.cloudflare.com/profile/api-tokens

---

## 🆘 Destek

Sorun yaşıyorsanız:

1. Bu dokümandaki **"Troubleshooting"** bölümünü kontrol edin
2. [Cloudflare Community](https://community.cloudflare.com/) forumlarına bakın
3. GitHub Issues'da yeni bir issue açın
4. Cloudflare Support ile iletişime geçin

---

**Önerilen Yöntem:** Git Integration (Yöntem 1) - Otomatik deployment **En
Hızlı:** Drag & Drop (Yöntem 3) - Manuel upload **En Profesyonel:** Wrangler CLI
(Yöntem 2) - CI/CD entegrasyonu

**Son Güncelleme:** Ekim 2025 **Versiyon:** 2.0.0 **Durum:** Production Ready ✅
