# 🤖 Dernek Yönetim Sistemi

## 📋 Proje Tanımı

Bu proje, **kar amacı gütmeyen dernekler için modern, kapsamlı yönetim sistemi**dir. React + TypeScript + Vite + Appwrite teknoloji stack'i kullanılarak geliştirilmiştir.

## 🏗️ Teknoloji Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Appwrite (Database, Auth, Storage, Functions)
- **UI**: Tailwind CSS, Radix UI, shadcn/ui
- **State Management**: Zustand
- **Routing**: React Router v7
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **PWA**: Vite PWA Plugin

## 🎯 Ana Modüller

### 1. **Ana Sayfa (genel)** - Dashboard ve istatistikler
### 2. **Bağış Yönetimi (bagis)** - Bağış listesi, raporlar, kumbara takibi
### 3. **Yardım Yönetimi (yardim)** - İhtiyaç sahipleri, başvurular, nakit yardım
### 4. **Burs Yönetimi (burs)** - Öğrenci listesi, burs başvuruları, yetim listesi
### 5. **Fon Yönetimi (fon)** - Gelir-gider takibi, finansal raporlar
### 6. **Mesajlaşma (mesaj)** - Kurum içi mesajlaşma, toplu mesaj
### 7. **İş Yönetimi (is)** - Etkinlikler, toplantılar, görevler
### 8. **Hukuki İşler (hukuki)** - Hukuki belgeler, danışmanlık
### 9. **Partner Yönetimi (partner)** - Partner listesi, bağışçı yönetimi
### 10. **Kullanıcı Yönetimi** - Rol bazlı yetkilendirme, sistem ayarları

## 🚀 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Production build
npm run build

# Test çalıştır
npm run test
```

## 📁 Proje Yapısı

```
├── components/          # React bileşenleri
├── hooks/              # Custom React hooks
├── lib/                # Utility fonksiyonları ve konfigürasyon
├── services/           # API servisleri
├── stores/             # Zustand state yönetimi
├── types/              # TypeScript tip tanımları
├── utils/              # Yardımcı fonksiyonlar
└── docs/               # Dokümantasyon
```

## 🔐 Güvenlik

- Appwrite backend güvenliği
- Role-based access control
- CSRF koruması
- Input validation ve sanitization
- Rate limiting

## 📱 PWA Özellikleri

- Offline çalışma desteği
- Push notifications
- App-like deneyim
- Background sync
- Haptic feedback

## 🧪 Test

```bash
# Unit testler
npm run test

# Test coverage
npm run test:coverage

# Test UI
npm run test:ui
```

## 📊 Performans

- Lazy loading
- Code splitting
- Memoization
- Virtual scrolling
- Image optimization

## 🔧 Geliştirme

```bash
# Linting
npm run lint

# Formatting
npm run format

# Type checking
npm run type-check
```

## 📚 API Dokümantasyonu

Detaylı API dokümantasyonu için [api.md](./api.md) dosyasına bakın.

## 🚀 Deployment

Deployment bilgileri için [deployment.md](./deployment.md) dosyasına bakın.
