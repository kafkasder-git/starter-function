
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
            'Authorization': `Bearer ${process.env.SMS_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: message.recipientIds,
            message: message.content,
            sender: process.env.SMS_SENDER_NAME,
          }),
        });
        
        if (response.ok) {
          log(`SMS gönderildi: ${message.subject}`);
        } else {
          throw new Error(`SMS gönderilemedi: ${response.statusText}`);
        }
      }
    }
    
    res.json({ success: true });
  } catch (err) {
    error(`SMS sender hatası: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};
