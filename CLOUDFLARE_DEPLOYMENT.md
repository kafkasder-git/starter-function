# ☁️ Cloudflare Pages Deployment Rehberi

Dernek Yönetim Sistemi için Cloudflare Pages deployment rehberi.

## 📋 İçindekiler

1. [Cloudflare Hesabı Oluşturma](#1-cloudflare-hesabı-oluşturma)
2. [API Token Alma](#2-api-token-alma)
3. [Deployment Yöntemleri](#3-deployment-yöntemleri)
4. [Environment Variables Ayarlama](#4-environment-variables-ayarlama)
5. [Custom Domain Ayarlama](#5-custom-domain-ayarlama)
6. [Test ve Doğrulama](#6-test-ve-doğrulama)
7. [Sorun Giderme](#7-sorun-giderme)

---

## 1. Cloudflare Hesabı Oluşturma

1. [Cloudflare Pages](https://pages.cloudflare.com) adresine gidin
2. "Sign Up" butonuna tıklayın
3. Email ve şifre ile hesap oluşturun
4. Email doğrulaması yapın

---

## 2. API Token Alma

### Yöntem A: Dashboard'dan Token Oluşturma

1. Cloudflare Dashboard'a gidin: https://dash.cloudflare.com
2. Sağ üst köşeden profil ikonuna tıklayın
3. **"My Profile"** > **"API Tokens"** sayfasına gidin
4. **"Create Token"** butonuna tıklayın
5. **"Cloudflare Pages"** template'ini seçin veya Custom Token oluşturun

**Custom Token İçin Gerekli Permissions:**

- **Account** - Cloudflare Pages: Edit
- **Zone** - Zone: Read
- **Zone** - DNS: Edit (Custom domain için)

6. Token'ı kopyalayın (bir daha gösterilmeyecek!)

### Yöntem B: Quick Setup

1. https://dash.cloudflare.com/profile/api-tokens adresine gidin
2. "Create Token" > "Create Custom Token"
3. Aşağıdaki ayarları yapın:
   - **Token name:** `kafkasder-panel-deploy`
   - **Permissions:**
     - Account → Cloudflare Pages → Edit
   - **Account Resources:**
     - Include → All accounts (veya belirli hesabınızı seçin)

4. "Continue to summary" > "Create Token"
5. Token'ı güvenli bir yere kaydedin

---

## 3. Deployment Yöntemleri

### Yöntem 1: Wrangler CLI ile Deploy (Önerilen)

#### Adım 1: API Token'ı Ayarlayın

```bash
# Terminal'de API token'ı environment variable olarak ayarlayın
export CLOUDFLARE_API_TOKEN="your_api_token_here"
```

veya `.env.local` dosyasına ekleyin:

```env
CLOUDFLARE_API_TOKEN=your_api_token_here
```

#### Adım 2: Build ve Deploy

```bash
# Build yapın
npm run build

# Deploy edin
npm run deploy:prod
```

Veya tek komutla:

```bash
# Build ve deploy
npm run build && npm run deploy:prod
```

### Yöntem 2: Git Integration ile Deploy

Bu yöntem ile her Git push otomatik olarak deploy edilir.

#### Adım 1: Repository'yi GitHub'a Push Edin

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### Adım 2: Cloudflare Pages'de Proje Oluşturun

1. [Cloudflare Pages Dashboard](https://dash.cloudflare.com/pages) gidin
2. **"Create a project"** butonuna tıklayın
3. **"Connect to Git"** seçeneğini seçin
4. GitHub hesabınızı bağlayın
5. Repository'nizi seçin (`panel-7`)
6. Build ayarlarını yapın:

**Build Configuration:**

```
Framework preset: None (veya Vite)
Build command: npm run build
Build output directory: dist
Root directory: /
```

**Environment Variables:**

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_APP_NAME=Dernek Yönetim Sistemi
VITE_APP_VERSION=1.0.0
```

7. **"Save and Deploy"** butonuna tıklayın

#### Adım 3: İlk Deployment'ı Bekleyin

- Build süresi: ~2-3 dakika
- Deploy URL'i otomatik oluşturulacak: `kafkasder-panel.pages.dev`

---

## 4. Environment Variables Ayarlama

### Dashboard Üzerinden

1. Cloudflare Pages Dashboard'da projenizi açın
2. **"Settings"** > **"Environment variables"** sayfasına gidin
3. Her environment variable için:
   - Variable name girin
   - Value girin
   - Environment seçin (Production, Preview, veya Both)
4. **"Save"** butonuna tıklayın

### Gerekli Environment Variables

```env
# Zorunlu - Supabase Configuration
VITE_SUPABASE_URL=https://gyburnfaszhxcxdnwogj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application Configuration
VITE_APP_NAME=Dernek Yönetim Sistemi
VITE_APP_VERSION=1.0.0
VITE_APP_DEBUG=false

# Feature Flags
VITE_ENABLE_OCR=true
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_OFFLINE_MODE=true

# Security
VITE_SESSION_TIMEOUT=3600
VITE_RATE_LIMIT=100

# Opsiyonel - Sentry
VITE_SENTRY_DSN=your_sentry_dsn
```

### Wrangler.toml ile (Yerel Development için)

`wrangler.toml` dosyasında `[vars]` bölümünde tanımlı değişkenler sadece local
development için kullanılır.

**⚠️ Güvenlik Uyarısı:** Production secrets'ları `wrangler.toml` dosyasına
yazmayın! Dashboard'dan ayarlayın.

---

## 5. Custom Domain Ayarlama

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

### Adım 3: SSL/TLS Ayarları

1. **SSL/TLS** > **Overview** sayfasına gidin
2. SSL/TLS encryption mode'u seçin:
   - **Full (strict)** - Önerilen
3. **Edge Certificates** sayfasında:
   - ✅ Always Use HTTPS: ON
   - ✅ Automatic HTTPS Rewrites: ON
   - ✅ Minimum TLS Version: 1.2

---

## 6. Test ve Doğrulama

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

1. **Authentication Test**
   - Login sayfasını açın
   - Test kullanıcısı ile giriş yapın
   - Dashboard'un yüklendiğini kontrol edin

2. **API Connection Test**
   - Browser console'u açın (F12)
   - Network tab'ını kontrol edin
   - Supabase API çağrılarının başarılı olduğunu doğrulayın

3. **PWA Test**
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

## 7. Sorun Giderme

### Build Hataları

#### Hata: "Cannot find module"

```bash
# Çözüm: Dependencies yeniden yükleyin
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Hata: "Out of memory"

```bash
# Çözüm: Node memory limit artırın
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

## 🚀 Hızlı Deployment Komutları

### İlk Kez Deploy

```bash
# 1. API Token ayarlayın
export CLOUDFLARE_API_TOKEN="your_token"

# 2. Build yapın
npm run build

# 3. Deploy edin
npm run deploy:prod
```

### Güncelleme Deploy

```bash
# Build ve deploy
npm run build && npm run deploy:prod
```

### Preview Deploy

```bash
# Preview branch deploy
npm run cloudflare:deploy
```

---

## 📊 Deployment Checklist

Deployment öncesi kontrol listesi:

- [ ] Supabase projesi oluşturuldu
- [ ] API keys alındı
- [ ] `.env.local` dosyası yapılandırıldı
- [ ] Build başarılı (`npm run build`)
- [ ] Cloudflare hesabı oluşturuldu
- [ ] API Token alındı
- [ ] Environment variables Cloudflare'de ayarlandı
- [ ] Deploy başarılı
- [ ] Custom domain eklendi (opsiyonel)
- [ ] SSL/TLS aktif
- [ ] Test ve doğrulama yapıldı

---

## 🔗 Faydalı Linkler

- **Cloudflare Pages Docs:** https://developers.cloudflare.com/pages/
- **Wrangler CLI Docs:** https://developers.cloudflare.com/workers/wrangler/
- **API Token Oluşturma:**
  https://developers.cloudflare.com/fundamentals/api/get-started/create-token/
- **Custom Domains:**
  https://developers.cloudflare.com/pages/how-to/custom-domains/
- **Environment Variables:**
  https://developers.cloudflare.com/pages/configuration/build-configuration/
- **Supabase Docs:** https://supabase.com/docs

---

## 🆘 Destek

Sorun yaşıyorsanız:

1. Bu dokümandaki "Sorun Giderme" bölümünü kontrol edin
2. [Cloudflare Community](https://community.cloudflare.com/) forumlarına bakın
3. GitHub Issues'da yeni bir issue açın
4. Cloudflare Support ile iletişime geçin

---

**Son Güncelleme:** Ekim 2025  
**Versiyon:** 1.0.0  
**Durum:** Production Ready ✅
