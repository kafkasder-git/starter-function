# Rol ve Yetki Yapılandırması

**Tarih:** 2025-10-09  
**Durum:** ✅ Yapılandırıldı

## 📋 Genel Bakış

Sistemde 4 temel rol ve genişletilmiş yetki sistemi yapılandırıldı. Her rol,
belirli kaynaklara ve aksiyonlara erişim sağlar.

---

## 👥 Roller

### 1. 🔴 Admin (Yönetici)

**Yetki Seviyesi:** Tam Yetki

**Açıklama:** Sistem yöneticisi, tüm özelliklere tam erişim

**Yetkiler:**

- ✅ Kullanıcı Yönetimi: Tam yetki
- ✅ Üye Yönetimi: Tam yetki
- ✅ Bağış Yönetimi: Tam yetki
- ✅ Kampanya Yönetimi: Tam yetki
- ✅ Rapor Yönetimi: Tam yetki
- ✅ Sistem Ayarları: Tam yetki
- ✅ Denetim Logları: Tam yetki
- ✅ Rol Yönetimi: Tam yetki
- ✅ Yardım Talepleri: Tam yetki
- ✅ Finans İşlemleri: Tam yetki
- ✅ Partner Yönetimi: Tam yetki
- ✅ Etkinlik Yönetimi: Tam yetki
- ✅ Görev Yönetimi: Tam yetki
- ✅ Envanter Yönetimi: Tam yetki
- ✅ Hukuki İşlemler: Tam yetki

**Permission Pattern:** `*:*` (her şey)

**Mevcut Kullanıcılar:** 2 kişi

- Ali Viskhadzhiev (aliviskhadzhiev@kafkasportal.com)
- İsa Hamid (isahamid095@gmail.com)

---

### 2. 🟡 Manager (Müdür)

**Yetki Seviyesi:** Yönetim

**Açıklama:** Yönetim yetkisi, onay süreçlerinde aktif rol

**Yetkiler:**

- ✅ Üyeler: Okuma, Yazma
- ✅ Bağışlar: Okuma, Yazma, Onaylama
- ✅ Kampanyalar: Okuma, Yazma
- ✅ Raporlar: Okuma
- ✅ Kullanıcılar: Okuma
- ✅ Yardım Talepleri: Okuma, Yazma, Onaylama
- ✅ Finans: Okuma, Yazma
- ✅ Partnerler: Okuma, Yazma
- ✅ Etkinlikler: Okuma, Yazma
- ✅ Görevler: Okuma, Yazma, Atama
- ✅ Envanter: Okuma, Yazma
- ✅ Hukuki İşlemler: Okuma, Yazma
- ❌ Silme İşlemleri: Yok
- ❌ Sistem Ayarları: Yok
- ❌ Rol Yönetimi: Yok

**Permissions:**

```json
[
  "members:read",
  "members:write",
  "donations:read",
  "donations:write",
  "donations:approve",
  "campaigns:read",
  "campaigns:write",
  "reports:read",
  "users:read",
  "aid_requests:read",
  "aid_requests:write",
  "aid_requests:approve",
  "finance:read",
  "finance:write",
  "partners:read",
  "partners:write",
  "events:read",
  "events:write",
  "tasks:read",
  "tasks:write",
  "tasks:assign",
  "inventory:read",
  "inventory:write",
  "legal:read",
  "legal:write"
]
```

**Mevcut Kullanıcılar:** 1 kişi

- Mekke Hamid (mekkehamid@kafkasportal.com)

---

### 3. 🔵 Operator (Operatör)

**Yetki Seviyesi:** Operasyonel

**Açıklama:** Günlük operasyonel işlemleri yapabilir

**Yetkiler:**

- ✅ Üyeler: Okuma, Yazma
- ✅ Bağışlar: Okuma, Yazma
- ✅ Kampanyalar: Okuma
- ✅ Yardım Talepleri: Okuma, Yazma
- ✅ Finans: Okuma
- ✅ Partnerler: Okuma
- ✅ Etkinlikler: Okuma, Yazma
- ✅ Görevler: Okuma, Yazma
- ✅ Envanter: Okuma, Yazma
- ✅ Hukuki İşlemler: Okuma
- ❌ Onaylama İşlemleri: Yok
- ❌ Silme İşlemleri: Yok
- ❌ Raporlar: Yok

**Permissions:**

```json
[
  "members:read",
  "members:write",
  "donations:read",
  "donations:write",
  "campaigns:read",
  "aid_requests:read",
  "aid_requests:write",
  "finance:read",
  "partners:read",
  "events:read",
  "events:write",
  "tasks:read",
  "tasks:write",
  "inventory:read",
  "inventory:write",
  "legal:read"
]
```

