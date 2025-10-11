# Appwrite MCP Database Setup Guide

Bu rehber, Appwrite MCP ile tam bir veritabanı sistemi kurulumunu açıklar. Sistem şunları içerir:

- ✅ Veritabanı ve koleksiyonlar
- ✅ Tablo şemaları ve indeksler
- ✅ Row Level Security (RLS) politikaları
- ✅ Kullanıcı rolleri ve yetkileri
- ✅ Kimlik doğrulama sistemi
- ✅ Yedekleme ve kurtarma sistemi
- ✅ Örnek veriler

## 🚀 Hızlı Başlangıç

### 1. Gereksinimler

- Node.js 18+
- Appwrite hesabı
- Appwrite API anahtarı

### 2. Kurulum

```bash
# Proje dizinine gidin
cd /home/pc/panel

# Gerekli paketleri yükleyin
npm install appwrite

# Kurulum scriptini çalıştırın
node scripts/setup-appwrite-system.js
```

### 3. Ortam Değişkenleri

Script otomatik olarak `.env` dosyası oluşturur. Aşağıdaki değerleri güncelleyin:

```env
# Appwrite Configuration
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=68e99f6c000183bafb39
VITE_APPWRITE_DATABASE_ID=your-database-id
APPWRITE_API_KEY=your-api-key

# Application Configuration
VITE_APP_NAME=Kafkasder Management System
VITE_APP_VERSION=1.0.0
VITE_APP_DEBUG=true
```

## 📊 Veritabanı Yapısı

### Koleksiyonlar

| Koleksiyon | Açıklama | Doküman Sayısı |
|------------|----------|----------------|
| `user_profiles` | Kullanıcı profilleri | ~4 |
| `beneficiaries` | Yardım alan kişiler | ~2 |
| `donations` | Bağışlar | ~2 |
| `campaigns` | Kampanyalar | 0 |
| `aid_applications` | Yardım başvuruları | 0 |
| `notifications` | Bildirimler | 0 |
| `tasks` | Görevler | 0 |
| `finance_transactions` | Mali işlemler | 0 |
| `legal_consultations` | Hukuki danışmanlık | 0 |
| `events` | Etkinlikler | 0 |
| `inventory_items` | Envanter | 0 |
| `backups` | Yedekleme kayıtları | 1 |

### Kullanıcı Rolleri

| Rol | Açıklama | Yetkiler |
|-----|----------|----------|
| `admin` | Sistem yöneticisi | Tüm yetkiler |
| `manager` | Yönetici | Çoğu yetki, silme hariç |
| `operator` | Operatör | Sınırlı yetkiler |
| `viewer` | Görüntüleyici | Sadece okuma |

### Varsayılan Kullanıcılar

