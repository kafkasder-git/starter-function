# Kafkasder Yönetim Sistemi

Modern, kapsamlı dernek yönetim sistemi.

## 🎉 Son Güncellemeler (v2.0)

### ✅ Önemli İyileştirmeler
- **React Router v6 Entegrasyonu** - URL-based routing ve browser history desteği
- **Component Reorganizasyonu** - Feature-based yapı ile daha iyi bakım
- **CSS/Tema Birleştirme** - Tailwind v4 native format ile tek kaynak
- **TypeScript İyileştirmeleri** - Yeni type helper'lar ve daha sıkı type safety
- **Geliştirilmiş Dokümantasyon** - Kapsamlı kılavuzlar ve migration dokümanları

### 📚 Dokümantasyon
- [Frontend İyileştirmeleri](./FRONTEND_IMPROVEMENTS.md) - Detaylı değişiklik listesi
- [Migration Kılavuzu](./docs/MIGRATION_GUIDE.md) - Yeni yapıya geçiş rehberi
- [Component Kılavuzu](./docs/COMPONENT_GUIDELINES.md) - Geliştirme standartları
- [Uygulama Özeti](./IMPLEMENTATION_SUMMARY.md) - Türkçe özet

## 🚀 Hızlı Başlangıç

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Production build
npm run build

# Testleri çalıştır
npm test
```

## 📁 Proje Yapısı

```
panel/
├── components/
│   ├── ui/              # Shadcn ve temel UI componentleri
│   ├── layouts/         # Layout componentleri (Header, Sidebar)
│   ├── shared/          # Paylaşılan componentler
│   ├── features/        # Feature-bazlı componentler
│   └── pages/           # Sayfa componentleri
├── src/
│   ├── App.tsx          # Ana uygulama
│   ├── main.tsx         # Entry point
│   └── routes.tsx       # Route tanımları
├── types/               # TypeScript type tanımları
├── stores/              # Zustand store'lar
├── hooks/               # Custom hooks
├── lib/                 # Utility fonksiyonlar
└── docs/                # Dokümantasyon

```

## 🛠️ Teknolojiler

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router v6** - Routing
- **Tailwind CSS v4** - Styling
- **Shadcn/ui** - Component library
- **Zustand** - State management
- **TanStack Query** - Data fetching
- **Appwrite** - Backend services

## 📖 Geliştirme Kılavuzları

### Component Oluşturma
```typescript
// components/features/myfeature/MyComponent.tsx
import type { BaseComponentProps } from '@/types/components';

interface MyComponentProps extends BaseComponentProps {
  title: string;
}

export const MyComponent = ({ title, className }: MyComponentProps) => {
  return <div className={className}>{title}</div>;
};
```

### Routing Kullanımı
```typescript
import { useNavigate } from 'react-router-dom';

const MyComponent = () => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/yardim/ihtiyac-sahipleri');
  };
  
  return <button onClick={handleClick}>Git</button>;
};
```

## 🧪 Test

```bash
# Tüm testleri çalıştır
npm test

# Coverage raporu
npm run test:coverage

# Watch mode
npm test -- --watch
```

## 📊 Kod Kalitesi

```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Format
npm run format
```

## 🔧 Yapılandırma

### Environment Variables
```env
VITE_APPWRITE_ENDPOINT=your_endpoint
VITE_APPWRITE_PROJECT_ID=your_project_id
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'feat: add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Lisans

MIT License

## 👥 Ekip

Kafkasder Development Team

## 📞 İletişim

- Website: https://panel.kafkasder.org
- Issues: https://github.com/kafkasder/panel/issues