**Mevcut Kullanıcılar:** 4 kişi

- Nurettin Osman (nurettinosman@kafkasportal.com)
- Abullah Aduyev (abullahaduev@kafkasportal.com)
- Ramzan İzrailov (ramzanizrailov@kafkasportal.com)
- Makka Machieva (makkamachieva@kafkasportal.com)

---

### 4. 🟢 Viewer (Görüntüleyici)

**Yetki Seviyesi:** Sadece Okuma

**Açıklama:** Sadece görüntüleme yetkisi

**Yetkiler:**

- ✅ Üyeler: Okuma
- ✅ Bağışlar: Okuma
- ✅ Kampanyalar: Okuma
- ✅ Raporlar: Okuma
- ✅ Yardım Talepleri: Okuma
- ✅ Finans: Okuma
- ✅ Partnerler: Okuma
- ✅ Etkinlikler: Okuma
- ✅ Görevler: Okuma
- ✅ Envanter: Okuma
- ✅ Hukuki İşlemler: Okuma
- ❌ Yazma İşlemleri: Yok
- ❌ Silme İşlemleri: Yok

**Permissions:**

```json
[
  "members:read",
  "donations:read",
  "campaigns:read",
  "reports:read",
  "aid_requests:read",
  "finance:read",
  "partners:read",
  "events:read",
  "tasks:read",
  "inventory:read",
  "legal:read"
]
```

**Mevcut Kullanıcılar:** 0 kişi

---

## 🔐 İzin Kaynakları (Resources)

### 1. **users** - Kullanıcı Yönetimi

- `users:read` - Kullanıcıları görüntüle
- `users:write` - Kullanıcı oluştur/düzenle
- `users:delete` - Kullanıcı sil
- `users:manage_roles` - Rolleri yönet
- `users:*` - Tam yetki

### 2. **members** - Üye Yönetimi

- `members:read` - Üyeleri görüntüle
- `members:write` - Üye oluştur/düzenle
- `members:delete` - Üye sil
- `members:export` - Üyeleri dışa aktar
- `members:*` - Tam yetki

### 3. **donations** - Bağış Yönetimi

- `donations:read` - Bağışları görüntüle
- `donations:write` - Bağış oluştur/düzenle
- `donations:approve` - Bağış onayla
- `donations:delete` - Bağış sil
- `donations:*` - Tam yetki

### 4. **campaigns** - Kampanya Yönetimi

- `campaigns:read` - Kampanyaları görüntüle
- `campaigns:write` - Kampanya oluştur/düzenle
- `campaigns:publish` - Kampanya yayınla
- `campaigns:delete` - Kampanya sil
- `campaigns:*` - Tam yetki

### 5. **aid_requests** - Yardım Talepleri

- `aid_requests:read` - Talepleri görüntüle
- `aid_requests:write` - Talep oluştur/düzenle
- `aid_requests:approve` - Talep onayla
- `aid_requests:delete` - Talep sil
- `aid_requests:*` - Tam yetki

### 6. **finance** - Finans İşlemleri

- `finance:read` - Finans işlemlerini görüntüle
- `finance:write` - Finans işlemi oluştur
- `finance:approve` - Finans işlemini onayla
- `finance:delete` - Finans işlemi sil
- `finance:*` - Tam yetki

### 7. **partners** - Partner Yönetimi

- `partners:read` - Partnerleri görüntüle
- `partners:write` - Partner oluştur/düzenle
- `partners:delete` - Partner sil
- `partners:*` - Tam yetki

### 8. **events** - Etkinlik Yönetimi

- `events:read` - Etkinlikleri görüntüle
- `events:write` - Etkinlik oluştur/düzenle
- `events:delete` - Etkinlik sil
- `events:*` - Tam yetki

### 9. **tasks** - Görev Yönetimi

- `tasks:read` - Görevleri görüntüle
- `tasks:write` - Görev oluştur/düzenle
- `tasks:assign` - Görev ata
- `tasks:delete` - Görev sil
- `tasks:*` - Tam yetki

### 10. **inventory** - Envanter Yönetimi

- `inventory:read` - Envanteri görüntüle
- `inventory:write` - Envanter oluştur/düzenle
- `inventory:delete` - Envanter sil
- `inventory:*` - Tam yetki

### 11. **legal** - Hukuki İşlemler

- `legal:read` - Hukuki işlemleri görüntüle
- `legal:write` - Hukuki işlem oluştur/düzenle
- `legal:delete` - Hukuki işlem sil
- `legal:*` - Tam yetki

