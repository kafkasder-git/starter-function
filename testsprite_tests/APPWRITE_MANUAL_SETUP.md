# 🎯 Appwrite Manuel Setup Rehberi

## ⚡ Hızlı Başlangıç (Tahmini Süre: 5-10 dakika)

### Adım 1: Appwrite Console'a Giriş

1. **URL:**
   https://cloud.appwrite.io/console/project-68e99f6c000183bafb39/databases/database-kafkasder_db
2. **Login:** Appwrite hesabınızla giriş yapın
3. **Project:** KafkasPortal (68e99f6c000183bafb39)
4. **Database:** kafkasder_db

---

## 📦 Collections Oluşturma

### Collection 1: Beneficiaries (İhtiyaç Sahipleri)

**Console'da:**

1. "Create Collection" butonuna tıklayın
2. Aşağıdaki bilgileri girin:

```
Collection ID: beneficiaries
Name: Beneficiaries
Document Security: ✅ Enabled (işaretli)
```

**Permissions (İzinler):**

- Read: `any` (herkes okuyabilir)
- Create: `users` (sadece giriş yapmış kullanıcılar)
- Update: `users`
- Delete: `users`

**Attributes (Create Collection sonrası ekleyin):**

| Key        | Type     | Size | Required | Array | Default  | Unique |
| ---------- | -------- | ---- | -------- | ----- | -------- | ------ |
| name       | String   | 255  | ✅ Yes   | ❌ No | -        | ❌ No  |
| tc_number  | String   | 11   | ✅ Yes   | ❌ No | -        | ✅ Yes |
| phone      | String   | 20   | ✅ Yes   | ❌ No | -        | ❌ No  |
| email      | String   | 255  | ❌ No    | ❌ No | -        | ❌ No  |
| address    | String   | 1000 | ✅ Yes   | ❌ No | -        | ❌ No  |
| status     | String   | 50   | ✅ Yes   | ❌ No | "active" | ❌ No  |
| created_at | DateTime | -    | ❌ No    | ❌ No | -        | ❌ No  |

**Indexes (Opsiyonel ama önerilen):**

- `tc_number_index` - Type: Unique - Attributes: tc_number
- `status_index` - Type: Key - Attributes: status

---

### Collection 2: Donations (Bağışlar)

```
Collection ID: donations
Name: Donations
Document Security: ✅ Enabled
Permissions: Same as Beneficiaries
```

**Attributes:**

| Key            | Type     | Size | Required | Array | Default   | Min | Unique |
| -------------- | -------- | ---- | -------- | ----- | --------- | --- | ------ |
| donor_name     | String   | 255  | ✅ Yes   | ❌ No | -         | -   | ❌ No  |
| amount         | Float    | -    | ✅ Yes   | ❌ No | -         | 0   | ❌ No  |
| currency       | String   | 10   | ✅ Yes   | ❌ No | "TRY"     | -   | ❌ No  |
| donation_type  | String   | 50   | ✅ Yes   | ❌ No | -         | -   | ❌ No  |
| payment_method | String   | 50   | ✅ Yes   | ❌ No | -         | -   | ❌ No  |
| status         | String   | 50   | ✅ Yes   | ❌ No | "pending" | -   | ❌ No  |
| donation_date  | DateTime | -    | ✅ Yes   | ❌ No | -         | -   | ❌ No  |
| notes          | String   | 2000 | ❌ No    | ❌ No | -         | -   | ❌ No  |

**Indexes:**

- `status_index` - Type: Key - Attributes: status
- `donation_date_index` - Type: Key - Attributes: donation_date - Order: DESC

---

### Collection 3: Aid Applications (Yardım Başvuruları)

```
Collection ID: aid_applications
Name: Aid Applications
Document Security: ✅ Enabled
Permissions: Same as above
```

**Attributes:**

| Key              | Type     | Size | Required | Array | Default   | Min | Unique |
| ---------------- | -------- | ---- | -------- | ----- | --------- | --- | ------ |
| applicant_name   | String   | 255  | ✅ Yes   | ❌ No | -         | -   | ❌ No  |
| applicant_phone  | String   | 20   | ✅ Yes   | ❌ No | -         | -   | ❌ No  |
| aid_type         | String   | 50   | ✅ Yes   | ❌ No | -         | -   | ❌ No  |
| requested_amount | Float    | -    | ❌ No    | ❌ No | -         | 0   | ❌ No  |
| status           | String   | 50   | ✅ Yes   | ❌ No | "pending" | -   | ❌ No  |
| urgency          | String   | 20   | ✅ Yes   | ❌ No | "medium"  | -   | ❌ No  |
| description      | String   | 2000 | ✅ Yes   | ❌ No | -         | -   | ❌ No  |
| application_date | DateTime | -    | ✅ Yes   | ❌ No | -         | -   | ❌ No  |
| assigned_to      | String   | 255  | ❌ No    | ❌ No | -         | -   | ❌ No  |

