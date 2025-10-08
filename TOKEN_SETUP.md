# 🔑 Cloudflare API Token Kurulum Rehberi

## Mevcut Sorun

Token şu anda sadece **User Details** okuyabiliyor, ancak **Pages deploy**
yetkisi yok.

```
✅ User → User Details → Read (ÇALIŞIYOR)
❌ Account → Cloudflare Pages → Edit (EKSİK!)
```

---

## ✅ Doğru Token Oluşturma Adımları

### 1. Token Sayfasına Gidin

🔗 **https://dash.cloudflare.com/8a9f71fb44d0cc7341faa4f0406d536b/api-tokens**

### 2. Create Custom Token

1. **"Create Token"** butonuna tıklayın
2. **"Create Custom Token"** seçeneğini seçin

### 3. Token Ayarları

#### Token Name

```
kafkasder-pages-deploy
```

#### Permissions (ÖNEMLİ!)

**Şu 2 izni MUTLAKA ekleyin:**

| Type        | Permission           | Access Level |
| ----------- | -------------------- | ------------ |
| **Account** | **Cloudflare Pages** | **Edit** ✅  |
| **User**    | **User Details**     | **Read** ✅  |

#### Account Resources

```
Include: All accounts
```

veya

```
Include: Admin@kafkasderpanel.com's Account
```

#### IP Address Filtering (Opsiyonel)

```
Is in: [Boş bırakın - tüm IP'ler]
```

#### TTL (Token Geçerlilik Süresi)

```
Start Date: Today
End Date: 1 year from now (veya Custom)
```

### 4. Token Oluştur

1. **"Continue to summary"** butonuna tıklayın
2. İzinleri kontrol edin:
   - ✅ Account - Cloudflare Pages - Edit
   - ✅ User - User Details - Read
3. **"Create Token"** butonuna tıklayın

### 5. Token'ı Kopyalayın

⚠️ **ÖNEMLİ:** Token sadece bir kez gösterilir! Güvenli bir yere kaydedin.

```
your-new-token-here
```

---

## 🚀 Token ile Deploy

Token oluşturduktan sonra:

```bash
# Terminal'de
cd /Users/mac/panel-7

# Token'ı environment variable olarak ayarlayın
export CLOUDFLARE_API_TOKEN="your-new-token-here"

# Deploy edin
npm run deploy:prod
```

veya tek satırda:

```bash
CLOUDFLARE_API_TOKEN="your-new-token-here" npm run deploy:prod
```

---

## 🔍 Token'ı Test Etme

Deploy öncesi token'ın çalışıp çalışmadığını test edin:

```bash
# Token bilgilerini kontrol et
CLOUDFLARE_API_TOKEN="your-token" npx wrangler whoami

# Başarılı ise şöyle bir çıktı görmelisiniz:
# ✅ Account: Admin@kafkasderpanel.com's Account
# ✅ Account ID: 8a9f71fb44d0cc7341faa4f0406d536b
```

---

## ⚠️ Sık Yapılan Hatalar

### ❌ Hata 1: Sadece "User Details - Read" izni

Token deploy yapamaz, sadece hesap bilgilerini okuyabilir.

**Çözüm:** "Account → Cloudflare Pages → Edit" iznini ekleyin.

### ❌ Hata 2: "Workers" izni eklemek

Workers ve Pages farklı servislerdir.

**Çözüm:** "Workers" değil, "Cloudflare Pages" iznini seçin.

### ❌ Hata 3: Account Resources boş

Token hiçbir hesapta çalışamaz.

**Çözüm:** "Include: All accounts" veya spesifik hesabınızı seçin.

---

## 🎯 Alternatif: Git Integration (Daha Kolay)

API token sorunları devam ederse, **Git Integration** kullanın:

### Avantajları:

- ✅ Token gerekmez
- ✅ Otomatik deployment
- ✅ Her push deploy olur
- ✅ Preview deployments

### Nasıl Yapılır:

1. **Cloudflare Pages Dashboard:** https://dash.cloudflare.com/pages
2. **"Create a project"** → **"Connect to Git"**
3. **GitHub'ı bağlayın ve repository seçin**
4. **Build ayarları:**
   ```
   Build command: npm run build
   Build output: dist
   ```
5. **Environment variables ekleyin** (Dashboard'dan)
6. **Save and Deploy**

---

## 📊 Karşılaştırma

| Özellik             | API Token  | Git Integration |
| ------------------- | ---------- | --------------- |
| Kurulum             | Orta       | Kolay           |
| Otomatik Deploy     | ❌         | ✅              |
| CI/CD               | ✅         | ✅              |
| Preview Deployments | ❌         | ✅              |
| Rollback            | Zor        | Kolay           |
| **Önerilen**        | CI/CD için | Genel kullanım  |

---

## 🆘 Hala Sorun Var mı?

### Seçenek 1: Yeni Token Deneyin

Yukarıdaki adımları tekrar takip edin ve yeni token oluşturun.

### Seçenek 2: Git Integration Kullanın

`QUICK_DEPLOY_GUIDE.md` dosyasındaki "Yöntem 1" adımlarını izleyin.

### Seçenek 3: Manuel Upload

Cloudflare Dashboard'dan `dist` klasörünü manuel upload edin (Drag & Drop).

---

**Önerilen Aksiyon:** Yukarıdaki adımları takip ederek yeni bir token oluşturun
ve deploy edin!

**Token Link:**
https://dash.cloudflare.com/8a9f71fb44d0cc7341faa4f0406d536b/api-tokens