### 12. **reports** - Rapor Yönetimi

- `reports:read` - Raporları görüntüle
- `reports:write` - Rapor oluştur
- `reports:export` - Rapor dışa aktar
- `reports:*` - Tam yetki

### 13. **settings** - Sistem Ayarları

- `settings:read` - Ayarları görüntüle
- `settings:write` - Ayarları düzenle
- `settings:*` - Tam yetki

### 14. **audit** - Denetim Logları

- `audit:read` - Denetim loglarını görüntüle
- `audit:*` - Tam yetki

### 15. **roles** - Rol Yönetimi

- `roles:manage` - Rolleri yönet
- `roles:*` - Tam yetki

---

## 📊 Kullanıcı Dağılımı

| Rol                    | Türkçe        | Kullanıcı Sayısı | Yüzde    |
| ---------------------- | ------------- | ---------------- | -------- |
| admin / yönetici       | Yönetici      | 2                | 28.6%    |
| manager / müdür        | Müdür         | 1                | 14.3%    |
| operator / operatör    | Operatör      | 4                | 57.1%    |
| viewer / görüntüleyici | Görüntüleyici | 0                | 0%       |
| **TOPLAM**             |               | **7**            | **100%** |

---

## 🔧 Rol Karşılaştırması

| Özellik                | Admin  | Manager              | Operator       | Viewer   |
| ---------------------- | ------ | -------------------- | -------------- | -------- |
| **Kullanıcı Yönetimi** | ✅ Tam | ✅ Okuma             | ❌             | ❌       |
| **Üye İşlemleri**      | ✅ Tam | ✅ Okuma/Yazma       | ✅ Okuma/Yazma | ✅ Okuma |
| **Bağış İşlemleri**    | ✅ Tam | ✅ Okuma/Yazma/Onay  | ✅ Okuma/Yazma | ✅ Okuma |
| **Kampanyalar**        | ✅ Tam | ✅ Okuma/Yazma       | ✅ Okuma       | ✅ Okuma |
| **Yardım Talepleri**   | ✅ Tam | ✅ Okuma/Yazma/Onay  | ✅ Okuma/Yazma | ✅ Okuma |
| **Finans**             | ✅ Tam | ✅ Okuma/Yazma       | ✅ Okuma       | ✅ Okuma |
| **Partnerler**         | ✅ Tam | ✅ Okuma/Yazma       | ✅ Okuma       | ✅ Okuma |
| **Etkinlikler**        | ✅ Tam | ✅ Okuma/Yazma       | ✅ Okuma/Yazma | ✅ Okuma |
| **Görevler**           | ✅ Tam | ✅ Okuma/Yazma/Atama | ✅ Okuma/Yazma | ✅ Okuma |
| **Envanter**           | ✅ Tam | ✅ Okuma/Yazma       | ✅ Okuma/Yazma | ✅ Okuma |
| **Hukuki İşlemler**    | ✅ Tam | ✅ Okuma/Yazma       | ✅ Okuma       | ✅ Okuma |
| **Raporlar**           | ✅ Tam | ✅ Okuma             | ❌             | ✅ Okuma |
| **Sistem Ayarları**    | ✅ Tam | ❌                   | ❌             | ❌       |
| **Denetim Logları**    | ✅ Tam | ❌                   | ❌             | ❌       |
| **Rol Yönetimi**       | ✅ Tam | ❌                   | ❌             | ❌       |

**Semboller:**

- ✅ **Tam:** Okuma, Yazma, Silme, tüm özel işlemler
- ✅ **Okuma/Yazma:** Görüntüleme ve düzenleme
- ✅ **Okuma:** Sadece görüntüleme
- ❌ **Yok:** Erişim yok

---

## 💻 Kod Kullanımı

### Rol Servisi Import

```typescript
import { rolesService } from '../services/rolesService';
```

### Tüm Rolleri Getir

```typescript
const { data: roles, error } = await rolesService.getRoles();

if (roles) {
  roles.forEach((role) => {
    console.log(role.display_name, role.permissions);
  });
}
```

### Kullanıcının Rolünü Kontrol Et

```typescript
const { data: userRole } = await rolesService.getUserRole(userId);

if (userRole) {
  console.log('Kullanıcı Rolü:', userRole.display_name);
  console.log('Yetkiler:', userRole.permissions);
}
```

### Yetki Kontrolü

```typescript
// Basit kontrol
const hasAccess = await rolesService.hasPermission(userId, 'donations:approve');

// Rol bazlı kontrol
const { data: role } = await rolesService.getRole(roleId);
if (role) {
  const canApprove = rolesService.roleHasAccess(role, 'donations', 'approve');
}
```

