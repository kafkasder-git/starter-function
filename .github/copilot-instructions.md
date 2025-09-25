Kafkasder Yönetim Paneli - GitHub Copilot Kullanım Kılavuzu Bu kılavuz, "Dernek
Yönetim Sistemi" projesinde GitHub Copilot'ı etkili, tutarlı ve mimariye uygun
bir şekilde kullanmak için oluşturulmuştur. Temel prensiplerin yanı sıra,
profesyonel geliştirme akışını takip eden ileri seviye kuralları da içerir.
Copilot'ın önerilerinin projemizin standartlarına uymasını sağlamak için bu
kurallara uymak kritik öneme sahiptir.

🚀 Temel Prensipler Pilot Sizsiniz, Copilot Yardımcı Pilot: Copilot güçlü bir
asistandır ancak son kararı her zaman geliştirici verir. Üretilen kodu körü
körüne kabul etmeyin. Kodun doğruluğunu, güvenliğini ve projenin mimari
desenlerine uygunluğunu daima kontrol edin.

Önce Düşün, Sonra Üret: Bir özellik geliştirmeye başlamadan önce, projenin
mevcut yapılarını (servisler, hook'lar, store'lar) nasıl kullanacağınızı
planlayın. Copilot'a bu plana uygun istemler (prompts) verin.

Mevcut Koddan Öğrenmesini Sağlayın: Copilot, açık olan dosyalardaki bağlamdan
öğrenir. Yeni bir bileşen veya fonksiyon yazarken, ilgili servis, hook veya tip
tanım dosyalarını (types.ts) yan sekmede açık tutun. Bu, daha isabetli ve
tutarlı öneriler almanızı sağlar.

Spesifik ve Açıklayıcı Yorumlar Yazın: Copilot'ı yönlendirmenin en iyi yolu, ne
istediğinizi açıklayan yorum satırları yazmaktır.

// KÖTÜ 👎 // bir fonksiyon yaz

// İYİ 👍 // membersService'i kullanarak belirli bir üyenin son 3 bağışını
getiren bir React hook'u oluştur. // Hook, yüklenme (loading), hata (error) ve
veri (data) durumlarını içermelidir.

🏆 Profesyonel Geliştirici Akışı ve İleri Seviye Kurallar Bu kurallar, Copilot'ı
sadece bir kod tamamlama aracından çıkarıp, projenin kalitesini proaktif olarak
artıran profesyonel bir asistana dönüştürmeyi hedefler.

1. Planla ve Uygula Metodolojisi KURAL: Karmaşık bir görev için Copilot ile
   çalışırken üç adımlı bir süreç izleyin: Planlama, Uygulama ve İyileştirme.

Planlama: Copilot'tan görevi tamamlamak için izlenmesi gereken adımları
listelemesini isteyin.

Uygulama: Planın her adımını Copilot'a tek tek uygulattırın.

Gözden Geçirme ve İyileştirme: Üretilen kodu analiz etmesini, olası
iyileştirmeleri (refactoring), hata yönetimi eklemeyi veya daha verimli hale
getirmeyi talep edin. Bu, ilk taslağın ötesine geçerek nihai kaliteyi artırır.

İstem Sıralaması:

Plan İsteği:

// Görev: Üyeler tablosuna gelişmiş bir filtreleme özelliği eklemek istiyorum.
// Plan: Bu özelliği eklemek için hangi dosyalarda (servis, hook, bileşen) //
değişiklik yapmam gerektiğini ve hangi adımları izlemem gerektiğini Türkçe
olarak listele. // Her adımı detaylıca açıkla.

Adım Adım Uygulama: Copilot'un oluşturduğu plana göre her adımı tek tek isteyin.

// Planın 1. adımı: membersService.ts dosyasına, TFilters nesnesini genişleterek
// üyenin aktiflik durumu ve kayıt tarih aralığına göre filtreleme yapacak //
`getFilteredMembers` adında yeni bir fonksiyon ekle. Bu işlemi yap ve kodunu
oluştur.

