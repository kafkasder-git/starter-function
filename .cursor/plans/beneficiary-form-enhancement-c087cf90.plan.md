<!-- c087cf90-1d4b-44fd-ae93-80c5e6e2f398 f8705486-c9f0-43cb-b3a5-13ba70de5bed -->
# Bağlantılı Kayıtlar Bölümü - Eski Tasarıma Dönüş

## Değiştirilecek Dosya

**Dosya:** `components/pages/BeneficiaryDetailPageComprehensive.tsx` (satırlar 2329-2453)

## Yapılacak Değişiklikler

### 1. Grid Düzenini Değiştir (satır 2342)
- Şu anki: `grid grid-cols-1` (tek sütun, büyük butonlar)
- Yeni: `connected-records-grid` class'ı kullan (3x4 grid CSS'den geliyor)

### 2. Buton Stilini Sadeleştir (satır 2395-2447)
- Tüm renkli background/border class'larını kaldır
- Sadece `connected-record-button` class'ını kullan (CSS'den geliyor)
- `hover:border-primary/30 hover:text-primary border-gray-200 text-gray-700` ekle
- Büyük padding'i kaldır (p-4 → CSS'deki varsayılan küçük padding)

### 3. Icon ve Açıklama Metinlerini Kaldır (satırlar 2344-2446)
- `getRecordIcon` ve `getRecordColor` fonksiyonlarını tamamen kaldır
- Buton içeriğini sadece text gösterecek şekilde sadeleştir
- Alt açıklama metinlerini kaldır (satır 2427-2437)
- Icon wrapper div'lerini kaldır
- ChevronRight icon'unu kaldır

### 4. Header'ı Sadeleştir (satırlar 2332-2339)
- Icon wrapper div'i kaldır
- Basit text başlık yap: `text-sm font-semibold` 
- Alt açıklama paragrafını kaldır

### 5. Mevcut Badge'i Koru (satırlar 2439-2443)
- Banka Hesapları için yeşil nokta göstergesini sadeleştir
- Sadece yeşil nokta kalsın, "Mevcut" text'i kaldırılsın

## Sonuç

Eski minimal tasarım:
- 3 sütun x 4 satır grid düzeni
- Küçük, kompakt butonlar
- Gri tonlar (hover'da subtle primary rengi)
- Sadece buton metni, ekstra icon/açıklama yok
- Genel temaya uyumlu, sade görünüm


### To-dos

- [ ] globals.css'e modern font sistemi ekle ve tipografi hiyerarşisini güçlendir
- [ ] BeneficiaryForm.tsx görsel iyileştirmeleri (başlık, progress bar, card styling, boşluklar)
- [ ] BeneficiaryForm.tsx kullanılabilirlik iyileştirmeleri (labels, placeholders, hata mesajları, açıklamalar)
- [ ] BeneficiaryHeader.tsx bileşenini iyileştir
- [ ] BeneficiaryPersonalInfo.tsx bileşenini iyileştir
- [ ] BeneficiaryFamily.tsx bileşenini iyileştir
- [ ] BeneficiaryHealthInfo.tsx bileşenini iyileştir
- [ ] BeneficiaryFinancial.tsx bileşenini iyileştir
- [ ] BeneficiaryDocuments.tsx bileşenini iyileştir
- [ ] BeneficiaryAidHistory.tsx bileşenini iyileştir
- [ ] Label ve Input UI bileşenlerini iyileştir
- [ ] Tüm değişiklikleri test et ve mevcut fonksiyonelliğin korunduğunu doğrula