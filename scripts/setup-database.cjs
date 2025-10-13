/**
 * Dernek Yönetim Sistemi - Appwrite Database Kurulum Scripti
 * Bu script Appwrite'da gerekli database, collections ve permissions'ları oluşturur
 */

const sdk = require('node-appwrite');

// Appwrite yapılandırması - Server-side API key kullanarak
const client = new sdk.Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('68e99f6c000183bafb39')
  .setKey('standard_312fec86d74bc55b3f6b026062001bfa144270f98504aa424c86054d9aa0b3a114fb5428bb24faef633a44a76ee5aff9eaa29a808bf78a1f0be63248c9582ca8ced7465a414e7572bed11156df1c859b0e57a5a30c9f74ebc73ef80bd2866c7a5fcd747477c9d08f8d4f4d975530acc666e872a9b33599b5421ae45ef9e3f67e');

const databases = new sdk.Databases(client);

// Database ID
const DATABASE_ID = 'dernek_yonetim_db';

/**
 * Ana database'i oluştur
 */
async function createDatabase() {
  try {
    console.log('📊 Database oluşturuluyor...');
    
    const result = await databases.create({
      databaseId: DATABASE_ID,
      name: 'Dernek Yönetim Sistemi',
      enabled: true,
    });
    
    console.log('✅ Database başarıyla oluşturuldu:', result.$id);
    return result;
  } catch (error) {
    if (error.code === 409) {
      console.log('ℹ️ Database zaten mevcut');
      return { $id: DATABASE_ID };
    }
    console.error('❌ Database oluşturulurken hata:', error);
    throw error;
  }
}

/**
 * Collection'ları oluştur
 */
