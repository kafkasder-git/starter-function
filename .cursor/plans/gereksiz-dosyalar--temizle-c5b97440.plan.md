<!-- c5b97440-195a-4f57-b695-3368d864198c 7366d887-7b4c-4cf4-8ea9-ebce0e67a402 -->
# GitHub CI/CD Pipeline Kurulumu

## Hedef

Local'den https://github.com/kafkasder-git/starter-function repository'sine push → otomatik test + build → Appwrite deployment

## Adımlar

### 1. Git Remote Kontrolü

Dosya: Yok (terminal komutu)

Mevcut git remote'u kontrol edip doğru repository'ye bağlı olduğundan emin olacağız:

```bash
git remote -v
# Eğer doğru değilse:
git remote set-url origin https://github.com/kafkasder-git/starter-function.git
```

### 2. Eski Workflow Dosyalarını Silme

Dizin: `.github/workflows/`

Silinecek 14 dosya:

- `appwrite-deploy.yml`
- `auto-setup-secrets.yml`
- `cd.yml`
- `ci-advanced.yml`
- `ci.yml`
- `codeql.yml`
- `deploy-prod.yml`
- `deploy-staging.yml`
- `deploy-static.yml`
- `environment-setup.yml`
- `full-auto-deploy.yml`
- `node.js.yml`
- `release.yml`
- `status-badges.yml`

### 3. Yeni CI/CD Workflow Oluşturma

Dosya: `.github/workflows/ci-cd.yml` (yeni dosya)

Otomatik pipeline: push to main → test → build → deploy ready

İçerik özeti:

- Node.js 20 setup
- npm ci --legacy-peer-deps
- Type check
- Build (environment variables GitHub secrets'tan)
- Build artifacts upload
- Deploy job (sadece main branch)

### 4. Manuel Deployment Workflow

Dosya: `.github/workflows/manual-deploy.yml` (yeni dosya)

İhtiyaç halinde manuel deployment için workflow

### 5. Local .env Güncelleme

Dosya: `.env`

Satır 8'i güncelle:

```bash
APPWRITE_API_KEY=standard_312fec86d74bc55b3f6b026062001bfa144270f98504aa424c86054d9aa0b3a114fb5428bb24faef633a44a76ee5aff9eaa29a808bf78a1f0be63248c9582ca8ced7465a414e7572bed11156df1c859b0e57a5a30c9f74ebc73ef80bd2866c7a5fcd747477c9d08f8d4f4d975530acc666e872a9b33599b5421ae45ef9e3f67e
```

Not: .env zaten .gitignore'da, push edilmeyecek

### 6. Git Commit ve Push

Terminal komutları:

```bash
git add .
git commit -m "chore: workflow cleanup + CI/CD pipeline setup"
git push origin main
```

### 7. GitHub Secrets Ayarlama (Manuel - Kullanıcı)

Repository: https://github.com/kafkasder-git/starter-function

Yol: Settings → Secrets and variables → Actions

Eklenecek secrets:

- `VITE_APPWRITE_ENDPOINT` = https://fra.cloud.appwrite.io/v1
- `VITE_APPWRITE_PROJECT_ID` = 68e99f6c000183bafb39
- `VITE_APPWRITE_DATABASE_ID` = dernek_yonetim_db
- `APPWRITE_API_KEY` = (full API key)

## Beklenen Sonuç

- 14 eski workflow → 2 minimal workflow
- Push to main → otomatik test + build
- Build artifacts GitHub'da
- Appwrite deployment hazır
- GitHub Actions: https://github.com/kafkasder-git/starter-function/actions

## Dosya Değişiklikleri Özeti

Silinecek: 14 workflow dosyası

Oluşturulacak: 2 workflow dosyası (ci-cd.yml, manual-deploy.yml)

Güncellenecek: 1 dosya (.env - local only)

### To-dos

- [ ] Git remote kontrolü ve repository bağlantısı doğrulama
- [ ] .github/workflows/ altındaki 14 eski workflow dosyasını sil
- [ ] .github/workflows/ci-cd.yml oluştur (otomatik pipeline)
- [ ] .github/workflows/manual-deploy.yml oluştur (manuel deployment)
- [ ] .env dosyasındaki APPWRITE_API_KEY'i gerçek key ile güncelle
- [ ] Git commit ve push yap (main branch)
- [ ] Kullanıcıya GitHub Secrets ayarlama talimatı ver