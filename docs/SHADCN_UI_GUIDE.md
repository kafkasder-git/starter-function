# shadcn/ui Entegrasyon Rehberi

Bu dokümantasyon, Kafkasder Yönetim Sistemi'nde shadcn/ui bileşenlerinin nasıl kullanılacağını açıklar.

## 📋 İçindekiler

- [Kurulum](#kurulum)
- [Bağımlılıklar ve Kurulum Gereksinimleri](#bağımlılıklar-ve-kurulum-gereksinimleri)
- [Mevcut Bileşenler](#mevcut-bileşenler)
- [Kullanım Örnekleri](#kullanım-örnekleri)
- [Gelişmiş Örnekler](#gelişmiş-örnekler)
- [Yeni Sayfalar](#yeni-sayfalar)
- [Shared Bileşenler](#shared-bileşenler)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🚀 Kurulum

### Bağımlılıklar

Proje zaten gerekli bağımlılıkları içeriyor:

```json
{
  "@radix-ui/react-slot": "^1.1.2",
  "@radix-ui/react-dialog": "^1.0.5",
  "@radix-ui/react-separator": "^1.0.3",
  "@radix-ui/react-tabs": "^1.0.4",
  "@radix-ui/react-accordion": "^1.1.2",
  "@radix-ui/react-collapsible": "^1.0.3",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.6.0",
  "lucide-react": "^0.294.0"
}
```

### Temel Kurulum

```bash
# Tüm gerekli paketleri yükle
npm install @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-separator @radix-ui/react-tabs @radix-ui/react-accordion @radix-ui/react-collapsible class-variance-authority clsx tailwind-merge lucide-react
```

### Yardımcı Dosyalar

**utils.ts** - Tailwind sınıflarını birleştirmek için:
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**useHapticFeedback.ts** - Mobil cihazlarda titreşim için:
```typescript
import { useCallback } from 'react';

export function useHapticFeedback() {
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (!('vibrate' in navigator)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    navigator.vibrate([20]);
  }, []);
  return { triggerHaptic };
}
```

### Bileşen Ekleme

Yeni bileşen eklemek için:

```bash
npx shadcn@latest add [component-name]
```

## 📦 Mevcut Bileşenler

Projede şu shadcn/ui bileşenleri mevcut:

### Form Bileşenleri
- `Button` - Buton bileşeni (8 varyant, 7 boyut, loading, ripple, haptic)
- `Input` - Metin girişi
- `Textarea` - Çok satırlı metin girişi
- `Select` - Seçim listesi
- `Checkbox` - Onay kutusu
- `RadioGroup` - Radyo buton grubu
- `Switch` - Anahtar
- `Label` - Etiket
- `Form` - Form yönetimi (React Hook Form ile)
- `Slider` - Aralık seçici
- `InputOTP` - OTP kod girişi

### Layout Bileşenleri
- `Card` - Kart bileşeni (5 varyant, interaktif, loading)
- `Separator` - Ayırıcı
- `Tabs` - Sekme sistemi
- `Accordion` - Açılır/kapanır içerik
- `Collapsible` - Daraltılabilir içerik
- `ScrollArea` - Özel kaydırılabilir alanlar
- `Resizable` - Yeniden boyutlandırılabilir paneller
- `AspectRatio` - En-boy oranı koruyucu
- `Sidebar` - Yan panel navigasyonu
- `Carousel` - Resim/içerik kutusu

### Feedback Bileşenleri
- `Alert` - Uyarı mesajları
- `Badge` - Durum rozetleri
- `Progress` - İlerleme çubuğu
- `Skeleton` - Yüklenme durumu
- `Toast` - Bildirimler (Sonner ile)

### Overlay Bileşenleri
- `Dialog` - Modal pencere
- `AlertDialog` - Onay modalı
- `Drawer` - Yan panel
- `Sheet` - Kaydırmalı panel
- `Popover` - Açılır içerik
- `Tooltip` - İpucu
- `HoverCard` - Hover kartı
- `DropdownMenu` - Açılır menü

### Navigation Bileşenleri
- `NavigationMenu` - Navigasyon menüsü
- `Menubar` - Menü çubuğu
- `Breadcrumb` - Sayfa yolu
- `Pagination` - Sayfalama
- `ContextMenu` - Sağ tık menüsü

### Data Display
- `Table` - Tablo
- `Avatar` - Profil resmi
- `Calendar` - Takvim
- `Chart` - Grafik (Recharts ile)
- `EnhancedChart` - Gelişmiş grafik
- `InteractiveChart` - Etkileşimli grafik
- `MetricCard` - Metrik kartı
- `Skeleton` - Yüklenme durumu
- `Progress` - İlerleme çubuğu

## 💡 Kullanım Örnekleri

### Basit Kart Kullanımı

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ExampleCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Başlık</CardTitle>
        <CardDescription>Açıklama</CardDescription>
      </CardHeader>
      <CardContent>
        <p>İçerik burada yer alır.</p>
      </CardContent>
    </Card>
  )
}
```

### Form ile Validasyon

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const formSchema = z.object({
  email: z.string().email("Geçerli bir email girin"),
  password: z.string().min(8, "Şifre en az 8 karakter olmalı"),
})

export function ExampleForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Gönder</Button>
      </form>
    </Form>
  )
}
```

### Button Bileşeni Örneği

```tsx
import { Button } from "@/components/ui/button"
import { Download, Plus, Search } from "lucide-react"

export function ButtonExamples() {
  return (
    <div className="space-y-4">
      {/* Temel varyantlar */}
      <div className="flex gap-2">
        <Button variant="default">Varsayılan</Button>
        <Button variant="destructive">Sil</Button>
        <Button variant="outline">Dış Çizgi</Button>
        <Button variant="secondary">İkincil</Button>
        <Button variant="ghost">Hayalet</Button>
        <Button variant="link">Bağlantı</Button>
      </div>

      {/* Boyutlar */}
      <div className="flex items-center gap-2">
        <Button size="sm">Küçük</Button>
        <Button size="default">Varsayılan</Button>
        <Button size="lg">Büyük</Button>
        <Button size="xl">Çok Büyük</Button>
      </div>

      {/* İkonlu butonlar */}
      <div className="flex gap-2">
        <Button iconLeft={<Plus />}>Ekle</Button>
        <Button iconRight={<Download />}>İndir</Button>
        <Button size="icon"><Search /></Button>
      </div>

      {/* Loading durumu */}
      <Button loading loadingText="Kaydediliyor...">
        Kaydet
      </Button>

      {/* Ripple efekti */}
      <Button ripple haptic="medium">
        Dokunmatik
      </Button>
    </div>
  )
}
```

### Dialog Bileşeni Örneği

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function DialogExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Dialog Aç</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Profil Düzenle</DialogTitle>
          <DialogDescription>
            Profil bilgilerinizi buradan güncelleyebilirsiniz.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Ad
            </Label>
            <Input id="name" defaultValue="Ahmet" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Değişiklikleri Kaydet</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### Toast Bildirimleri

```tsx
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export function ToastExample() {
  const showToast = () => {
    toast.success("İşlem başarıyla tamamlandı!", {
      description: "Değişiklikler kaydedildi.",
      action: {
        label: "Geri Al",
        onClick: () => console.log("Geri alındı"),
      },
    })
  }

  return (
    <div className="space-y-2">
      <Button onClick={showToast}>
        Başarı Bildirimi Göster
      </Button>
      
      <Button 
        variant="destructive" 
        onClick={() => toast.error("Bir hata oluştu!")}
      >
        Hata Bildirimi
      </Button>
      
      <Button 
        variant="outline" 
        onClick={() => toast.info("Bilgi mesajı")}
      >
        Bilgi Bildirimi
      </Button>
    </div>
  )
}
```

### İstatistik Kartı

```tsx
import { StatsCard } from "@/components/shared/StatsCard"
import { TrendingUp } from "lucide-react"

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatsCard
        title="Toplam Gelir"
        value="₺45,231"
        change={{ value: 12.5, type: "increase", period: "bu ay" }}
        icon={TrendingUp}
        color="green"
      />
    </div>
  )
}
```

## 💡 Gelişmiş Örnekler

### Login Formu

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

const loginSchema = z.object({
  email: z.string().email("Geçerli bir email adresi girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
  remember: z.boolean().default(false),
})

export function LoginForm() {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  })

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    console.log("Login data:", data)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Giriş Yap</CardTitle>
        <CardDescription>
          Hesabınıza giriş yapmak için bilgilerinizi girin
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="ornek@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Şifre</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="remember"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Beni hatırla</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Giriş Yap
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
```

### İletişim Formu

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const contactSchema = z.object({
  name: z.string().min(2, "Ad en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir email adresi girin"),
  subject: z.string().min(1, "Konu seçin"),
  message: z.string().min(10, "Mesaj en az 10 karakter olmalı"),
})

export function ContactForm() {
  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  })

  const onSubmit = (data: z.infer<typeof contactSchema>) => {
    console.log("Contact data:", data)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>İletişim Formu</CardTitle>
        <CardDescription>
          Sorularınız için bizimle iletişime geçin
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad Soyad</FormLabel>
                    <FormControl>
                      <Input placeholder="Adınız Soyadınız" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="ornek@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Konu</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Konu seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="general">Genel Bilgi</SelectItem>
                      <SelectItem value="support">Teknik Destek</SelectItem>
                      <SelectItem value="sales">Satış</SelectItem>
                      <SelectItem value="feedback">Geri Bildirim</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mesaj</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Mesajınızı buraya yazın..." 
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Mesaj Gönder
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
```

### Arama Formu

```tsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X } from "lucide-react"

export function SearchForm() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<string[]>([])

  const availableFilters = ["Kategori A", "Kategori B", "Kategori C"]

  const addFilter = (filter: string) => {
    if (!filters.includes(filter)) {
      setFilters([...filters, filter])
    }
  }

  const removeFilter = (filter: string) => {
    setFilters(filters.filter(f => f !== filter))
  }

  const clearAllFilters = () => {
    setFilters([])
    setSearchTerm("")
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Arama çubuğu */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtreler */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Filtreler:</span>
            {filters.map((filter) => (
              <Badge key={filter} variant="secondary" className="gap-1">
                {filter}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter(filter)}
                />
              </Badge>
            ))}
            {filters.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAllFilters}
                className="h-6 px-2"
              >
                Temizle
              </Button>
            )}
          </div>

          {/* Filtre seçenekleri */}
          <div className="flex flex-wrap gap-2">
            {availableFilters.map((filter) => (
              <Button
                key={filter}
                variant="outline"
                size="sm"
                onClick={() => addFilter(filter)}
                disabled={filters.includes(filter)}
                className="h-8"
              >
                <Filter className="h-3 w-3 mr-1" />
                {filter}
              </Button>
            ))}
          </div>

          {/* Sonuçlar */}
          <div className="text-sm text-muted-foreground">
            {searchTerm || filters.length > 0 ? (
              `"${searchTerm}" için ${filters.length} filtre ile arama sonuçları`
            ) : (
              "Arama yapmak için yukarıdaki alanı kullanın"
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

## 🆕 Yeni Sayfalar

### UI Components Showcase

**Route:** `/genel/ui-showcase`

Tüm shadcn/ui bileşenlerinin örneklerini içeren sayfa. Geliştiriciler için referans kaynağı.

**Özellikler:**
- Bileşen kategorileri (Form, Layout, Feedback, Overlay)
- Kod örnekleri
- Kopyalama özelliği
- Kurulum rehberi

### Form Examples

**Route:** `/genel/form-examples`

Farklı form tipleri ve validasyon örnekleri.

**Özellikler:**
- Basit form
- Çok adımlı form
- Gelişmiş validasyon
- Tarih seçici
- Komut paleti

## 🔧 Shared Bileşenler

### StatsCard

Dashboard için yeniden kullanılabilir istatistik kartı.

```tsx
import { StatsCard } from "@/components/shared/StatsCard"

<StatsCard
  title="Başlık"
  value="Değer"
  change={{ value: 10, type: "increase", period: "bu ay" }}
  icon={IconComponent}
  color="blue"
  onClick={() => console.log("clicked")}
/>
```

**Preset Varyantlar:**
- `RevenueCard` - Gelir kartı
- `UsersCard` - Kullanıcı kartı
- `OrdersCard` - Sipariş kartı
- `PendingCard` - Bekleyen işlemler kartı

### DataTableWrapper

Gelişmiş tablo bileşeni.

```tsx
import { DataTableWrapper } from "@/components/shared/DataTableWrapper"

const columns = [
  { key: "name", title: "Ad", sortable: true },
  { key: "email", title: "Email", filterable: true },
  { key: "status", title: "Durum", render: (value) => <Badge>{value}</Badge> }
]

<DataTableWrapper
  data={users}
  columns={columns}
  title="Kullanıcılar"
  searchable
  filterable
  sortable
  selectable
  pagination
/>
```

**Özellikler:**
- Arama
- Filtreleme
- Sıralama
- Sayfalama
- Satır seçimi
- Dışa aktarma
- Özelleştirilebilir sütunlar

## 🎯 Best Practices

### 1. Bileşen İmportları

```tsx
// ✅ Doğru
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// ❌ Yanlış
import { Button, Card } from "@/components/ui"
```

### 2. Form Validasyonu

```tsx
// ✅ Zod ile validasyon
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

// ✅ React Hook Form ile entegrasyon
const form = useForm({
  resolver: zodResolver(schema)
})
```

### 3. Responsive Tasarım

```tsx
// ✅ Tailwind responsive sınıfları
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <Card>...</Card>
</div>
```

### 4. Loading States

```tsx
// ✅ Skeleton ile loading
{loading ? (
  <Skeleton className="h-4 w-full" />
) : (
  <p>İçerik</p>
)}
```

### 5. Error Handling

```tsx
// ✅ Alert ile hata gösterimi
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertDescription>
    Bir hata oluştu
  </AlertDescription>
</Alert>
```

### 6. Bağımlılık Yönetimi

```tsx
// ✅ Bağımlılıkları doğru şekilde yönetin
// package.json'da sürümleri sabitleyin
{
  "@radix-ui/react-dialog": "^1.0.5",
  "class-variance-authority": "^0.7.1"
}

// ✅ Yardımcı dosyaları merkezi tutun
// components/ui/utils.ts - cn() fonksiyonu
// hooks/useHapticFeedback.ts - Haptic feedback
```

### 7. Performans Optimizasyonu

```tsx
// ✅ Memoized bileşenleri kullanın
import { MemoizedButton, MemoizedCard } from "@/components/ui"

// ✅ Gereksiz re-render'ları önleyin
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{data.map(item => <Card key={item.id}>{item.name}</Card>)}</div>
})

// ✅ Lazy loading kullanın
const LazyComponent = React.lazy(() => import('./HeavyComponent'))
```

### 8. Mobil Uyumluluk

```tsx
// ✅ Touch-friendly boyutlar kullanın
<Button size="lg" className="min-h-[44px]">Mobil Dostu</Button>

// ✅ Haptic feedback ekleyin
<Button haptic="medium" onClick={handleClick}>
  Dokunmatik Geri Bildirim
</Button>

// ✅ Responsive breakpoint'leri kullanın
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>Mobil Uyumlu</Card>
</div>
```

## 🐛 Troubleshooting

### Yaygın Sorunlar

#### 1. Bileşen Import Hatası

```bash
# Çözüm: Bileşeni tekrar ekleyin
npx shadcn@latest add button
```

#### 2. Stil Uygulanmıyor

```tsx
// Çözüm: cn utility kullanın
import { cn } from "@/lib/utils"

<Button className={cn("custom-class", className)} />
```

#### 3. Form Validasyonu Çalışmıyor

```tsx
// Çözüm: FormProvider ile sarmalayın
<FormProvider {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    ...
  </form>
</FormProvider>
```

#### 4. TypeScript Hataları

```tsx
// Çözüm: Doğru tip tanımları
interface Props {
  title: string
  value: string | number
  onChange?: (value: string) => void
}
```

#### 5. Bağımlılık Sürüm Uyumsuzlukları

```bash
# Sorun: Radix UI sürümleri uyumsuz
# Çözüm: Sürümleri güncelleyin
npm update @radix-ui/react-dialog @radix-ui/react-slot

# Veya belirli sürümleri yükleyin
npm install @radix-ui/react-dialog@^1.0.5
```

#### 6. Mobil Cihazlarda Performans Sorunları

```tsx
// Sorun: Mobilde yavaş render
// Çözüm: Memoization ve lazy loading kullanın

// ✅ Memoized bileşenler
const MemoizedCard = React.memo(Card)

// ✅ Lazy loading
const HeavyChart = React.lazy(() => import('./Chart'))

// ✅ Virtual scrolling büyük listeler için
import { FixedSizeList as List } from 'react-window'
```

## 📚 Ek Kaynaklar

- [shadcn/ui Resmi Dokümantasyon](https://ui.shadcn.com)
- [Radix UI Bileşenleri](https://www.radix-ui.com)
- [Tailwind CSS](https://tailwindcss.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod Validasyon](https://zod.dev)

## 🤝 Katkıda Bulunma

1. Yeni bileşen eklerken bu rehberi güncelleyin
2. Örnekleri test edin
3. Dokümantasyonu Türkçe tutun
4. Best practices'e uyun

---

**Son Güncelleme:** 2024-12-19  
**Versiyon:** 2.0.0  
**Yazar:** Kafkasder Yönetim Sistemi Ekibi
