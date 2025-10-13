/**
 * Dernek Yönetim Sistemi - Appwrite Functions Kurulum Scripti
 * Bu script Appwrite'da gerekli serverless functions'ları oluşturur
 */

const sdk = require('node-appwrite');

// Appwrite yapılandırması - Server-side API key kullanarak
const client = new sdk.Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('68e99f6c000183bafb39')
  .setKey('standard_312fec86d74bc55b3f6b026062001bfa144270f98504aa424c86054d9aa0b3a114fb5428bb24faef633a44a76ee5aff9eaa29a808bf78a1f0be63248c9582ca8ced7465a414e7572bed11156df1c859b0e57a5a30c9f74ebc73ef80bd2866c7a5fcd747477c9d08f8d4f4d975530acc666e872a9b33599b5421ae45ef9e3f67e');

const functions = new sdk.Functions(client);

/**
 * Functions'ları oluştur
 */
async function createFunctions() {
  const functionList = [
    {
      id: 'email-sender',
      name: 'Email Sender',
      description: 'Email gönderimi için serverless function',
      runtime: 'node-18.0',
      entrypoint: 'src/index.js',
      vars: [
        { key: 'SMTP_HOST', value: 'smtp.gmail.com' },
        { key: 'SMTP_PORT', value: '587' },
        { key: 'SMTP_USER', value: 'your-email@gmail.com' },
        { key: 'SMTP_PASS', value: 'your-app-password' },
        { key: 'FROM_EMAIL', value: 'noreply@dernek.org' },
      ],
      events: [],
      schedule: '',
      timeout: 60,
      enabled: true,
    },
    {
      id: 'sms-sender',
      name: 'SMS Sender',
      description: 'SMS gönderimi için serverless function',
      runtime: 'node-18.0',
      entrypoint: 'src/index.js',
      vars: [
        { key: 'SMS_API_KEY', value: 'your-sms-api-key' },
        { key: 'SMS_API_URL', value: 'https://api.sms-service.com' },
        { key: 'SMS_SENDER_NAME', value: 'DernekOrg' },
      ],
      events: [],
      schedule: '',
      timeout: 60,
      enabled: true,
    },
    {
      id: 'push-notification',
      name: 'Push Notification',
      description: 'Push notification gönderimi için serverless function',
      runtime: 'node-18.0',
      entrypoint: 'src/index.js',
      vars: [
        { key: 'FCM_SERVER_KEY', value: 'your-fcm-server-key' },
        { key: 'FCM_PROJECT_ID', value: 'your-fcm-project-id' },
      ],
      events: [],
      schedule: '',
      timeout: 60,
      enabled: true,
    },
    {
      id: 'donation-processor',
      name: 'Donation Processor',
      description: 'Bağış işleme ve onaylama için serverless function',
      runtime: 'node-18.0',
      entrypoint: 'src/index.js',
      vars: [
        { key: 'PAYMENT_GATEWAY_API_KEY', value: 'your-payment-api-key' },
        { key: 'PAYMENT_GATEWAY_URL', value: 'https://api.payment-gateway.com' },
      ],
      events: [],
      schedule: '',
      timeout: 120,
      enabled: true,
    },
    {
      id: 'report-generator',
      name: 'Report Generator',
      description: 'Otomatik rapor oluşturma için serverless function',
      runtime: 'node-18.0',
      entrypoint: 'src/index.js',
      vars: [
        { key: 'REPORT_TEMPLATE_PATH', value: '/tmp/reports' },
        { key: 'REPORT_STORAGE_BUCKET', value: 'reports' },
      ],
      events: [],
      schedule: '0 0 * * *', // Her gün gece yarısı
      timeout: 300,
      enabled: true,
    },
    {
      id: 'data-backup',
      name: 'Data Backup',
      description: 'Veritabanı yedekleme için serverless function',
      runtime: 'node-18.0',
      entrypoint: 'src/index.js',
      vars: [
        { key: 'BACKUP_STORAGE_BUCKET', value: 'backups' },
        { key: 'BACKUP_RETENTION_DAYS', value: '30' },
      ],
      events: [],
      schedule: '0 2 * * *', // Her gün saat 02:00
      timeout: 600,
      enabled: true,
    },
    {
      id: 'user-activity-tracker',
      name: 'User Activity Tracker',
      description: 'Kullanıcı aktivitelerini takip etme için serverless function',
      runtime: 'node-18.0',
      entrypoint: 'src/index.js',
      vars: [
        { key: 'ANALYTICS_API_KEY', value: 'your-analytics-api-key' },
        { key: 'TRACKING_ENABLED', value: 'true' },
      ],
      events: [],
      schedule: '',
      timeout: 30,
      enabled: true,
    },
    {
      id: 'notification-scheduler',
      name: 'Notification Scheduler',
      description: 'Zamanlanmış bildirimleri gönderme için serverless function',
      runtime: 'node-18.0',
      entrypoint: 'src/index.js',
      vars: [
        { key: 'SCHEDULER_INTERVAL', value: '300000' }, // 5 dakika
        { key: 'MAX_BATCH_SIZE', value: '100' },
      ],
      events: [],
      schedule: '*/5 * * * *', // Her 5 dakikada bir
      timeout: 180,
      enabled: true,
    },
  ];

  console.log('⚡ Functions oluşturuluyor...');
  
  for (const func of functionList) {
    try {
      const result = await functions.create({
        functionId: func.id,
        name: func.name,
        description: func.description,
        runtime: func.runtime,
        entrypoint: func.entrypoint,
        vars: func.vars,
        events: func.events,
        schedule: func.schedule,
        timeout: func.timeout,
        enabled: func.enabled,
      });
      
      console.log(`✅ Function "${func.name}" oluşturuldu:`, result.$id);
      console.log(`   📋 Ayarlar:`);
      console.log(`   - Runtime: ${func.runtime}`);
      console.log(`   - Timeout: ${func.timeout}s`);
      console.log(`   - Events: ${func.events.length > 0 ? func.events.join(', ') : 'Manuel'}`);
      console.log(`   - Schedule: ${func.schedule || 'Yok'}`);
      console.log(`   - Variables: ${func.vars.length} adet`);
      console.log('');
      
    } catch (error) {
      if (error.code === 409) {
        console.log(`ℹ️ Function "${func.name}" zaten mevcut`);
      } else {
        console.error(`❌ Function "${func.name}" oluşturulurken hata:`, error);
      }
    }
  }
}

