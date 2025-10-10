# Rol Uyumluluk Raporu

## 🚨 Kritik Sorunlar

### 1. AuthStore - Supabase Uyumsuzluğu

**Sorun:** `authStore.ts` sadece `auth.users` tablosundaki `user_metadata` ve
`app_metadata`'yı kontrol ediyor, ancak `user_profiles` tablosunu kontrol
etmiyor.

**Etkilenen Kullanıcılar:**

- ✅ isahamid095@gmail.com → admin (✅ metadata'da var)
- ❌ aliviskhadzhiev@kafkasportal.com → yönetici (❌ sadece profile'da)
- ❌ mekkehamid@kafkasportal.com → müdür (❌ sadece profile'da)
- ❌ abullahaduev@kafkasportal.com → operatör (❌ sadece profile'da)
- ❌ makkamachieva@kafkasportal.com → operatör (❌ sadece profile'da)
- ❌ nurettinosman@kafkasportal.com → operatör (❌ sadece profile'da)
- ❌ ramzanizrailov@kafkasportal.com → operatör (❌ sadece profile'da)

### 2. Türkçe Rol Tanıma Sorunu

**Sorun:** Uygulama kodu sadece İngilizce rolleri tanıyor:

```typescript
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  OPERATOR = 'operator',
  VIEWER = 'viewer',
}
```

Ancak Supabase'de hem İngilizce hem Türkçe roller var:

- admin, manager, operator, viewer (İngilizce)
- yönetici, müdür, operatör, görüntüleyici (Türkçe)

**authStore.ts satır 100-104:**

```typescript
if (
  appMetadata.role &&
  Object.values(UserRole).includes(appMetadata.role as UserRole)
) {
  role = appMetadata.role as UserRole;
} else if (
  metadata.role &&
  Object.values(UserRole).includes(metadata.role as UserRole)
) {
  role = metadata.role as UserRole;
}
```

Bu kod Türkçe rolleri tanımaz ve default olarak `VIEWER` rolü atar!

### 3. Role Normalization Kullanılmıyor

**Mevcut Çözüm:** `lib/roleMapping.ts` dosyasında normalizeRoleToEnglish
fonksiyonu var ama authStore kullanmıyor.

## 📊 Veritabanı Durumu

### Kullanıcı Rolleri:

| Email                            | app_metadata | user_metadata | user_profiles | Durum                    |
| -------------------------------- | ------------ | ------------- | ------------- | ------------------------ |
| isahamid095@gmail.com            | admin        | admin         | admin         | ✅ Çalışıyor             |
| aliviskhadzhiev@kafkasportal.com | null         | null          | yönetici      | ❌ Viewer olarak görülür |
| mekkehamid@kafkasportal.com      | null         | null          | müdür         | ❌ Viewer olarak görülür |
| abullahaduev@kafkasportal.com    | null         | null          | operatör      | ❌ Viewer olarak görülür |
| makkamachieva@kafkasportal.com   | null         | null          | operatör      | ❌ Viewer olarak görülür |
| nurettinosman@kafkasportal.com   | null         | null          | operatör      | ❌ Viewer olarak görülür |
| ramzanizrailov@kafkasportal.com  | null         | null          | operatör      | ❌ Viewer olarak görülür |

## 🔧 Gerekli Düzeltmeler

### 1. AuthStore Güncellemesi (Öncelikli)

```typescript
// stores/authStore.ts - buildUserFromSupabaseUser fonksiyonu
import { normalizeRoleToEnglish } from '../lib/roleMapping';

const buildUserFromSupabaseUser = (supabaseUser: SupabaseUser): User => {
  const metadata = supabaseUser.user_metadata;
  const appMetadata = supabaseUser.app_metadata;

  let role: UserRole = UserRole.VIEWER;

  // Get role from app_metadata or user_metadata
  let rawRole = appMetadata.role || metadata.role;

  // Normalize Turkish roles to English
  if (rawRole) {
    const normalizedRole = normalizeRoleToEnglish(rawRole);
    if (Object.values(UserRole).includes(normalizedRole as UserRole)) {
      role = normalizedRole as UserRole;
    }
  }

  // ... rest of the code
};
```

### 2. Tüm Kullanıcılar İçin Metadata Güncelleme

Her kullanıcı için `auth.users` tablosunda metadata'yı güncelle:

```sql
UPDATE auth.users u
SET
  raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    to_jsonb(CASE
      WHEN p.role = 'yönetici' THEN 'admin'
      WHEN p.role = 'müdür' THEN 'manager'
      WHEN p.role = 'operatör' THEN 'operator'
      WHEN p.role = 'görüntüleyici' THEN 'viewer'
      ELSE p.role
    END)
  ),
  updated_at = now()
FROM public.user_profiles p
WHERE u.id = p.id
  AND p.role IS NOT NULL
  AND (u.raw_app_meta_data->>'role' IS NULL);
```

### 3. User Profiles Normalizasyonu

Tüm Türkçe rolleri İngilizce'ye çevir:

```sql
UPDATE public.user_profiles
SET
  role = CASE
    WHEN role = 'yönetici' THEN 'admin'
    WHEN role = 'müdür' THEN 'manager'
    WHEN role = 'operatör' THEN 'operator'
    WHEN role = 'görüntüleyici' THEN 'viewer'
    ELSE role
  END,
  updated_at = now()
WHERE role IN ('yönetici', 'müdür', 'operatör', 'görüntüleyici');
```

## 📝 İzin Eşleşmeleri

### Admin Rolü - Tüm İzinler ✅

- ✅ VIEW_DASHBOARD
- ✅ VIEW_DONATIONS, CREATE_DONATION, EDIT_DONATION, DELETE_DONATION
- ✅ VIEW_MEMBERS, CREATE_MEMBER, EDIT_MEMBER, DELETE_MEMBER
- ✅ VIEW_AID, CREATE_AID, EDIT_AID, DELETE_AID, APPROVE_AID
- ✅ VIEW_FINANCE, CREATE_FINANCE, EDIT_FINANCE, DELETE_FINANCE,
  **MANAGE_FINANCIAL**
- ✅ VIEW_MESSAGES, SEND_MESSAGES
- ✅ VIEW_EVENTS, CREATE_EVENT, EDIT_EVENT, DELETE_EVENT
- ✅ VIEW_SETTINGS, EDIT_SETTINGS
- ✅ VIEW_USERS, CREATE_USER, EDIT_USER, DELETE_USER
- ✅ VIEW_REPORTS, EXPORT_REPORTS

### Manager (Müdür) Rolü

- ✅ Finansal yönetim dahil çoğu yetki
- ✅ MANAGE_FINANCIAL ✅
- ❌ Kullanıcı silme (DELETE_USER)
- ❌ Sistem ayarları düzenleme (EDIT_SETTINGS)

### Operator (Operatör) Rolü

- ✅ Görüntüleme ve oluşturma
- ❌ MANAGE_FINANCIAL ❌
- ❌ Onaylama, silme, düzenleme yetkileri yok

### Viewer (Görüntüleyici) Rolü

- ✅ Sadece görüntüleme
- ❌ Hiçbir değişiklik yapamaz

## ⚠️ Acil Yapılması Gerekenler

1. **AuthStore'u güncelle** - roleMapping kullan
2. **Tüm kullanıcıların metadata'sını senkronize et**
3. **user_profiles rollerini İngilizce'ye normaliz et**
4. **Test et**: Tüm kullanıcıların doğru yetkilerle giriş yaptığını doğrula

## 🎯 isahamid095@gmail.com Durumu

✅ **Bu kullanıcı şu an çalışıyor** çünkü:

- auth.users → app_metadata.role = "admin" ✅
- auth.users → user_metadata.role = "admin" ✅
- user_profiles → role = "admin" ✅

Ancak diğer kullanıcılar için sorun var!
