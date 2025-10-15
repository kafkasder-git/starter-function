# API Documentation

## Overview

Dernek Yönetim Sistemi API'si, kar amacı gütmeyen dernekler için kapsamlı yönetim işlevleri sunar. React + TypeScript + Appwrite teknoloji stack'i kullanılarak geliştirilmiştir.

## Base Configuration

```typescript
// Appwrite Configuration
const config = {
  endpoint: 'https://fra.cloud.appwrite.io/v1',
  projectId: '68e99f6c000183bafb39',
  databaseId: 'dernek_yonetim_db'
};
```

## Authentication Service

### Login
```typescript
async login(email: string, password: string): Promise<AuthResult>
```

**Parameters:**
- `email` (string): Kullanıcı email adresi
- `password` (string): Kullanıcı şifresi

**Returns:**
```typescript
interface AuthResult {
  user: User;
  session: Session;
  success: boolean;
  error?: string;
}
```

**Example:**
```typescript
const result = await authService.login('admin@dernek.com', 'password123');
if (result.success) {
  console.log('Giriş başarılı:', result.user.name);
}
```

### Logout
```typescript
async logout(): Promise<void>
```

### Reset Password
```typescript
async resetPassword(email: string): Promise<boolean>
```

**Parameters:**
- `email` (string): Şifre sıfırlama email adresi

### Two-Factor Authentication
```typescript
async enable2FA(): Promise<string> // Returns QR code URL
async verify2FA(token: string): Promise<boolean>
async disable2FA(password: string): Promise<boolean>
```

## Beneficiaries Service

### Get All Beneficiaries
```typescript
async getBeneficiaries(filters?: BeneficiaryFilters): Promise<ListResponse<Beneficiary>>
```

**Parameters:**
```typescript
interface BeneficiaryFilters {
  search?: string;
  city?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'active' | 'inactive' | 'pending';
  needType?: string;
  limit?: number;
  offset?: number;
}
```

**Returns:**
```typescript
interface Beneficiary {
  id: string;
  name: string;
  surname: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'active' | 'inactive' | 'pending';
  needType: string;
  familyMembers: number;
  monthlyIncome?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Create Beneficiary
```typescript
async createBeneficiary(data: BeneficiaryCreateData): Promise<Beneficiary>
```

**Parameters:**
```typescript
interface BeneficiaryCreateData {
  name: string;
  surname: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  needType: string;
  familyMembers: number;
  monthlyIncome?: number;
  notes?: string;
}
```

### Update Beneficiary
```typescript
async updateBeneficiary(id: string, data: Partial<BeneficiaryCreateData>): Promise<Beneficiary>
```

### Delete Beneficiary
```typescript
async deleteBeneficiary(id: string): Promise<boolean>
```

### Get Beneficiary Statistics
```typescript
async getBeneficiaryStats(): Promise<BeneficiaryStats>
```

**Returns:**
```typescript
interface BeneficiaryStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  byCity: Record<string, number>;
  byNeedType: Record<string, number>;
}
```

## Donations Service

### Get All Donations
```typescript
async getDonations(filters?: DonationFilters): Promise<ListResponse<Donation>>
```

**Parameters:**
```typescript
interface DonationFilters {
  search?: string;
  donorName?: string;
  type?: 'cash' | 'in_kind' | 'service';
  category?: string;
  status?: 'pending' | 'approved' | 'rejected';
  minAmount?: number;
  maxAmount?: number;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}