### Kullanıcı Rolünü Değiştir

```typescript
const { data, error } = await rolesService.updateUserRole(
  userId,
  'manager', // yeni rol
);

if (data) {
  console.log('Rol başarıyla güncellendi');
}
```

### Rol İstatistikleri

```typescript
const { data: stats } = await rolesService.getRoleStats();

// Output: { "yönetici": 2, "müdür": 1, "operatör": 4 }
```

### Yeni Rol Oluştur

```typescript
const { data: newRole } = await rolesService.createRole(
  'accountant',
  'Muhasebeci',
  'Finans ve muhasebe işlemleri',
  [
    'finance:read',
    'finance:write',
    'donations:read',
    'reports:read',
    'reports:export',
  ],
);
```

---

## 🎯 React Component'te Kullanım

### Permission Hook

```typescript
// hooks/usePermission.ts
import { useState, useEffect } from 'react';
import { rolesService } from '../services/rolesService';
import { useAuthStore } from '../stores/authStore';

export const usePermission = (resource: string, action: string = 'read') => {
  const [hasPermission, setHasPermission] = useState(false);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const checkPermission = async () => {
      if (!user?.id) {
        setHasPermission(false);
        return;
      }

      const permission = await rolesService.hasPermission(
        user.id,
        `${resource}:${action}`,
      );

      setHasPermission(permission);
    };

    checkPermission();
  }, [user, resource, action]);

  return hasPermission;
};

// Kullanım:
const canApproveDonations = usePermission('donations', 'approve');
const canDeleteMembers = usePermission('members', 'delete');
```

### Protected Component

```typescript
import { usePermission } from '../hooks/usePermission';

function DonationApprovalButton() {
  const canApprove = usePermission('donations', 'approve');

  if (!canApprove) {
    return null; // veya disabled button
  }

  return (
    <button onClick={handleApprove}>
      Bağışı Onayla
    </button>
  );
}
```

### Role-Based Rendering

```typescript
import { useAuthStore } from '../stores/authStore';

function AdminPanel() {
  const user = useAuthStore(state => state.user);
  const isAdmin = user?.role === 'admin' || user?.role === 'yönetici';

  if (!isAdmin) {
    return <div>Bu sayfaya erişim yetkiniz yok</div>;
  }

  return (
    <div>
      {/* Admin özellikleri */}
    </div>
  );
}
```

---

## 🛡️ RLS (Row Level Security) Entegrasyonu

Roller, Supabase RLS policy'leri ile otomatik entegre çalışır:

### Örnek Policy

```sql
-- Sadece admin'ler sistem ayarlarını değiştirebilir
CREATE POLICY "settings_update_admin_only"
ON system_settings FOR UPDATE
USING (
  (select auth.uid()) IN (
    SELECT id FROM user_profiles
    WHERE role IN ('admin', 'yönetici')
  )
);

-- Manager'lar ve admin'ler bağış onaylayabilir
CREATE POLICY "donations_approve_manager_admin"
ON donations FOR UPDATE
USING (
  (select auth.uid()) IN (
    SELECT id FROM user_profiles
    WHERE role IN ('admin', 'yönetici', 'manager', 'müdür')
  )
);
```

---

## 📋 Yapılacaklar

### Tamamlandı ✅

- [x] 4 temel rol oluşturuldu
- [x] 23 temel izin tanımlandı
- [x] 24 yeni izin eklendi (aid_requests, finance, partners, vb.)
- [x] Rollere izinler atandı
- [x] 7 kullanıcıya rol atandı
- [x] RolesService oluşturuldu
- [x] Type-safe implementasyon

### Gelecek İyileştirmeler 🔄

- [ ] Custom rol oluşturma UI
- [ ] Kullanıcı-rol atama UI
- [ ] İzin matrisi görselleştirme
- [ ] Rol bazlı dashboard widget'ları
- [ ] Audit log entegrasyonu
- [ ] Dinamik RLS policy generator

---

## 📖 Enum Değerleri

### user_role Enum

```typescript
type UserRole =
  | 'admin' // İngilizce
  | 'manager'
  | 'operator'
  | 'viewer'
  | 'yönetici' // Türkçe
  | 'müdür'
  | 'operatör'
  | 'görüntüleyici';
```

**Not:** Hem İngilizce hem Türkçe değerler destekleniyor. Mapping:

- `admin` ↔ `yönetici`
- `manager` ↔ `müdür`
- `operator` ↔ `operatör`
- `viewer` ↔ `görüntüleyici`

