# 🚀 Cloudflare Pages Manuel Deployment Rehberi

Bu rehber, Kafkasder Management System'ı Cloudflare Pages'e manuel olarak deploy
etmek için adım adım talimatlar içerir.

## 📋 Ön Gereksinimler

- [x] Node.js 20+ yüklü
- [x] npm yüklü
- [x] Cloudflare hesabı
- [x] Cloudflare API Token
- [x] Supabase projesi yapılandırılmış

---

## 🔧 Adım 1: Cloudflare API Token Alma

### 1.1 Cloudflare Dashboard'a Giriş Yapın

1. https://dash.cloudflare.com adresine gidin
2. Hesabınızla giriş yapın

### 1.2 API Token Oluşturun

1. Sağ üst köşeden profil ikonuna tıklayın
2. **"My Profile"** > **"API Tokens"** sayfasına gidin
3. **"Create Token"** butonuna tıklayın
4. **"Create Custom Token"** seçin

### 1.3 Token Permissions Ayarlayın

**Token Adı:** `kafkasder-panel-deploy`

**Permissions:**

- **Account** → Cloudflare Pages → **Edit**
- **Account** → Account Settings → **Read**

**Account Resources:**

- Include → **All accounts** (veya spesifik hesabınızı seçin)

**Client IP Address Filtering:** (opsiyonel)

- Is in → Tüm IP'ler için boş bırakın

5. **"Continue to summary"** butonuna tıklayın
6. **"Create Token"** ile onaylayın
7. **Token'ı kopyalayın** - Bu token sadece bir kez gösterilir!

### 1.4 Token'ı Kaydedin

Token'ı güvenli bir yerde saklayın. Daha sonra kullanacaksınız.

```
Örnek: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🌐 Adım 2: Cloudflare Pages Projesi Oluşturma

### 2.1 Pages Dashboard'a Gidin

1. Cloudflare Dashboard'da sol menüden **"Workers & Pages"** seçin
2. **"Create application"** butonuna tıklayın
3. **"Pages"** sekmesini seçin
4. **"Create using direct upload"** seçin

### 2.2 Proje Bilgilerini Girin

**Project name:** `kafkasderpanel`

> ⚠️ **Önemli:** Proje adı `wrangler.toml` dosyasındaki `name` değeri ile aynı
> olmalı!

**Production branch:** `main` (veya `master`)

5. **"Create project"** butonuna tıklayın

---

## ⚙️ Adım 3: Environment Variables Ayarlama

### 3.1 Settings Sayfasına Gidin

1. Yeni oluşturduğunuz projeye tıklayın
2. **"Settings"** sekmesine gidin
3. Sol menüden **"Environment variables"** seçin

### 3.2 Production Variables Ekleyin

**"Production" tabına geçin** ve aşağıdaki değişkenleri tek tek ekleyin:

#### Supabase Configuration

**Variable 1:**

```
Variable name: VITE_SUPABASE_URL
Value: https://gyburnfaszhxcxdnwogj.supabase.co
Type: Text
Environment: Production
```

**Variable 2:**

```
Variable name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5YnVybmZhc3poeGN4ZG53b2dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4ODI2ODMsImV4cCI6MjA3MzQ1ODY4M30.R-AD4ABGXGI1v_VoVqeRDVs9Wio-GJ0HUVRrP0iGG4k
Type: Text (Encrypted olarak işaretleyin)
Environment: Production
```

#### Application Configuration

**Variable 3:**

```
Variable name: VITE_APP_NAME
Value: Kafkasder Management System
Type: Text
Environment: Production
```

**Variable 4:**

```
Variable name: VITE_APP_VERSION
Value: 1.0.0
Type: Text
Environment: Production
```

**Variable 5:**

```
Variable name: VITE_APP_DEBUG
Value: false
Type: Text
Environment: Production
```

#### Node Version

**Variable 6:**

```
Variable name: NODE_VERSION
Value: 20
Type: Text
Environment: Production
```

#### Feature Flags (Opsiyonel)

```
VITE_ENABLE_OCR=true
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_OFFLINE_MODE=true
```

### 3.3 Değişkenleri Kaydedin

Her değişkeni ekledikten sonra **"Save"** butonuna tıklayın.

> 💡 **Not:** Environment variable'lar ekledikten sonra yeniden deploy yapmanız
> gerekir.

---

## 🔐 Adım 4: Local Environment Setup

### 4.1 API Token'ı Environment'a Ekleyin

**Windows (PowerShell):**

```powershell
$env:CLOUDFLARE_API_TOKEN="your_api_token_here"
```

**Windows (CMD):**

```cmd
set CLOUDFLARE_API_TOKEN=your_api_token_here
```

**Linux/Mac:**

```bash
export CLOUDFLARE_API_TOKEN="your_api_token_here"
```

### 4.2 Token'ı Kalıcı Yapmak İsterseniz (Opsiyonel)

**Windows:** Sistem environment variables'a ekleyin:

1. Win + R → `sysdm.cpl` → Environment Variables
2. User variables'a `CLOUDFLARE_API_TOKEN` ekleyin

**Linux/Mac:** `~/.bashrc` veya `~/.zshrc` dosyasına ekleyin:

```bash
export CLOUDFLARE_API_TOKEN="your_api_token_here"
```

---

## 🚀 Adım 5: İlk Deployment

### 5.1 Proje Klasörüne Gidin

```bash
cd c:\panel\panel
```

### 5.2 Dependencies Yükleyin (İlk kez)

```bash
npm install
```

### 5.3 Deploy Edin

```bash
npm run deploy:prod
```

Bu komut:

1. ✅ Otomatik olarak `npm run build` çalıştırır (predeploy hook)
2. ✅ `dist/` klasörünü Cloudflare Pages'e yükler
3. ✅ Proje adını otomatik tanır (`kafkasderpanel`)

### 5.4 Deploy Çıktısını Kontrol Edin

Başarılı deployment'ta göreceğiniz çıktı:

```
✨ Success! Uploaded 234 files (2.3 sec)

