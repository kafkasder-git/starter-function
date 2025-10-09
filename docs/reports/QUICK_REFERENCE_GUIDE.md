# Supabase Integration Quick Reference Guide

**Project:** Panel - Aid Management System  
**Purpose:** Quick reference for developers implementing Supabase integration  
**Last Updated:** 2025-10-09

---

## Supabase Integration Patterns

### Pattern 1: Using BaseService (Recommended)

This is the recommended pattern for most services as it provides consistent CRUD operations and reduces boilerplate code.

```typescript
// services/exampleService.ts
import { supabase, TABLES } from '../lib/supabase';
import { BaseService } from './baseService';
import type { Entity, EntityInsert, EntityUpdate } from '../types/entity';

export class ExampleService extends BaseService<Entity, EntityInsert, EntityUpdate> {
  constructor() {
    super('table_name');
  }
  
  // Implement custom methods as needed
  async customMethod(param: string) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('field', param);
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      this.logger.error('Error in customMethod', error);
      return { data: null, error: error.message };
    }
  }
}

export const exampleService = new ExampleService();
export default exampleService;
```

**When to use:**
- Standard CRUD operations needed
- Consistent error handling required
- Pagination support needed
- Following established patterns

---

### Pattern 2: Direct Supabase Client Usage

Use this pattern when you need more control or when BaseService doesn't fit your use case.

```typescript
// services/exampleService.ts
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logging/logger';

export class ExampleService {
  async getAll() {
    try {
      const { data, error } = await supabase.from('table_name').select('*');
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logger.error('Error fetching data', error);
      return { data: null, error: error.message };
    }
  }
  
  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('table_name')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logger.error('Error fetching by id', error);
      return { data: null, error: error.message };
    }
  }
  
  async create(entity: any) {
    try {
      const { data, error } = await supabase
        .from('table_name')
        .insert([entity])
        .select();
      
      if (error) throw error;
      return { data: data[0], error: null };
    } catch (error) {
      logger.error('Error creating entity', error);
      return { data: null, error: error.message };
    }
  }
}

export const exampleService = new ExampleService();
export default exampleService;
```

**When to use:**
- Complex queries not supported by BaseService
- Custom business logic required
- Integration with external APIs
- Specialized data transformations

---

## Page Integration Pattern

### Standard Page Integration

```typescript
// components/pages/ExamplePage.tsx
import { useState, useEffect } from 'react';
import { exampleService } from '../../services/exampleService';
import type { Entity } from '../../types/entity';

export function ExamplePage() {
  const [data, setData] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await exampleService.getAll();
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setData(response.data);
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  
  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

### Page Integration with Filters

```typescript
export function ExamplePageWithFilters() {
  const [data, setData] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    searchTerm: '',
    dateFrom: '',
    dateTo: ''
  });
  
  useEffect(() => {
    loadData();
  }, [filters]); // Reload when filters change
  
  const loadData = async () => {
    setIsLoading(true);
    const response = await exampleService.getAll({ filters });
    if (response.data) setData(response.data);
    setIsLoading(false);
  };
  
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  return (
    <div>
      <FilterBar filters={filters} onChange={handleFilterChange} />
      {isLoading ? <LoadingSpinner /> : <DataTable data={data} />}
    </div>
  );
}
```

---

## Current Implementation Status

### ✅ Fully Integrated Pages (4 of 31)

These pages have complete Supabase integration and are production-ready:

| Page | Service | Table | Features |
|------|---------|-------|----------|
| **BeneficiariesPageEnhanced.tsx** | beneficiariesService.ts | beneficiaries | Full CRUD, filtering, search, pagination |
| **BeneficiaryDetailPageComprehensive.tsx** | beneficiariesService.ts | beneficiaries | Detail view, edit, related data |
| **DonationsPage.tsx** | donationsService.ts | donations | Complex filtering, statistics, export |
| **UserManagementPageReal.tsx** | userManagementService.ts | users | User CRUD, role management |

**Success Rate:** 13% (4/31 pages)

---

### ❌ Mock Data Pages (9+ confirmed)

These pages use empty arrays or mock data and need Supabase integration:

| Page | Current State | Priority | Service Needed |
|------|---------------|----------|----------------|
| **AidApplicationsPage.tsx** | Empty array (line 48) | 🔴 Critical | aidApplicationsService.ts |
| **AidPage.tsx** | Empty array (line 44) | 🔴 Critical | aidRequestsService.ts |
| **AllAidListPage.tsx** | Empty array (line 48) | 🔴 Critical | aidRecordsService.ts |
| **CampaignManagementPage.tsx** | Commented code (lines 73-74) | 🔴 High | campaignsService.ts |
| **BursStudentsPage.tsx** | Empty array (line 81) | 🟡 Medium | scholarshipService.ts |
| **BursApplicationsPage.tsx** | Empty array (line 78) | 🟡 Medium | scholarshipApplicationsService.ts |
| **DocumentManagementPage.tsx** | Empty array (line 61) | 🟡 Medium | sponsorsService.ts |
| **SystemSettingsPage.tsx** | Commented code (lines 86-87) | 🟢 Low | systemSettingsService.ts |
| **KumbaraPage.tsx** | Empty array (line 63) | 🟡 Medium | kumbaraService.ts |

---

### ❓ Unknown Status (~18 pages)

These pages require individual audit to determine connection status:

- BankPaymentOrdersPage.tsx
- AppointmentSchedulingPage.tsx
- CaseManagementPage.tsx
- CashAidTransactionsPage.tsx
- ApplicationWorkflowPage.tsx
- InKindAidTransactionsPage.tsx
- InternalMessagingPage.tsx
- HospitalReferralPage.tsx
- FinanceIncomePage.tsx
- EventsPage.tsx
- DistributionTrackingPage.tsx
- CashAidVaultPage.tsx
- InventoryManagementPage.tsx
- LawsuitTrackingPage.tsx
- LawyerAssignmentsPage.tsx
- LegalConsultationPage.tsx
- LegalDocumentsPage.tsx
- ProfilePage.tsx
- ServiceTrackingPage.tsx

---

## File Upload Integration

### Current Status
File upload functionality requires separate audit. Initial investigation shows:

**Files to Review:**
- `components/forms/DocumentUpload.tsx` (lines 138-143)
- `components/beneficiary/BeneficiaryDocuments.tsx`
- `services/fileStorageService.ts`

### Expected Pattern for File Uploads

```typescript
// Upload file to Supabase Storage
const uploadFile = async (file: File, path: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('bucket-name')
      .upload(path, file);
    
    if (error) throw error;
    
    // Save metadata to database
    const { data: docData, error: docError } = await supabase
      .from('documents')
      .insert([{
        file_path: data.path,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        uploaded_by: userId,
        entity_id: entityId,
        entity_type: 'beneficiary'
      }])
      .select();
    
    if (docError) throw docError;
    return { data: docData[0], error: null };
  } catch (error) {
    logger.error('Error uploading file', error);
    return { data: null, error: error.message };
  }
};