/**
 * Function deployment'ları için örnek kod oluştur
 */
async function createFunctionExamples() {
  console.log('📝 Function örnekleri oluşturuluyor...');
  
  // Email sender function örneği
  const emailSenderCode = `
const { Client } = require('node-appwrite');
const nodemailer = require('nodemailer');

module.exports = async ({ req, res, log, error }) => {
  try {
    log('Email sender function başlatıldı');
    
    // Appwrite client'ı oluştur
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);
    
    // SMTP transporter oluştur
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    
    // Event verisini al
    const eventData = JSON.parse(req.body);
    
    if (eventData.event === 'database.documents.create' && eventData.collectionId === 'messages') {
      const message = eventData.document;
      
      if (message.type === 'email') {
        // Email gönder
        await transporter.sendMail({
          from: process.env.FROM_EMAIL,
          to: message.recipientIds.join(','),
          subject: message.subject,
          text: message.content,
          html: \`<p>\${message.content}</p>\`,
        });
        
        log(\`Email gönderildi: \${message.subject}\`);
      }
    }
    
    res.json({ success: true });
  } catch (err) {
    error(\`Email sender hatası: \${err.message}\`);
    res.status(500).json({ error: err.message });
  }
};
`;

  // SMS sender function örneği
  const smsSenderCode = `
const { Client } = require('node-appwrite');

module.exports = async ({ req, res, log, error }) => {
  try {
    log('SMS sender function başlatıldı');
    
    // Appwrite client'ı oluştur
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);
    
    // Event verisini al
    const eventData = JSON.parse(req.body);
    
    if (eventData.event === 'database.documents.create' && eventData.collectionId === 'messages') {
      const message = eventData.document;
      
      if (message.type === 'sms') {
        // SMS API'sine istek gönder
        const response = await fetch(process.env.SMS_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': \`Bearer \${process.env.SMS_API_KEY}\`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: message.recipientIds,
            message: message.content,
            sender: process.env.SMS_SENDER_NAME,
          }),
        });
        
        if (response.ok) {
          log(\`SMS gönderildi: \${message.subject}\`);
        } else {
          throw new Error(\`SMS gönderilemedi: \${response.statusText}\`);
        }
      }
    }
    
    res.json({ success: true });
  } catch (err) {
    error(\`SMS sender hatası: \${err.message}\`);
    res.status(500).json({ error: err.message });
  }
};
`;

  // Push notification function örneği
  const pushNotificationCode = `
const { Client } = require('node-appwrite');
const admin = require('firebase-admin');

module.exports = async ({ req, res, log, error }) => {
  try {
    log('Push notification function başlatıldı');
    
    // Firebase Admin SDK'yı başlat
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FCM_PROJECT_ID,
      });
    }
    
    // Appwrite client'ı oluştur
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);
    
    // Event verisini al
    const eventData = JSON.parse(req.body);
    
    if (eventData.event === 'database.documents.create' && eventData.collectionId === 'messages') {
      const message = eventData.document;
      
      if (message.type === 'push') {
        // Push notification gönder
        const messaging = admin.messaging();
        
        const notification = {
          title: message.subject,
          body: message.content,
          data: {
            messageId: message.$id,
            type: message.type,
            priority: message.priority,
          },
        };
        
        // Her recipient için push notification gönder
        for (const recipientId of message.recipientIds) {
          try {
            await messaging.send({
              token: recipientId, // FCM token
              notification,
            });
            
            log(\`Push notification gönderildi: \${recipientId}\`);
          } catch (pushError) {
            error(\`Push notification hatası (\${recipientId}): \${pushError.message}\`);
          }
        }
      }
    }
    
    res.json({ success: true });
  } catch (err) {
    error(\`Push notification hatası: \${err.message}\`);
    res.status(500).json({ error: err.message });
  }
};
`;

  // Dosyalara yaz
  const fs = require('fs');
  const path = require('path');
  
  const functionsDir = path.join(process.cwd(), 'functions');
  if (!fs.existsSync(functionsDir)) {
    fs.mkdirSync(functionsDir, { recursive: true });
  }
  
  // Email sender
  const emailDir = path.join(functionsDir, 'email-sender');
  const emailSrcDir = path.join(emailDir, 'src');
  if (!fs.existsSync(emailSrcDir)) {
    fs.mkdirSync(emailSrcDir, { recursive: true });
  }
  fs.writeFileSync(path.join(emailSrcDir, 'index.js'), emailSenderCode);
  fs.writeFileSync(path.join(emailDir, 'package.json'), JSON.stringify({
    name: 'email-sender',
    version: '1.0.0',
    dependencies: {
      'node-appwrite': '^21.2.1',
      'nodemailer': '^6.9.0',
    },
  }, null, 2));
  
  // SMS sender
  const smsDir = path.join(functionsDir, 'sms-sender');
  const smsSrcDir = path.join(smsDir, 'src');
  if (!fs.existsSync(smsSrcDir)) {
    fs.mkdirSync(smsSrcDir, { recursive: true });
  }
  fs.writeFileSync(path.join(smsSrcDir, 'index.js'), smsSenderCode);
  fs.writeFileSync(path.join(smsDir, 'package.json'), JSON.stringify({
    name: 'sms-sender',
    version: '1.0.0',
    dependencies: {
      'node-appwrite': '^21.2.1',
    },
  }, null, 2));
  
  // Push notification
  const pushDir = path.join(functionsDir, 'push-notification');
  const pushSrcDir = path.join(pushDir, 'src');
  if (!fs.existsSync(pushSrcDir)) {
    fs.mkdirSync(pushSrcDir, { recursive: true });
  }
  fs.writeFileSync(path.join(pushSrcDir, 'index.js'), pushNotificationCode);
  fs.writeFileSync(path.join(pushDir, 'package.json'), JSON.stringify({
    name: 'push-notification',
    version: '1.0.0',
    dependencies: {
      'node-appwrite': '^21.2.1',
      'firebase-admin': '^12.0.0',
    },
  }, null, 2));
  
  console.log('✅ Function örnekleri oluşturuldu');
  console.log('📁 Functions dizini:', functionsDir);
}

/**
 * Ana kurulum fonksiyonu
 */
async function setupFunctions() {
  try {
    console.log('🚀 Dernek Yönetim Sistemi Functions kurulumu başlatılıyor...\n');
    
    // Functions'ları oluştur
    await createFunctions();
    
    // Function örneklerini oluştur
    await createFunctionExamples();
    
    console.log('\n🎉 Functions kurulumu tamamlandı!');
    console.log('🔗 Appwrite Console:', 'https://fra.cloud.appwrite.io/console/project-68e99f6c000183bafb39');
    console.log('📝 Not: Functions deployment için Appwrite CLI kullanın');
    console.log('   appwrite functions createDeployment --functionId=email-sender --entrypoint=src/index.js --code=./functions/email-sender');
    
  } catch (error) {
    console.error('❌ Functions kurulumu sırasında hata:', error);
    process.exit(1);
  }
}

// Script'i çalıştır
if (require.main === module) {
  setupFunctions();
}

module.exports = { setupFunctions };