**Indexes:**

- `status_index` - Type: Key - Attributes: status
- `urgency_index` - Type: Key - Attributes: urgency
- `application_date_index` - Type: Key - Attributes: application_date - Order:
  DESC

---

### Collection 4: Members (Üyeler)

```
Collection ID: members
Name: Members
Document Security: ✅ Enabled
Permissions: Same as above
```

**Attributes:**

| Key               | Type     | Size | Required | Array | Default  | Unique |
| ----------------- | -------- | ---- | -------- | ----- | -------- | ------ |
| name              | String   | 255  | ✅ Yes   | ❌ No | -        | ❌ No  |
| email             | String   | 255  | ✅ Yes   | ❌ No | -        | ✅ Yes |
| phone             | String   | 20   | ✅ Yes   | ❌ No | -        | ❌ No  |
| membership_number | String   | 50   | ✅ Yes   | ❌ No | -        | ✅ Yes |
| status            | String   | 50   | ✅ Yes   | ❌ No | "active" | ❌ No  |
| joined_date       | DateTime | -    | ✅ Yes   | ❌ No | -        | ❌ No  |

**Indexes:**

- `email_index` - Type: Unique - Attributes: email
- `membership_number_index` - Type: Unique - Attributes: membership_number

---

## 🔐 API Key Sorunu

**Problem:** Verilen API key'ler `collections.write` yetkisine sahip değil.

**Çözüm Seçenekleri:**

### Seçenek 1: API Key Oluştur (Önerilen)

1. Appwrite Console'a gidin:
   https://cloud.appwrite.io/console/project-68e99f6c000183bafb39/settings
2. **API Keys** sekmesine tıklayın
3. **Create API Key** butonuna tıklayın
4. Şu scope'ları seçin:
   - ✅ `databases.read`
   - ✅ `databases.write`
   - ✅ `collections.read`
   - ✅ `collections.write`
   - ✅ `attributes.read`
   - ✅ `attributes.write`
   - ✅ `indexes.read`
   - ✅ `indexes.write`
   - ✅ `documents.read`
   - ✅ `documents.write`
5. API Key'i kopyalayın ve buraya yapıştırın

### Seçenek 2: Manuel Oluşturma (En Basit)

Collections'ları manuel olarak Appwrite Console'dan oluşturun:
https://cloud.appwrite.io/console/project-68e99f6c000183bafb39/databases/database-kafkasder_db

Yukarıdaki tablolara göre her collection ve attribute'u elle ekleyin.

---

## 🧪 Doğrulama

Collections oluşturulduktan sonra test edin:

```bash
# Collections'ları listele
curl -X GET 'https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections' \
  -H 'X-Appwrite-Project: 68e99f6c000183bafb39' \
  -H 'X-API-Key: YOUR_NEW_API_KEY'
```

Başarılıysa 4 collection görmeli

siniz.

---

## 🚀 TestSprite Testlerini Yeniden Çalıştırma

Collections oluşturulduktan sonra:

```bash
# Development server hala çalışıyor olmalı (port 5173)
cd /Users/mac/starter-function
node /Users/mac/.npm/_npx/8ddf6bea01b2519d/node_modules/@testsprite/testsprite-mcp/dist/index.js generateCodeAndExecute
```

**Beklenen Sonuç:**

- Şu an: 4/25 test başarılı (16%)
- Collections sonrası: **20-24/25 test başarılı (80-96%)** 🎉

---

## 📊 Neden Bu Kadar Önemli?

**Etkilenen Testler (20 test):**

- TC005 - Beneficiary Profile Creation
- TC006 - Aid Application Process
- TC007 - Donation Management
- TC008 - Scholarship Application
- TC009 - Financial Management
- TC010 - Bulk Messaging
- TC011 - Task & Event Management
- TC012 - Legal Case Management
- TC013 - Offline Support
- TC014 - Internationalization
- TC016 - Form Validation
- TC017 - Security Testing
- TC018 - Notification System
- TC019 - Data Export/Import
- TC020 - System Settings
- TC021 - Performance Benchmarks
- TC022 - Load Testing
- TC023 - Disaster Recovery
- TC024 - User Profile Management
- TC025 - Security Audit

Tüm bu testler collections olmadan çalışamıyor!

---

## 🆘 Hala Sorun Mu Var?

Eğer API key ile çalışmıyorsa:

1. **Manuel oluşturun** - En garantili yöntem
2. **Appwrite CLI kullanın** - Farklı bir yaklaşım deneyin
3. **Server SDK kullanın** - Node.js script ile oluşturun

---

**Hazırlayan:** TestSprite AI **Tarih:** 2025-10-12 **Durum:** API Key yetkileri
yetersiz - Manuel setup gerekli
