# Cloudflare Deployment Setup - Kafkasder Panel

## 📋 Mevcut Cloudflare Yapılandırması

### Account Bilgileri
- **Account ID:** `8a9f71fb44d0cc7341faa4f0406d536b`
- **Email:** admin@kafkasderpanel.com
- **API Token:** Yapılandırıldı ✅

### Aktif Workers
1. **broken-mountain-7c43**
   - Created: 2025-09-27
   - Type: Fetch handler
   - Deployment: Dashboard template

2. **kafkasder**
   - Created: 2025-10-05
   - Type: Full HTTP router (Hono.js benzeri)
   - Deployment: Wrangler CLI
   - Compatibility: Node.js compat enabled
   - Features: REST API endpoints (GET, POST, PUT, DELETE, etc.)

### Cloudflare Pages Deployment
- **Project:** kafkasder-panel
- **Latest URL:** https://4e9354ee.kafkasder-panel.pages.dev
- **Build:** Vite production build
- **Output:** /dist directory

---

## 🚀 Deployment Yöntemleri

### 1. Manuel CLI Deployment (Hızlı)
```bash
# Build ve deploy tek komutla
npm run build && npm run cloudflare:deploy:prod
```

### 2. GitHub Actions (Otomatik - Önerilen)
Her `git push` ile otomatik deployment.

**Gerekli GitHub Secrets:**
- ✅ CLOUDFLARE_API_TOKEN
- ✅ CLOUDFLARE_ACCOUNT_ID
- ⚠️ VITE_SUPABASE_URL (eklenecek)
- ⚠️ VITE_SUPABASE_ANON_KEY (eklenecek)

### 3. Cloudflare Dashboard
Direct Git integration via Cloudflare Dashboard

---

## 🔧 Environment Variables

### Production Variables (Cloudflare Pages)
Cloudflare Dashboard → Workers & Pages → kafkasder-panel → Settings → Environment Variables

**Eklenecek:**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
NODE_ENV=production
```

---

## 📊 Monitoring

### Cloudflare Analytics
```
https://dash.cloudflare.com → Workers & Pages → kafkasder-panel → Analytics
```

**Takip edilen metrikler:**
- Request count
- Bandwidth usage
- Error rates
- Response times
- Geographic distribution

---

## 🔗 Önemli Linkler

- **Cloudflare Dashboard:** https://dash.cloudflare.com
- **Pages Project:** https://dash.cloudflare.com → Workers & Pages → kafkasder-panel
- **API Tokens:** https://dash.cloudflare.com/profile/api-tokens
- **GitHub Actions:** https://github.com/kafkasder-git/panel/actions
- **Live Site:** https://4e9354ee.kafkasder-panel.pages.dev

---

## ✅ Kurulum Durumu

- [x] Cloudflare hesabı aktif
- [x] Wrangler CLI yapılandırıldı
- [x] İlk deployment başarılı
- [x] GitHub Actions workflow hazır
- [x] MCP server yapılandırıldı
- [ ] Environment variables eklenmeli
- [ ] Custom domain yapılandırılabilir (opsiyonel)

---

## 🎯 Sonraki Adımlar

1. **GitHub Secrets Ekle** (kritik)
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY

2. **Test Deployment**
   ```bash
   git push
   ```

3. **Custom Domain** (opsiyonel)
   - Cloudflare Pages → Custom domains
   - DNS ayarları otomatik

4. **Performance Monitoring**
   - Web Vitals izleme
   - Error tracking
   - User analytics

---

**Son Güncelleme:** 2025-10-06

