# Kafkasder Management Panel

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF.svg)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-2.57.4-green.svg)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🏢 Dernek Yönetim Sistemi

Modern, responsive ve güvenli bir dernek yönetim sistemi. React, TypeScript ve Supabase teknolojileri ile geliştirilmiştir.

## ✨ Özellikler

### 🎯 Temel Özellikler
- **Üye Yönetimi**: Üye kayıt, güncelleme ve takibi
- **Bağış Yönetimi**: Bağış kayıt ve raporlama
- **Yardım Başvuruları**: İhtiyaç sahipleri için başvuru sistemi
- **Kumbara Sistemi**: Dijital kumbara yönetimi
- **Raporlama**: Detaylı analiz ve raporlar

### 🚀 Teknik Özellikler
- **Modern Stack**: React 18 + TypeScript + Vite
- **Real-time**: Supabase ile gerçek zamanlı veri
- **PWA**: Progressive Web App desteği
- **Mobile-First**: Responsive tasarım
- **AI Integration**: Gelişmiş AI destekli özellikler
- **Security**: Kapsamlı güvenlik önlemleri

## 🛠️ Teknoloji Stack

### Frontend
- **React 18** - Modern UI kütüphanesi
- **TypeScript** - Tip güvenli JavaScript
- **Vite** - Hızlı build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component library

### Backend & Database
- **Supabase** - Backend as a Service
- **PostgreSQL** - Güçlü veritabanı
- **Real-time** - Canlı veri senkronizasyonu

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Vitest** - Testing framework
- **Playwright** - E2E testing

## 🚀 Kurulum

### Gereksinimler
- Node.js >= 22.0.0
- npm >= 10.0.0

### Adımlar

1. **Repository'yi klonlayın**
```bash
git clone https://github.com/kafkasder/panel.git
cd panel
```

2. **Dependencies'leri yükleyin**
```bash
npm install
```

3. **Environment variables'ları ayarlayın**
```bash
cp .env.example .env.local
# .env.local dosyasını düzenleyin
```

4. **Development server'ı başlatın**
```bash
npm run dev
```

## 📜 Scripts

### Development
```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
```

### Code Quality
```bash
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run format       # Prettier format
npm run type-check   # TypeScript check
npm run quality:check # Full quality check
npm run quality:fix  # Auto-fix all issues
```

### Testing
```bash
npm run test         # Run tests
npm run test:coverage # Run tests with coverage
npm run test:ui      # Run tests with UI
```

### Maintenance
```bash
npm run cleanup:imports # Clean unused imports
npm run cleanup:all     # Full cleanup
npm run deps:check      # Check outdated dependencies
npm run deps:update     # Update dependencies
npm run security:check  # Security audit
```

## 🏗️ Proje Yapısı

```
kafkasder-panel/
├── components/          # React bileşenleri
│   ├── auth/           # Kimlik doğrulama
│   ├── beneficiary/    # İhtiyaç sahipleri
│   ├── forms/          # Form bileşenleri
│   ├── ui/             # UI bileşenleri
│   └── ...
├── hooks/              # Custom React hooks
├── lib/                # Utility kütüphaneleri
├── services/           # API servisleri
├── stores/             # Zustand state management
├── types/              # TypeScript tip tanımları
├── utils/              # Yardımcı fonksiyonlar
└── tests/              # Test dosyaları
```

## 🔧 Konfigürasyon

### ESLint
Gelişmiş ESLint konfigürasyonu ile kod kalitesi:
- TypeScript strict rules
- React best practices
- Security rules
- Unused imports detection

### TypeScript
Strict mode ile tip güvenliği:
- No implicit any
- Strict null checks
- Unused locals/parameters detection
- Exact optional property types

### Prettier
Tutarlı kod formatlama:
- Tailwind CSS plugin
- File-specific overrides
- Consistent formatting rules

## 🔒 Güvenlik

### Güvenlik Önlemleri
- **Input Sanitization**: XSS koruması
- **CSRF Protection**: Cross-site request forgery koruması
- **Rate Limiting**: API rate limiting
- **Session Management**: Güvenli oturum yönetimi
- **File Upload Security**: Güvenli dosya yükleme

### Güvenlik Araçları
- ESLint security plugin
- Dependency vulnerability scanning
- Automated security audits

## 📊 Performance

### Optimizasyonlar
- **Code Splitting**: Lazy loading
- **Bundle Analysis**: Bundle size monitoring
- **Performance Monitoring**: Real-time performance tracking
- **Memory Management**: Efficient memory usage
- **Caching**: Smart caching strategies

### Performance Tools
- Vite bundle analyzer
- Performance monitoring
- Memory usage tracking
- Long task detection

## 🧪 Testing

### Test Stratejisi
- **Unit Tests**: Vitest ile component testing
- **Integration Tests**: API integration testing
- **E2E Tests**: Playwright ile end-to-end testing
- **Accessibility Tests**: a11y testing

### Test Coverage
- Minimum %80 code coverage
- Critical path testing
- Error scenario testing

## 📱 PWA Özellikleri

### Progressive Web App
- **Offline Support**: Service worker ile offline çalışma
- **Install Prompt**: Native app gibi yükleme
- **Push Notifications**: Gerçek zamanlı bildirimler
- **Background Sync**: Arka plan senkronizasyonu

## 🤖 AI Integration

### AI Özellikleri
- **Smart Suggestions**: Akıllı öneriler
- **Content Generation**: İçerik üretimi
- **Data Analysis**: Veri analizi
- **Turkish Language Support**: Türkçe dil desteği

## 📈 Monitoring & Analytics

### Monitoring
- **Error Tracking**: Sentry entegrasyonu
- **Performance Monitoring**: Real-time performance tracking
- **User Analytics**: Kullanıcı davranış analizi
- **Business Metrics**: İş metrikleri

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SENTRY_DSN=your_sentry_dsn
```

### Deployment Platforms
- **Vercel**: Recommended for frontend
- **Netlify**: Alternative option
- **Docker**: Container deployment

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Make changes
4. Run quality checks
5. Submit pull request

### Code Standards
- Follow ESLint rules
- Use TypeScript strict mode
- Write tests for new features
- Update documentation

## 📄 License

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 📞 İletişim

- **Website**: [panel.kafkasder.org](https://panel.kafkasder.org)
- **Email**: info@kafkasder.org
- **GitHub**: [kafkasder/panel](https://github.com/kafkasder/panel)

## 🙏 Teşekkürler

Bu projeyi mümkün kılan tüm açık kaynak kütüphanelerine ve geliştiricilere teşekkürler.

---

**Kafkasder Management Panel** - Modern dernek yönetim sistemi 🏢