// Download file from Supabase Storage
const downloadFile = async (path: string) => {
  const { data, error } = await supabase.storage
    .from('bucket-name')
    .download(path);
  
  if (error) throw error;
  return data;
};

// Get public URL for file
const getPublicUrl = (path: string) => {
  const { data } = supabase.storage
    .from('bucket-name')
    .getPublicUrl(path);
  
  return data.publicUrl;
};
```

---

## Common Supabase Operations

### Select All Records

```typescript
const { data, error } = await supabase
  .from('table')
  .select('*');
```

### Select with Filter

```typescript
const { data, error } = await supabase
  .from('table')
  .select('*')
  .eq('status', 'active')
  .order('created_at', { ascending: false });
```

### Select with Multiple Filters

```typescript
const { data, error } = await supabase
  .from('table')
  .select('*')
  .eq('status', 'active')
  .gte('amount', 100)
  .lte('amount', 1000)
  .ilike('name', '%search%')
  .order('created_at', { ascending: false });
```

### Select Single Record

```typescript
const { data, error } = await supabase
  .from('table')
  .select('*')
  .eq('id', id)
  .single();
```

### Select with Joins (Foreign Keys)

```typescript
const { data, error } = await supabase
  .from('donations')
  .select(`
    *,
    campaign:campaigns(id, name),
    donor:beneficiaries(id, name)
  `)
  .eq('status', 'completed');
```

### Insert Single Record

```typescript
const { data, error } = await supabase
  .from('table')
  .insert([{ 
    column1: value1, 
    column2: value2 
  }])
  .select();
```

### Insert Multiple Records

```typescript
const { data, error } = await supabase
  .from('table')
  .insert([
    { name: 'Item 1', status: 'active' },
    { name: 'Item 2', status: 'active' },
    { name: 'Item 3', status: 'active' }
  ])
  .select();
```

### Update Record

```typescript
const { data, error } = await supabase
  .from('table')
  .update({ 
    column: newValue,
    updated_at: new Date().toISOString()
  })
  .eq('id', id)
  .select();
```

### Update Multiple Records

```typescript
const { data, error } = await supabase
  .from('table')
  .update({ status: 'archived' })
  .eq('status', 'inactive')
  .lt('updated_at', '2024-01-01')
  .select();
```

### Delete Record

```typescript
const { error } = await supabase
  .from('table')
  .delete()
  .eq('id', id);
```

### Count Records

```typescript
const { count, error } = await supabase
  .from('table')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'active');
