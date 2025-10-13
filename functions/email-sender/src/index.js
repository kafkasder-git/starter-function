
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
          html: `<p>${message.content}</p>`,
        });
        
        log(`Email gönderildi: ${message.subject}`);
      }
    }
    
    res.json({ success: true });
  } catch (err) {
    error(`Email sender hatası: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};