2. Kod Tekrarını Önleme (DRY - Don't Repeat Yourself) KURAL: Yeni bir fonksiyon,
   hook veya bileşen oluşturmadan önce, projedeki mevcut benzer yapıları analiz
   etmesini ve kopyala-yapıştır yerine mevcut koddan ilham alarak tutarlı bir
   yapı oluşturmasını isteyin.

İstem Örneği:

// Projeyi tara. `useDonations` adında bir hook zaten mevcut. // Şimdi yardım
talepleri (`aidRequests`) için benzer bir hook oluşturmak istiyorum. //
`useDonations` hook'unun yapısını ve en iyi pratikleri referans alarak //
`useAidRequests` adında yeni bir hook oluştur. Servis olarak
`aidRequestsService`'i kullan. // İki hook arasındaki tutarlılığı en üst düzeyde
tut.

3. Sıfır Hata ve Mevcut Kodu İyileştirme Odağı KURAL: Copilot'ı sadece yeni kod
   üretmek için değil, aynı zamanda mevcut koddaki potansiyel hataları bulmak,
   performansı iyileştirmek ve kod okunabilirliğini artırmak için de kullanın.

İstem Örneği (Hata Ayıklama):

// Bu useEffect hook'u bazen gereksiz yere birden fazla kez tetikleniyor. //
Kodu çok dikkatli analiz et. Bağımlılık dizisini (dependency array) ve içerideki
mantığı // inceleyerek bu sorunun kök nedenini bul ve sorunu düzelten, optimize
edilmiş kodu yaz. // Yaptığın değişikliği Türkçe olarak açıkla. // [Mevcut
hatalı kod bloğu buraya yapıştırılır]

4. Proje Dışına Çıkmama (Strict Context) KURAL: Copilot'tan asla proje
   mimarisinde bulunmayan bir kütüphane veya desen (örneğin Redux, MobX, farklı
   bir UI kütüphanesi) önermesini istemeyin. Tüm çözümler daima Zustand, Radix
   UI, Tailwind CSS ve mevcut servis katmanı mimarisi içinde kalmalıdır. Bu
   kural kesindir.

5. Mock Data Kullanımı Kesinlikle Yasaktır KURAL: Kod geliştirme sırasında asla
   mock data veya sahte veri üreten fonksiyonlar oluşturmayın. Proje,
   lib/supabase.ts dosyasındaki isSupabaseConfigured kontrolü sayesinde Supabase
   bağlantısı olmadığında zaten zarif bir şekilde davranacak şekilde
   tasarlanmıştır. Tüm veri işlemleri, gerçek Supabase servis çağrıları
   üzerinden yapılmalıdır.

6. Güvenlik ve Hassas Veri Yönetimi (ZORUNLU) KURAL: Asla API anahtarları,
   şifreler veya diğer hassas verileri yorum satırlarına veya kodun içine
   yazarak Copilot'a bağlam olarak vermeyin. Copilot'un hassas verileri işleyen
   (örn. kullanıcı şifresi güncelleme) kod önerilerini iki kat dikkatle
   inceleyin ve projenin güvenlik standartlarına (örn. sanitizeInput kullanımı)
   uyduğundan emin olun.

7. Kod Gözden Geçirme (Code Review) Süreci KURAL: Pull Request (PR)
   açıklamalarınızda, Copilot tarafından yoğun bir şekilde üretilen veya
   refactor edilen karmaşık kod bloklarını belirtin. Bu, gözden geçiren
   kişilerin bu bölümlere ekstra dikkat etmesini sağlar ve "Pilot Sizsiniz"
   prensibini pekiştirir. AI tarafından üretilen kod, insan tarafından üretilen
   kod ile aynı kalite kontrolünden geçmelidir.

🏛️ Mimari ve Desen Kuralları Bu kurallar, projenin temel mimarisini korumak için
en önemli olanlardır.

1. Service Katmanı Kullanımı (ZORUNLU) KURAL: Tüm Supabase veya harici API
   işlemleri yalnızca services/ dizinindeki ilgili servis dosyası içinde
   yapılmalıdır. Bileşenler veya hook'lar doğrudan supabaseClient'ı
   çağırmamalıdır.

İstem Örneği:

// services/donationsService.ts içinde

