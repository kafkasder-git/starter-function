# Cloudflare Pages Deployment Guide

Bu rehber, Kafkasder Panel projenizi Cloudflare Pages'e deploy etmek için gerekli adımları içerir.

## Ön Gereksinimler

1. **Cloudflare Hesabı**: [cloudflare.com](https://cloudflare.com) üzerinden ücretsiz hesap oluşturun
2. **GitHub Repository**: Projenizin GitHub'da olması gerekiyor
3. **Wrangler CLI**: Cloudflare'in resmi CLI aracı

## Kurulum

### 1. Wrangler CLI Kurulumu

```bash
# Global olarak kur
npm install -g wrangler

# Veya proje içinde kullan
npx wrangler --version
```

### 2. Cloudflare'e Giriş

```bash
# Cloudflare hesabınızla giriş yapın
wrangler login
```

## Deployment Yöntemleri

### Yöntem 1: Cloudflare Dashboard (Önerilen)

1. **Cloudflare Dashboard'a gidin**
   - [dash.cloudflare.com](https://dash.cloudflare.com)
   - "Pages" sekmesine tıklayın

2. **Yeni Proje Oluşturun**
   - "Create a project" butonuna tıklayın
   - "Connect to Git" seçin
   - GitHub repository'nizi bağlayın

3. **Build Ayarları**
   ```
   Project name: kafkasder-panel
   Production branch: main
   Build command: npm run build
   Build output directory: dist
   Root directory: / (boş bırakın)
   ```

4. **Environment Variables**
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   NODE_ENV=production
   ```

5. **Deploy**
   - "Save and Deploy" butonuna tıklayın
   - İlk build otomatik olarak başlayacak

### Yöntem 2: Wrangler CLI ile Manuel Deploy

```bash
# 1. Projeyi build edin
npm run cloudflare:build

# 2. Deploy edin
npm run cloudflare:deploy

# Veya production için
npm run cloudflare:deploy:prod
```

### Yöntem 3: GitHub Actions ile Otomatik Deploy

`.github/workflows/cloudflare.yml` dosyası oluşturun:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build project
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: kafkasder-panel
          directory: dist
```

## Environment Variables

Cloudflare Pages'te aşağıdaki environment variables'ları ayarlayın:

### Production
```
VITE_SUPABASE_URL=your-production-supabase-url
VITE_SUPABASE_ANON_KEY=your-production-supabase-anon-key
NODE_ENV=production
```

### Preview/Staging
```
VITE_SUPABASE_URL=your-staging-supabase-url
VITE_SUPABASE_ANON_KEY=your-staging-supabase-anon-key
NODE_ENV=production
```

## Custom Domain Ayarlama

1. **Cloudflare Dashboard'da**
   - Pages projenize gidin
   - "Custom domains" sekmesine tıklayın
   - "Set up a custom domain" butonuna tıklayın
   - Domain adınızı girin

2. **DNS Ayarları**
   - Cloudflare otomatik olarak DNS kayıtlarını ayarlayacak
   - SSL sertifikası otomatik olarak oluşturulacak

## Performance Optimizasyonları

### 1. Caching Headers
`wrangler.toml` dosyasında optimize edilmiş cache headers tanımlanmıştır:
- Static assets: 1 yıl cache
- HTML files: No cache (always fresh)
- PWA files: 1 gün cache

### 2. Compression
Cloudflare otomatik olarak:
- Gzip/Brotli compression uygular
- Minification yapar
- Image optimization sağlar

### 3. CDN
- Global CDN network
- Edge caching
- Automatic HTTPS

## Monitoring ve Analytics

### 1. Cloudflare Analytics
- Pages projenizde otomatik olarak analytics mevcut
- Traffic, performance, errors tracking

### 2. Web Vitals
- Core Web Vitals otomatik monitoring
- Performance insights

## Troubleshooting

### Build Hataları

```bash
# Build'i local'de test edin
npm run build

# Dist klasörünü kontrol edin
ls -la dist/

# Wrangler ile local preview
npm run cloudflare:preview
```

### Environment Variables

```bash
# Environment variables'ları kontrol edin
wrangler pages project list
wrangler pages secret list --project-name=kafkasder-panel
```

### Cache Sorunları

```bash
# Cache'i temizleyin (Cloudflare Dashboard'dan)
# Veya yeni deployment yapın
npm run cloudflare:deploy
```

## Güvenlik

### 1. Security Headers
`wrangler.toml` dosyasında güvenlik headers tanımlanmıştır:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Content-Security-Policy: Strict policy
- Strict-Transport-Security: HSTS enabled

### 2. DDoS Protection
- Cloudflare otomatik DDoS koruması
- Rate limiting
- Bot protection

## Backup ve Recovery

### 1. Git Backup
- Tüm kod GitHub'da saklanıyor
- Branch protection rules önerilir

### 2. Environment Backup
- Environment variables'ları dokümante edin
- Cloudflare'de export edilebilir

## Cost Management

### Free Plan Limits
- 500 build minutes/month
- 20,000 requests/day
- 1 GB bandwidth/month

### Upgrade Seçenekleri
- Pro: $20/month
- Business: $200/month
- Enterprise: Custom pricing

## Support

### Cloudflare Support
- [Cloudflare Community](https://community.cloudflare.com/)
- [Cloudflare Docs](https://developers.cloudflare.com/pages/)
- [Status Page](https://www.cloudflarestatus.com/)

### Project Specific
- GitHub Issues: [panel/issues](https://github.com/kafkasder/panel/issues)
- Documentation: Bu rehber ve README.md

## Deployment Checklist

- [ ] Cloudflare hesabı oluşturuldu
- [ ] GitHub repository bağlandı
- [ ] Build settings ayarlandı
- [ ] Environment variables eklendi
- [ ] Custom domain ayarlandı (opsiyonel)
- [ ] SSL sertifikası aktif
- [ ] Performance test edildi
- [ ] Security headers kontrol edildi
- [ ] Monitoring kuruldu
- [ ] Backup stratejisi belirlendi

## Sonraki Adımlar

1. **Performance Monitoring**: Web Vitals tracking
2. **Analytics**: Kullanıcı davranış analizi
3. **A/B Testing**: Feature testing
4. **Edge Functions**: Server-side logic (opsiyonel)
5. **Image Optimization**: Cloudflare Image Resizing

---

**Not**: Bu rehber sürekli güncellenmektedir. En güncel bilgiler için [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)'ı ziyaret edin.
