# 📡 API Dokümantasyonu

## 🔐 Authentication

### Kullanıcı Girişi
```typescript
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "session": {
    "$id": "session_id",
    "userId": "user_id",
    "expire": "2024-12-31T23:59:59.000Z"
  },
  "user": {
    "$id": "user_id",
    "email": "user@example.com",
    "name": "Kullanıcı Adı",
    "role": "admin"
  }
}
```

### Kullanıcı Kaydı
```typescript
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "Kullanıcı Adı",
  "role": "operator"
}
```

## 👥 Kullanıcı Yönetimi

### Kullanıcı Listesi
```typescript
GET /users
Headers: {
  "Authorization": "Bearer session_id"
}

// Response
{
  "users": [
    {
      "$id": "user_id",
      "email": "user@example.com",
      "name": "Kullanıcı Adı",
      "role": "admin",
      "status": "active",
      "$createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1
}
```

### Kullanıcı Güncelleme
```typescript
PUT /users/{userId}
Headers: {
  "Authorization": "Bearer session_id"
}
Content-Type: application/json

{
  "name": "Yeni İsim",
  "role": "manager",
  "status": "active"
}
```

## 💰 Bağış Yönetimi

### Bağış Listesi
```typescript
GET /donations
Headers: {
  "Authorization": "Bearer session_id"
}
Query Parameters:
- page: number (default: 1)
- limit: number (default: 50)
- status: 'pending' | 'approved' | 'rejected'
- type: 'cash' | 'in_kind' | 'service'

// Response
{
  "donations": [
    {
      "$id": "donation_id",
      "amount": 1000.00,
      "currency": "TRY",
      "type": "cash",
      "status": "approved",
      "donorName": "Bağışçı Adı",
      "donorEmail": "donor@example.com",
      "description": "Bağış açıklaması",
      "date": "2024-01-01T00:00:00.000Z",
      "$createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 50
}
```

### Bağış Oluşturma
```typescript
POST /donations
Headers: {
  "Authorization": "Bearer session_id"
}
Content-Type: application/json

{
  "amount": 1000.00,
  "currency": "TRY",
  "type": "cash",
  "donorName": "Bağışçı Adı",
  "donorEmail": "donor@example.com",
  "description": "Bağış açıklaması",
  "date": "2024-01-01T00:00:00.000Z"
}
```

## 🤝 Yardım Yönetimi

### Yardım Başvuru Listesi
```typescript
GET /aid-applications
Headers: {
  "Authorization": "Bearer session_id"
}
Query Parameters:
- page: number (default: 1)
- limit: number (default: 50)
- status: 'new' | 'reviewing' | 'approved' | 'rejected'
- priority: 'low' | 'medium' | 'high' | 'urgent'

// Response
{
  "applications": [
    {
      "$id": "application_id",
      "applicantName": "Başvuru Sahibi",
      "applicantEmail": "applicant@example.com",
      "applicantPhone": "05551234567",
      "aidType": "cash",
      "amount": 5000.00,
      "currency": "TRY",
      "status": "reviewing",
      "priority": "high",
      "description": "Başvuru açıklaması",
      "documents": ["document1.pdf", "document2.pdf"],
      "reviewNotes": "İnceleme notları",
      "date": "2024-01-01T00:00:00.000Z",
      "$createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 50
}
```

### Yardım Başvurusu Oluşturma
```typescript
POST /aid-applications
Headers: {
  "Authorization": "Bearer session_id"
}
Content-Type: application/json

{
  "applicantName": "Başvuru Sahibi",
  "applicantEmail": "applicant@example.com",
  "applicantPhone": "05551234567",
  "aidType": "cash",
  "amount": 5000.00,
  "currency": "TRY",
  "priority": "high",
  "description": "Başvuru açıklaması",
  "documents": ["document1.pdf"]
}
```

## 🎓 Burs Yönetimi

