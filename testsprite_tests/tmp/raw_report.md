
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** panel-3
- **Date:** 2025-10-03
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001
- **Test Name:** User Authentication Success
- **Test Code:** [TC001_User_Authentication_Success.py](./TC001_User_Authentication_Success.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/1109eaed-83bb-49ab-b4de-6f08a94374f3/4ae25a1b-5c24-48a6-bd59-6dbcd2029925
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002
- **Test Name:** User Authentication Failure with Invalid Credentials
- **Test Code:** [TC002_User_Authentication_Failure_with_Invalid_Credentials.py](./TC002_User_Authentication_Failure_with_Invalid_Credentials.py)
- **Test Error:** Login with invalid credentials did not fail as expected. Instead, the system allowed access and redirected to the dashboard without any error message. This is a critical issue that needs to be fixed. Stopping further testing.
Browser Console Logs:
[WARNING] Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key. (at http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=95e6c095:5721:14)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/1109eaed-83bb-49ab-b4de-6f08a94374f3/e9294c2f-e040-4bf9-b457-4d3bd6a1195d
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003
- **Test Name:** Real-Time Statistics Dashboard Update
- **Test Code:** [TC003_Real_Time_Statistics_Dashboard_Update.py](./TC003_Real_Time_Statistics_Dashboard_Update.py)
- **Test Error:** Testing stopped due to inability to open the new member form via 'Yeni Üye Ekle' or 'İlk Üyeyi Ekle' buttons. This blocks triggering data change events necessary to validate real-time updates on the dashboard. Issue reported for resolution.
Browser Console Logs:
[WARNING] Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key. (at http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=95e6c095:5721:14)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://gyburnfaszhxcxdnwogj.supabase.co/rest/v1/members?select=membership_status%2Cmembership_type%2Ccity%2Cprofession%2Cjoin_date%2Cbirth_date%2Cvolunteer_hours%2Ccontribution_amount%2Cfee_paid:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://gyburnfaszhxcxdnwogj.supabase.co/rest/v1/members?select=membership_status%2Cmembership_type%2Ccity%2Cprofession%2Cjoin_date%2Cbirth_date%2Cvolunteer_hours%2Ccontribution_amount%2Cfee_paid:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/1109eaed-83bb-49ab-b4de-6f08a94374f3/dadac03b-ced4-4791-a8cb-9ca49647ca1b
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004
- **Test Name:** Member Registration and Profile Update
- **Test Code:** [TC004_Member_Registration_and_Profile_Update.py](./TC004_Member_Registration_and_Profile_Update.py)
- **Test Error:** Testing stopped due to critical issue: The new member registration form does not open when clicking either 'Yeni Üye Ekle' or 'İlk Üyeyi Ekle' buttons on the member management page. This blocks the registration process and prevents further testing.
Browser Console Logs:
[WARNING] Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key. (at http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=95e6c095:5721:14)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://gyburnfaszhxcxdnwogj.supabase.co/rest/v1/members?select=membership_status%2Cmembership_type%2Ccity%2Cprofession%2Cjoin_date%2Cbirth_date%2Cvolunteer_hours%2Ccontribution_amount%2Cfee_paid:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://gyburnfaszhxcxdnwogj.supabase.co/rest/v1/members?select=membership_status%2Cmembership_type%2Ccity%2Cprofession%2Cjoin_date%2Cbirth_date%2Cvolunteer_hours%2Ccontribution_amount%2Cfee_paid:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/1109eaed-83bb-49ab-b4de-6f08a94374f3/67688691-f0bf-4dbe-99a5-e03f6a7a79b1
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005
- **Test Name:** Membership Fee Tracking and Alerts
- **Test Code:** [TC005_Membership_Fee_Tracking_and_Alerts.py](./TC005_Membership_Fee_Tracking_and_Alerts.py)
- **Test Error:** Reported the website issue about incorrect navigation from 'Aidat Takibi' button. Stopping further actions as the task cannot proceed without correct page access.
Browser Console Logs:
[WARNING] Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key. (at http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=95e6c095:5721:14)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://gyburnfaszhxcxdnwogj.supabase.co/rest/v1/members?select=membership_status%2Cmembership_type%2Ccity%2Cprofession%2Cjoin_date%2Cbirth_date%2Cvolunteer_hours%2Ccontribution_amount%2Cfee_paid:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://gyburnfaszhxcxdnwogj.supabase.co/rest/v1/members?select=membership_status%2Cmembership_type%2Ccity%2Cprofession%2Cjoin_date%2Cbirth_date%2Cvolunteer_hours%2Ccontribution_amount%2Cfee_paid:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/1109eaed-83bb-49ab-b4de-6f08a94374f3/5924e1a1-055f-450c-8378-da85a6bfc4b7
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006
- **Test Name:** Donation Entry and Kumbara Management
- **Test Code:** [TC006_Donation_Entry_and_Kumbara_Management.py](./TC006_Donation_Entry_and_Kumbara_Management.py)
- **Test Error:** Donation form submission failed despite valid inputs. Cannot proceed with donation addition, kumbara tracking, or report generation. Reporting issue and stopping test.
Browser Console Logs:
[WARNING] Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key. (at http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=95e6c095:5721:14)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://gyburnfaszhxcxdnwogj.supabase.co/rest/v1/donations?select=amount%2Cstatus%2Cdonor_type%2Cdonation_type%2Cpayment_method%2Ccreated_at:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://gyburnfaszhxcxdnwogj.supabase.co/rest/v1/donations?select=amount%2Cstatus%2Cdonor_type%2Cdonation_type%2Cpayment_method%2Ccreated_at:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://gyburnfaszhxcxdnwogj.supabase.co/rest/v1/donations?columns=%22donor_name%22%2C%22donor_email%22%2C%22donor_phone%22%2C%22donor_type%22%2C%22amount%22%2C%22currency%22%2C%22donation_type%22%2C%22category%22%2C%22description%22%2C%22payment_method%22%2C%22payment_reference%22%2C%22bank_account%22%2C%22transaction_id%22%2C%22status%22%2C%22allocated_to%22%2C%22beneficiary_id%22%2C%22allocation_percentage%22%2C%22receipt_issued%22%2C%22tax_deductible%22%2C%22campaign_id%22%2C%22source%22%2C%22referral_code%22%2C%22communication_preference%22%2C%22is_recurring%22%2C%22recurring_frequency%22%2C%22recurring_end_date%22%2C%22recurring_amount%22%2C%22notes%22&select=*:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/1109eaed-83bb-49ab-b4de-6f08a94374f3/3b24bc17-3f08-49ef-9ec2-49df2ccfbd04
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007
- **Test Name:** Beneficiary Application and Aid Tracking
- **Test Code:** [TC007_Beneficiary_Application_and_Aid_Tracking.py](./TC007_Beneficiary_Application_and_Aid_Tracking.py)
- **Test Error:** Testing stopped due to UI issue preventing aid application submission. Beneficiary registration was successful, but the new aid application form could not be accessed. Issue reported for resolution.
Browser Console Logs:
[WARNING] Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key. (at http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=95e6c095:5721:14)
[WARNING] Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}. (at http://localhost:5173/node_modules/.vite/deps/chunk-MB2SGOZE.js?v=95e6c095:333:35)
[WARNING] Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}. (at http://localhost:5173/node_modules/.vite/deps/chunk-MB2SGOZE.js?v=95e6c095:333:35)
[WARNING] Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}. (at http://localhost:5173/node_modules/.vite/deps/chunk-MB2SGOZE.js?v=95e6c095:333:35)
[WARNING] Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}. (at http://localhost:5173/node_modules/.vite/deps/chunk-MB2SGOZE.js?v=95e6c095:333:35)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/1109eaed-83bb-49ab-b4de-6f08a94374f3/79a60582-7ab7-4cde-a382-542fec6a04d8
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008
- **Test Name:** Scholarship Student Application and Monitoring
- **Test Code:** [TC008_Scholarship_Student_Application_and_Monitoring.py](./TC008_Scholarship_Student_Application_and_Monitoring.py)
- **Test Error:** Testing stopped due to UI issue: The 'Öğrenci Adına Başvuru Oluştur' button does not open the application form, preventing submission of new scholarship applications. Further testing cannot continue until this is resolved.
Browser Console Logs:
[WARNING] Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key. (at http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=95e6c095:5721:14)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/1109eaed-83bb-49ab-b4de-6f08a94374f3/719a03ad-7473-442c-82cd-6f261823b7a0
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009
- **Test Name:** Service Tracking and Hospital Referral Workflow
- **Test Code:** [TC009_Service_Tracking_and_Hospital_Referral_Workflow.py](./TC009_Service_Tracking_and_Hospital_Referral_Workflow.py)
- **Test Error:** Reported the issue about missing Hospital Referral page and stopped further testing as the required navigation is not possible.
Browser Console Logs:
[WARNING] Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key. (at http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=95e6c095:5721:14)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/1109eaed-83bb-49ab-b4de-6f08a94374f3/26efd5d9-7cc0-4c9a-b482-c8b331067c5e
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010
- **Test Name:** Legal Module Document Upload and Lawyer Assignment
- **Test Code:** [TC010_Legal_Module_Document_Upload_and_Lawyer_Assignment.py](./TC010_Legal_Module_Document_Upload_and_Lawyer_Assignment.py)
- **Test Error:** Testing stopped due to critical issue: The 'Belge Yükle' button does not open the file upload dialog, preventing document upload and OCR testing. Please fix this issue to continue testing.
Browser Console Logs:
[WARNING] Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key. (at http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=95e6c095:5721:14)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/1109eaed-83bb-49ab-b4de-6f08a94374f3/ba1c2354-9ee2-426f-a332-969abc076b30
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC011
- **Test Name:** Financial Income and Expense Management with Reporting
- **Test Code:** [TC011_Financial_Income_and_Expense_Management_with_Reporting.py](./TC011_Financial_Income_and_Expense_Management_with_Reporting.py)
- **Test Error:** Navigation to Financial Income page failed due to incorrect menu behavior. Testing cannot proceed further. Reporting the issue and stopping the task.
Browser Console Logs:
[WARNING] Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key. (at http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=95e6c095:5721:14)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/1109eaed-83bb-49ab-b4de-6f08a94374f3/51104a20-db72-44e9-ae2b-2bf133ee5ecb
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012
- **Test Name:** Event Creation and Appointment Scheduling
- **Test Code:** [TC012_Event_Creation_and_Appointment_Scheduling.py](./TC012_Event_Creation_and_Appointment_Scheduling.py)
- **Test Error:** Event creation form is not accessible after clicking 'Yeni Etkinlik Ekle'. The event creation workflow is blocked. Reporting the issue and stopping further actions.
Browser Console Logs:
[WARNING] Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key. (at http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=95e6c095:5721:14)
[ERROR] Warning: <%s /> is using incorrect casing. Use PascalCase for React components, or lowercase for HTML elements.%s Heart 
    at Heart
    at div
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at div
    at div
    at CardContent (http://localhost:5173/components/ui/card.tsx:97:24)
    at div
    at Card (http://localhost:5173/components/ui/card.tsx:18:17)
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at div
    at http://localhost:5173/node_modules/.vite/deps/chunk-GN4BXVVX.js?v=95e6c095:43:13
    at Presence (http://localhost:5173/node_modules/.vite/deps/chunk-NHQZK2WS.js?v=95e6c095:24:11)
    at http://localhost:5173/node_modules/.vite/deps/@radix-ui_react-tabs.js?v=95e6c095:175:13
    at TabsContent (http://localhost:5173/components/ui/tabs.tsx:83:24)
    at div
    at http://localhost:5173/node_modules/.vite/deps/chunk-GN4BXVVX.js?v=95e6c095:43:13
    at Provider (http://localhost:5173/node_modules/.vite/deps/chunk-36WGJFHK.js?v=95e6c095:37:15)
    at http://localhost:5173/node_modules/.vite/deps/@radix-ui_react-tabs.js?v=95e6c095:52:7
    at Tabs (http://localhost:5173/components/ui/tabs.tsx:20:17)
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at div
    at http://localhost:5173/components/ui/EnhancedDashboard.tsx:183:8
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at PageTransition (http://localhost:5173/components/AnimatedContainer.tsx:197:3)
    at Suspense
    at PageRenderer (http://localhost:5173/components/app/PageRenderer.tsx:27:32)
    at div
    at div
    at main
    at div
    at div
    at ProtectedRoute (http://localhost:5173/components/auth/ProtectedRoute.tsx:24:3)
    at http://localhost:5173/App.tsx:31:22
    at NavigationProvider (http://localhost:5173/components/app/NavigationManager.tsx:31:3)
    at _c3
    at SupabaseAuthProvider (http://localhost:5173/contexts/SupabaseAuthContext.tsx:23:40)
    at ErrorBoundary (http://localhost:5173/components/ErrorBoundary.tsx:9:8)
    at AppWithErrorHandling
    at App (at http://localhost:5173/node_modules/.vite/deps/chunk-YQ5BCTVV.js?v=95e6c095:520:37)
[ERROR] Warning: The tag <%s> is unrecognized in this browser. If you meant to render a React component, start its name with an uppercase letter.%s Heart 
    at Heart
    at div
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at div
    at div
    at CardContent (http://localhost:5173/components/ui/card.tsx:97:24)
    at div
    at Card (http://localhost:5173/components/ui/card.tsx:18:17)
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at div
    at http://localhost:5173/node_modules/.vite/deps/chunk-GN4BXVVX.js?v=95e6c095:43:13
    at Presence (http://localhost:5173/node_modules/.vite/deps/chunk-NHQZK2WS.js?v=95e6c095:24:11)
    at http://localhost:5173/node_modules/.vite/deps/@radix-ui_react-tabs.js?v=95e6c095:175:13
    at TabsContent (http://localhost:5173/components/ui/tabs.tsx:83:24)
    at div
    at http://localhost:5173/node_modules/.vite/deps/chunk-GN4BXVVX.js?v=95e6c095:43:13
    at Provider (http://localhost:5173/node_modules/.vite/deps/chunk-36WGJFHK.js?v=95e6c095:37:15)
    at http://localhost:5173/node_modules/.vite/deps/@radix-ui_react-tabs.js?v=95e6c095:52:7
    at Tabs (http://localhost:5173/components/ui/tabs.tsx:20:17)
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at div
    at http://localhost:5173/components/ui/EnhancedDashboard.tsx:183:8
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at PageTransition (http://localhost:5173/components/AnimatedContainer.tsx:197:3)
    at Suspense
    at PageRenderer (http://localhost:5173/components/app/PageRenderer.tsx:27:32)
    at div
    at div
    at main
    at div
    at div
    at ProtectedRoute (http://localhost:5173/components/auth/ProtectedRoute.tsx:24:3)
    at http://localhost:5173/App.tsx:31:22
    at NavigationProvider (http://localhost:5173/components/app/NavigationManager.tsx:31:3)
    at _c3
    at SupabaseAuthProvider (http://localhost:5173/contexts/SupabaseAuthContext.tsx:23:40)
    at ErrorBoundary (http://localhost:5173/components/ErrorBoundary.tsx:9:8)
    at AppWithErrorHandling
    at App (at http://localhost:5173/node_modules/.vite/deps/chunk-YQ5BCTVV.js?v=95e6c095:520:37)
[ERROR] Warning: <%s /> is using incorrect casing. Use PascalCase for React components, or lowercase for HTML elements.%s Users 
    at Users
    at div
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at div
    at div
    at CardContent (http://localhost:5173/components/ui/card.tsx:97:24)
    at div
    at Card (http://localhost:5173/components/ui/card.tsx:18:17)
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at div
    at http://localhost:5173/node_modules/.vite/deps/chunk-GN4BXVVX.js?v=95e6c095:43:13
    at Presence (http://localhost:5173/node_modules/.vite/deps/chunk-NHQZK2WS.js?v=95e6c095:24:11)
    at http://localhost:5173/node_modules/.vite/deps/@radix-ui_react-tabs.js?v=95e6c095:175:13
    at TabsContent (http://localhost:5173/components/ui/tabs.tsx:83:24)
    at div
    at http://localhost:5173/node_modules/.vite/deps/chunk-GN4BXVVX.js?v=95e6c095:43:13
    at Provider (http://localhost:5173/node_modules/.vite/deps/chunk-36WGJFHK.js?v=95e6c095:37:15)
    at http://localhost:5173/node_modules/.vite/deps/@radix-ui_react-tabs.js?v=95e6c095:52:7
    at Tabs (http://localhost:5173/components/ui/tabs.tsx:20:17)
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at div
    at http://localhost:5173/components/ui/EnhancedDashboard.tsx:183:8
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at PageTransition (http://localhost:5173/components/AnimatedContainer.tsx:197:3)
    at Suspense
    at PageRenderer (http://localhost:5173/components/app/PageRenderer.tsx:27:32)
    at div
    at div
    at main
    at div
    at div
    at ProtectedRoute (http://localhost:5173/components/auth/ProtectedRoute.tsx:24:3)
    at http://localhost:5173/App.tsx:31:22
    at NavigationProvider (http://localhost:5173/components/app/NavigationManager.tsx:31:3)
    at _c3
    at SupabaseAuthProvider (http://localhost:5173/contexts/SupabaseAuthContext.tsx:23:40)
    at ErrorBoundary (http://localhost:5173/components/ErrorBoundary.tsx:9:8)
    at AppWithErrorHandling
    at App (at http://localhost:5173/node_modules/.vite/deps/chunk-YQ5BCTVV.js?v=95e6c095:520:37)
[ERROR] Warning: The tag <%s> is unrecognized in this browser. If you meant to render a React component, start its name with an uppercase letter.%s Users 
    at Users
    at div
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at div
    at div
    at CardContent (http://localhost:5173/components/ui/card.tsx:97:24)
    at div
    at Card (http://localhost:5173/components/ui/card.tsx:18:17)
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at div
    at http://localhost:5173/node_modules/.vite/deps/chunk-GN4BXVVX.js?v=95e6c095:43:13
    at Presence (http://localhost:5173/node_modules/.vite/deps/chunk-NHQZK2WS.js?v=95e6c095:24:11)
    at http://localhost:5173/node_modules/.vite/deps/@radix-ui_react-tabs.js?v=95e6c095:175:13
    at TabsContent (http://localhost:5173/components/ui/tabs.tsx:83:24)
    at div
    at http://localhost:5173/node_modules/.vite/deps/chunk-GN4BXVVX.js?v=95e6c095:43:13
    at Provider (http://localhost:5173/node_modules/.vite/deps/chunk-36WGJFHK.js?v=95e6c095:37:15)
    at http://localhost:5173/node_modules/.vite/deps/@radix-ui_react-tabs.js?v=95e6c095:52:7
    at Tabs (http://localhost:5173/components/ui/tabs.tsx:20:17)
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at div
    at http://localhost:5173/components/ui/EnhancedDashboard.tsx:183:8
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at PageTransition (http://localhost:5173/components/AnimatedContainer.tsx:197:3)
    at Suspense
    at PageRenderer (http://localhost:5173/components/app/PageRenderer.tsx:27:32)
    at div
    at div
    at main
    at div
    at div
    at ProtectedRoute (http://localhost:5173/components/auth/ProtectedRoute.tsx:24:3)
    at http://localhost:5173/App.tsx:31:22
    at NavigationProvider (http://localhost:5173/components/app/NavigationManager.tsx:31:3)
    at _c3
    at SupabaseAuthProvider (http://localhost:5173/contexts/SupabaseAuthContext.tsx:23:40)
    at ErrorBoundary (http://localhost:5173/components/ErrorBoundary.tsx:9:8)
    at AppWithErrorHandling
    at App (at http://localhost:5173/node_modules/.vite/deps/chunk-YQ5BCTVV.js?v=95e6c095:520:37)
[ERROR] Warning: <%s /> is using incorrect casing. Use PascalCase for React components, or lowercase for HTML elements.%s UserPlus 
    at UserPlus
    at div
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at div
    at div
    at CardContent (http://localhost:5173/components/ui/card.tsx:97:24)
    at div
    at Card (http://localhost:5173/components/ui/card.tsx:18:17)
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at div
    at http://localhost:5173/node_modules/.vite/deps/chunk-GN4BXVVX.js?v=95e6c095:43:13
    at Presence (http://localhost:5173/node_modules/.vite/deps/chunk-NHQZK2WS.js?v=95e6c095:24:11)
    at http://localhost:5173/node_modules/.vite/deps/@radix-ui_react-tabs.js?v=95e6c095:175:13
    at TabsContent (http://localhost:5173/components/ui/tabs.tsx:83:24)
    at div
    at http://localhost:5173/node_modules/.vite/deps/chunk-GN4BXVVX.js?v=95e6c095:43:13
    at Provider (http://localhost:5173/node_modules/.vite/deps/chunk-36WGJFHK.js?v=95e6c095:37:15)
    at http://localhost:5173/node_modules/.vite/deps/@radix-ui_react-tabs.js?v=95e6c095:52:7
    at Tabs (http://localhost:5173/components/ui/tabs.tsx:20:17)
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at div
    at http://localhost:5173/components/ui/EnhancedDashboard.tsx:183:8
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at PageTransition (http://localhost:5173/components/AnimatedContainer.tsx:197:3)
    at Suspense
    at PageRenderer (http://localhost:5173/components/app/PageRenderer.tsx:27:32)
    at div
    at div
    at main
    at div
    at div
    at ProtectedRoute (http://localhost:5173/components/auth/ProtectedRoute.tsx:24:3)
    at http://localhost:5173/App.tsx:31:22
    at NavigationProvider (http://localhost:5173/components/app/NavigationManager.tsx:31:3)
    at _c3
    at SupabaseAuthProvider (http://localhost:5173/contexts/SupabaseAuthContext.tsx:23:40)
    at ErrorBoundary (http://localhost:5173/components/ErrorBoundary.tsx:9:8)
    at AppWithErrorHandling
    at App (at http://localhost:5173/node_modules/.vite/deps/chunk-YQ5BCTVV.js?v=95e6c095:520:37)
[ERROR] Warning: The tag <%s> is unrecognized in this browser. If you meant to render a React component, start its name with an uppercase letter.%s UserPlus 
    at UserPlus
    at div
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at div
    at div
    at CardContent (http://localhost:5173/components/ui/card.tsx:97:24)
    at div
    at Card (http://localhost:5173/components/ui/card.tsx:18:17)
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at div
    at http://localhost:5173/node_modules/.vite/deps/chunk-GN4BXVVX.js?v=95e6c095:43:13
    at Presence (http://localhost:5173/node_modules/.vite/deps/chunk-NHQZK2WS.js?v=95e6c095:24:11)
    at http://localhost:5173/node_modules/.vite/deps/@radix-ui_react-tabs.js?v=95e6c095:175:13
    at TabsContent (http://localhost:5173/components/ui/tabs.tsx:83:24)
    at div
    at http://localhost:5173/node_modules/.vite/deps/chunk-GN4BXVVX.js?v=95e6c095:43:13
    at Provider (http://localhost:5173/node_modules/.vite/deps/chunk-36WGJFHK.js?v=95e6c095:37:15)
    at http://localhost:5173/node_modules/.vite/deps/@radix-ui_react-tabs.js?v=95e6c095:52:7
    at Tabs (http://localhost:5173/components/ui/tabs.tsx:20:17)
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at div
    at http://localhost:5173/components/ui/EnhancedDashboard.tsx:183:8
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at PageTransition (http://localhost:5173/components/AnimatedContainer.tsx:197:3)
    at Suspense
    at PageRenderer (http://localhost:5173/components/app/PageRenderer.tsx:27:32)
    at div
    at div
    at main
    at div
    at div
    at ProtectedRoute (http://localhost:5173/components/auth/ProtectedRoute.tsx:24:3)
    at http://localhost:5173/App.tsx:31:22
    at NavigationProvider (http://localhost:5173/components/app/NavigationManager.tsx:31:3)
    at _c3
    at SupabaseAuthProvider (http://localhost:5173/contexts/SupabaseAuthContext.tsx:23:40)
    at ErrorBoundary (http://localhost:5173/components/ErrorBoundary.tsx:9:8)
    at AppWithErrorHandling
    at App (at http://localhost:5173/node_modules/.vite/deps/chunk-YQ5BCTVV.js?v=95e6c095:520:37)
[ERROR] Warning: <%s /> is using incorrect casing. Use PascalCase for React components, or lowercase for HTML elements.%s Package 
    at Package
    at div
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at div
    at div
    at CardContent (http://localhost:5173/components/ui/card.tsx:97:24)
    at div
    at Card (http://localhost:5173/components/ui/card.tsx:18:17)
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at div
    at http://localhost:5173/node_modules/.vite/deps/chunk-GN4BXVVX.js?v=95e6c095:43:13
    at Presence (http://localhost:5173/node_modules/.vite/deps/chunk-NHQZK2WS.js?v=95e6c095:24:11)
    at http://localhost:5173/node_modules/.vite/deps/@radix-ui_react-tabs.js?v=95e6c095:175:13
    at TabsContent (http://localhost:5173/components/ui/tabs.tsx:83:24)
    at div
    at http://localhost:5173/node_modules/.vite/deps/chunk-GN4BXVVX.js?v=95e6c095:43:13
    at Provider (http://localhost:5173/node_modules/.vite/deps/chunk-36WGJFHK.js?v=95e6c095:37:15)
    at http://localhost:5173/node_modules/.vite/deps/@radix-ui_react-tabs.js?v=95e6c095:52:7
    at Tabs (http://localhost:5173/components/ui/tabs.tsx:20:17)
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at div
    at http://localhost:5173/components/ui/EnhancedDashboard.tsx:183:8
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at PageTransition (http://localhost:5173/components/AnimatedContainer.tsx:197:3)
    at Suspense
    at PageRenderer (http://localhost:5173/components/app/PageRenderer.tsx:27:32)
    at div
    at div
    at main
    at div
    at div
    at ProtectedRoute (http://localhost:5173/components/auth/ProtectedRoute.tsx:24:3)
    at http://localhost:5173/App.tsx:31:22
    at NavigationProvider (http://localhost:5173/components/app/NavigationManager.tsx:31:3)
    at _c3
    at SupabaseAuthProvider (http://localhost:5173/contexts/SupabaseAuthContext.tsx:23:40)
    at ErrorBoundary (http://localhost:5173/components/ErrorBoundary.tsx:9:8)
    at AppWithErrorHandling
    at App (at http://localhost:5173/node_modules/.vite/deps/chunk-YQ5BCTVV.js?v=95e6c095:520:37)
[ERROR] Warning: The tag <%s> is unrecognized in this browser. If you meant to render a React component, start its name with an uppercase letter.%s Package 
    at Package
    at div
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at div
    at div
    at CardContent (http://localhost:5173/components/ui/card.tsx:97:24)
    at div
    at Card (http://localhost:5173/components/ui/card.tsx:18:17)
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at div
    at http://localhost:5173/node_modules/.vite/deps/chunk-GN4BXVVX.js?v=95e6c095:43:13
    at Presence (http://localhost:5173/node_modules/.vite/deps/chunk-NHQZK2WS.js?v=95e6c095:24:11)
    at http://localhost:5173/node_modules/.vite/deps/@radix-ui_react-tabs.js?v=95e6c095:175:13
    at TabsContent (http://localhost:5173/components/ui/tabs.tsx:83:24)
    at div
    at http://localhost:5173/node_modules/.vite/deps/chunk-GN4BXVVX.js?v=95e6c095:43:13
    at Provider (http://localhost:5173/node_modules/.vite/deps/chunk-36WGJFHK.js?v=95e6c095:37:15)
    at http://localhost:5173/node_modules/.vite/deps/@radix-ui_react-tabs.js?v=95e6c095:52:7
    at Tabs (http://localhost:5173/components/ui/tabs.tsx:20:17)
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at div
    at http://localhost:5173/components/ui/EnhancedDashboard.tsx:183:8
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at PageTransition (http://localhost:5173/components/AnimatedContainer.tsx:197:3)
    at Suspense
    at PageRenderer (http://localhost:5173/components/app/PageRenderer.tsx:27:32)
    at div
    at div
    at main
    at div
    at div
    at ProtectedRoute (http://localhost:5173/components/auth/ProtectedRoute.tsx:24:3)
    at http://localhost:5173/App.tsx:31:22
    at NavigationProvider (http://localhost:5173/components/app/NavigationManager.tsx:31:3)
    at _c3
    at SupabaseAuthProvider (http://localhost:5173/contexts/SupabaseAuthContext.tsx:23:40)
    at ErrorBoundary (http://localhost:5173/components/ErrorBoundary.tsx:9:8)
    at AppWithErrorHandling
    at App (at http://localhost:5173/node_modules/.vite/deps/chunk-YQ5BCTVV.js?v=95e6c095:520:37)
[ERROR] Warning: <%s /> is using incorrect casing. Use PascalCase for React components, or lowercase for HTML elements.%s FileText 
    at FileText
    at div
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at div
    at div
    at CardContent (http://localhost:5173/components/ui/card.tsx:97:24)
    at div
    at Card (http://localhost:5173/components/ui/card.tsx:18:17)
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at div
    at http://localhost:5173/node_modules/.vite/deps/chunk-GN4BXVVX.js?v=95e6c095:43:13
    at Presence (http://localhost:5173/node_modules/.vite/deps/chunk-NHQZK2WS.js?v=95e6c095:24:11)
    at http://localhost:5173/node_modules/.vite/deps/@radix-ui_react-tabs.js?v=95e6c095:175:13
    at TabsContent (http://localhost:5173/components/ui/tabs.tsx:83:24)
    at div
    at http://localhost:5173/node_modules/.vite/deps/chunk-GN4BXVVX.js?v=95e6c095:43:13
    at Provider (http://localhost:5173/node_modules/.vite/deps/chunk-36WGJFHK.js?v=95e6c095:37:15)
    at http://localhost:5173/node_modules/.vite/deps/@radix-ui_react-tabs.js?v=95e6c095:52:7
    at Tabs (http://localhost:5173/components/ui/tabs.tsx:20:17)
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at div
    at http://localhost:5173/components/ui/EnhancedDashboard.tsx:183:8
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at PageTransition (http://localhost:5173/components/AnimatedContainer.tsx:197:3)
    at Suspense
    at PageRenderer (http://localhost:5173/components/app/PageRenderer.tsx:27:32)
    at div
    at div
    at main
    at div
    at div
    at ProtectedRoute (http://localhost:5173/components/auth/ProtectedRoute.tsx:24:3)
    at http://localhost:5173/App.tsx:31:22
    at NavigationProvider (http://localhost:5173/components/app/NavigationManager.tsx:31:3)
    at _c3
    at SupabaseAuthProvider (http://localhost:5173/contexts/SupabaseAuthContext.tsx:23:40)
    at ErrorBoundary (http://localhost:5173/components/ErrorBoundary.tsx:9:8)
    at AppWithErrorHandling
    at App (at http://localhost:5173/node_modules/.vite/deps/chunk-YQ5BCTVV.js?v=95e6c095:520:37)
[ERROR] Warning: The tag <%s> is unrecognized in this browser. If you meant to render a React component, start its name with an uppercase letter.%s FileText 
    at FileText
    at div
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at div
    at div
    at CardContent (http://localhost:5173/components/ui/card.tsx:97:24)
    at div
    at Card (http://localhost:5173/components/ui/card.tsx:18:17)
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at div
    at http://localhost:5173/node_modules/.vite/deps/chunk-GN4BXVVX.js?v=95e6c095:43:13
    at Presence (http://localhost:5173/node_modules/.vite/deps/chunk-NHQZK2WS.js?v=95e6c095:24:11)
    at http://localhost:5173/node_modules/.vite/deps/@radix-ui_react-tabs.js?v=95e6c095:175:13
    at TabsContent (http://localhost:5173/components/ui/tabs.tsx:83:24)
    at div
    at http://localhost:5173/node_modules/.vite/deps/chunk-GN4BXVVX.js?v=95e6c095:43:13
    at Provider (http://localhost:5173/node_modules/.vite/deps/chunk-36WGJFHK.js?v=95e6c095:37:15)
    at http://localhost:5173/node_modules/.vite/deps/@radix-ui_react-tabs.js?v=95e6c095:52:7
    at Tabs (http://localhost:5173/components/ui/tabs.tsx:20:17)
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at div
    at http://localhost:5173/components/ui/EnhancedDashboard.tsx:183:8
    at div
    at MotionDOMComponent (http://localhost:5173/node_modules/.vite/deps/motion_react.js?v=95e6c095:5368:40)
    at PageTransition (http://localhost:5173/components/AnimatedContainer.tsx:197:3)
    at Suspense
    at PageRenderer (http://localhost:5173/components/app/PageRenderer.tsx:27:32)
    at div
    at div
    at main
    at div
    at div
    at ProtectedRoute (http://localhost:5173/components/auth/ProtectedRoute.tsx:24:3)
    at http://localhost:5173/App.tsx:31:22
    at NavigationProvider (http://localhost:5173/components/app/NavigationManager.tsx:31:3)
    at _c3
    at SupabaseAuthProvider (http://localhost:5173/contexts/SupabaseAuthContext.tsx:23:40)
    at ErrorBoundary (http://localhost:5173/components/ErrorBoundary.tsx:9:8)
    at AppWithErrorHandling
    at App (at http://localhost:5173/node_modules/.vite/deps/chunk-YQ5BCTVV.js?v=95e6c095:520:37)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/1109eaed-83bb-49ab-b4de-6f08a94374f3/62b23f8c-48bd-4905-acc2-1643ba6bca7f
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013
- **Test Name:** Inventory Management and Distribution Tracking
- **Test Code:** [TC013_Inventory_Management_and_Distribution_Tracking.py](./TC013_Inventory_Management_and_Distribution_Tracking.py)
- **Test Error:** 🖱️  Clicked button with index 30: Ekle
Browser Console Logs:
[WARNING] Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key. (at http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=95e6c095:5721:14)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/1109eaed-83bb-49ab-b4de-6f08a94374f3/c637b95f-ef76-4a35-9748-4cd43b53de9a
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC014
- **Test Name:** User Profile Editing and Permissions Management
- **Test Code:** [TC014_User_Profile_Editing_and_Permissions_Management.py](./TC014_User_Profile_Editing_and_Permissions_Management.py)
- **Test Error:** Testing stopped due to critical issue: Unable to add or edit members because the member addition buttons are unresponsive on the 'Üye Yönetimi' page. Profile editing and permission change tests cannot proceed.
Browser Console Logs:
[WARNING] Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key. (at http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=95e6c095:5721:14)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://gyburnfaszhxcxdnwogj.supabase.co/rest/v1/members?select=membership_status%2Cmembership_type%2Ccity%2Cprofession%2Cjoin_date%2Cbirth_date%2Cvolunteer_hours%2Ccontribution_amount%2Cfee_paid:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://gyburnfaszhxcxdnwogj.supabase.co/rest/v1/members?select=membership_status%2Cmembership_type%2Ccity%2Cprofession%2Cjoin_date%2Cbirth_date%2Cvolunteer_hours%2Ccontribution_amount%2Cfee_paid:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/1109eaed-83bb-49ab-b4de-6f08a94374f3/7c4c5a26-2692-44a5-9225-5dff917a0b90
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC015
- **Test Name:** Real-Time Notifications and Messaging Functionality
- **Test Code:** [TC015_Real_Time_Notifications_and_Messaging_Functionality.py](./TC015_Real_Time_Notifications_and_Messaging_Functionality.py)
- **Test Error:** Donation form submission failed repeatedly, preventing triggering of real-time notifications. No notification appeared in Notification Center or badge updates. Internal messaging test not performed due to this blocking issue. Reporting the issue and stopping further testing.
Browser Console Logs:
[WARNING] Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key. (at http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=95e6c095:5721:14)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://gyburnfaszhxcxdnwogj.supabase.co/rest/v1/donations?select=amount%2Cstatus%2Cdonor_type%2Cdonation_type%2Cpayment_method%2Ccreated_at:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://gyburnfaszhxcxdnwogj.supabase.co/rest/v1/donations?select=amount%2Cstatus%2Cdonor_type%2Cdonation_type%2Cpayment_method%2Ccreated_at:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://gyburnfaszhxcxdnwogj.supabase.co/rest/v1/donations?columns=%22donor_name%22%2C%22donor_email%22%2C%22donor_phone%22%2C%22donor_type%22%2C%22amount%22%2C%22currency%22%2C%22donation_type%22%2C%22category%22%2C%22description%22%2C%22payment_method%22%2C%22payment_reference%22%2C%22bank_account%22%2C%22transaction_id%22%2C%22status%22%2C%22allocated_to%22%2C%22beneficiary_id%22%2C%22allocation_percentage%22%2C%22receipt_issued%22%2C%22tax_deductible%22%2C%22campaign_id%22%2C%22source%22%2C%22referral_code%22%2C%22communication_preference%22%2C%22is_recurring%22%2C%22recurring_frequency%22%2C%22recurring_end_date%22%2C%22recurring_amount%22%2C%22notes%22&select=*:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/1109eaed-83bb-49ab-b4de-6f08a94374f3/7ba7d29d-d531-4734-b93e-9f56572aeaaf
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC016
- **Test Name:** Advanced Search and Filter Functionality
- **Test Code:** [TC016_Advanced_Search_and_Filter_Functionality.py](./TC016_Advanced_Search_and_Filter_Functionality.py)
- **Test Error:** Testing stopped due to critical issue: unable to add members as member addition forms do not open. This prevents testing the search system with filters and smart search capabilities. Issue reported for resolution.
Browser Console Logs:
[WARNING] Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key. (at http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=95e6c095:5721:14)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://gyburnfaszhxcxdnwogj.supabase.co/rest/v1/members?select=membership_status%2Cmembership_type%2Ccity%2Cprofession%2Cjoin_date%2Cbirth_date%2Cvolunteer_hours%2Ccontribution_amount%2Cfee_paid:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://gyburnfaszhxcxdnwogj.supabase.co/rest/v1/members?select=membership_status%2Cmembership_type%2Ccity%2Cprofession%2Cjoin_date%2Cbirth_date%2Cvolunteer_hours%2Ccontribution_amount%2Cfee_paid:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/1109eaed-83bb-49ab-b4de-6f08a94374f3/9b6250cf-53a3-4451-a107-d48c31447f6f
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC017
- **Test Name:** Form Validation Using React Hook Form and Zod
- **Test Code:** [TC017_Form_Validation_Using_React_Hook_Form_and_Zod.py](./TC017_Form_Validation_Using_React_Hook_Form_and_Zod.py)
- **Test Error:** Stopped testing due to unresponsive 'Yeni Üye Ekle' button preventing access to member registration form. Validation tests on this form could not be completed.
Browser Console Logs:
[WARNING] Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key. (at http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=95e6c095:5721:14)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://gyburnfaszhxcxdnwogj.supabase.co/rest/v1/members?select=membership_status%2Cmembership_type%2Ccity%2Cprofession%2Cjoin_date%2Cbirth_date%2Cvolunteer_hours%2Ccontribution_amount%2Cfee_paid:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://gyburnfaszhxcxdnwogj.supabase.co/rest/v1/members?select=membership_status%2Cmembership_type%2Ccity%2Cprofession%2Cjoin_date%2Cbirth_date%2Cvolunteer_hours%2Ccontribution_amount%2Cfee_paid:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/1109eaed-83bb-49ab-b4de-6f08a94374f3/2792aef0-901d-4894-9c3b-b1abfae19ec3
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC018
- **Test Name:** PWA Offline Functionality and Background Sync
- **Test Code:** [null](./null)
- **Test Error:** Test execution timed out after 15 minutes
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/1109eaed-83bb-49ab-b4de-6f08a94374f3/cd1b5193-2d88-4c48-a1bd-8dd7ed2974a4
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC019
- **Test Name:** Security: CSRF Protection and Rate Limiting
- **Test Code:** [null](./null)
- **Test Error:** Test execution timed out after 15 minutes
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/1109eaed-83bb-49ab-b4de-6f08a94374f3/75a8396a-e47d-43f6-a50f-09de87823608
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC020
- **Test Name:** Data Export and Import Integrity and Performance
- **Test Code:** [TC020_Data_Export_and_Import_Integrity_and_Performance.py](./TC020_Data_Export_and_Import_Integrity_and_Performance.py)
- **Test Error:** Testing stopped due to unresponsive 'Yeni Üye Ekle' button preventing addition of test data necessary for export/import validation. Issue reported for resolution.
Browser Console Logs:
[WARNING] Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key. (at http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=95e6c095:5721:14)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://gyburnfaszhxcxdnwogj.supabase.co/rest/v1/members?select=membership_status%2Cmembership_type%2Ccity%2Cprofession%2Cjoin_date%2Cbirth_date%2Cvolunteer_hours%2Ccontribution_amount%2Cfee_paid:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://gyburnfaszhxcxdnwogj.supabase.co/rest/v1/members?select=membership_status%2Cmembership_type%2Ccity%2Cprofession%2Cjoin_date%2Cbirth_date%2Cvolunteer_hours%2Ccontribution_amount%2Cfee_paid:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/1109eaed-83bb-49ab-b4de-6f08a94374f3/3a4a9abc-e693-4f56-a7fc-77bc5697b45b
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC021
- **Test Name:** Accessibility Compliance and Responsive UI
- **Test Code:** [TC021_Accessibility_Compliance_and_Responsive_UI.py](./TC021_Accessibility_Compliance_and_Responsive_UI.py)
- **Test Error:** Accessibility and responsiveness testing on the login page is complete. However, login failure prevents further testing on the main dashboard. The issue has been reported. Stopping further actions.
Browser Console Logs:
[WARNING] Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key. (at http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=95e6c095:5721:14)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://gyburnfaszhxcxdnwogj.supabase.co/auth/v1/token?grant_type=password:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/1109eaed-83bb-49ab-b4de-6f08a94374f3/2605a8b0-379e-4370-b998-a7f79c8b46cc
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC022
- **Test Name:** Error Handling and Boundary Testing
- **Test Code:** [TC022_Error_Handling_and_Boundary_Testing.py](./TC022_Error_Handling_and_Boundary_Testing.py)
- **Test Error:** Tested error handling by trying to introduce an error via UI interaction but no error or fallback UI appeared. The application does not seem to handle unexpected errors or log them properly. Stopping the test as per instructions.
Browser Console Logs:
[WARNING] Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key. (at http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=95e6c095:5721:14)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/1109eaed-83bb-49ab-b4de-6f08a94374f3/db4a4351-a381-4594-966d-05bec1e7bac9
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC023
- **Test Name:** Automatic Deployment on Netlify
- **Test Code:** [TC023_Automatic_Deployment_on_Netlify.py](./TC023_Automatic_Deployment_on_Netlify.py)
- **Test Error:** The task to test the CI/CD pipeline triggers and deployment on Netlify could not be completed because repeated Google CAPTCHA challenges blocked access to search resources and prevented pushing code changes to the repository branch linked to Netlify. The login to the system was successful, but no code push was performed, so no build was triggered or deployment verified. Therefore, the environment variables application and deployment success could not be validated. Task incomplete.
Browser Console Logs:
[WARNING] Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key. (at http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=95e6c095:5721:14)
[ERROR] Failed to load resource: the server responded with a status of 429 () (at https://www.google.com/sorry/index?continue=https://www.google.com/search%3Fq%3Dhow%2520to%2520push%2520code%2520change%2520to%2520repository%2520branch%2520linked%2520to%2520Netlify%26udm%3D14%26sei%3D8kzfaMCaH_Tg7_UP3YyY2AY&q=EgROo3aeGPOZ_cYGIjCwp_uJWcyVab0PthzEOUyVTgsi4LhN-Cjd31dI_y06JnU8ddNmDwbdOIgKfzVl1XYyAVJaAUM:0:0)
[WARNING] An iframe which has both allow-scripts and allow-same-origin for its sandbox attribute can escape its sandboxing. (at https://www.google.com/recaptcha/enterprise/anchor?ar=1&k=6LdLLIMbAAAAAIl-KLj9p1ePhM-4LCCDbjtJLqRO&co=aHR0cHM6Ly93d3cuZ29vZ2xlLmNvbTo0NDM.&hl=en&v=Jv8jlA-BQE5JD6rA-h_iqNH2&size=normal&s=FNSbXIP-cpNbeiHgA-J8RsKp7lc9YI1y2xL7hCNR1fffuvH6zjeoeWaRWNjccsikhMt7b1tvzEehThrNJBFVVKaCS5s0UIu6vgo8KsOegafUxw-eTItQRHczMiN2bh2QaKOajVHOmwqY3h_abZecAzCj1MDV5uP3XXaRYnCntWwQEl5TO7JHqvGAfuexy_XC6q16zRJkND1jMFGJdNJP02IsJvu8FDI6HXAcOWPadwo7f3kCQdWR0oQ7BozfMTET_z3Cm7TFYdKBA9ansMiC8-cLQj-4xUo&anchor-ms=20000&execute-ms=15000&cb=1fk436g3dl91:0:0)
[WARNING] An iframe which has both allow-scripts and allow-same-origin for its sandbox attribute can escape its sandboxing. (at https://www.google.com/recaptcha/enterprise/bframe?hl=en&v=Jv8jlA-BQE5JD6rA-h_iqNH2&k=6LdLLIMbAAAAAIl-KLj9p1ePhM-4LCCDbjtJLqRO&bft=0dAFcWeA62meWRArn1DXmzQc9rO5jUCXukymEAjTFKeRtVxe4bPr7lT0q6ZrsoqxOGzKePBvoUKr4joSRxDKdj7_i6R6mSe211Sw:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/1109eaed-83bb-49ab-b4de-6f08a94374f3/92b06fbf-5929-497e-aa39-5b44111873cc
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC024
- **Test Name:** Performance Testing and Optimization Validation
- **Test Code:** [TC024_Performance_Testing_and_Optimization_Validation.py](./TC024_Performance_Testing_and_Optimization_Validation.py)
- **Test Error:** Task cannot proceed due to Google CAPTCHA blocking access to necessary resources for performance audit. Manual intervention is required to run Lighthouse audit directly on the local environment. Stopping all automated actions.
Browser Console Logs:
[WARNING] Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key. (at http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=95e6c095:5721:14)
[ERROR] Failed to load resource: the server responded with a status of 429 () (at https://www.google.com/sorry/index?continue=https://www.google.com/search%3Fq%3Drun%2520lighthouse%2520performance%2520audit%2520on%2520http://localhost:5173/%2520main%2520dashboard%26udm%3D14%26sei%3D6kzfaIP3BJ7-7_UPhaPEuQQ&q=EgROo3aeGOqZ_cYGIjCYeTZiDTL8G_iFoh_TGbFCGFuZh5IALyZuPPa8OBREtQzR85Z_I2qW9KcmHdZ9xa0yAVJaAUM:0:0)
[WARNING] An iframe which has both allow-scripts and allow-same-origin for its sandbox attribute can escape its sandboxing. (at https://www.google.com/recaptcha/enterprise/anchor?ar=1&k=6LdLLIMbAAAAAIl-KLj9p1ePhM-4LCCDbjtJLqRO&co=aHR0cHM6Ly93d3cuZ29vZ2xlLmNvbTo0NDM.&hl=en&v=Jv8jlA-BQE5JD6rA-h_iqNH2&size=normal&s=TW4VWnS6TFUhAK_bGYEKfnf_uKSXzp8eNF59_HtWyo95jGOB53FdPjPj0RcHtUQY9KuWelKuCjflJcFjwgnL_f22gTcEDUkjgm7j5x2Sgm1jLpwfqYpqD9VxmaVgewDi0BxfL1o5VkESwsWiABfy-RFu3qtlMYDasuGbYABGYGnzL71Sm7rCDOUpZGNksxuTzOpZGL6hBI-RzaNEnauC_xgLNewvsmQNDUHiVbuqrBLSeil5GNcqupg8BOVSqaQmeSY8E8UumAwoBgIlbK4iDq3kQCknrrc&anchor-ms=20000&execute-ms=15000&cb=j77axak9js68:0:0)
[WARNING] An iframe which has both allow-scripts and allow-same-origin for its sandbox attribute can escape its sandboxing. (at https://www.google.com/recaptcha/enterprise/bframe?hl=en&v=Jv8jlA-BQE5JD6rA-h_iqNH2&k=6LdLLIMbAAAAAIl-KLj9p1ePhM-4LCCDbjtJLqRO&bft=0dAFcWeA7ju3UOM4vpfkneSbjgWQsUFzzBfR1V351LGOBGOdfAAirP0jS8G9JvceKcj9qDmnQjVuEj9Ds6ubBpLl1AUE2awrHt7g:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/1109eaed-83bb-49ab-b4de-6f08a94374f3/c0ca32fd-d8ca-481b-b5a9-e5156009d00d
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **4.17** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---