# Appwrite Services Setup Guide

This guide will help you set up and configure all the core Appwrite services for your application.

## 🚀 Quick Start

Your app now includes comprehensive services for:

- **Authentication** - User management, login, registration, sessions
- **Database** - Data storage and retrieval with type safety
- **Storage** - File upload, download, and management
- **Functions** - Serverless function execution
- **Service Manager** - Health monitoring and service coordination

## 📋 Prerequisites

1. **Appwrite Server** - Make sure your Appwrite server is running
2. **Environment Variables** - Configure your `.env` file
3. **Project Setup** - Create your Appwrite project and get the credentials

## 🔧 Environment Configuration

Create or update your `.env` file with the following variables:

```env
# Appwrite Configuration
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_APPWRITE_DATABASE_ID=your-database-id

# Optional: Additional configuration
VITE_APP_NAME=Kafkasder Management System
VITE_APP_VERSION=1.0.0
VITE_APP_DEBUG=true
```

## 🏗️ Service Architecture

### Core Services

#### 1. Authentication Service (`lib/auth/authService.ts`)
- **Purpose**: Handle user authentication, registration, and session management
- **Features**:
  - Login/logout with email and password
  - User registration
  - Password reset
  - Profile management
  - Role-based permissions
  - Session management

```typescript
import { authService } from '../lib/auth/authService';

// Login
const result = await authService.login({
  email: 'user@example.com',
  password: 'password123'
});

// Check permissions
if (authService.hasPermission('read:beneficiaries')) {
  // User can read beneficiaries
}
```

#### 2. Storage Service (`lib/storage/storageService.ts`)
- **Purpose**: Handle file upload, download, and management
- **Features**:
  - Single and multiple file uploads
  - File listing and search
  - File download and preview
  - File deletion and copying
  - Storage statistics
  - Bucket management

```typescript
import { storageService } from '../lib/storage/storageService';

// Upload file
const result = await storageService.uploadFile({
  file: fileObject,
  bucketId: 'documents',
  permissions: ['read("any")']
});

// Get file URL
const fileUrl = storageService.getFileUrl('documents', fileId);
```

#### 3. Functions Service (`lib/functions/functionsService.ts`)
- **Purpose**: Execute serverless functions
- **Features**:
  - Function execution (sync and async)
  - Execution result monitoring
  - Function management
  - Deployment handling
  - Statistics and monitoring

```typescript
import { functionsService } from '../lib/functions/functionsService';

// Execute function
const result = await functionsService.executeFunctionWithJson(
  'function-id',
  { data: 'example' }
);

// Wait for completion
const finalResult = await functionsService.waitForExecution(
  'function-id',
  result.executionId!
);
```

#### 4. Service Manager (`lib/services/serviceManager.ts`)
- **Purpose**: Coordinate and monitor all services
- **Features**:
  - Service health monitoring
  - Automatic health checks
  - Service statistics
  - Error handling and recovery
  - Configuration management

```typescript
import { serviceManager } from '../lib/services/serviceManager';

// Initialize all services
await serviceManager.initialize();

// Check health
const health = await serviceManager.checkAllServicesHealth();

// Get statistics
const stats = await serviceManager.getServiceStats();
```

## 🗄️ Database Collections

Your app expects the following collections in your Appwrite database:

### Required Collections

1. **user_profiles** - User profile information
   ```json
   {
     "id": "string",
     "email": "string",
     "name": "string",
     "role": "admin|manager|operator|viewer",
     "is_active": "boolean",
     "avatar_url": "string",
     "created_at": "datetime",
     "updated_at": "datetime"
   }
   ```

2. **beneficiaries** - Beneficiary information
3. **donations** - Donation records
4. **aid_applications** - Aid application records
5. **finance_transactions** - Financial transactions
6. **campaigns** - Campaign information
7. **legal_consultations** - Legal consultation records
8. **events** - Event information
9. **inventory_items** - Inventory management
10. **notifications** - Notification records
11. **tasks** - Task management