### Burs Başvuru Listesi
```typescript
GET /scholarship-applications
Headers: {
  "Authorization": "Bearer session_id"
}
Query Parameters:
- page: number (default: 1)
- limit: number (default: 50)
- status: 'new' | 'reviewing' | 'approved' | 'rejected'
- studentType: 'orphan' | 'needy' | 'merit'

// Response
{
  "applications": [
    {
      "$id": "scholarship_id",
      "studentName": "Öğrenci Adı",
      "studentEmail": "student@example.com",
      "studentPhone": "05551234567",
      "schoolName": "Okul Adı",
      "grade": "12",
      "studentType": "orphan",
      "monthlyAmount": 1000.00,
      "currency": "TRY",
      "status": "approved",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-12-31T23:59:59.000Z",
      "description": "Burs açıklaması",
      "documents": ["transcript.pdf", "id_copy.pdf"],
      "$createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 50
}
```

## 💼 Fon Yönetimi

### Gelir-Gider Raporu
```typescript
GET /financial-reports
Headers: {
  "Authorization": "Bearer session_id"
}
Query Parameters:
- startDate: string (ISO date)
- endDate: string (ISO date)
- type: 'income' | 'expense' | 'all'

// Response
{
  "report": {
    "period": {
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-12-31T23:59:59.000Z"
    },
    "summary": {
      "totalIncome": 100000.00,
      "totalExpense": 75000.00,
      "netAmount": 25000.00,
      "currency": "TRY"
    },
    "transactions": [
      {
        "$id": "transaction_id",
        "type": "income",
        "amount": 1000.00,
        "currency": "TRY",
        "category": "donation",
        "description": "Bağış",
        "date": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

## 💬 Mesajlaşma

### Mesaj Listesi
```typescript
GET /messages
Headers: {
  "Authorization": "Bearer session_id"
}
Query Parameters:
- page: number (default: 1)
- limit: number (default: 50)
- type: 'inbox' | 'sent' | 'all'

// Response
{
  "messages": [
    {
      "$id": "message_id",
      "senderId": "sender_user_id",
      "senderName": "Gönderen Adı",
      "recipientId": "recipient_user_id",
      "recipientName": "Alıcı Adı",
      "subject": "Mesaj Konusu",
      "content": "Mesaj içeriği",
      "isRead": false,
      "type": "individual",
      "date": "2024-01-01T00:00:00.000Z",
      "$createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 50
}
```

### Mesaj Gönderme
```typescript
POST /messages
Headers: {
  "Authorization": "Bearer session_id"
}
Content-Type: application/json

{
  "recipientId": "recipient_user_id",
  "subject": "Mesaj Konusu",
  "content": "Mesaj içeriği",
  "type": "individual"
}
```

## 📊 Dashboard İstatistikleri

### Genel İstatistikler
```typescript
GET /dashboard/stats
Headers: {
  "Authorization": "Bearer session_id"
}

// Response
{
  "stats": {
    "totalDonations": {
      "amount": 1000000.00,
      "currency": "TRY",
      "count": 150
    },
    "totalAidApplications": {
      "approved": 25,
      "pending": 10,
      "rejected": 5
    },
    "totalScholarships": {
      "active": 50,
      "pending": 15,
      "totalAmount": 50000.00,
      "currency": "TRY"
    },
    "totalUsers": {
      "active": 25,
      "inactive": 5
    },
    "recentActivity": [
      {
        "type": "donation",
        "description": "Yeni bağış alındı",
        "amount": 1000.00,
        "date": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

## 🔒 Hata Kodları

### HTTP Status Kodları
- `200` - Başarılı
- `201` - Oluşturuldu
- `400` - Geçersiz istek
- `401` - Yetkisiz erişim
- `403` - Yasaklı
- `404` - Bulunamadı
- `422` - Validation hatası
- `500` - Sunucu hatası

### Hata Response Formatı
```typescript
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Geçersiz veri formatı",
    "details": {
      "field": "email",
      "reason": "Geçerli email adresi giriniz"
    }
  }
}
```

## 📝 Notlar

- Tüm tarihler ISO 8601 formatında (UTC)
- Para birimi varsayılan olarak TRY
- Sayfalama: page (1'den başlar), limit (max 100)
- Tüm API istekleri JSON formatında
- Authorization header'ı tüm korumalı endpoint'ler için gerekli
- Rate limiting: dakikada 100 istek
