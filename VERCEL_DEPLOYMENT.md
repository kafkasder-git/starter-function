# 🚀 Vercel Deployment Rehberi

## Beyaz Ekran Sorununu Çözme

Vercel'de beyaz ekran sorunu genellikle **environment variables** eksikliğinden kaynaklanır. Bu rehber size doğru deployment yapmanızı gösterecek.

## ✅ Gerekli Environment Variables

Vercel Dashboard'da **Project Settings > Environment Variables** bölümünde şu değişkenleri ekleyin:

### 🔑 Zorunlu Değişkenler

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Security
VITE_CSRF_SECRET=your-32-character-random-string

# App Mode  
VITE_APP_MODE=production
```

### 📋 Değişkenleri Nasıl Alırsınız?

#### 1. Supabase URL ve Key
- [Supabase Dashboard](https://supabase.com/dashboard) > Projeniz > Settings > API
- **Project URL** → `VITE_SUPABASE_URL`
- **anon/public key** → `VITE_SUPABASE_ANON_KEY`

#### 2. CSRF Secret Oluşturma
Terminal'de çalıştırın:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🛠️ Deployment Adımları

### 1. Environment Variables Ayarlama
```bash
# Vercel CLI ile (opsiyonel)
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY  
vercel env add VITE_CSRF_SECRET
vercel env add VITE_APP_MODE
```

### 2. Manual Deployment
Vercel Dashboard'da:
1. **Settings** > **Environment Variables**
2. Yukarıdaki 4 değişkeni ekleyin
3. **Deployments** > **Redeploy** yapın

### 3. Auto Deployment
Kod push ettiğinizde otomatik deploy olacak:
```bash
git add .
git commit -m "fix: Vercel deployment configuration"
git push origin main
```

## 🔍 Hata Ayıklama

### Beyaz Ekran Hala Varsa

1. **Browser Console** açın (F12)
2. **Console** tab'inde hataları kontrol edin
3. **Network** tab'inde failed request'leri kontrol edin

### Yaygın Hatalar

- ❌ `Environment variable undefined` 
  - ✅ Environment variables'ları Vercel'de ayarlayın

- ❌ `CORS error` 
  - ✅ Supabase URL'nin doğru olduğunu kontrol edin

- ❌ `Invalid API key`
  - ✅ Supabase anon key'in doğru olduğunu kontrol edin

## 📞 Destek

Sorun devam ederse:

1. **Vercel Function Logs** kontrol edin
2. **Build Logs** kontrol edin  
3. **Runtime Logs** kontrol edin

## 🎯 Production Optimizations

Bu değişiklikler ile:
- ✅ **Environment hatası** artık uygulamayı crash etmez
- ✅ **Global error handling** eklendi
- ✅ **User-friendly error messages** gösterilir  
- ✅ **Auto recovery** mekanizması var
- ✅ **Chunk loading errors** handle ediliyor

## 🔧 Geliştirici Notları

### Error Handling Improvements:
- `lib/environment.ts` - Production'da soft error handling
- `main.tsx` - Global error boundaries and fallbacks
- `vercel.json` - Optimized build configuration

### Monitoring:
- Browser console'da detaylı error logs
- Vercel Analytics integration
- User-friendly error UI instead of white screen
