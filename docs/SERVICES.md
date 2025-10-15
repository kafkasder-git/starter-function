# Services Documentation

## Overview

Dernek Yönetim Sistemi, modüler service mimarisi kullanarak backend işlemlerini organize eder. Her service belirli bir domain'e odaklanır ve Appwrite backend ile iletişim kurar.

## Service Architecture

```
services/
├── authService.ts           # Authentication & Authorization
├── beneficiariesService.ts  # İhtiyaç Sahipleri Yönetimi
├── donationsService.ts      # Bağış Yönetimi
├── aidApplicationsService.ts # Yardım Başvuruları
├── userManagementService.ts # Kullanıcı Yönetimi
├── messagingService.ts      # Mesajlaşma Sistemi
├── notificationService.ts   # Bildirim Sistemi
├── reportingService.ts      # Raporlama
├── kumbaraService.ts        # Kumbara Yönetimi
├── partnersService.ts       # Partner Yönetimi
└── index.ts                 # Service Export Hub
```

## Core Services

### 1. Authentication Service (`authService.ts`)

**Purpose**: Kullanıcı kimlik doğrulama ve yetkilendirme

**Key Methods**:
```typescript
class AuthService {
  // Login/Logout
  async login(email: string, password: string): Promise<AuthResult>
  async logout(): Promise<void>
  async refreshToken(): Promise<string>
  
  // Password Management
  async resetPassword(email: string): Promise<boolean>
  async changePassword(oldPassword: string, newPassword: string): Promise<boolean>
  
  // Two-Factor Authentication
  async enable2FA(): Promise<string> // QR code URL
  async verify2FA(token: string): Promise<boolean>
  async disable2FA(password: string): Promise<boolean>
  
  // Session Management
  async getCurrentUser(): Promise<User | null>
  async isAuthenticated(): Promise<boolean>
  async hasPermission(permission: string): Promise<boolean>
}
```

**Usage Example**:
```typescript
import { authService } from '@/services';

// Login
const result = await authService.login('admin@dernek.com', 'password123');
if (result.success) {
  console.log('Kullanıcı giriş yaptı:', result.user.name);
}

// 2FA Setup
const qrCodeUrl = await authService.enable2FA();
// Show QR code to user for Google Authenticator

// Permission Check
const canManageUsers = await authService.hasPermission('users:manage');
```

### 2. Beneficiaries Service (`beneficiariesService.ts`)

**Purpose**: İhtiyaç sahiplerinin yönetimi

**Key Methods**:
```typescript
class BeneficiariesService {
  // CRUD Operations
  async getBeneficiaries(filters?: BeneficiaryFilters): Promise<ListResponse<Beneficiary>>
  async getBeneficiary(id: string): Promise<Beneficiary>
  async createBeneficiary(data: BeneficiaryCreateData): Promise<Beneficiary>
  async updateBeneficiary(id: string, data: Partial<BeneficiaryCreateData>): Promise<Beneficiary>
  async deleteBeneficiary(id: string): Promise<boolean>
  
  // Advanced Queries
  async getBeneficiariesByCity(city: string): Promise<Beneficiary[]>
  async getUrgentBeneficiaries(): Promise<Beneficiary[]>
  async searchBeneficiaries(query: string): Promise<Beneficiary[]>
  
  // Statistics
  async getBeneficiaryStats(): Promise<BeneficiaryStats>
  async getBeneficiariesByPriority(): Promise<PriorityStats>
  async getBeneficiariesByNeedType(): Promise<NeedTypeStats>
}
```

**Usage Example**:
```typescript
import { beneficiariesService } from '@/services';

// Get active beneficiaries
const beneficiaries = await beneficiariesService.getBeneficiaries({
  status: 'active',
  limit: 50,
  sortBy: 'priority',
  sortDirection: 'desc'
});

// Create new beneficiary
const newBeneficiary = await beneficiariesService.createBeneficiary({
  name: 'Ahmet',
  surname: 'Yılmaz',
  phone: '0555 123 4567',
  address: 'İstanbul/Kadıköy',
  city: 'İstanbul',
  priority: 'high',
  needType: 'gıda',
  familyMembers: 4
});

// Get statistics
const stats = await beneficiariesService.getBeneficiaryStats();
console.log(`${stats.total} toplam ihtiyaç sahibi`);
```