## 🧪 Testing Your Setup

### 1. Run the Service Test Script

```bash
node scripts/test-services.js
```

This script will:
- Test all service connections
- Check service health
- Display service statistics
- Report any configuration issues

### 2. Manual Testing

You can also test services individually:

```typescript
// Test authentication
import { authService } from '../lib/auth/authService';
await authService.initialize();

// Test storage
import { storageService } from '../lib/storage/storageService';
await storageService.testStorage();

// Test functions
import { functionsService } from '../lib/functions/functionsService';
await functionsService.testFunctions();
```

## 🔍 Service Health Monitoring

The service manager provides automatic health monitoring:

```typescript
// Start health checks (runs every minute by default)
serviceManager.startHealthChecks();

// Get current health status
const health = serviceManager.getLastHealthCheck();

// Check specific service
const authHealth = await serviceManager.checkServiceHealth('auth');
```

## 🛠️ Common Issues and Solutions

### 1. Authentication Issues

**Problem**: Login fails with "Invalid credentials"
**Solution**: 
- Check if user exists in Appwrite
- Verify email/password combination
- Check user status (not blocked)

**Problem**: "User session not found"
**Solution**:
- User needs to login again
- Check session expiry settings
- Verify Appwrite session configuration

### 2. Database Issues

**Problem**: "Collection not found"
**Solution**:
- Create the required collections in Appwrite console
- Check database ID in environment variables
- Verify collection permissions

**Problem**: "Permission denied"
**Solution**:
- Check collection permissions in Appwrite
- Verify user roles and permissions
- Update collection security rules

### 3. Storage Issues

**Problem**: "File upload failed"
**Solution**:
- Check file size limits
- Verify allowed file types
- Check bucket permissions
- Ensure bucket exists

**Problem**: "Storage quota exceeded"
**Solution**:
- Check storage usage in Appwrite console
- Delete unused files
- Upgrade storage plan if needed

### 4. Functions Issues

**Problem**: "Function not found"
**Solution**:
- Create the function in Appwrite console
- Check function ID
- Verify function is deployed

**Problem**: "Function execution timeout"
**Solution**:
- Check function timeout settings
- Optimize function code
- Check function logs for errors

## 📊 Monitoring and Analytics

### Service Statistics

Get detailed statistics about your services:

```typescript
const stats = await serviceManager.getServiceStats();

// Storage statistics
console.log(`Total files: ${stats.storage?.totalFiles}`);
console.log(`Total size: ${stats.storage?.totalSize}`);

// Function statistics
console.log(`Total functions: ${stats.functions?.totalFunctions}`);
console.log(`Enabled functions: ${stats.functions?.enabledFunctions}`);
```

### Health Monitoring

Monitor service health in real-time:

```typescript
// Subscribe to health changes
serviceManager.onHealthChange((health) => {
  console.log('Service health changed:', health.overall);
});
```

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit `.env` files to version control
2. **Permissions**: Use least-privilege principle for all collections and buckets
3. **Authentication**: Always validate user sessions before sensitive operations
4. **File Uploads**: Validate file types and sizes on both client and server
5. **Functions**: Implement proper error handling and input validation

## 📚 Additional Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite Console](https://cloud.appwrite.io)
- [Service API Reference](./docs/services/README.md)
- [Troubleshooting Guide](./docs/troubleshooting.md)

## 🆘 Getting Help

If you encounter issues:

1. Check the [Common Issues](#-common-issues-and-solutions) section
2. Run the service test script: `node scripts/test-services.js`
3. Check Appwrite console for detailed error logs
4. Review environment variable configuration
5. Verify network connectivity to Appwrite server

---

## 🎉 You're All Set!

Your Appwrite services are now properly configured and ready to use. The service manager will handle health monitoring, error recovery, and provide detailed statistics about your application's backend services.

Happy coding! 🚀
