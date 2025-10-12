# Kibo UI Integration Guide

Bu proje artık **Kibo UI** bileşenleri ile entegre edilmiştir. Kibo UI, modern, erişilebilir ve özelleştirilebilir React bileşenleri sağlayan bir UI kütüphanesidir.

## 🚀 Özellikler

- **Modern Tasarım**: Tailwind CSS ile güçlendirilmiş, modern ve responsive tasarım
- **Erişilebilirlik**: WCAG standartlarına uygun, ekran okuyucu dostu bileşenler
- **TypeScript Desteği**: Tam tip güvenliği ile geliştirilmiş
- **Performans**: Optimize edilmiş, hızlı render eden bileşenler
- **Özelleştirilebilir**: Kolayca tema ve stil değişiklikleri

## 📦 Mevcut Bileşenler

### Temel Bileşenler
- `Button` - Çoklu varyant ve durum desteği
- `Input` - Gelişmiş form girişi bileşenleri
- `Card` - İçerik organizasyonu için kartlar
- `Badge` - Durum ve etiket göstergeleri
- `Label` - Form etiketleri

### Veri Bileşenleri
- `Table` - Responsive veri tabloları
- `Form` - React Hook Form entegrasyonu

### Yardımcı Bileşenler
- `Tooltip` - Bağlamsal yardım metinleri
- `Gantt` - Proje yönetimi için Gantt çizelgeleri

## 🛠️ Kullanım

### Import

```tsx
import { Button, Input, Card, Badge } from '@/components/kibo-ui';
```

### Temel Kullanım

```tsx
import React from 'react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '@/components/kibo-ui';

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Başlık</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Bir şeyler yazın..." />
        <Button variant="default">Kaydet</Button>
      </CardContent>
    </Card>
  );
}
```

### Button Varyantları

```tsx
<Button variant="default">Varsayılan</Button>
<Button variant="secondary">İkincil</Button>
<Button variant="outline">Çerçeveli</Button>
<Button variant="ghost">Hayalet</Button>
<Button variant="destructive">Yıkıcı</Button>
<Button variant="link">Bağlantı</Button>
<Button variant="success">Başarılı</Button>
<Button variant="warning">Uyarı</Button>
<Button variant="info">Bilgi</Button>
```

### Button Boyutları

```tsx
<Button size="xs">Çok Küçük</Button>
<Button size="sm">Küçük</Button>
<Button size="default">Varsayılan</Button>
<Button size="lg">Büyük</Button>
<Button size="xl">Çok Büyük</Button>
<Button size="icon">🎯</Button>
```

### Button Durumları

```tsx
<Button loading>Yükleniyor</Button>
<Button disabled>Devre Dışı</Button>
<Button ripple>Dalga Efekti</Button>
<Button badge="3">Bildirimli</Button>
<Button tooltip="Bu bir araç ipucu">Araç İpucu</Button>
```

### Input Özellikleri

```tsx
<Input placeholder="Normal giriş" />
<Input placeholder="Hata girişi" error errorText="Bu alan gerekli" />
<Input placeholder="Başarı girişi" success successText="Harika!" />
<Input placeholder="Uyarı girişi" warning warningText="Lütfen kontrol edin" />
<Input placeholder="Yükleniyor girişi" loading />
<Input placeholder="Devre dışı girişi" disabled />
<Input placeholder="Temizlenebilir giriş" clearable />
<Input type="password" placeholder="Şifre girişi" />
```

### Form Kullanımı

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Button
} from '@/components/kibo-ui';

const formSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalı'),
  email: z.string().email('Geçersiz email adresi'),
});

function MyForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>İsim</FormLabel>
              <FormControl>
                <Input placeholder="İsminizi girin" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Gönder</Button>
      </form>
    </Form>
  );
}
```

### Tablo Kullanımı

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/kibo-ui';

function MyTable() {
  const data = [
    { id: 1, name: 'Ahmet', email: 'ahmet@example.com' },
    { id: 2, name: 'Ayşe', email: 'ayse@example.com' },
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>İsim</TableHead>
          <TableHead>Email</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.id}</TableCell>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.email}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

## 🎨 Tema ve Stil

Kibo UI bileşenleri Tailwind CSS ile oluşturulmuştur ve mevcut tasarım sisteminizle uyumludur. CSS değişkenleri kullanarak kolayca özelleştirilebilir:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  /* ... diğer renkler */
}
```

## 📍 Örnek Sayfalar

Projede aşağıdaki örnek sayfalar mevcuttur:

- **Gantt Chart**: `/genel/gantt` - Proje yönetimi için Gantt çizelgesi
- **Kibo UI Showcase**: `/genel/kibo-ui` - Tüm bileşenlerin örnekleri

## 🔧 Geliştirme

### Yeni Bileşen Ekleme

1. `components/kibo-ui/` klasörüne yeni bileşen dosyası oluşturun
2. Bileşeni `components/kibo-ui/index.ts` dosyasına ekleyin
3. TypeScript tiplerini tanımlayın
4. Dokümantasyon ekleyin

### Bileşen Yapısı

```tsx
/**
 * @fileoverview Kibo UI [ComponentName] Component
 * Modern, accessible [component] component
 * 
 * @author Kibo UI Team
 * @version 2.0.0
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ComponentNameProps extends React.HTMLAttributes<HTMLDivElement> {
  // Props tanımları
}

const ComponentName = React.forwardRef<HTMLDivElement, ComponentNameProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('base-classes', className)}
        {...props}
      />
    );
  }
);

ComponentName.displayName = 'ComponentName';

export { ComponentName };
```

## 🚀 Gelecek Planları

- [ ] Daha fazla bileşen ekleme (Modal, Dropdown, etc.)
- [ ] Animasyon sistemi
- [ ] Tema değiştirici
- [ ] Dark mode desteği
- [ ] Mobil optimizasyonlar
- [ ] Accessibility iyileştirmeleri

## 📚 Kaynaklar

- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Class Variance Authority](https://cva.style/)

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