### 3. Donations Service (`donationsService.ts`)

**Purpose**: Bağış kayıtları ve yönetimi

**Key Methods**:
```typescript
class DonationsService {
  // CRUD Operations
  async getDonations(filters?: DonationFilters): Promise<ListResponse<Donation>>
  async getDonation(id: string): Promise<Donation>
  async createDonation(data: DonationCreateData): Promise<Donation>
  async updateDonation(id: string, data: Partial<DonationCreateData>): Promise<Donation>
  async deleteDonation(id: string): Promise<boolean>
  
  // Status Management
  async approveDonation(id: string): Promise<Donation>
  async rejectDonation(id: string, reason: string): Promise<Donation>
  
  // Analytics
  async getDonationStats(): Promise<DonationStats>
  async getDonationsByMonth(year: number): Promise<MonthlyDonations[]>
  async getTopDonors(limit?: number): Promise<DonorStats[]>
  async getDonationsByCategory(): Promise<CategoryStats[]>
  
  // Reporting
  async generateDonationReport(filters: DonationReportFilters): Promise<DonationReport>
  async exportDonations(format: 'csv' | 'excel'): Promise<Blob>
}
```

**Usage Example**:
```typescript
import { donationsService } from '@/services';

// Create donation
const donation = await donationsService.createDonation({
  donorName: 'Mehmet Demir',
  donorEmail: 'mehmet@example.com',
  amount: 1000,
  type: 'cash',
  category: 'genel',
  description: 'Genel amaçlı bağış',
  paymentMethod: 'bank_transfer'
});

// Get monthly statistics
const monthlyStats = await donationsService.getDonationsByMonth(2024);
console.log('2024 yılı toplam bağış:', monthlyStats.reduce((sum, month) => sum + month.amount, 0));

// Approve donation
await donationsService.approveDonation(donation.id);
```

### 4. Aid Applications Service (`aidApplicationsService.ts`)

**Purpose**: Yardım başvurularının yönetimi

**Key Methods**:
```typescript
class AidApplicationsService {
  // CRUD Operations
  async getAidApplications(filters?: AidApplicationFilters): Promise<ListResponse<AidApplication>>
  async getAidApplication(id: string): Promise<AidApplication>
  async createAidApplication(data: AidApplicationCreateData): Promise<AidApplication>
  async updateAidApplication(id: string, data: Partial<AidApplicationCreateData>): Promise<AidApplication>
  async deleteAidApplication(id: string): Promise<boolean>
  
  // Status Management
  async approveAidApplication(id: string, approvedAmount: number): Promise<AidApplication>
  async rejectAidApplication(id: string, reason: string): Promise<AidApplication>
  async completeAidApplication(id: string, notes: string): Promise<AidApplication>
  
  // Analytics
  async getAidApplicationStats(): Promise<AidApplicationStats>
  async getApplicationsByStatus(): Promise<StatusStats>
  async getApplicationsByPriority(): Promise<PriorityStats>
  
  // Workflow
  async assignToReviewer(applicationId: string, reviewerId: string): Promise<AidApplication>
  async addReviewNote(applicationId: string, note: string): Promise<AidApplication>
}
```

### 5. User Management Service (`userManagementService.ts`)

**Purpose**: Sistem kullanıcılarının yönetimi

**Key Methods**:
```typescript
class UserManagementService {
  // User CRUD
  async getUsers(filters?: UserFilters): Promise<ListResponse<ManagedUser>>
  async getUser(id: string): Promise<ManagedUser>
  async createUser(data: CreateUserRequest): Promise<ManagedUser>
  async updateUser(id: string, data: UpdateUserRequest): Promise<ManagedUser>
  async deleteUser(id: string): Promise<boolean>
  
  // Role Management
  async assignRole(userId: string, role: string): Promise<boolean>
  async removeRole(userId: string, role: string): Promise<boolean>
  async getUserRoles(userId: string): Promise<string[]>
  
  // Permission Management
  async grantPermission(userId: string, permission: string): Promise<boolean>
  async revokePermission(userId: string, permission: string): Promise<boolean>
  async getUserPermissions(userId: string): Promise<string[]>
  
  // User Status
  async activateUser(userId: string): Promise<boolean>
  async deactivateUser(userId: string): Promise<boolean>
  async suspendUser(userId: string, reason: string): Promise<boolean>
  
  // Password Management
  async resetUserPassword(userId: string): Promise<string> // Returns temporary password
  async changeUserPassword(userId: string, newPassword: string): Promise<boolean>
}
```

