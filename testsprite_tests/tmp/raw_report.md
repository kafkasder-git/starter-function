# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata

- **Project Name:** starter-function
- **Date:** 2025-10-12
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001

- **Test Name:** User Authentication Success
- **Test Code:**
  [TC001_User_Authentication_Success.py](./TC001_User_Authentication_Success.py)
- **Test Visualization and Result:**
  https://www.testsprite.com/dashboard/mcp/tests/a8f09e5b-7fe3-4ebe-8c4b-ee4a2dc681ad/05057c5a-c15f-48f8-86db-3dac04c4cfcb
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.

---

#### Test TC002

- **Test Name:** User Authentication Failure with Invalid Credentials
- **Test Code:**
  [TC002_User_Authentication_Failure_with_Invalid_Credentials.py](./TC002_User_Authentication_Failure_with_Invalid_Credentials.py)
- **Test Error:** Login test with invalid credentials failed because the system
  incorrectly allowed access and did not show an error message. This issue has
  been reported. Stopping further testing. Browser Console Logs: [ERROR] Failed
  to load resource: the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 502 ()
  (at https://httpbin.org/status/200:0:0) [ERROR] Failed to load resource: the
  server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 502 () (at
  https://httpbin.org/status/200:0:0) [ERROR] Failed to load resource: the
  server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0)
- **Test Visualization and Result:**
  https://www.testsprite.com/dashboard/mcp/tests/a8f09e5b-7fe3-4ebe-8c4b-ee4a2dc681ad/f71dd5c3-f2bf-4335-a42e-3bfb4437434b
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.

---

#### Test TC003

- **Test Name:** Role-Based Access Control Enforcement
- **Test Code:**
  [TC003_Role_Based_Access_Control_Enforcement.py](./TC003_Role_Based_Access_Control_Enforcement.py)
- **Test Visualization and Result:**
  https://www.testsprite.com/dashboard/mcp/tests/a8f09e5b-7fe3-4ebe-8c4b-ee4a2dc681ad/c4c0fa2e-439c-49f0-b8cb-a2fb81874f37
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.

---

#### Test TC004

- **Test Name:** Comprehensive Dashboard Data Display
- **Test Code:**
  [TC004_Comprehensive_Dashboard_Data_Display.py](./TC004_Comprehensive_Dashboard_Data_Display.py)
- **Test Visualization and Result:**
  https://www.testsprite.com/dashboard/mcp/tests/a8f09e5b-7fe3-4ebe-8c4b-ee4a2dc681ad/909f7873-555b-434e-9cff-c7d42851d548
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.

---

#### Test TC005

- **Test Name:** Beneficiary Profile Creation and Data Validation
- **Test Code:**
  [TC005_Beneficiary_Profile_Creation_and_Data_Validation.py](./TC005_Beneficiary_Profile_Creation_and_Data_Validation.py)
- **Test Error:** Navigation to beneficiary management and creation pages is not
  working. The 'Yeni İhtiyaç Sahibi' and 'İhtiyaç Sahipleri' buttons do not
  navigate away from the dashboard. Testing beneficiary profile creation and
  validation cannot proceed. Issue reported and testing stopped. Browser Console
  Logs: [ERROR] Failed to load resource: the server responded with a status of
  404 () (at https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR] Failed to
  load resource: the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 401 ()
  (at https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load
  resource: the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0)
- **Test Visualization and Result:**
  https://www.testsprite.com/dashboard/mcp/tests/a8f09e5b-7fe3-4ebe-8c4b-ee4a2dc681ad/273a4515-3583-4083-a0ce-de568b60fd83
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.

---

#### Test TC006

- **Test Name:** Aid Application Multi-Step Process with Bulk Operations
- **Test Code:**
  [TC006_Aid_Application_Multi_Step_Process_with_Bulk_Operations.py](./TC006_Aid_Application_Multi_Step_Process_with_Bulk_Operations.py)
- **Test Error:** Testing stopped due to critical issue: The 'Yeni İhtiyaç
  Sahibi' button does not open the multi-step aid application form, blocking
  further progress in the aid application workflow testing. Browser Console
  Logs: [ERROR] Failed to load resource: the server responded with a status of
  404 () (at https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR] Failed to
  load resource: the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 401 ()
  (at https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load
  resource: the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0)
- **Test Visualization and Result:**
  https://www.testsprite.com/dashboard/mcp/tests/a8f09e5b-7fe3-4ebe-8c4b-ee4a2dc681ad/14a7cf71-96bc-46b4-a1e7-0761dbf0a936
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.

---

#### Test TC007

- **Test Name:** Donation Management: Create and Track Donations
- **Test Code:**
  [TC007_Donation_Management_Create_and_Track_Donations.py](./TC007_Donation_Management_Create_and_Track_Donations.py)
- **Test Error:** The donation management page is inaccessible. Manual
  navigation to /donations resulted in a 404 Not Found error page. This prevents
  further testing of donor profile creation, donation recording, and donation
  history verification. Please fix the missing or broken donation management
  page to continue testing. Browser Console Logs: [ERROR] Failed to load
  resource: the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 401 ()
  (at https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load
  resource: the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0)
- **Test Visualization and Result:**
  https://www.testsprite.com/dashboard/mcp/tests/a8f09e5b-7fe3-4ebe-8c4b-ee4a2dc681ad/05980b60-c0ed-439c-9bc5-d74a1b307c78
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.

---

#### Test TC008

- **Test Name:** Scholarship Application and Monitoring
- **Test Code:**
  [TC008_Scholarship_Application_and_Monitoring.py](./TC008_Scholarship_Application_and_Monitoring.py)
- **Test Error:** Scholarship application submission failed. The form remains
  open after submission with no error message and no new application added. This
  blocks further testing of application visibility and profile updates.
  Reporting this as a website issue and stopping the test. Browser Console Logs:
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR] Failed to load
  resource: the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 401 ()
  (at https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load
  resource: the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents?queries%5B0%5D=%7B%22method%22%3A%22equal%22%2C%22attribute%22%3A%22aid_type%22%2C%22values%22%3A%5B%22education%22%5D%7D&queries%5B1%5D=%7B%22method%22%3A%22orderDesc%22%2C%22attribute%22%3A%22created_at%22%7D&queries%5B2%5D=%7B%22method%22%3A%22offset%22%2C%22values%22%3A%5B0%5D%7D&queries%5B3%5D=%7B%22method%22%3A%22limit%22%2C%22values%22%3A%5B1000%5D%7D:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents?queries%5B0%5D=%7B%22method%22%3A%22equal%22%2C%22attribute%22%3A%22aid_type%22%2C%22values%22%3A%5B%22education%22%5D%7D&queries%5B1%5D=%7B%22method%22%3A%22orderDesc%22%2C%22attribute%22%3A%22created_at%22%7D&queries%5B2%5D=%7B%22method%22%3A%22offset%22%2C%22values%22%3A%5B0%5D%7D&queries%5B3%5D=%7B%22method%22%3A%22limit%22%2C%22values%22%3A%5B1000%5D%7D:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 401 ()
  (at https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load
  resource: the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
- **Test Visualization and Result:**
  https://www.testsprite.com/dashboard/mcp/tests/a8f09e5b-7fe3-4ebe-8c4b-ee4a2dc681ad/ea1e86c9-ef10-4a5e-86a5-e00f7c688caa
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.

---

#### Test TC009

- **Test Name:** Financial Management: Income and Expense Tracking
- **Test Code:**
  [TC009_Financial_Management_Income_and_Expense_Tracking.py](./TC009_Financial_Management_Income_and_Expense_Tracking.py)
- **Test Error:** Testing cannot proceed because the financial management page
  is inaccessible due to a 404 error. The issue has been reported. Please fix
  the navigation or page availability to continue testing. Browser Console Logs:
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR] Failed to load
  resource: the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 401 ()
  (at https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load
  resource: the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0)
- **Test Visualization and Result:**
  https://www.testsprite.com/dashboard/mcp/tests/a8f09e5b-7fe3-4ebe-8c4b-ee4a2dc681ad/868c8792-6772-4c36-b66d-15fe5406923d
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.

---

#### Test TC010

- **Test Name:** Bulk Messaging System: Email and SMS Campaigns
- **Test Code:**
  [TC010_Bulk_Messaging_System_Email_and_SMS_Campaigns.py](./TC010_Bulk_Messaging_System_Email_and_SMS_Campaigns.py)
- **Test Error:** Stopped testing because messaging campaign management features
  are not accessible or visible in the current UI after login. Search and
  sidebar navigation attempts failed to locate campaign management section.
  Please verify user permissions or UI availability for these features. Browser
  Console Logs: [ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at
  http://localhost:5173/components/pages/FinanceIncomePage.tsx:0:0) [ERROR]
  Failed to load resource: the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 401 ()
  (at https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load
  resource: the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0)
- **Test Visualization and Result:**
  https://www.testsprite.com/dashboard/mcp/tests/a8f09e5b-7fe3-4ebe-8c4b-ee4a2dc681ad/5aeb6577-a198-4d7a-acc9-4c30691557a0
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.

---

#### Test TC011

- **Test Name:** Task, Event, and Meeting Creation and Coordination
- **Test Code:**
  [TC011_Task_Event_and_Meeting_Creation_and_Coordination.py](./TC011_Task_Event_and_Meeting_Creation_and_Coordination.py)
- **Test Error:** Test stopped due to inability to create new tasks. The 'Yeni
  Görev' button is unresponsive and does not open the task creation interface,
  which is a critical issue for verifying task creation, assignment, and
  progress tracking with calendar integration. Browser Console Logs: [ERROR]
  Failed to load resource: the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 401 ()
  (at https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load
  resource: the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0)
- **Test Visualization and Result:**
  https://www.testsprite.com/dashboard/mcp/tests/a8f09e5b-7fe3-4ebe-8c4b-ee4a2dc681ad/95745f2e-bdb6-4544-a9a5-305e51861a45
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.

---

#### Test TC012

- **Test Name:** Legal Case Management and Document Tracking
- **Test Code:**
  [TC012_Legal_Case_Management_and_Document_Tracking.py](./TC012_Legal_Case_Management_and_Document_Tracking.py)
- **Test Error:** Testing stopped due to 404 error on legal case management page
  'Dava Takipleri'. Unable to proceed with case management, lawyer assignment,
  and document handling tests. Issue reported. Browser Console Logs: [ERROR]
  Failed to load resource: net::ERR_EMPTY_RESPONSE (at
  http://localhost:5173/components/pages/NotFoundPage.tsx:0:0) [ERROR] Failed to
  load resource: the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 401 ()
  (at https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load
  resource: the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0)
- **Test Visualization and Result:**
  https://www.testsprite.com/dashboard/mcp/tests/a8f09e5b-7fe3-4ebe-8c4b-ee4a2dc681ad/af8f20f5-2461-47a3-8d3c-238d62f8cb5f
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.

---

#### Test TC013

- **Test Name:** Offline Support and Background Sync
- **Test Code:**
  [TC013_Offline_Support_and_Background_Sync.py](./TC013_Offline_Support_and_Background_Sync.py)
- **Test Error:** Stopped testing due to critical UI issue: 'Yeni İhtiyaç
  Sahibi' button does not open the new need entry form, preventing offline usage
  simulation and synchronization verification. Browser Console Logs: [ERROR]
  Failed to load resource: the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 401 ()
  (at https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load
  resource: the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0)
- **Test Visualization and Result:**
  https://www.testsprite.com/dashboard/mcp/tests/a8f09e5b-7fe3-4ebe-8c4b-ee4a2dc681ad/cd9399a0-15f6-4404-b1ad-c151fcdb040e
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.

---

#### Test TC014

- **Test Name:** Internationalization and RTL Language Support
- **Test Code:**
  [TC014_Internationalization_and_RTL_Language_Support.py](./TC014_Internationalization_and_RTL_Language_Support.py)
- **Test Error:** Testing stopped. The application does not provide a visible or
  functional language switcher to change the UI language to an RTL language.
  Turkish language UI and locale formatting verification completed successfully.
  RTL language and layout orientation verification could not be performed due to
  this issue. Browser Console Logs: [ERROR] Failed to load resource: the server
  responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 401 ()
  (at https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load
  resource: the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0)
- **Test Visualization and Result:**
  https://www.testsprite.com/dashboard/mcp/tests/a8f09e5b-7fe3-4ebe-8c4b-ee4a2dc681ad/116614d6-9729-4282-8bdb-ccf464890411
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.

---

#### Test TC015

- **Test Name:** WCAG 2.1 AA Accessibility Compliance
- **Test Code:**
  [TC015_WCAG_2.1_AA_Accessibility_Compliance.py](./TC015_WCAG_2.1_AA_Accessibility_Compliance.py)
- **Test Visualization and Result:**
  https://www.testsprite.com/dashboard/mcp/tests/a8f09e5b-7fe3-4ebe-8c4b-ee4a2dc681ad/38af0480-ee45-465e-a303-dc9b6f362d50
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.

---

#### Test TC016

- **Test Name:** Form Validation and Multi-Step Form Functionality
- **Test Code:**
  [TC016_Form_Validation_and_Multi_Step_Form_Functionality.py](./TC016_Form_Validation_and_Multi_Step_Form_Functionality.py)
- **Test Error:** Reported the navigation issue preventing access to forms from
  the dashboard. Stopping further testing as form validation cannot proceed
  without access to forms. Browser Console Logs: [ERROR] Failed to load
  resource: the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 401 ()
  (at https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load
  resource: the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0)
- **Test Visualization and Result:**
  https://www.testsprite.com/dashboard/mcp/tests/a8f09e5b-7fe3-4ebe-8c4b-ee4a2dc681ad/13e77c71-75a2-4970-b9f1-380af060d93a
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.

---

#### Test TC017

- **Test Name:** Security Testing: CSRF Protection and Rate Limiting
- **Test Code:**
  [TC017_Security_Testing_CSRF_Protection_and_Rate_Limiting.py](./TC017_Security_Testing_CSRF_Protection_and_Rate_Limiting.py)
- **Test Error:** Reported website issue due to inability to access forms for
  CSRF and rate limiting testing. Stopping further actions as core testing
  cannot proceed without form access. Browser Console Logs: [ERROR] Failed to
  load resource: the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 502 ()
  (at https://httpbin.org/status/200:0:0) [ERROR] Failed to load resource: the
  server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0)
- **Test Visualization and Result:**
  https://www.testsprite.com/dashboard/mcp/tests/a8f09e5b-7fe3-4ebe-8c4b-ee4a2dc681ad/19f25bc2-375c-4604-85b0-b4828d5e4109
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.

---

#### Test TC018

- **Test Name:** Notification System Functionality and Delivery
- **Test Code:**
  [TC018_Notification_System_Functionality_and_Delivery.py](./TC018_Notification_System_Functionality_and_Delivery.py)
- **Test Error:** Testing stopped due to critical UI issue: Notification panel
  does not display upon clicking notification bell despite notification count
  increment. Cannot verify in-app notifications or proceed with push
  notification tests. Browser Console Logs: [ERROR] Failed to load resource: the
  server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 401 ()
  (at https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load
  resource: the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0)
- **Test Visualization and Result:**
  https://www.testsprite.com/dashboard/mcp/tests/a8f09e5b-7fe3-4ebe-8c4b-ee4a2dc681ad/79affc3a-e492-4b52-bd08-1a57bea2f425
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.

---

#### Test TC019

- **Test Name:** Data Export and Import Accuracy
- **Test Code:**
  [TC019_Data_Export_and_Import_Accuracy.py](./TC019_Data_Export_and_Import_Accuracy.py)
- **Test Error:** Export functionality on donations list page is not accessible.
  Clicking the 'Dışa Aktar' button does not open export options or trigger any
  export action. No donation records are present which might affect export
  availability, but the export UI should still be accessible. Stopping further
  testing due to this issue. Browser Console Logs: [ERROR] Failed to load
  resource: the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 401 ()
  (at https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load
  resource: the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents?queries%5B0%5D=%7B%22method%22%3A%22select%22%2C%22values%22%3A%5B%22amount%22%2C%22status%22%2C%22donor_type%22%2C%22donation_type%22%2C%22payment_method%22%2C%22created_at%22%5D%7D:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents?queries%5B0%5D=%7B%22method%22%3A%22orderDesc%22%2C%22attribute%22%3A%22created_at%22%7D&queries%5B1%5D=%7B%22method%22%3A%22offset%22%2C%22values%22%3A%5B0%5D%7D&queries%5B2%5D=%7B%22method%22%3A%22limit%22%2C%22values%22%3A%5B10%5D%7D:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents?queries%5B0%5D=%7B%22method%22%3A%22orderDesc%22%2C%22attribute%22%3A%22created_at%22%7D&queries%5B1%5D=%7B%22method%22%3A%22offset%22%2C%22values%22%3A%5B0%5D%7D&queries%5B2%5D=%7B%22method%22%3A%22limit%22%2C%22values%22%3A%5B10%5D%7D:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents?queries%5B0%5D=%7B%22method%22%3A%22select%22%2C%22values%22%3A%5B%22amount%22%2C%22status%22%2C%22donor_type%22%2C%22donation_type%22%2C%22payment_method%22%2C%22created_at%22%5D%7D:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents?queries%5B0%5D=%7B%22method%22%3A%22orderDesc%22%2C%22attribute%22%3A%22created_at%22%7D&queries%5B1%5D=%7B%22method%22%3A%22offset%22%2C%22values%22%3A%5B0%5D%7D&queries%5B2%5D=%7B%22method%22%3A%22limit%22%2C%22values%22%3A%5B10%5D%7D:0:0)
- **Test Visualization and Result:**
  https://www.testsprite.com/dashboard/mcp/tests/a8f09e5b-7fe3-4ebe-8c4b-ee4a2dc681ad/6cd24ed0-56e7-4728-b857-478264a936ea
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.

---

#### Test TC020

- **Test Name:** System Settings and Backup Management
- **Test Code:**
  [TC020_System_Settings_and_Backup_Management.py](./TC020_System_Settings_and_Backup_Management.py)
- **Test Error:** The system settings configuration options were accessed and
  modified successfully, including General and Notification settings, with
  changes persisting after saving. The backup and recovery workflow was
  initiated by triggering a manual backup in the Database tab; however, no
  confirmation message was found to verify successful completion of the backup.
  Therefore, the backup process success could not be fully confirmed. Overall,
  the task is partially completed with successful settings modification but
  incomplete verification of backup success. Browser Console Logs: [ERROR]
  Failed to load resource: the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 401 ()
  (at https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load
  resource: the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0)
- **Test Visualization and Result:**
  https://www.testsprite.com/dashboard/mcp/tests/a8f09e5b-7fe3-4ebe-8c4b-ee4a2dc681ad/28ce22a6-9f6f-4f8c-96bd-6f5cfbee0454
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.

---

#### Test TC021

- **Test Name:** Performance Benchmark Verification
- **Test Code:**
  [TC021_Performance_Benchmark_Verification.py](./TC021_Performance_Benchmark_Verification.py)
- **Test Visualization and Result:**
  https://www.testsprite.com/dashboard/mcp/tests/a8f09e5b-7fe3-4ebe-8c4b-ee4a2dc681ad/a1e4b65f-1eb4-4ccd-af9d-595772a508b1
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.

---

#### Test TC022

- **Test Name:** Load Testing for 100% User Support
- **Test Code:**
  [TC022_Load_Testing_for_100_User_Support.py](./TC022_Load_Testing_for_100_User_Support.py)
- **Test Visualization and Result:**
  https://www.testsprite.com/dashboard/mcp/tests/a8f09e5b-7fe3-4ebe-8c4b-ee4a2dc681ad/97e7f47c-6ac8-4809-8acd-926018f404ca
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.

---

#### Test TC023

- **Test Name:** Disaster Recovery Process Validation
- **Test Code:**
  [TC023_Disaster_Recovery_Process_Validation.py](./TC023_Disaster_Recovery_Process_Validation.py)
- **Test Error:** Disaster recovery process test stopped due to inability to
  access recovery procedures from the UI. The system remains on the dashboard
  with no recovery workflow accessible. Issue reported for resolution. Browser
  Console Logs: [ERROR] Failed to load resource: the server responded with a
  status of 404 () (at https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR]
  Failed to load resource: the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 401 ()
  (at https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load
  resource: the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 502 () (at
  https://httpbin.org/status/200:0:0) [ERROR] Failed to load resource: the
  server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0)
- **Test Visualization and Result:**
  https://www.testsprite.com/dashboard/mcp/tests/a8f09e5b-7fe3-4ebe-8c4b-ee4a2dc681ad/10389f1f-e90a-4b18-8f18-f7e4772f41c3
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.

---

#### Test TC024

- **Test Name:** User Profile Update and Role Management
- **Test Code:**
  [TC024_User_Profile_Update_and_Role_Management.py](./TC024_User_Profile_Update_and_Role_Management.py)
- **Test Error:** The 'Kullanıcılar' (Users) page in the user management section
  returned a 404 error (Page Not Found). This prevents verification of user role
  and permission management functionalities. The test cannot proceed further due
  to this critical issue. Please fix the broken link or page to enable further
  testing. Browser Console Logs: [ERROR] Failed to load resource: the server
  responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 401 ()
  (at https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load
  resource: the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0)
- **Test Visualization and Result:**
  https://www.testsprite.com/dashboard/mcp/tests/a8f09e5b-7fe3-4ebe-8c4b-ee4a2dc681ad/0098b42a-c2df-4626-925d-83f3f9f4a38e
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.

---

#### Test TC025

- **Test Name:** Security Audit Results: Zero Critical Vulnerabilities
- **Test Code:**
  [TC025_Security_Audit_Results_Zero_Critical_Vulnerabilities.py](./TC025_Security_Audit_Results_Zero_Critical_Vulnerabilities.py)
- **Test Error:** Security audit testing halted due to critical navigation
  failure. The 'Kullanıcılar' page returned a 404 error, blocking access to
  critical modules for security scans and penetration testing. Please fix the
  broken link or missing page to continue the audit. No critical vulnerabilities
  could be verified due to this issue. Browser Console Logs: [ERROR] Failed to
  load resource: the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/account:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 404 () (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/beneficiaries/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/donations/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/members/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 404 ()
  (at
  https://fra.cloud.appwrite.io/v1/databases/kafkasder_db/collections/aid_applications/documents:0:0)
  [ERROR] Failed to load resource: the server responded with a status of 401 ()
  (at https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load
  resource: the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0) [ERROR] Failed to load resource:
  the server responded with a status of 401 () (at
  https://fra.cloud.appwrite.io/v1/health:0:0)
- **Test Visualization and Result:**
  https://www.testsprite.com/dashboard/mcp/tests/a8f09e5b-7fe3-4ebe-8c4b-ee4a2dc681ad/7a967551-f1a2-4e98-bfdd-2df7c98e7c7c
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.

---

## 3️⃣ Coverage & Matching Metrics

- **24.00** of tests passed

| Requirement | Total Tests | ✅ Passed | ❌ Failed |
| ----------- | ----------- | --------- | --------- |
| ...         | ...         | ...       | ...       |

---

## 4️⃣ Key Gaps / Risks

## {AI_GNERATED_KET_GAPS_AND_RISKS}
