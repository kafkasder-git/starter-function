
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
            
            log(`Push notification gönderildi: ${recipientId}`);
          } catch (pushError) {
            error(`Push notification hatası (${recipientId}): ${pushError.message}`);
          }
        }
      }
    }
    
    res.json({ success: true });
  } catch (err) {
    error(`Push notification hatası: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};