### 6. Messaging Service (`messagingService.ts`)

**Purpose**: İç mesajlaşma sistemi

**Key Methods**:
```typescript
class MessagingService {
  // Conversation Management
  async getConversations(): Promise<Conversation[]>
  async createConversation(participants: string[], title?: string): Promise<Conversation>
  async deleteConversation(conversationId: string): Promise<boolean>
  
  // Message Management
  async getMessages(conversationId: string): Promise<Message[]>
  async sendMessage(conversationId: string, content: string, type: MessageType): Promise<Message>
  async deleteMessage(messageId: string): Promise<boolean>
  async editMessage(messageId: string, newContent: string): Promise<Message>
  
  // Real-time Features
  async subscribeToConversation(conversationId: string, callback: MessageCallback): Promise<void>
  async unsubscribeFromConversation(conversationId: string): Promise<void>
  
  // File Attachments
  async uploadAttachment(file: File): Promise<Attachment>
  async getAttachment(attachmentId: string): Promise<Blob>
  async deleteAttachment(attachmentId: string): Promise<boolean>
}
```

### 7. Notification Service (`notificationService.ts`)

**Purpose**: Bildirim ve iletişim sistemi

**Key Methods**:
```typescript
class NotificationService {
  // Push Notifications
  async sendPushNotification(userId: string, notification: PushNotification): Promise<boolean>
  async sendBulkPushNotification(userIds: string[], notification: PushNotification): Promise<BulkResult>
  
  // Email Notifications
  async sendEmail(to: string, subject: string, content: string): Promise<boolean>
  async sendBulkEmail(recipients: string[], subject: string, content: string): Promise<BulkResult>
  async sendEmailTemplate(templateId: string, to: string, variables: Record<string, any>): Promise<boolean>
  
  // SMS Notifications
  async sendSMS(phoneNumber: string, message: string): Promise<boolean>
  async sendBulkSMS(phoneNumbers: string[], message: string): Promise<BulkResult>
  
  // In-app Notifications
  async createInAppNotification(userId: string, notification: InAppNotification): Promise<boolean>
  async markNotificationAsRead(notificationId: string): Promise<boolean>
  async getUserNotifications(userId: string): Promise<InAppNotification[]>
  
  // Template Management
  async getEmailTemplates(): Promise<EmailTemplate[]>
  async createEmailTemplate(template: EmailTemplateCreateData): Promise<EmailTemplate>
  async updateEmailTemplate(id: string, template: Partial<EmailTemplateCreateData>): Promise<EmailTemplate>
}
```

## Service Integration

### Service Factory Pattern

```typescript
// services/index.ts
export class ServiceFactory {
  private static instance: ServiceFactory;
  private services: Map<string, any> = new Map();
  
  static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }
  
  getService<T>(serviceName: string): T {
    if (!this.services.has(serviceName)) {
      this.services.set(serviceName, this.createService(serviceName));
    }
    return this.services.get(serviceName);
  }
  
  private createService(serviceName: string): any {
    switch (serviceName) {
      case 'auth':
        return new AuthService();
      case 'beneficiaries':
        return new BeneficiariesService();
      case 'donations':
        return new DonationsService();
      // ... other services
      default:
        throw new Error(`Unknown service: ${serviceName}`);
    }
  }
}

// Usage
const serviceFactory = ServiceFactory.getInstance();
const authService = serviceFactory.getService<AuthService>('auth');
const beneficiariesService = serviceFactory.getService<BeneficiariesService>('beneficiaries');
```

### Service Dependencies

```typescript
// Service dependency injection
class ServiceContainer {
  private services: Map<string, any> = new Map();
  
  register<T>(name: string, service: T): void {
    this.services.set(name, service);
  }
  
  get<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found`);
    }
    return service;
  }
}

// Initialize services with dependencies
const container = new ServiceContainer();

// Register core services
container.register('database', new DatabaseService());
container.register('cache', new CacheService());

