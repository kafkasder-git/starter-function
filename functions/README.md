# Appwrite Functions - Dernek Yönetim Sistemi

Bu klasör, Dernek Yönetim Sistemi için Appwrite Functions içerir.

## 🚀 Özellikler

### API Endpoints
- `GET /health` - Sistem durumu kontrolü
- `GET /api/beneficiaries` - İhtiyaç sahiplerini listele
- `POST /api/beneficiaries` - Yeni ihtiyaç sahibi ekle
- `GET /api/donations` - Bağışları listele
- `POST /api/donations` - Yeni bağış ekle
- `GET /api/messages` - Mesajları listele
- `POST /api/messages` - Yeni mesaj gönder
- `GET /api/stats` - Sistem istatistikleri

### Fonksiyonlar
- **Health Check**: Database ve service bağlantılarını kontrol eder
- **CRUD Operations**: Tüm veri işlemleri için API endpoints
- **Statistics**: Dashboard için istatistik verileri
- **Error Handling**: Kapsamlı hata yönetimi
- **CORS Support**: Cross-origin requests desteği

## 🔧 Kurulum

### 1. Environment Variables
```bash
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
APPWRITE_DATABASE_ID=your_database_id
ENVIRONMENT=production
VERSION=1.0.0
```

### 2. Database Collections
Fonksiyon çalışmadan önce aşağıdaki collection'ları oluşturun:

#### Beneficiaries Collection
```json
{
  "collectionId": "beneficiaries",
  "name": "Beneficiaries",
  "attributes": [
    {
      "key": "name",
      "type": "string",
      "size": 255,
      "required": true
    },
    {
      "key": "email",
      "type": "string",
      "size": 255,
      "required": true
    },
    {
      "key": "phone",
      "type": "string",
      "size": 20,
      "required": false
    },
    {
      "key": "address",
      "type": "string",
      "size": 500,
      "required": false
    },
    {
      "key": "needs",
      "type": "string",
      "size": 1000,
      "required": false
    },
    {
      "key": "priority",
      "type": "enum",
      "elements": ["low", "medium", "high", "urgent"],
      "default": "medium"
    },
    {
      "key": "status",
      "type": "enum",
      "elements": ["active", "inactive", "pending"],
      "default": "active"
    }
  ],
  "permissions": [
    "read('any')",
    "create('users')",
    "update('users')",
    "delete('users')"
  ]
}
```

#### Donations Collection
```json
{
  "collectionId": "donations",
  "name": "Donations",
  "attributes": [
    {
      "key": "amount",
      "type": "double",
      "required": true
    },
    {
      "key": "type",
      "type": "enum",
      "elements": ["cash", "goods", "service"],
      "required": true
    },
    {
      "key": "donorName",
      "type": "string",
      "size": 255,
      "required": true
    },
    {
      "key": "donorEmail",
      "type": "string",
      "size": 255,
      "required": false
    },
    {
      "key": "description",
      "type": "string",
      "size": 1000,
      "required": false
    },
    {
      "key": "beneficiaryId",
      "type": "string",
      "size": 255,
      "required": false
    },
    {
      "key": "status",
      "type": "enum",
      "elements": ["pending", "approved", "rejected", "completed"],
      "default": "pending"
    }
  ],
  "permissions": [
    "read('any')",
    "create('users')",
    "update('users')",
    "delete('users')"
  ]
}
```

#### Messages Collection
```json
{
  "collectionId": "messages",
  "name": "Messages",
  "attributes": [
    {
      "key": "content",
      "type": "string",
      "size": 5000,
      "required": true
    },
    {
      "key": "type",
      "type": "enum",
      "elements": ["text", "image", "file", "system"],
      "default": "text"
    },
    {
      "key": "conversationId",
      "type": "string",
      "size": 255,
      "required": true
    },
    {
      "key": "senderId",
      "type": "string",
      "size": 255,
      "required": true
    },
    {
      "key": "recipientId",
      "type": "string",
      "size": 255,
      "required": false
    },
    {
      "key": "status",
      "type": "enum",
      "elements": ["sent", "delivered", "read"],
      "default": "sent"
    },
    {
      "key": "readAt",
      "type": "datetime",
      "required": false
    }
  ],
  "permissions": [
    "read('any')",
    "create('users')",
    "update('users')",
    "delete('users')"
  ]
}
```

## 🚀 Deployment

### Otomatik Deployment
GitHub Actions ile otomatik deployment:

```bash
# Main branch'e push
git push origin main
```

### Manuel Deployment
```bash
# Appwrite CLI ile
appwrite functions create \
  --functionId=dernekys-staging \
  --name="Dernek YS Staging" \
  --runtime=node-18.0

# Code deploy et
appwrite functions createDeployment \
  --functionId=dernekys-staging \
  --activate=true \
  --code=./functions
```

## 📊 API Kullanım Örnekleri

### Health Check
```bash
curl https://cloud.appwrite.io/v1/functions/[project-id]/dernekys-staging/executions
```

### Beneficiaries API
```bash
# Get all beneficiaries
curl "https://cloud.appwrite.io/v1/functions/[project-id]/dernekys-staging/executions" \
  -H "Content-Type: application/json" \
  -d '{"path": "/api/beneficiaries", "method": "GET"}'

# Create beneficiary
curl "https://cloud.appwrite.io/v1/functions/[project-id]/dernekys-staging/executions" \
  -H "Content-Type: application/json" \
  -d '{
    "path": "/api/beneficiaries",
    "method": "POST",
    "body": {
      "name": "Ahmet Yılmaz",
      "email": "ahmet@example.com",
      "phone": "555-123-4567",
      "needs": "Gıda yardımı",
      "priority": "high"
    }
  }'
```

### Statistics API
```bash
curl "https://cloud.appwrite.io/v1/functions/[project-id]/dernekys-staging/executions" \
  -H "Content-Type: application/json" \
  -d '{"path": "/api/stats", "method": "GET"}'
```

## 🔍 Monitoring

### Logs
Appwrite Console > Functions > [Function Name] > Logs

### Metrics
- Execution time
- Memory usage
- Error rate
- Request count

### Health Monitoring
```bash
# Health check endpoint
curl https://cloud.appwrite.io/v1/functions/[project-id]/dernekys-staging/executions \
  -H "Content-Type: application/json" \
  -d '{"path": "/health", "method": "GET"}'
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Function Timeout
- **Cause**: Long-running operations
- **Solution**: Optimize database queries, add pagination

#### 2. Database Connection Error
- **Cause**: Wrong credentials or network issues
- **Solution**: Check environment variables, network connectivity

#### 3. Permission Denied
- **Cause**: Incorrect collection permissions
- **Solution**: Update collection permissions in Appwrite Console

#### 4. Memory Limit Exceeded
- **Cause**: Large data processing
- **Solution**: Implement pagination, optimize queries

### Debug Commands
```bash
# Check function logs
appwrite functions listLogs --functionId=dernekys-staging

# Test function locally
node index.js

# Check database connectivity
curl -X POST "https://cloud.appwrite.io/v1/databases/[database-id]/collections" \
  -H "X-Appwrite-Project: [project-id]" \
  -H "X-Appwrite-Key: [api-key]"
```

## 📚 Resources

- [Appwrite Functions Documentation](https://appwrite.io/docs/functions)
- [Appwrite CLI Documentation](https://appwrite.io/docs/command-line)
- [Node.js SDK Documentation](https://appwrite.io/docs/client/nodejs)
- [Database API Documentation](https://appwrite.io/docs/apis/databases)
