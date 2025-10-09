# 🔧 Cursor MCP Sunucuları Kurulum Rehberi

Bu rehber, Cursor IDE için MCP (Model Context Protocol) sunucularının nasıl
yapılandırılacağını açıklar.

## 📋 Yapılandırılan MCP Sunucuları

1. **GitHub MCP Server** - GitHub entegrasyonu
2. **Supabase Postgres MCP Server** - Veritabanı erişimi
3. **Filesystem MCP Server** - Proje dosya sistemi erişimi

## 🚀 Kurulum Adımları

### 1. GitHub Token Alın

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens
   (classic)
2. "Generate new token (classic)" seçin
3. Token adı: `Cursor MCP - Panel Project`
4. Scope seçimleri:
   - ✅ `repo` (Tüm repository erişimi)
   - ✅ `read:org` (Organizasyon bilgileri)
   - ✅ `workflow` (GitHub Actions)
   - ✅ `read:project` (Projects v2)
5. "Generate token" butonuna tıklayın
6. Token'ı kopyalayın (sadece bir kez gösterilir!)

### 2. Supabase Database URL'sini Alın

1. [Supabase Dashboard](https://supabase.com/dashboard) → Projenize gidin
2. Settings → Database → Connection String
3. **Connection Pooling** sekmesine gidin
4. Mode: **Transaction** seçin
5. URI'yi kopyalayın:
   ```
   postgresql://postgres.gyburnfaszhxcxdnwogj:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```
6. `[YOUR-PASSWORD]` kısmını Supabase database şifrenizle değiştirin

### 3. Environment.json Dosyasını Güncelleyin

`.cursor/environment.json` dosyasını açın ve token'ları ekleyin:

```json
{
  "agentCanUpdateSnapshot": true,
  "env": {
    "GITHUB_TOKEN": "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "SUPABASE_DB_URL": "postgresql://postgres.gyburnfaszhxcxdnwogj:YOUR_ACTUAL_PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres",
    "VITE_SUPABASE_URL": "https://gyburnfaszhxcxdnwogj.supabase.co",
    "VITE_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5YnVybmZhc3poeGN4ZG53b2dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4ODI2ODMsImV4cCI6MjA3MzQ1ODY4M30.R-AD4ABGXGI1v_VoVqeRDVs9Wio-GJ0HUVRrP0iGG4k"
  }
}
```

**⚠️ Önemli:**

- `GITHUB_TOKEN`: Yukarıda oluşturduğunuz GitHub token
- `SUPABASE_DB_URL`: Supabase şifrenizi içeren tam connection string
- Bu dosya `.gitignore`'a eklenmiştir, asla commit edilmeyecek

### 4. MCP Paketlerini Yükleyin

Terminal'de şu komutu çalıştırın:

```bash
npm install -D @modelcontextprotocol/sdk @modelcontextprotocol/server-github @modelcontextprotocol/server-postgres @modelcontextprotocol/server-filesystem
```

### 5. Cursor IDE'yi Yeniden Başlatın

Yapılandırma değişikliklerinin aktif olması için:

1. Cursor IDE'yi tamamen kapatın
2. Yeniden açın
3. MCP sunucuları otomatik olarak başlatılacak

## ✅ Kurulum Testi

MCP sunucularının düzgün çalıştığını test edin:

### GitHub MCP Testi

Cursor AI'a şunu sorun:

```
"Bu repo'daki son 5 commit'i göster"
"Açık issue'ları listele"
"PR'ları kontrol et"
```

### Supabase MCP Testi

Cursor AI'a şunu sorun:

```
"Veritabanındaki tabloları listele"
"members tablosunun şemasını göster"
"profiles tablosunda kaç kayıt var?"
```

### Filesystem MCP Testi

Cursor AI'a şunu sorun:

```
"components klasöründeki dosyaları listele"
"package.json'daki dependencies'i göster"
```

## 🔍 MCP Sunucu Yapılandırması

### `.cursor/mcp.json` İçeriği

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "supabase-postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "${SUPABASE_DB_URL}"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "c:\\panel\\panel"
      ]
    }
  }
}
```

## 📚 Kullanım Örnekleri

### GitHub Komutları

- "Son commit'leri göster"
- "Issue #123'ü aç"
- "PR'ları review et"
- "Branch'leri listele"
- "Commit geçmişini analiz et"

### Supabase/Postgres Komutları

- "Veritabanı şemasını göster"
- "SELECT \* FROM members LIMIT 10"
- "Donations tablosundaki toplam tutarı hesapla"
- "En çok bağış yapan 5 kişiyi listele"
- "Aktif beneficiary'leri göster"

### Filesystem Komutları

- "services klasöründeki tüm dosyaları listele"
- "\*.tsx uzantılı dosyaları bul"
- "package.json içeriğini göster"
- "components/auth klasöründeki dosyaları analiz et"

## 🔒 Güvenlik Notları

1. ⚠️ **ASLA** `.cursor/environment.json` dosyasını Git'e commit etmeyin
2. ⚠️ Token'larınızı kimseyle paylaşmayın
3. ⚠️ GitHub token'a minimum gerekli yetkiler verin
4. ⚠️ Supabase database şifresini güvenli tutun
5. ✅ `.gitignore`'da `.cursor/environment.json` var (otomatik eklendi)

## 🆘 Sorun Giderme

### "MCP sunucusu başlatılamadı" Hatası

**Çözüm:**

1. `.cursor/environment.json` dosyasındaki token'ları kontrol edin
2. MCP paketlerinin yüklü olduğunu doğrulayın:
   `npm list @modelcontextprotocol/server-github`
3. Cursor IDE'yi yeniden başlatın

### "GitHub API hatası" Mesajı

**Çözüm:**

1. GitHub token'ın geçerli olduğunu kontrol edin
2. Token'ın doğru scope'lara sahip olduğunu doğrulayın
3. GitHub'da token'ı yenileyin veya yeni oluşturun

### "Database connection failed" Hatası

**Çözüm:**

1. `SUPABASE_DB_URL`'deki şifrenin doğru olduğundan emin olun
2. Supabase projenizin aktif olduğunu kontrol edin
3. Connection pooling ayarlarını kontrol edin (Transaction mode)
4. Supabase Dashboard → Database → Connection pooling

### "Filesystem access denied" Hatası

**Çözüm:**

1. `.cursor/mcp.json`'daki dosya yolunu kontrol edin
2. Windows'ta ters slash kullanıldığından emin olun: `c:\\panel\\panel`
3. Klasör izinlerini kontrol edin

## 📊 MCP Sunucu Durumunu Kontrol Etme

Cursor IDE'de MCP sunucularının durumunu görmek için:

1. Cursor Settings'i açın (Ctrl+,)
2. "MCP" araması yapın
3. Aktif sunucuları ve logları görüntüleyin

Veya Cursor AI'a sorun:

```
"MCP sunucularının durumunu göster"
"Hangi MCP sunucuları aktif?"
```

## 🔄 Güncelleme

MCP sunucularını güncellemek için:

```bash
npm update @modelcontextprotocol/server-github @modelcontextprotocol/server-postgres @modelcontextprotocol/server-filesystem
```

## 📞 Destek

Sorun yaşıyorsanız:

1. Bu dokümandaki "Sorun Giderme" bölümünü kontrol edin
2. Cursor IDE loglarını inceleyin
3. MCP Server dokümantasyonuna bakın: https://modelcontextprotocol.io/
4. GitHub Issues'da yeni bir issue açın

---

**Son Güncelleme:** Ekim 2025  
**Versiyon:** 1.0.0  
**Proje:** Kafkasder Management System
