# 🚀 Deployment Dokümantasyonu

## 📋 Genel Bakış

Bu dokümantasyon, Dernek Yönetim Sistemi'nin production ortamına deployment sürecini açıklar.

## 🏗️ Teknoloji Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Appwrite Cloud
- **Hosting**: Vercel / Netlify / GitHub Pages
- **Domain**: Özel domain (opsiyonel)

## 🔧 Ön Gereksinimler

### 1. Appwrite Kurulumu
```bash
# Appwrite CLI kurulumu
npm install -g appwrite-cli

# Appwrite projesine bağlanma
appwrite login
appwrite init
```

### 2. Environment Variables
```env
# .env.production
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_COLLECTION_USERS=users
VITE_APPWRITE_COLLECTION_DONATIONS=donations
VITE_APPWRITE_COLLECTION_AID_APPLICATIONS=aid_applications
VITE_APPWRITE_COLLECTION_SCHOLARSHIPS=scholarships
VITE_APPWRITE_COLLECTION_MESSAGES=messages
VITE_APPWRITE_BUCKET_DOCUMENTS=documents
VITE_APPWRITE_BUCKET_PROFILES=profiles
```

## 🚀 Deployment Seçenekleri

### Seçenek 1: Vercel (Önerilen)

#### 1. Vercel CLI Kurulumu
```bash
npm install -g vercel
```

#### 2. Proje Deployment
```bash
# Vercel'e giriş yap
vercel login

# Proje deploy et
vercel

# Production deployment
vercel --prod
```

#### 3. Environment Variables Ayarla
Vercel dashboard'da:
1. Project Settings > Environment Variables
2. Production environment için tüm `VITE_` değişkenlerini ekle

#### 4. Custom Domain (Opsiyonel)
```bash
# Domain ekle
vercel domains add yourdomain.com

# SSL sertifikası otomatik olarak oluşturulur
```

### Seçenek 2: Netlify

#### 1. Netlify CLI Kurulumu
```bash
npm install -g netlify-cli
```

#### 2. Build Ayarları
`netlify.toml` dosyası oluştur:
```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 3. Deployment
```bash
# Netlify'e giriş yap
netlify login

# Site oluştur ve deploy et
netlify init
netlify deploy --prod
```

### Seçenek 3: GitHub Pages

#### 1. GitHub Actions Workflow
`.github/workflows/deploy.yml` dosyası oluştur:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
      env:
        VITE_APPWRITE_ENDPOINT: ${{ secrets.VITE_APPWRITE_ENDPOINT }}
        VITE_APPWRITE_PROJECT_ID: ${{ secrets.VITE_APPWRITE_PROJECT_ID }}
        # Diğer environment variables...
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

#### 2. GitHub Secrets Ayarla
Repository Settings > Secrets and variables > Actions:
- `VITE_APPWRITE_ENDPOINT`
- `VITE_APPWRITE_PROJECT_ID`
- Diğer tüm environment variables

## 🔐 Appwrite Production Kurulumu

### 1. Database Collections Oluştur
```bash
# Collections script çalıştır
node scripts/create-collections.cjs
```

### 2. Storage Buckets Oluştur
```bash
# Storage script çalıştır
node scripts/setup-storage.cjs
```

### 3. Functions Deploy Et
```bash
# Functions script çalıştır
node scripts/setup-functions.cjs
```

### 4. Security Ayarları
```bash
# Appwrite Console'da:
# 1. Security > Domains: Production domain'i ekle
# 2. Security > CORS: Frontend URL'i ekle
# 3. Auth > Settings: Email verification aktif et
# 4. Auth > Settings: Password policy ayarla
```

## 📊 Monitoring ve Analytics

### 1. Vercel Analytics
```bash
# Vercel Analytics kurulumu
npm install @vercel/analytics

# main.tsx'e ekle
import { Analytics } from '@vercel/analytics/react'

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  )
}
```

### 2. Error Monitoring
```bash
# Sentry kurulumu (opsiyonel)
npm install @sentry/react @sentry/tracing

# Sentry konfigürasyonu
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production"
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npm run type-check
    
    - name: Run tests
      run: npm run test:coverage
    
    - name: Build
      run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
      env:
        VITE_APPWRITE_ENDPOINT: ${{ secrets.VITE_APPWRITE_ENDPOINT }}
        VITE_APPWRITE_PROJECT_ID: ${{ secrets.VITE_APPWRITE_PROJECT_ID }}
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## 🛡️ Security Checklist

### Pre-Deployment
- [ ] Environment variables doğru ayarlandı
- [ ] HTTPS zorunlu hale getirildi
- [ ] CORS ayarları yapıldı
- [ ] Rate limiting aktif
- [ ] Input validation kontrol edildi
- [ ] SQL injection koruması aktif
- [ ] XSS koruması aktif

### Post-Deployment
- [ ] SSL sertifikası çalışıyor
- [ ] Domain doğru yönlendiriliyor
- [ ] API endpoints erişilebilir
- [ ] Authentication çalışıyor
- [ ] File upload çalışıyor
- [ ] Email gönderimi çalışıyor

## 📱 PWA Deployment

### 1. Manifest Ayarları
`public/manifest.webmanifest`:
```json
{
  "name": "Dernek Yönetim Sistemi",
  "short_name": "Dernek YS",
  "description": "Kar amacı gütmeyen dernekler için yönetim sistemi",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 2. Service Worker
Vite PWA plugin otomatik olarak service worker oluşturur.

## 🔍 Troubleshooting

### Yaygın Sorunlar

#### 1. Build Hatası
```bash
# Cache temizle
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 2. Environment Variables Çalışmıyor
- Production environment'da değişkenlerin doğru ayarlandığından emin ol
- `VITE_` prefix'inin olduğunu kontrol et

#### 3. Appwrite Bağlantı Hatası
- CORS ayarlarını kontrol et
- Domain'in Appwrite'da whitelist'te olduğunu kontrol et

#### 4. PWA Çalışmıyor
- HTTPS'in aktif olduğunu kontrol et
- Service worker'ın doğru çalıştığını kontrol et

## 📞 Destek

Deployment ile ilgili sorunlar için:
1. GitHub Issues
2. Dokümantasyon kontrol et
3. Appwrite Community
4. Vercel/Netlify Support