async function createCollections() {
  const collections = [
    // Kullanıcı Yönetimi
    {
      id: 'users',
      name: 'Kullanıcılar',
      permissions: [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.any()),
        sdk.Permission.update(sdk.Role.any()),
        sdk.Permission.delete(sdk.Role.any()),
      ],
      attributes: [
        { key: 'email', type: 'email', required: true, array: false },
        { key: 'name', type: 'string', size: 255, required: true, array: false },
        { key: 'role', type: 'enum', elements: ['super_admin', 'admin', 'manager', 'operator', 'viewer', 'volunteer'], required: true, array: false },
        { key: 'phone', type: 'string', size: 20, required: false, array: false },
        { key: 'isActive', type: 'boolean', required: true, array: false, default: true },
        { key: 'lastLogin', type: 'datetime', required: false, array: false },
        { key: 'profileImage', type: 'string', size: 500, required: false, array: false },
      ],
    },
    
    // Bağış Yönetimi
    {
      id: 'donations',
      name: 'Bağışlar',
      permissions: [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.any()),
        sdk.Permission.update(sdk.Role.any()),
        sdk.Permission.delete(sdk.Role.any()),
      ],
      attributes: [
        { key: 'donorName', type: 'string', size: 255, required: true, array: false },
        { key: 'donorEmail', type: 'string', size: 255, required: false, array: false },
        { key: 'donorPhone', type: 'string', size: 20, required: false, array: false },
        { key: 'amount', type: 'double', required: true, array: false },
        { key: 'currency', type: 'string', size: 3, required: true, array: false, default: 'TRY' },
        { key: 'type', type: 'enum', elements: ['nakit', 'ayni', 'hizmet'], required: true, array: false },
        { key: 'status', type: 'enum', elements: ['beklemede', 'onaylandı', 'reddedildi'], required: true, array: false, default: 'beklemede' },
        { key: 'description', type: 'string', size: 1000, required: false, array: false },
        { key: 'donationDate', type: 'datetime', required: true, array: false },
        { key: 'processedBy', type: 'string', size: 255, required: false, array: false },
      ],
    },
    
    // İhtiyaç Sahipleri
    {
      id: 'beneficiaries',
      name: 'İhtiyaç Sahipleri',
      permissions: [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.any()),
        sdk.Permission.update(sdk.Role.any()),
        sdk.Permission.delete(sdk.Role.any()),
      ],
      attributes: [
        { key: 'fullName', type: 'string', size: 255, required: true, array: false },
        { key: 'email', type: 'string', size: 255, required: false, array: false },
        { key: 'phone', type: 'string', size: 20, required: true, array: false },
        { key: 'address', type: 'string', size: 500, required: true, array: false },
        { key: 'city', type: 'string', size: 100, required: true, array: false },
        { key: 'status', type: 'enum', elements: ['aktif', 'pasif', 'beklemede'], required: true, array: false, default: 'aktif' },
        { key: 'priority', type: 'enum', elements: ['düşük', 'orta', 'yüksek', 'acil'], required: true, array: false, default: 'orta' },
        { key: 'notes', type: 'string', size: 1000, required: false, array: false },
        { key: 'createdBy', type: 'string', size: 255, required: true, array: false },
      ],
    },
    
    // Yardım Başvuruları
    {
      id: 'aid_requests',
      name: 'Yardım Başvuruları',
      permissions: [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.any()),
        sdk.Permission.update(sdk.Role.any()),
        sdk.Permission.delete(sdk.Role.any()),
      ],
      attributes: [
        { key: 'beneficiaryId', type: 'string', size: 255, required: true, array: false },
        { key: 'requestType', type: 'enum', elements: ['nakit', 'ayni', 'hizmet'], required: true, array: false },
        { key: 'amount', type: 'double', required: false, array: false },
        { key: 'currency', type: 'string', size: 3, required: false, array: false, default: 'TRY' },
        { key: 'description', type: 'string', size: 1000, required: true, array: false },
        { key: 'status', type: 'enum', elements: ['yeni', 'inceleniyor', 'onaylandı', 'reddedildi'], required: true, array: false, default: 'yeni' },
        { key: 'priority', type: 'enum', elements: ['düşük', 'orta', 'yüksek', 'acil'], required: true, array: false, default: 'orta' },
        { key: 'requestDate', type: 'datetime', required: true, array: false },
        { key: 'processedBy', type: 'string', size: 255, required: false, array: false },
        { key: 'documents', type: 'string', size: 1000, required: false, array: true },
      ],
    },
    
    // Burs Yönetimi
    {
      id: 'scholarships',
      name: 'Burslar',
      permissions: [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.any()),
        sdk.Permission.update(sdk.Role.any()),
        sdk.Permission.delete(sdk.Role.any()),
      ],
      attributes: [
        { key: 'studentName', type: 'string', size: 255, required: true, array: false },
        { key: 'studentId', type: 'string', size: 50, required: true, array: false },
        { key: 'school', type: 'string', size: 255, required: true, array: false },
        { key: 'grade', type: 'string', size: 10, required: true, array: false },
        { key: 'amount', type: 'double', required: true, array: false },
        { key: 'currency', type: 'string', size: 3, required: true, array: false, default: 'TRY' },
        { key: 'status', type: 'enum', elements: ['aktif', 'pasif', 'tamamlandı'], required: true, array: false, default: 'aktif' },
        { key: 'startDate', type: 'datetime', required: true, array: false },
        { key: 'endDate', type: 'datetime', required: false, array: false },
        { key: 'notes', type: 'string', size: 1000, required: false, array: false },
      ],
    },
    
    // Etkinlik Yönetimi
    {
      id: 'events',
      name: 'Etkinlikler',
      permissions: [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.any()),
        sdk.Permission.update(sdk.Role.any()),
        sdk.Permission.delete(sdk.Role.any()),
      ],
      attributes: [
        { key: 'title', type: 'string', size: 255, required: true, array: false },
        { key: 'description', type: 'string', size: 1000, required: true, array: false },
        { key: 'location', type: 'string', size: 255, required: true, array: false },
        { key: 'startDate', type: 'datetime', required: true, array: false },
        { key: 'endDate', type: 'datetime', required: true, array: false },
        { key: 'maxParticipants', type: 'integer', required: false, array: false },
        { key: 'status', type: 'enum', elements: ['planlanıyor', 'aktif', 'tamamlandı', 'iptal'], required: true, array: false, default: 'planlanıyor' },
        { key: 'organizerId', type: 'string', size: 255, required: true, array: false },
        { key: 'participants', type: 'string', size: 255, required: false, array: true },
      ],
    },
    
    // Mesajlaşma
    {
      id: 'messages',
      name: 'Mesajlar',
      permissions: [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.any()),
        sdk.Permission.update(sdk.Role.any()),
        sdk.Permission.delete(sdk.Role.any()),
      ],
      attributes: [
        { key: 'senderId', type: 'string', size: 255, required: true, array: false },
        { key: 'recipientIds', type: 'string', size: 255, required: true, array: true },
        { key: 'subject', type: 'string', size: 255, required: true, array: false },
        { key: 'content', type: 'string', size: 2000, required: true, array: false },
        { key: 'type', type: 'enum', elements: ['email', 'sms', 'push', 'internal'], required: true, array: false },
        { key: 'status', type: 'enum', elements: ['draft', 'sent', 'delivered', 'failed'], required: true, array: false, default: 'draft' },
        { key: 'priority', type: 'enum', elements: ['low', 'normal', 'high', 'urgent'], required: true, array: false, default: 'normal' },
        { key: 'scheduledAt', type: 'datetime', required: false, array: false },
        { key: 'sentAt', type: 'datetime', required: false, array: false },
        { key: 'attachments', type: 'string', size: 500, required: false, array: true },
        { key: 'metadata', type: 'string', size: 1000, required: false, array: false },
      ],
    },
    
    // Toplu Mesajlar
    {
      id: 'bulk_messages',
      name: 'Toplu Mesajlar',
      permissions: [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.any()),
        sdk.Permission.update(sdk.Role.any()),
        sdk.Permission.delete(sdk.Role.any()),
      ],
      attributes: [
        { key: 'senderId', type: 'string', size: 255, required: true, array: false },
        { key: 'recipientGroups', type: 'string', size: 255, required: true, array: true },
        { key: 'subject', type: 'string', size: 255, required: true, array: false },
        { key: 'content', type: 'string', size: 2000, required: true, array: false },
        { key: 'type', type: 'enum', elements: ['email', 'sms', 'push'], required: true, array: false },
        { key: 'status', type: 'enum', elements: ['draft', 'sending', 'sent', 'failed'], required: true, array: false, default: 'draft' },
        { key: 'totalRecipients', type: 'integer', required: true, array: false },
        { key: 'sentCount', type: 'integer', required: true, array: false, default: 0 },
        { key: 'failedCount', type: 'integer', required: true, array: false, default: 0 },
        { key: 'scheduledAt', type: 'datetime', required: false, array: false },
        { key: 'sentAt', type: 'datetime', required: false, array: false },
      ],
    },
    
    // Mesaj Şablonları
    {
      id: 'message_templates',
      name: 'Mesaj Şablonları',
      permissions: [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.any()),
        sdk.Permission.update(sdk.Role.any()),
        sdk.Permission.delete(sdk.Role.any()),
      ],
      attributes: [
        { key: 'name', type: 'string', size: 255, required: true, array: false },
        { key: 'type', type: 'enum', elements: ['email', 'sms', 'push'], required: true, array: false },
        { key: 'subject', type: 'string', size: 255, required: false, array: false },
        { key: 'content', type: 'string', size: 2000, required: true, array: false },
        { key: 'variables', type: 'string', size: 500, required: false, array: true },
        { key: 'isActive', type: 'boolean', required: true, array: false, default: true },
      ],
    },
    
    // Bildirim Ayarları
    {
      id: 'notification_settings',
      name: 'Bildirim Ayarları',
      permissions: [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.any()),
        sdk.Permission.update(sdk.Role.any()),
        sdk.Permission.delete(sdk.Role.any()),
      ],
      attributes: [
        { key: 'userId', type: 'string', size: 255, required: true, array: false },
        { key: 'emailEnabled', type: 'boolean', required: true, array: false, default: true },
        { key: 'smsEnabled', type: 'boolean', required: true, array: false, default: false },
        { key: 'pushEnabled', type: 'boolean', required: true, array: false, default: true },
        { key: 'digestEnabled', type: 'boolean', required: true, array: false, default: false },
        { key: 'digestFrequency', type: 'enum', elements: ['daily', 'weekly', 'monthly'], required: true, array: false, default: 'daily' },
        { key: 'quietHours', type: 'string', size: 500, required: false, array: false },
      ],
    },
    
    // Partner Yönetimi
    {
      id: 'partners',
      name: 'Partnerler',
      permissions: [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.any()),
        sdk.Permission.update(sdk.Role.any()),
        sdk.Permission.delete(sdk.Role.any()),
      ],
      attributes: [
        { key: 'name', type: 'string', size: 255, required: true, array: false },
        { key: 'type', type: 'enum', elements: ['kurum', 'kişi', 'şirket'], required: true, array: false },
        { key: 'contactPerson', type: 'string', size: 255, required: false, array: false },
        { key: 'email', type: 'string', size: 255, required: false, array: false },
        { key: 'phone', type: 'string', size: 20, required: false, array: false },
        { key: 'address', type: 'string', size: 500, required: false, array: false },
        { key: 'website', type: 'string', size: 255, required: false, array: false },
        { key: 'status', type: 'enum', elements: ['aktif', 'pasif'], required: true, array: false, default: 'aktif' },
        { key: 'notes', type: 'string', size: 1000, required: false, array: false },
      ],
    },
    
    // Finansal İşlemler
    {
      id: 'financial_transactions',
      name: 'Finansal İşlemler',
      permissions: [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.any()),
        sdk.Permission.update(sdk.Role.any()),
        sdk.Permission.delete(sdk.Role.any()),
      ],
      attributes: [
        { key: 'type', type: 'enum', elements: ['gelir', 'gider'], required: true, array: false },
        { key: 'category', type: 'string', size: 100, required: true, array: false },
        { key: 'amount', type: 'double', required: true, array: false },
        { key: 'currency', type: 'string', size: 3, required: true, array: false, default: 'TRY' },
        { key: 'description', type: 'string', size: 500, required: true, array: false },
        { key: 'transactionDate', type: 'datetime', required: true, array: false },
        { key: 'processedBy', type: 'string', size: 255, required: true, array: false },
        { key: 'referenceId', type: 'string', size: 255, required: false, array: false },
        { key: 'receipt', type: 'string', size: 500, required: false, array: false },
      ],
    },
  ];

  console.log('📋 Collection\'lar oluşturuluyor...');
  
  for (const collection of collections) {
    try {
      // Önce collection'ı oluştur
      const result = await databases.createCollection({
        databaseId: DATABASE_ID,
        collectionId: collection.id,
        name: collection.name,
        permissions: collection.permissions,
        documentSecurity: false,
        enabled: true,
      });
      
      console.log(`✅ Collection "${collection.name}" oluşturuldu:`, result.$id);
      
      // Sonra attributes'ları ekle
      for (const attr of collection.attributes) {
        try {
          await addAttribute(DATABASE_ID, collection.id, attr);
        } catch (attrError) {
          console.warn(`⚠️ Attribute "${attr.key}" eklenirken hata:`, attrError.message);
        }
      }
      
    } catch (error) {
      if (error.code === 409) {
        console.log(`ℹ️ Collection "${collection.name}" zaten mevcut`);
      } else {
        console.error(`❌ Collection "${collection.name}" oluşturulurken hata:`, error);
      }
    }
  }
}