---

## 🔍 Örnek Sorgular

### Belirli Bir İzne Sahip Kullanıcıları Bul

```sql
SELECT up.id, up.name, up.email, up.role, r.permissions
FROM user_profiles up
JOIN roles r ON r.name = up.role
WHERE r.permissions @> '["donations:approve"]'::jsonb
  AND up.is_active = true;
```

### Rol Bazında Kullanıcı Sayısı

```sql
SELECT
  role,
  COUNT(*) as user_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM user_profiles
WHERE is_active = true
GROUP BY role
ORDER BY user_count DESC;
```

### Aktif İzinleri Kaynak Bazında Grupla

```sql
SELECT
  resource,
  COUNT(*) as permission_count,
  json_agg(action ORDER BY action) as actions
FROM permissions
GROUP BY resource
ORDER BY resource;
```

---

## ⚙️ Yapılandırma

### Yeni İzin Ekleme

```sql
INSERT INTO permissions (name, display_name, description, resource, action)
VALUES (
  'beneficiaries_write',
  'Yararlanıcı Oluştur/Düzenle',
  'Yararlanıcı oluşturma ve düzenleme',
  'beneficiaries',
  'write'
);
```

### Role İzin Ekleme

```sql
UPDATE roles
SET permissions = permissions || '["beneficiaries:write"]'::jsonb
WHERE name = 'operator';
```

### Kullanıcıya Özel İzin Verme

```sql
INSERT INTO user_permissions (user_id, permission_id, granted_by, is_active)
SELECT
  'user-uuid',
  id,
  auth.uid(),
  true
FROM permissions
WHERE name = 'reports:export';
```

---

## 📚 Servis API Referansı

### `rolesService.getRoles()`

Tüm rolleri getirir.

**Return:** `ApiResponse<Role[]>`

### `rolesService.getRole(id: string)`

Belirli bir rolü getirir.

**Return:** `ApiResponse<Role>`

### `rolesService.getPermissions()`

Tüm izinleri getirir.

**Return:** `ApiResponse<Permission[]>`

### `rolesService.getPermissionsByResource()`

İzinleri kaynak bazında gruplar.

**Return:** `ApiResponse<Record<string, Permission[]>>`

### `rolesService.hasPermission(userId, permissionName)`

Kullanıcının belirli bir izni olup olmadığını kontrol eder.

**Return:** `Promise<boolean>`

### `rolesService.getUserRole(userId)`

Kullanıcının rol detaylarını getirir.

**Return:** `ApiResponse<RoleWithPermissions>`

### `rolesService.updateUserRole(userId, newRole)`

Kullanıcının rolünü değiştirir.

**Return:** `ApiResponse<boolean>`

### `rolesService.getUsersWithRoles()`

Tüm kullanıcıları rolleriyle birlikte getirir.

**Return:** `ApiResponse<UserWithRole[]>`

### `rolesService.getRoleStats()`

Rol bazında kullanıcı istatistiklerini getirir.

**Return:** `ApiResponse<Record<string, number>>`

### `rolesService.createRole(name, displayName, description, permissions)`

Yeni rol oluşturur.

**Return:** `ApiResponse<Role>`

### `rolesService.updateRole(id, updates)`

Rol bilgilerini günceller.

**Return:** `ApiResponse<Role>`

### `rolesService.getPermissionMatrix(role)`

Rolün izin matrisini döner.

**Return:** `Record<string, string[]>`

### `rolesService.roleHasAccess(role, resource, action)`

Rolün belirli bir kaynağa erişimi olup olmadığını kontrol eder.

**Return:** `boolean`

---

## ✅ Başarı Metrikleri

- ✅ 4 temel rol yapılandırıldı
- ✅ 47 izin tanımlandı (23 mevcut + 24 yeni)
- ✅ 7 aktif kullanıcı
- ✅ Type-safe rol servisi oluşturuldu
- ✅ İki dilli destek (Türkçe/İngilizce)
- ✅ Granular permission system
- ✅ RLS entegrasyonu

---

## 🚀 Sonraki Adımlar

1. **UI Komponenti Oluştur**
   - Rol yönetim sayfası
   - Kullanıcı-rol atama ekranı
   - İzin matrisi tablosu

2. **Permission Guards**
   - React route guards
   - Component-level guards
   - API endpoint guards

3. **Audit Logging**
   - Rol değişikliklerini logla
   - İzin değişikliklerini kaydet

---

**Rol sistemi hazır! 🎉**

Kullanıcılar artık yetki seviyelerine göre sistemi kullanabilir.
