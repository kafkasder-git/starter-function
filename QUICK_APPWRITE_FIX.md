# ⚡ Quick Appwrite Collections Fix

## 🚨 Problem

TestSprite tests failing with 404 errors:

```
Failed to load resource: 404
- /v1/databases/kafkasder_db/collections/beneficiaries/documents
- /v1/databases/kafkasder_db/collections/donations/documents
- /v1/databases/kafkasder_db/collections/aid_applications/documents
- /v1/databases/kafkasder_db/collections/members/documents
```

**Impact:** 20/25 tests failing (80% of tests blocked!)

---

## ✅ Quick Solution (5 minutes)

### Option 1: Appwrite Console (Recommended - Fastest)

1. **Go to:**
   https://cloud.appwrite.io/console/project-68e99f6c000183bafb39/databases/database-kafkasder_db

2. **Create 4 Collections** - Click "Create Collection" for each:

#### Collection 1: `beneficiaries`

```
Collection ID: beneficiaries
Name: Beneficiaries
Permissions:
  - read("any")
  - create("users")
  - update("users")
  - delete("users")
Document Security: ✅ Enabled
```

**Attributes to add:**

- `name` - String (255) - Required
- `tc_number` - String (11) - Required, Unique
- `phone` - String (20) - Required
- `email` - String (255) - Optional
- `address` - String (1000) - Required
- `status` - String (50) - Required, Default: "active"
- `created_at` - DateTime - Optional

#### Collection 2: `donations`

```
Collection ID: donations
Name: Donations
Permissions: Same as above
Document Security: ✅ Enabled
```

**Attributes:**

- `donor_name` - String (255) - Required
- `amount` - Float - Required, Min: 0
- `currency` - String (10) - Required, Default: "TRY"
- `donation_type` - String (50) - Required
- `payment_method` - String (50) - Required
- `status` - String (50) - Required, Default: "pending"
- `donation_date` - DateTime - Required
- `notes` - String (2000) - Optional

#### Collection 3: `aid_applications`

```
Collection ID: aid_applications
Name: Aid Applications
Permissions: Same as above
Document Security: ✅ Enabled
```

**Attributes:**

- `applicant_name` - String (255) - Required
- `applicant_phone` - String (20) - Required
- `aid_type` - String (50) - Required
- `requested_amount` - Float - Optional, Min: 0
- `status` - String (50) - Required, Default: "pending"
- `urgency` - String (20) - Required, Default: "medium"
- `description` - String (2000) - Required
- `application_date` - DateTime - Required
- `assigned_to` - String (255) - Optional

#### Collection 4: `members`

```
Collection ID: members
Name: Members
Permissions: Same as above
Document Security: ✅ Enabled
```

**Attributes:**

- `name` - String (255) - Required
- `email` - String (255) - Required, Unique
- `phone` - String (20) - Required
- `membership_number` - String (50) - Required, Unique
- `status` - String (50) - Required, Default: "active"
- `joined_date` - DateTime - Required

---

### Option 2: Import from appwrite.json (If Console supports)

The complete collection definitions are in:
`/Users/mac/starter-function/appwrite.json`

You can try importing directly if Appwrite Console has an import feature.

---

## 🧪 Verify Collections Created

Run this command to check:

```bash
curl -s -X GET 'https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections' \
  -H 'X-Appwrite-Project: 68e99f6c000183bafb39' \
  -H 'X-API-Key: 98fb9180c6cd941534a659cb894cf920bb2b15c9c3448c3b93e0231955b0a6469c7d87973d59a5db663e819133042e9a23b01b64c5e70f32fa222d95c5fa1769eda529f19f28c70f4eafbe81745197148c6184f85ef011680b7ed3666f745768423d146937d8572b047bd2f707e89b43a5d585db10c7bad2308dbce4b0c9736c' | jq
```

Expected output: Should list 4 collections

---

## 🚀 After Creating Collections

### Rerun Tests Immediately

```bash
# Development server should still be running on port 5173
# In new terminal:
cd /Users/mac/starter-function
node /Users/mac/.npm/_npx/8ddf6bea01b2519d/node_modules/@testsprite/testsprite-mcp/dist/index.js generateCodeAndExecute
```

### Expected Result

- **Before:** 4/25 tests passing (16%)
- **After:** 20-24/25 tests passing (80-96%)

The 20 tests that were failing due to 404 errors should now pass!

---

## 📊 Other Fixes Needed (Lower Priority)

After collections are created, there are 2 other issues to fix:

### 1. Login Validation Bug (TC002)

**Issue:** Invalid credentials are being accepted **File:**
`components/auth/LoginForm.tsx` or `services/appwriteAuthService.ts` **Fix:**
Add proper error handling for invalid credentials

### 2. Navigation Issues (TC005-TC009)

**Issue:** Dashboard buttons don't navigate properly **Files:**
`components/layouts/Sidebar.tsx`, `components/pages/DashboardPage.tsx` **Fix:**
Check React Router navigation handlers

---

## 📝 Notes

- The full collection schema is defined in `appwrite.json`
- All collections need `documentSecurity: true`
- Permissions should allow read for "any", write for "users"
- Test user is already configured: `isahamid095@gmail.com`
- Development server is running on port 5173

---

## 🆘 Quick Support

**Appwrite Console:** https://cloud.appwrite.io/ **Project:** KafkasPortal
(68e99f6c000183bafb39) **Database:** kafkasder_db

**If stuck:**

1. Check if database `kafkasder_db` exists
2. Check if you're logged into the correct Appwrite account
3. Verify you have admin access to the project