/**
 * Attribute ekleme helper fonksiyonu
 */
async function addAttribute(databaseId, collectionId, attr) {
  const { key, type, required, array, default: defaultValue, size, elements, min, max } = attr;
  
  switch (type) {
    case 'string':
      return await databases.createStringAttribute({
        databaseId,
        collectionId,
        key,
        size: size || 255,
        required: required || false,
        default: defaultValue || '',
        array: array || false,
      });
      
    case 'email':
      return await databases.createEmailAttribute({
        databaseId,
        collectionId,
        key,
        required: required || false,
        default: defaultValue || '',
        array: array || false,
      });
      
    case 'boolean':
      return await databases.createBooleanAttribute({
        databaseId,
        collectionId,
        key,
        required: required || false,
        default: defaultValue || false,
        array: array || false,
      });
      
    case 'integer':
      return await databases.createIntegerAttribute({
        databaseId,
        collectionId,
        key,
        required: required || false,
        min: min || null,
        max: max || null,
        default: defaultValue || null,
        array: array || false,
      });
      
    case 'double':
    case 'float':
      return await databases.createFloatAttribute({
        databaseId,
        collectionId,
        key,
        required: required || false,
        min: min || null,
        max: max || null,
        default: defaultValue || null,
        array: array || false,
      });
      
    case 'datetime':
      return await databases.createDatetimeAttribute({
        databaseId,
        collectionId,
        key,
        required: required || false,
        default: defaultValue || '',
        array: array || false,
      });
      
    case 'enum':
      return await databases.createEnumAttribute({
        databaseId,
        collectionId,
        key,
        elements: elements || [],
        required: required || false,
        default: defaultValue || '',
        array: array || false,
      });
      
    default:
      console.warn(`⚠️ Desteklenmeyen attribute type: ${type}`);
      return null;
  }
}

/**
 * Ana kurulum fonksiyonu
 */
async function setupDatabase() {
  try {
    console.log('🚀 Dernek Yönetim Sistemi Database kurulumu başlatılıyor...\n');
    
    // Database oluştur
    await createDatabase();
    
    // Collection'ları oluştur
    await createCollections();
    
    console.log('\n🎉 Database kurulumu tamamlandı!');
    console.log('📊 Database ID:', DATABASE_ID);
    console.log('🔗 Appwrite Console:', 'https://fra.cloud.appwrite.io/console/project-68e99f6c000183bafb39');
    
  } catch (error) {
    console.error('❌ Database kurulumu sırasında hata:', error);
    process.exit(1);
  }
}

// Script'i çalıştır
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase, DATABASE_ID };