✨ Deployment complete! Take a peek over at
   https://xxxxxxxx.kafkasderpanel.pages.dev
```

---

## ✅ Adım 6: Deployment Doğrulama

### 6.1 Uygulamayı Açın

1. Terminal'deki deployment URL'ini kopyalayın
2. Tarayıcıda açın: `https://xxxxxxxx.kafkasderpanel.pages.dev`

Veya production URL:

```
https://kafkasderpanel.pages.dev
```

### 6.2 Supabase Bağlantısını Test Edin

1. Uygulama açıldığında **F12** ile Developer Tools'u açın
2. **Console** sekmesine gidin
3. Şu komutu çalıştırın:

```javascript
console.log(import.meta.env.VITE_SUPABASE_URL);
console.log(
  import.meta.env.VITE_SUPABASE_ANON_KEY
    ? 'Anon key yüklendi'
    : 'Anon key YOK!',
);
```

**Beklenen sonuç:**

```
https://gyburnfaszhxcxdnwogj.supabase.co
Anon key yüklendi
```

### 6.3 Login Test Edin

1. Login sayfasına gidin
2. Test kullanıcısı ile giriş yapmayı deneyin
3. Dashboard'un yüklendiğini kontrol edin

---

## 🔄 Güncellemeler için Deployment

Kod değişikliği yaptıktan sonra:

### Hızlı Deployment

```bash
npm run deploy:prod
```

### Git ile Birlikte

```bash
git add .
git commit -m "feat: yeni özellik eklendi"
git push origin main
npm run deploy:prod
```

---

## 🐛 Sorun Giderme

### Hata 1: "Authentication error" / "Invalid API token"

**Çözüm:**