// Register business services with dependencies
container.register('auth', new AuthService(
  container.get('database'),
  container.get('cache')
));
```

## Error Handling

### Standardized Error Handling

```typescript
// Base service class with error handling
abstract class BaseService {
  protected async handleRequest<T>(
    operation: () => Promise<T>,
    errorContext: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      console.error(`${errorContext} failed:`, error);
      
      if (error instanceof AppwriteException) {
        throw new ServiceError(error.message, error.code, errorContext);
      }
      
      throw new ServiceError('An unexpected error occurred', 'UNKNOWN_ERROR', errorContext);
    }
  }
}

// Custom error class
class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public context: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}
```

## Testing Services

### Service Unit Tests

```typescript
// Example test for BeneficiariesService
describe('BeneficiariesService', () => {
  let service: BeneficiariesService;
  let mockDatabase: jest.Mocked<DatabaseService>;
  
  beforeEach(() => {
    mockDatabase = createMockDatabase();
    service = new BeneficiariesService(mockDatabase);
  });
  
  it('should create beneficiary successfully', async () => {
    const beneficiaryData = {
      name: 'Test',
      surname: 'User',
      phone: '0555 123 4567',
      address: 'Test Address',
      city: 'Test City',
      priority: 'medium' as const,
      needType: 'gıda',
      familyMembers: 2
    };
    
    mockDatabase.create.mockResolvedValue({ id: '123', ...beneficiaryData });
    
    const result = await service.createBeneficiary(beneficiaryData);
    
    expect(result).toEqual({ id: '123', ...beneficiaryData });
    expect(mockDatabase.create).toHaveBeenCalledWith('beneficiaries', beneficiaryData);
  });
  
  it('should handle database errors gracefully', async () => {
    mockDatabase.create.mockRejectedValue(new Error('Database error'));
    
    await expect(service.createBeneficiary({} as any))
      .rejects.toThrow('Database error');
  });
});
```

## Performance Optimization

### Service Caching

```typescript
// Cache-enabled service
class CachedBeneficiariesService extends BeneficiariesService {
  private cache = new Map<string, { data: any; expiry: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  
  async getBeneficiaries(filters?: BeneficiaryFilters): Promise<ListResponse<Beneficiary>> {
    const cacheKey = this.generateCacheKey('beneficiaries', filters);
    const cached = this.cache.get(cacheKey);
    
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }
    
    const result = await super.getBeneficiaries(filters);
    this.cache.set(cacheKey, {
      data: result,
      expiry: Date.now() + this.CACHE_TTL
    });
    
    return result;
  }
  
  private generateCacheKey(operation: string, params?: any): string {
    return `${operation}:${JSON.stringify(params || {})}`;
  }
}
```

### Service Monitoring

```typescript
// Service metrics and monitoring
class MonitoredService extends BaseService {
  private metrics = {
    requestCount: 0,
    errorCount: 0,
    averageResponseTime: 0
  };
  
  protected async handleRequest<T>(
    operation: () => Promise<T>,
    errorContext: string
  ): Promise<T> {
    const startTime = Date.now();
    this.metrics.requestCount++;
    
    try {
      const result = await operation();
      this.updateResponseTime(Date.now() - startTime);
      return result;
    } catch (error) {
      this.metrics.errorCount++;
      throw error;
    }
  }
  
  private updateResponseTime(responseTime: number): void {
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime + responseTime) / 2;
  }
  
  getMetrics() {
    return { ...this.metrics };
  }
}
```

## Best Practices

### 1. Service Design
- **Single Responsibility**: Her service tek bir domain'e odaklanır
- **Dependency Injection**: Dependencies constructor'da inject edilir
- **Error Handling**: Standardized error handling pattern kullanılır
- **Type Safety**: Full TypeScript type safety sağlanır

### 2. Performance
- **Caching**: Frequently accessed data cache'lenir
- **Pagination**: Large datasets pagination ile yönetilir
- **Lazy Loading**: Heavy operations lazy loading ile optimize edilir
- **Connection Pooling**: Database connections optimize edilir

### 3. Security
- **Input Validation**: Tüm input'lar validate edilir
- **Permission Checks**: Her operation öncesi permission kontrolü
- **Rate Limiting**: API abuse prevention
- **Audit Logging**: Critical operations log'lanır

### 4. Testing
- **Unit Tests**: Her service için comprehensive unit tests
- **Integration Tests**: Service interactions test edilir
- **Mock Services**: Test'lerde mock services kullanılır
- **Coverage**: Minimum %80 test coverage hedeflenir