| Email | Rol | Şifre |
|-------|-----|-------|
| admin@kafkasder.org | admin | (Appwrite'da oluşturulacak) |
| manager@kafkasder.org | manager | (Appwrite'da oluşturulacak) |
| operator@kafkasder.org | operator | (Appwrite'da oluşturulacak) |
| viewer@kafkasder.org | viewer | (Appwrite'da oluşturulacak) |

## 🔐 Güvenlik

### Row Level Security (RLS) Politikaları

Her koleksiyon için özel RLS politikaları tanımlanmıştır:

- **Kullanıcı Profilleri**: Kullanıcılar kendi profillerini okuyabilir, yöneticiler tüm profilleri okuyabilir
- **Yardım Alanlar**: Tüm aktif kullanıcılar okuyabilir, yöneticiler oluşturabilir/güncelleyebilir
- **Bağışlar**: Tüm aktif kullanıcılar okuyabilir, yöneticiler oluşturabilir/güncelleyebilir
- **Görevler**: Kullanıcılar kendilerine atanan görevleri okuyabilir/güncelleyebilir

### Yetki Sistemi

```typescript
// Örnek yetki kontrolü
const hasPermission = await appwriteUserService.hasPermission(userId, 'create_beneficiary');
const hasRole = await appwriteUserService.hasRole(userId, 'admin');
```

## 💾 Yedekleme Sistemi

### Otomatik Yedekleme

- **Sıklık**: Günlük saat 02:00
- **Format**: JSON ve CSV
- **Sıkıştırma**: Desteklenir
- **Şifreleme**: Desteklenir

### Manuel Yedekleme

```typescript
// Tam yedekleme oluştur
const { data: backup } = await backupService.createBackup({
  collections: ['beneficiaries', 'donations'],
  includeMetadata: true,
  compress: true
});

// Yedekleme listele
const { data: backups } = await backupService.listBackups();

// Yedeklemeden geri yükle
const { error } = await backupService.restoreBackup(backupData, {
  overwriteExisting: false,
  validateData: true
});
```

## 🔧 Geliştirme

### Servisler

| Servis | Açıklama |
|--------|----------|
| `appwriteUserService` | Kullanıcı yönetimi |
| `appwriteAuthService` | Kimlik doğrulama |
| `backupService` | Yedekleme ve kurtarma |

### Örnek Kullanım

```typescript
import { appwriteUserService } from './services/appwriteUserService';
import { appwriteAuthService } from './services/appwriteAuthService';
import { backupService } from './services/backupService';

// Kullanıcı oluştur
const { data: user } = await appwriteUserService.createUser({
  user_id: 'user123',
  email: 'user@example.com',
  name: 'John Doe',
  role: 'operator'
});

// Giriş yap
const { data: authUser } = await appwriteAuthService.login({
  email: 'user@example.com',
  password: 'password123'
});

// Yedekleme oluştur
const { data: backup } = await backupService.createBackup();
```

## 📱 MCP Server Kurulumu

### Cursor IDE için MCP Konfigürasyonu

`.cursorrules` dosyası otomatik olarak oluşturulur:

```json
{
    "mcpServers": {
        "appwrite-api": {
            "command": "uvx",
            "args": [
                "mcp-server-appwrite",
                "--users"
            ],
            "env": {
                "APPWRITE_API_KEY": "your-api-key",
                "APPWRITE_PROJECT_ID": "68e99f6c000183bafb39",
                "APPWRITE_ENDPOINT": "https://fra.cloud.appwrite.io/v1"
            }
        }
    }
}
```

### MCP Server Kullanımı

MCP server kurulduktan sonra Cursor IDE'de Appwrite komutlarını kullanabilirsiniz:

- Kullanıcı oluşturma
- Kullanıcı listeleme
- Kullanıcı güncelleme
- Kullanıcı silme
- Oturum yönetimi

## 🚨 Sorun Giderme

### Yaygın Sorunlar

1. **API Anahtarı Hatası**
   ```bash
   Error: Invalid API key
   ```
   **Çözüm**: Appwrite Console'dan doğru API anahtarını alın

2. **Veritabanı Bulunamadı**
   ```bash
   Error: Database not found
   ```
   **Çözüm**: `VITE_APPWRITE_DATABASE_ID` değerini kontrol edin

3. **Koleksiyon Oluşturma Hatası**
   ```bash
   Error: Collection already exists
   ```
   **Çözüm**: Bu normal bir durumdur, mevcut koleksiyon kullanılır

### Log Kontrolü

```bash
# Uygulama loglarını kontrol edin
tail -f logs/app.log

# Appwrite loglarını kontrol edin
# Appwrite Console > Logs bölümünden
```

## 📈 Performans

### Optimizasyon Önerileri

1. **İndeksler**: Tüm sorgu alanları için indeks oluşturulmuştur
2. **Sayfalama**: Büyük veri setleri için sayfalama kullanın
3. **Önbellekleme**: Sık kullanılan verileri önbelleğe alın
4. **Yedekleme**: Düzenli yedekleme yapın

### İzleme

```typescript
// Performans izleme
const startTime = Date.now();
const { data } = await db.list('beneficiaries', queries);
const duration = Date.now() - startTime;
console.log(`Query took ${duration}ms`);
```

## 🔄 Güncellemeler

### Sistem Güncellemesi

```bash
# Yeni koleksiyon ekleme
node scripts/add-collection.js

# Şema güncelleme
node scripts/update-schema.js

# Veri migrasyonu
node scripts/migrate-data.js
```

### Yedekleme Güncellemesi

```bash
# Yedekleme formatını güncelle
node scripts/update-backup-format.js

# Yedekleme politikalarını güncelle
node scripts/update-backup-policies.js
```

## 📞 Destek

### Dokümantasyon

- [Appwrite Dokümantasyonu](https://appwrite.io/docs)
- [MCP Server Dokümantasyonu](https://github.com/appwrite/mcp-server-appwrite)

### Topluluk

- [Appwrite Discord](https://discord.gg/appwrite)
- [GitHub Issues](https://github.com/appwrite/appwrite/issues)

### Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

**Not**: Bu kurulum rehberi sürekli güncellenmektedir. En güncel bilgiler için GitHub repository'sini kontrol edin.
