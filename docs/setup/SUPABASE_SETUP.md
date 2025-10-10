# 🚀 Supabase Kurulum Rehberi

Bu rehber, Dernek Yönetim Sistemi için Supabase konfigürasyonunun nasıl
yapılacağını adım adım açıklar.

## 📋 İçindekiler

1. [Supabase Hesabı Oluşturma](#1-supabase-hesabı-oluşturma)
2. [Proje Oluşturma](#2-proje-oluşturma)
3. [API Keys Alma](#3-api-keys-alma)
4. [Environment Variables Ayarlama](#4-environment-variables-ayarlama)
5. [Database Schema Kurulumu](#5-database-schema-kurulumu)
6. [Row Level Security (RLS) Ayarları](#6-row-level-security-rls-ayarları)
7. [Test ve Doğrulama](#7-test-ve-doğrulama)

---

## 1. Supabase Hesabı Oluşturma

1. [Supabase web sitesine](https://supabase.com) gidin
2. Sağ üst köşeden "Start your project" butonuna tıklayın
3. GitHub hesabınızla giriş yapın (önerilen) veya email ile kaydolun
4. Email doğrulaması yapın (gerekirse)

## 2. Proje Oluşturma

1. Dashboard'da "New Project" butonuna tıklayın
2. Proje bilgilerini doldurun:
   - **Name:** `dernek-yonetim-sistemi` (veya istediğiniz bir isim)
   - **Database Password:** Güçlü bir şifre oluşturun (not alın!)
   - **Region:** Size en yakın bölgeyi seçin (örn: `Europe West (Frankfurt)`)
   - **Pricing Plan:** Free plan ile başlayabilirsiniz
3. "Create new project" butonuna tıklayın
4. Proje oluşturulması 2-3 dakika sürebilir

## 3. API Keys Alma

Proje oluştuktan sonra:

1. Sol menüden **Settings** > **API** sayfasına gidin
2. Aşağıdaki bilgileri kopyalayın:

### Project URL

```
https://YOUR_PROJECT_ID.supabase.co
```

### API Keys

#### anon/public key

- Frontend'de kullanılır
- Güvenli ve public olarak kullanılabilir
- Row Level Security (RLS) ile korunur

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### service_role key (Opsiyonel)

- ⚠️ **GİZLİ TUTUN!** Asla frontend'de kullanmayın
- Backend/admin işlemler için
- RLS'yi bypass eder

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 4. Environment Variables Ayarlama

### Yerel Geliştirme (Local Development)

1. Proje kök dizininde `.env.local` dosyasını açın
2. API bilgilerini yapıştırın:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Dosyayı kaydedin

### Production Deployment (Cloudflare Pages)

**Cloudflare Pages:**

1. Cloudflare Dashboard > Workers & Pages > Your Project > Settings >
   Environment variables
2. Production environment için environment variables ekleyin:
   - `VITE_SUPABASE_URL`: Proje URL'niz
   - `VITE_SUPABASE_ANON_KEY`: Anon key'iniz
3. Save ve yeniden deploy edin

**Detaylı talimatlar:**
[Cloudflare Deployment Rehberi](../deployment/QUICK_DEPLOY_GUIDE.md)

## 5. Database Schema Kurulumu

### SQL Editor ile Manuel Kurulum

1. Supabase Dashboard'da **SQL Editor** sayfasına gidin
2. "New query" butonuna tıklayın
3. Aşağıdaki SQL komutlarını çalıştırın:

```sql
-- Users tablosu (Auth ile entegre)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'manager', 'operator', 'viewer')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Members tablosu
CREATE TABLE IF NOT EXISTS public.members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  district TEXT,
  membership_date DATE DEFAULT CURRENT_DATE,
  membership_type TEXT DEFAULT 'regular',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Donations tablosu
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  donation_id TEXT UNIQUE NOT NULL,
  donor_name TEXT NOT NULL,
  donor_email TEXT,
  donor_phone TEXT,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'TRY',
  donation_type TEXT DEFAULT 'money' CHECK (donation_type IN ('money', 'goods', 'service')),
  category TEXT,
  payment_method TEXT,
  donation_date DATE DEFAULT CURRENT_DATE,
  receipt_number TEXT,
  notes TEXT,
  status TEXT DEFAULT 'received' CHECK (status IN ('pending', 'received', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Beneficiaries tablosu
CREATE TABLE IF NOT EXISTS public.beneficiaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  beneficiary_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  district TEXT,
  family_size INTEGER DEFAULT 1,
  monthly_income DECIMAL(10, 2),
  needs TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Aid Requests tablosu
CREATE TABLE IF NOT EXISTS public.aid_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id TEXT UNIQUE NOT NULL,
  beneficiary_id UUID REFERENCES public.beneficiaries(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  request_date DATE DEFAULT CURRENT_DATE,
  approved_date DATE,
  completed_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id)
);

-- Campaigns tablosu
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  goal_amount DECIMAL(10, 2),
  current_amount DECIMAL(10, 2) DEFAULT 0,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_members_status ON public.members(status);
CREATE INDEX IF NOT EXISTS idx_members_member_id ON public.members(member_id);
CREATE INDEX IF NOT EXISTS idx_donations_donor_name ON public.donations(donor_name);
CREATE INDEX IF NOT EXISTS idx_donations_donation_date ON public.donations(donation_date);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_status ON public.beneficiaries(status);
CREATE INDEX IF NOT EXISTS idx_aid_requests_status ON public.aid_requests(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beneficiaries_updated_at BEFORE UPDATE ON public.beneficiaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aid_requests_updated_at BEFORE UPDATE ON public.aid_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 6. Row Level Security (RLS) Ayarları

RLS, database seviyesinde güvenlik sağlar. Her tablo için aktif edilmeli:

```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aid_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Members policies
CREATE POLICY "Members viewable by authenticated users"
  ON public.members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only managers and admins can insert members"
  ON public.members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager', 'operator')
    )
  );

CREATE POLICY "Only managers and admins can update members"
  ON public.members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager', 'operator')
    )
  );

CREATE POLICY "Only admins can delete members"
  ON public.members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Donations policies (benzer şekilde)
CREATE POLICY "Donations viewable by authenticated users"
  ON public.donations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert donations"
  ON public.donations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only managers and admins can update donations"
  ON public.donations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager', 'operator')
    )
  );

-- Beneficiaries ve diğer tablolar için benzer policies ekleyin
```

## 7. Test ve Doğrulama

### Bağlantı Testi

1. Development server'ı başlatın:

```bash
npm run dev
```

2. Tarayıcıda `http://localhost:5173` adresine gidin

3. Browser console'u açın (F12) ve şu komutu çalıştırın:

```javascript
// Supabase bağlantı testi
const { data, error } = await supabase.from('profiles').select('*').limit(1);
console.log('Supabase test:', { data, error });
```

### Authentication Testi

1. Supabase Dashboard > Authentication > Users sayfasına gidin
2. "Add user" butonuna tıklayın ve bir test kullanıcısı oluşturun
3. Uygulamada login sayfasına gidin
4. Test kullanıcısı ile giriş yapmayı deneyin

### Başarılı Kurulum Kontrol Listesi

- [ ] Supabase projesi oluşturuldu
- [ ] API keys alındı ve `.env.local` dosyasına eklendi
- [ ] Database schema kuruldu
- [ ] RLS policies eklendi
- [ ] Development server başlatıldı
- [ ] Bağlantı testi başarılı
- [ ] Authentication testi başarılı

## 🆘 Sorun Giderme

### "Supabase konfigürasyonu eksik" Hatası

**Çözüm:**

1. `.env.local` dosyasını kontrol edin
2. `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` değerlerinin doğru olduğundan
   emin olun
3. Development server'ı yeniden başlatın (`npm run dev`)

### "Invalid API Key" Hatası

**Çözüm:**

1. Supabase Dashboard > Settings > API sayfasına gidin
2. Keys'leri tekrar kopyalayın
3. `.env.local` dosyasında herhangi bir space veya yeni satır olmadığından emin
   olun

### "Failed to fetch" Hatası

**Çözüm:**

1. İnternet bağlantınızı kontrol edin
2. Supabase proje status'ünü kontrol edin: https://status.supabase.com/
3. CORS ayarlarınızı kontrol edin (genelde otomatik yapılandırılır)

### Database Connection Sorunları

**Çözüm:**

1. Supabase Dashboard > Database > Connection pooling sayfasına gidin
2. "Transaction" modunu seçin
3. Connection string'i kontrol edin

## 📚 Ek Kaynaklar

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

## 🔒 Güvenlik Uyarıları

1. ⚠️ **Asla** `.env.local` dosyasını Git'e commit etmeyin
2. ⚠️ **Service Role Key**'i asla frontend'de kullanmayın
3. ⚠️ Production ortamında **mutlaka RLS** aktif olmalı
4. ⚠️ API keys'leri güvenli bir yerde saklayın (password manager)
5. ⚠️ Database şifrenizi kimseyle paylaşmayın

## 📞 Destek

Sorun yaşıyorsanız:

1. Bu dokümandaki "Sorun Giderme" bölümünü kontrol edin
2. [Supabase Discord](https://discord.supabase.com/) topluluğuna katılın
3. GitHub Issues'da yeni bir issue açın

---

**Son Güncelleme:** Ekim 2025 **Versiyon:** 1.0.0