```bash
# Token'ı kontrol edin
echo $env:CLOUDFLARE_API_TOKEN  # PowerShell
echo $CLOUDFLARE_API_TOKEN       # Linux/Mac

# Yeni token oluşturun ve tekrar deneyin
$env:CLOUDFLARE_API_TOKEN="yeni_token"
npm run deploy:prod
```

### Hata 2: "Project not found: kafkasderpanel"

**Çözüm:**

1. Cloudflare Dashboard'da proje adını kontrol edin
2. `wrangler.toml` dosyasındaki `name` ile eşleştiğinden emin olun
3. Proje yoksa Adım 2'yi tekrar yapın

### Hata 3: "Build failed" / "npm run build failed"

**Çözüm:**

```bash
# Dependencies temizle ve yeniden yükle
rm -rf node_modules package-lock.json
npm install

# Build'i manuel test et
npm run build

# Başarılı olduysa deploy et
npm run deploy:prod
```

### Hata 4: Supabase Bağlantı Hatası (Deployment sonrası)

**Çözüm:**

1. **Cloudflare Dashboard'da environment variables kontrol:**
   - Settings > Environment variables > Production
   - `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` var mı?

2. **Yeniden deploy (environment değişiklikleri için):**

   ```bash
   npm run deploy:prod
   ```

3. **Browser cache temizle:**
   - Ctrl + Shift + Delete
   - Cached images and files seç
   - Temizle

### Hata 5: "wrangler: command not found"

**Çözüm:**

```bash
# Wrangler'ı global olarak yükleyin
npm install -g wrangler

# Veya npx kullanın (package.json zaten kullanıyor)
npx wrangler pages deploy dist --project-name=kafkasderpanel
```

---

## 📊 Deployment Checklist

Her deployment öncesi kontrol edin:

- [ ] Kod değişiklikleri commit edildi
- [ ] `npm run build` local'de başarılı
- [ ] `CLOUDFLARE_API_TOKEN` environment variable ayarlı
- [ ] Cloudflare Pages projesi mevcut
- [ ] Environment variables Production'da ayarlı
- [ ] `npm run deploy:prod` komutu çalıştırıldı
- [ ] Deployment URL açıldı ve test edildi
- [ ] Supabase bağlantısı çalışıyor
- [ ] Login fonksiyonu çalışıyor

---

## 🔗 Yararlı Komutlar

```bash
# Build testi (deploy etmeden)
npm run build

# Build sonrasını preview (local)
npm run preview

# Wrangler ile login
npx wrangler login

# Mevcut deploymentları listele
npx wrangler pages deployment list --project-name=kafkasderpanel

# Deployment logları
# Cloudflare Dashboard > Workers & Pages > kafkasderpanel > Deployments

# Production deployment
npm run deploy:prod

# Preview deployment (branch deploy)
npm run deploy
```

---

## 📚 Ek Kaynaklar

- **Cloudflare Pages Docs:** https://developers.cloudflare.com/pages/
- **Wrangler CLI Docs:** https://developers.cloudflare.com/workers/wrangler/
- **Vite Environment Variables:** https://vitejs.dev/guide/env-and-mode.html
- **Supabase JavaScript Client:**
  https://supabase.com/docs/reference/javascript/

---

## 💡 İpuçları

1. **Environment Variables:** Cloudflare Pages'de environment variable
   değişikliği yaptıktan sonra mutlaka yeniden deploy edin.

2. **Caching:** Deployment sonrası uygulama güncellemediyse, browser cache
   temizleyin (Ctrl+Shift+R).

3. **Preview Deployments:** Branch'ler için otomatik preview deployment yapılmaz
   (manuel deployment kullanıyorsunuz).

4. **Custom Domain:** Production'a geçtikten sonra Settings > Custom domains'den
   özel domain ekleyebilirsiniz.

5. **Monitoring:** Cloudflare Analytics'te trafik ve performans metrikleri
   izleyebilirsiniz.

---

**Son Güncelleme:** Ekim 2025  
**Versiyon:** 1.0.0  
**Durum:** Production Ready ✅
