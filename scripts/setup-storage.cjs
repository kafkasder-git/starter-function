/**
 * Dernek Yönetim Sistemi - Appwrite Storage Kurulum Scripti
 * Bu script Appwrite'da gerekli storage bucketları oluşturur
 */

const sdk = require('node-appwrite');

// Appwrite yapılandırması - Server-side API key kullanarak
const client = new sdk.Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('68e99f6c000183bafb39')
  .setKey('standard_312fec86d74bc55b3f6b026062001bfa144270f98504aa424c86054d9aa0b3a114fb5428bb24faef633a44a76ee5aff9eaa29a808bf78a1f0be63248c9582ca8ced7465a414e7572bed11156df1c859b0e57a5a30c9f74ebc73ef80bd2866c7a5fcd747477c9d08f8d4f4d975530acc666e872a9b33599b5421ae45ef9e3f67e');

const storage = new sdk.Storage(client);

/**
 * Storage bucket'ları oluştur
 */
async function createStorageBuckets() {
  const buckets = [
    // Profil Resimleri
    {
      id: 'profile_images',
      name: 'Profil Resimleri',
      permissions: [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.any()),
        sdk.Permission.update(sdk.Role.any()),
        sdk.Permission.delete(sdk.Role.any()),
      ],
      fileSecurity: false,
      allowedFileExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      maximumFileSize: 5 * 1024 * 1024, // 5MB
      enabled: true,
      encryption: false,
      antivirus: false,
    },
    
    // Dokümanlar
    {
      id: 'documents',
      name: 'Dokümanlar',
      permissions: [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.any()),
        sdk.Permission.update(sdk.Role.any()),
        sdk.Permission.delete(sdk.Role.any()),
      ],
      fileSecurity: false,
      allowedFileExtensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
      maximumFileSize: 10 * 1024 * 1024, // 10MB
      enabled: true,
      encryption: false,
      antivirus: false,
    },
    
    // Bağış Belgeleri
    {
      id: 'donation_documents',
      name: 'Bağış Belgeleri',
      permissions: [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.any()),
        sdk.Permission.update(sdk.Role.any()),
        sdk.Permission.delete(sdk.Role.any()),
      ],
      fileSecurity: false,
      allowedFileExtensions: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
      maximumFileSize: 10 * 1024 * 1024, // 10MB
      enabled: true,
      encryption: false,
      antivirus: false,
    },
    
    // Yardım Başvuru Belgeleri
    {
      id: 'aid_documents',
      name: 'Yardım Başvuru Belgeleri',
      permissions: [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.any()),
        sdk.Permission.update(sdk.Role.any()),
        sdk.Permission.delete(sdk.Role.any()),
      ],
      fileSecurity: false,
      allowedFileExtensions: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
      maximumFileSize: 10 * 1024 * 1024, // 10MB
      enabled: true,
      encryption: false,
      antivirus: false,
    },
    
    // Burs Belgeleri
    {
      id: 'scholarship_documents',
      name: 'Burs Belgeleri',
      permissions: [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.any()),
        sdk.Permission.update(sdk.Role.any()),
        sdk.Permission.delete(sdk.Role.any()),
      ],
      fileSecurity: false,
      allowedFileExtensions: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
      maximumFileSize: 10 * 1024 * 1024, // 10MB
      enabled: true,
      encryption: false,
      antivirus: false,
    },
    
    // Etkinlik Medyaları
    {
      id: 'event_media',
      name: 'Etkinlik Medyaları',
      permissions: [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.any()),
        sdk.Permission.update(sdk.Role.any()),
        sdk.Permission.delete(sdk.Role.any()),
      ],
      fileSecurity: false,
      allowedFileExtensions: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi', 'pdf'],
      maximumFileSize: 50 * 1024 * 1024, // 50MB
      enabled: true,
      encryption: false,
      antivirus: false,
    },
    
    // Hukuki Belgeler
    {
      id: 'legal_documents',
      name: 'Hukuki Belgeler',
      permissions: [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.any()),
        sdk.Permission.update(sdk.Role.any()),
        sdk.Permission.delete(sdk.Role.any()),
      ],
      fileSecurity: true, // Hukuki belgeler için güvenlik aktif
      allowedFileExtensions: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
      maximumFileSize: 15 * 1024 * 1024, // 15MB
      enabled: true,
      encryption: true, // Hukuki belgeler için şifreleme aktif
      antivirus: true, // Antivirus taraması aktif
    },
    
    // Raporlar
    {
      id: 'reports',
      name: 'Raporlar',
      permissions: [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.any()),
        sdk.Permission.update(sdk.Role.any()),
        sdk.Permission.delete(sdk.Role.any()),
      ],
      fileSecurity: false,
      allowedFileExtensions: ['pdf', 'xls', 'xlsx', 'csv'],
      maximumFileSize: 25 * 1024 * 1024, // 25MB
      enabled: true,
      encryption: false,
      antivirus: false,
    },
    
    // Geçici Dosyalar
    {
      id: 'temp_files',
      name: 'Geçici Dosyalar',
      permissions: [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.any()),
        sdk.Permission.update(sdk.Role.any()),
        sdk.Permission.delete(sdk.Role.any()),
      ],
      fileSecurity: false,
      allowedFileExtensions: ['*'], // Tüm dosya türleri
      maximumFileSize: 100 * 1024 * 1024, // 100MB
      enabled: true,
      encryption: false,
      antivirus: false,
    },
  ];

  console.log('📁 Storage bucket\'ları oluşturuluyor...');
  
  for (const bucket of buckets) {
    try {
      const result = await storage.createBucket({
        bucketId: bucket.id,
        name: bucket.name,
        permissions: bucket.permissions,
        fileSecurity: bucket.fileSecurity,
        allowedFileExtensions: bucket.allowedFileExtensions,
        maximumFileSize: bucket.maximumFileSize,
        enabled: bucket.enabled,
        encryption: bucket.encryption,
        antivirus: bucket.antivirus,
      });
      
      console.log(`✅ Bucket "${bucket.name}" oluşturuldu:`, result.$id);
      
      // Bucket ayarlarını göster
      console.log(`   📋 Ayarlar:`);
      console.log(`   - Dosya Uzantıları: ${bucket.allowedFileExtensions.join(', ')}`);
      console.log(`   - Maksimum Dosya Boyutu: ${(bucket.maximumFileSize / 1024 / 1024).toFixed(1)}MB`);
      console.log(`   - Güvenlik: ${bucket.fileSecurity ? 'Aktif' : 'Pasif'}`);
      console.log(`   - Şifreleme: ${bucket.encryption ? 'Aktif' : 'Pasif'}`);
      console.log(`   - Antivirus: ${bucket.antivirus ? 'Aktif' : 'Pasif'}`);
      console.log('');
      
    } catch (error) {
      if (error.code === 409) {
        console.log(`ℹ️ Bucket "${bucket.name}" zaten mevcut`);
      } else {
        console.error(`❌ Bucket "${bucket.name}" oluşturulurken hata:`, error);
      }
    }
  }
}

/**
 * Ana kurulum fonksiyonu
 */
async function setupStorage() {
  try {
    console.log('🚀 Dernek Yönetim Sistemi Storage kurulumu başlatılıyor...\n');
    
    // Storage bucket'larını oluştur
    await createStorageBuckets();
    
    console.log('\n🎉 Storage kurulumu tamamlandı!');
    console.log('🔗 Appwrite Console:', 'https://fra.cloud.appwrite.io/console/project-68e99f6c000183bafb39');
    
  } catch (error) {
    console.error('❌ Storage kurulumu sırasında hata:', error);
    process.exit(1);
  }
}

// Script'i çalıştır
if (require.main === module) {
  setupStorage();
}

module.exports = { setupStorage };