```

### Pagination

```typescript
const pageSize = 20;
const page = 1;
const from = (page - 1) * pageSize;
const to = from + pageSize - 1;

const { data, error, count } = await supabase
  .from('table')
  .select('*', { count: 'exact' })
  .range(from, to)
  .order('created_at', { ascending: false });
```

---

## Key Files Reference

### Core Supabase Files

| File | Purpose | Key Exports |
|------|---------|-------------|
| **lib/supabase.ts** | Supabase client configuration | `supabase`, `TABLES` constant |
| **hooks/useSupabaseConnection.ts** | Connection health check | `useSupabaseConnection` hook |
| **services/baseService.ts** | Abstract base service class | `BaseService` class |

### Working Service Examples

| Service | Pattern | Table | Status |
|---------|---------|-------|--------|
| **services/beneficiariesService.ts** | Extends BaseService | beneficiaries | ✅ Production |
| **services/donationsService.ts** | Direct client usage | donations | ✅ Production |
| **services/userManagementService.ts** | Custom implementation | users | ✅ Production |

### Working Page Examples

| Page | Features | Service Used |
|------|----------|--------------|
| **components/pages/BeneficiariesPageEnhanced.tsx** | Full CRUD, filters, search, pagination | beneficiariesService |
| **components/pages/DonationsPage.tsx** | Complex filtering, statistics, export | donationsService |
| **components/pages/UserManagementPageReal.tsx** | User management, role assignment | userManagementService |

---

## Database Tables

### Currently in Use (3 tables)

| Table | Purpose | Key Columns | Status |
|-------|---------|-------------|--------|
| **beneficiaries** | Beneficiary records | id, name, status, phone, address | ✅ Active |
| **donations** | Donation transactions | id, donor_name, amount, campaign_id, status | ✅ Active |
| **users** | User accounts | id, email, role, status | ✅ Active |

### Tables Needed for Full Integration

| Table | Purpose | Required For | Priority |
|-------|---------|--------------|----------|
| **aid_applications** | Aid application requests | AidApplicationsPage | 🔴 Critical |
| **aid_requests** | General aid requests | AidPage | 🔴 Critical |
| **aid_records** | Delivered aid tracking | AllAidListPage | 🔴 Critical |
| **campaigns** | Fundraising campaigns | CampaignManagementPage | 🔴 High |
| **scholarship_students** | Scholarship recipients | BursStudentsPage | 🟡 Medium |
| **scholarship_applications** | Scholarship applications | BursApplicationsPage | 🟡 Medium |
| **kumbara** | Donation box tracking | KumbaraPage | 🟡 Medium |
| **sponsors** | Sponsor organizations | DocumentManagementPage | 🟡 Medium |
| **system_settings** | Application settings | SystemSettingsPage | 🟢 Low |

---

## Next Steps for Developers

### To Add Supabase to a Page

**Step-by-step process:**

1. **Check if service exists**
   ```powershell
   # Search for service in services directory
   Get-ChildItem -Path ".\services\" -Filter "*Service.ts"
   ```

2. **Create service if missing**
   - Follow BaseService pattern (recommended)
   - Define TypeScript interfaces
   - Implement CRUD operations
   - Export singleton instance

3. **Define database table schema**
   - Create table in Supabase dashboard
   - Add primary key, timestamps, indexes
   - Set up RLS policies
   - Add foreign keys for relationships

4. **Import service in page component**
   ```typescript
   import { exampleService } from '../../services/exampleService';
   ```

5. **Replace mock data with service calls**
   ```typescript
   // Remove:
   const [data] = useState<Type[]>([]);
   
   // Add:
   const [data, setData] = useState<Type[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   ```

6. **Add loading and error states**
   ```typescript
   if (isLoading) return <LoadingSpinner />;
   if (error) return <ErrorMessage message={error} />;
   ```

7. **Test CRUD operations**
   - Test data loading
   - Test create operation
   - Test update operation
   - Test delete operation
   - Test error handling

8. **Deploy and monitor**
   - Deploy to staging first
   - Monitor error logs
   - Check performance metrics
   - Deploy to production

---

### To Verify Supabase Connection

**Verification checklist:**

1. **Check page imports**
   - Look for service import from `services/` directory
   - Verify service is used in component

2. **Check service implementation**
   - Open service file
   - Verify `supabase.from()` calls exist
   - Check for proper error handling

3. **Check data loading**
   - Look for `useEffect` hook
   - Verify async data loading function
   - Check loading states

4. **Check error handling**
   - Verify try-catch blocks
   - Check error state management
   - Verify error messages displayed to user

5. **Verify in Supabase dashboard**
   - Check table exists
   - Verify data persists after operations
   - Check RLS policies allow access

---

## Troubleshooting Common Issues

### Issue: Data not loading

**Symptoms:**
- Page shows loading spinner indefinitely
- No data appears after loading
- Console shows no errors

**Solutions:**
1. Check Supabase connection status in browser console
2. Verify table exists in Supabase dashboard
3. Check RLS policies allow read access for current user
4. Verify service is imported and called correctly
5. Check network tab for failed requests
6. Verify environment variables are set correctly

**Debug code:**
```typescript
const loadData = async () => {
  console.log('Loading data...');
  const response = await exampleService.getAll();
  console.log('Response:', response);
  if (response.error) {
    console.error('Error:', response.error);
  }
};
```

---

### Issue: Create/Update/Delete not working

**Symptoms:**
- Operations fail silently
- Data doesn't persist
- Error messages appear

**Solutions:**
1. Check RLS policies allow write access
2. Verify user authentication status
3. Check for validation errors in console
4. Verify foreign key constraints are satisfied
5. Check for unique constraint violations
6. Verify required fields are provided

**Debug code:**
```typescript
const createItem = async (item: Entity) => {
  console.log('Creating item:', item);
  const response = await exampleService.create(item);
  console.log('Create response:', response);
  if (response.error) {
    console.error('Create error:', response.error);
  }
};
```

---

### Issue: Performance problems

**Symptoms:**
- Slow page load times
- Laggy UI interactions
- High memory usage

**Solutions:**
1. Add indexes to frequently queried columns
2. Implement pagination for large datasets
3. Use `.select()` to limit returned columns
4. Consider caching for static data
5. Optimize complex queries
6. Use database functions for aggregations

**Example optimization:**
```typescript
// Before: Fetch all columns
const { data } = await supabase.from('table').select('*');

// After: Fetch only needed columns
const { data } = await supabase
  .from('table')
  .select('id, name, status')
  .limit(20);
```

---

### Issue: Authentication errors

**Symptoms:**
- "JWT expired" errors
- Unauthorized access errors
- User logged out unexpectedly

**Solutions:**
1. Check token expiration settings
2. Implement token refresh logic
3. Verify RLS policies are correct
4. Check user session status
5. Verify authentication flow

---

### Issue: Foreign key constraint violations

**Symptoms:**
- Insert/update operations fail
- Error messages about foreign keys

**Solutions:**
1. Verify referenced record exists
2. Check foreign key column values
3. Ensure proper data types
4. Verify cascade delete settings

---

## Resources

### Official Documentation
- **Supabase Documentation:** https://supabase.com/docs
- **Supabase JavaScript Client:** https://supabase.com/docs/reference/javascript
- **Supabase Auth:** https://supabase.com/docs/guides/auth
- **Supabase Storage:** https://supabase.com/docs/guides/storage

### Project-Specific Documentation
- **Project Supabase Dashboard:** [Add your project URL]
- **Internal Setup Guide:** `docs/setup/SUPABASE_SETUP.md`
- **Security Guide:** `docs/security/SUPABASE_SECURITY.md`
- **Connection Audit Report:** `docs/reports/SUPABASE_CONNECTION_AUDIT.md`
- **Integration Roadmap:** `docs/reports/SUPABASE_INTEGRATION_ROADMAP.md`
- **Service Audit Checklist:** `docs/reports/SERVICE_AUDIT_CHECKLIST.md`

### Code Examples
- **BaseService Implementation:** `services/baseService.ts`
- **Service Example (BaseService):** `services/beneficiariesService.ts`
- **Service Example (Direct):** `services/donationsService.ts`
- **Page Example (Full CRUD):** `components/pages/BeneficiariesPageEnhanced.tsx`
- **Page Example (Complex Filters):** `components/pages/DonationsPage.tsx`

### Community Resources
- **Supabase Discord:** https://discord.supabase.com
- **Supabase GitHub:** https://github.com/supabase/supabase
- **Stack Overflow:** Tag `supabase`

---

## Quick Command Reference

### Check Service Status
```powershell
# List all services
Get-ChildItem -Path ".\services\" -Filter "*.ts"

# Search for Supabase imports
Select-String -Path ".\services\*.ts" -Pattern "from.*supabase"

# Search for BaseService usage
Select-String -Path ".\services\*.ts" -Pattern "extends BaseService"
```

### Check Page Status
```powershell
# List all pages
Get-ChildItem -Path ".\components\pages\" -Filter "*.tsx"

# Search for service imports in pages
Select-String -Path ".\components\pages\*.tsx" -Pattern "from.*services"

# Search for empty array initialization
Select-String -Path ".\components\pages\*.tsx" -Pattern "= \[\]"
```

### Database Operations
```sql
-- Check if table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'your_table';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';
```

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-09  
**Maintained By:** Development Team  
**Questions?** Contact the development team or refer to the full audit reports.