// Belirli bir tarih aralığındaki ve belirli bir bağış türündeki bağışları
getiren // bir asenkron fonksiyon oluştur. Fonksiyon, filtre olarak TFilters
nesnesi almalı // ve ApiResponse<Donation[]> formatında bir sonuç döndürmelidir.
// Supabase'den 'donations' tablosunu sorgula.

2. Veri Akışı Deseni: Service -> Hook -> Component KURAL: Bileşenler, veriye
   erişmek için servisleri doğrudan çağırmaz. Bunun yerine, servisleri çağıran
   ve bileşenler için veri, yüklenme ve hata durumlarını yöneten özel hook'ları
   (hooks/ dizininde) kullanır.

İstem Örneği (Hook oluşturma):

// hooks/useDonations.ts içinde

// donationsService'teki getDonationsByDateRange fonksiyonunu çağıran // bir
React hook'u (useDonations) oluştur. // Hook, filtreleri parametre olarak almalı
ve [loading, error, data] durumlarını yönetmelidir.

3. State Yönetimi: Context vs Zustand KURAL: State yönetimi için doğru aracı
   kullanın.

SupabaseAuthContext: Sadece ve sadece kimlik doğrulama (authentication),
kullanıcı bilgileri (user) ve oturum durumu (isAuthenticated) için kullanılır.

useUIStore (Zustand): Global UI durumları (sidebar'ın açık/kapalı olması,
bildirimler, modal durumları vb.) için kullanılır.

4. AI Entegrasyonu: EnhancedAIProvider KURAL: Tüm yapay zeka özellikleri için
   merkezi useAI hook'u kullanılmalıdır. Doğrudan OpenAI veya başka bir
   sağlayıcının API'si çağrılmamalıdır.

🧩 Bileşen Geliştirme Kuralları TypeScript ve Tipler: Copilot'a bir bileşen
oluşturmasını söylerken, alacağı props'ların tiplerini belirtin.

Dizin Yapısı: Yeni bir özellik için bileşen oluştururken, components/[feature]/
yapısına uygun hareket edin.

Yol Kısayolları (@/): Import işlemlerinde her zaman @/ kısayolunu kullanın.

Tipleri Bağlam Olarak Sunma: Karmaşık bir fonksiyon veya bileşen yazdırırken,
ilgili tipleri (interface, type) yorum içinde veya doğrudan kodda belirterek
Copilot'a net bir bağlam sunun. Örnek İstem: // Bu fonksiyon, parametre olarak
bir Member nesnesi alacak. // type Member = { id: string; name: string;
isActive: boolean; }; // Fonksiyon, üyenin adını ve aktiflik durumunu içeren bir
string döndürmeli.

🇹🇷 Türkçe Dil ve Yerelleştirme UI Metinleri: Kullanıcıya gösterilen tüm metinler
(butonlar, etiketler, mesajlar) Türkçe olmalıdır.

AI İstemleri: useAI hook'unu kullanırken, Türkçe içerik istediğinizi belirtin.

Doğrulama (Validation): Türkçe'ye özel formatlar için lib/validation.ts içindeki
VALIDATION_PATTERNS yapısını kullanın.

🧪 Test Yazımı Birim Testleri (Vitest):

KURAL: Bir fonksiyon veya hook için test yazdırırken, sadece başarılı
senaryoları değil, aynı zamanda hata durumlarını, kenar durumları (edge cases)
ve geçersiz girdileri de test etmesini açıkça isteyin. Örnek İstem: //
getMemberByIdservisi için testler yaz. Başarılı veri dönüşünü, bulunamayan ID
içinnull dönüşünü ve veritabanı hatası durumunda fırlatılan hatayı test et.

Hook Testleri: Servisleri mock'layarak hook'ların davranışını test edin.

İstem Örneği: // Vitest ve React Testing Library kullanarak useMembers hook'unu
test et. membersService.getMembers fonksiyonunu mock'la ve hook'un doğru veri,
yüklenme ve hata durumlarını döndürdüğünü doğrula.

Bu kurallara uyarak, GitHub Copilot'ı projenizin kalitesini ve tutarlılığını
artıran güçlü bir takım arkadaşı haline getirebilirsiniz.