```

**Returns:**
```typescript
interface Donation {
  id: string;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  amount: number;
  type: 'cash' | 'in_kind' | 'service';
  category: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  paymentMethod?: 'cash' | 'bank_transfer' | 'credit_card' | 'check';
  receiptNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Create Donation
```typescript
async createDonation(data: DonationCreateData): Promise<Donation>
```

### Update Donation Status
```typescript
async updateDonationStatus(id: string, status: 'approved' | 'rejected'): Promise<Donation>
```

### Get Donation Statistics
```typescript
async getDonationStats(): Promise<DonationStats>
```

## Aid Applications Service

### Get All Aid Applications
```typescript
async getAidApplications(filters?: AidApplicationFilters): Promise<ListResponse<AidApplication>>
```

### Create Aid Application
```typescript
async createAidApplication(data: AidApplicationCreateData): Promise<AidApplication>
```

### Update Aid Application Status
```typescript
async updateAidApplicationStatus(
  id: string, 
  status: 'pending' | 'approved' | 'rejected' | 'completed'
): Promise<AidApplication>
```

## User Management Service

### Get All Users
```typescript
async getUsers(filters?: UserFilters): Promise<ListResponse<ManagedUser>>
```

### Create User
```typescript
async createUser(data: CreateUserRequest): Promise<ManagedUser>
```

### Update User
```typescript
async updateUser(id: string, data: UpdateUserRequest): Promise<ManagedUser>
```

### Delete User
```typescript
async deleteUser(id: string): Promise<boolean>
```

### Reset User Password
```typescript
async resetUserPassword(id: string, newPassword: string): Promise<boolean>
```

## Messaging Service

### Get Conversations
```typescript
async getConversations(): Promise<Conversation[]>
```

### Get Messages
```typescript
async getMessages(conversationId: string): Promise<Message[]>
```

### Send Message
```typescript
async sendMessage(
  conversationId: string,
  content: string,
  type: 'text' | 'image' | 'file' = 'text'
): Promise<Message>
```

### Create Conversation
```typescript
async createConversation(
  participants: string[],
  title?: string
): Promise<Conversation>
```

## Notification Service

### Send Notification
```typescript
async sendNotification(
  userId: string,
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error'
): Promise<boolean>
```

### Send Bulk Notification
```typescript
async sendBulkNotification(
  userIds: string[],
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error'
): Promise<BulkNotificationResult>
```

### Send Email
```typescript
async sendEmail(
  to: string,
  subject: string,
  htmlContent: string,
  attachments?: EmailAttachment[]
): Promise<boolean>
```

### Send SMS
```typescript
async sendSMS(
  phoneNumber: string,
  message: string
): Promise<boolean>
```

## Reporting Service

### Generate Financial Report
```typescript
async generateFinancialReport(
  startDate: Date,
  endDate: Date,
  includeDetails?: boolean
): Promise<FinancialReport>
```

### Generate Beneficiary Report
```typescript
async generateBeneficiaryReport(
  filters?: BeneficiaryFilters
): Promise<BeneficiaryReport>
```

### Generate Donation Report
```typescript
async generateDonationReport(
  startDate: Date,
  endDate: Date,
  groupBy?: 'day' | 'week' | 'month' | 'year'
): Promise<DonationReport>
```

## Error Handling

### Standard Error Response
```typescript
interface ErrorResponse {
  error: string;
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
}
```

### Common Error Codes
- `AUTH_FAILED`: Authentication failed
- `INVALID_INPUT`: Invalid input parameters
- `NOT_FOUND`: Resource not found
- `PERMISSION_DENIED`: Insufficient permissions
- `RATE_LIMITED`: Too many requests
- `SERVER_ERROR`: Internal server error

## Rate Limiting

### Limits
- **Authentication**: 5 requests per minute per IP
- **API Calls**: 100 requests per minute per user
- **File Uploads**: 10 requests per minute per user
- **Bulk Operations**: 5 requests per hour per user

### Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Webhooks

### Supported Events
- `user.created`
- `user.updated`
- `user.deleted`
- `donation.created`
- `donation.updated`
- `aid_application.created`
- `aid_application.status_changed`

### Webhook Payload
```typescript
interface WebhookPayload {
  event: string;
  data: any;
  timestamp: Date;
  signature: string;
}
```

## SDK Examples

### JavaScript/TypeScript
```typescript
import { AppwriteService } from '@/services/appwriteService';

const appwrite = new AppwriteService();

// Login
const authResult = await appwrite.auth.login('admin@dernek.com', 'password');

// Get beneficiaries
const beneficiaries = await appwrite.beneficiaries.getBeneficiaries({
  status: 'active',
  limit: 50
});

// Create donation
const donation = await appwrite.donations.createDonation({
  donorName: 'Ahmet Yılmaz',
  amount: 500,
  type: 'cash',
  category: 'genel'
});
```

## Testing

### Test Endpoints
- **Development**: `https://dev-api.dernekys.com`
- **Staging**: `https://staging-api.dernekys.com`
- **Production**: `https://api.dernekys.com`

### Test Data
Test kullanıcıları ve örnek veriler development environment'ta mevcuttur.

## Support

API ile ilgili sorularınız için:
- **Email**: api-support@dernekys.com
- **Documentation**: [docs.dernekys.com](https://docs.dernekys.com)
- **GitHub Issues**: [github.com/dernekys/api](https://github.com/dernekys/api)
