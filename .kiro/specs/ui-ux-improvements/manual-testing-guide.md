# Manual Testing Guide for UI/UX Improvements

## Purpose

This guide provides step-by-step instructions for manually testing all UI/UX improvements across the application. Use this guide to verify implementation quality before production deployment.

---

## Testing Environment Setup

### Required Tools
- **Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Devices**: iPhone (iOS), Android phone, iPad, Desktop
- **Screen Readers**: VoiceOver (Mac), NVDA (Windows)
- **DevTools**: Browser developer tools, Lighthouse extension
- **Measurement Tools**: Ruler extension for measuring touch targets

### Test Data
- Use staging environment with realistic test data
- Create test accounts with different permission levels
- Prepare test files for upload (documents, images)
- Have Turkish locale configured in browser

---

## Test Scenario 1: Design Token Compliance

### Objective
Verify all components use semantic design tokens instead of hardcoded colors.

### Steps

1. **Open Browser DevTools**
   - Navigate to any page (e.g., Dashboard)
   - Open DevTools (F12)
   - Go to Elements tab

2. **Inspect Button Components**
   - Right-click any button → Inspect
   - Check computed styles
   - **Expected**: Colors use CSS variables like `hsl(var(--primary-500))`
   - **Not Expected**: Hardcoded values like `#3b82f6` or `rgb(59, 130, 246)`

3. **Inspect Card Components**
   - Inspect any card on the page
   - Check border colors
   - **Expected**: `border-color: hsl(var(--neutral-200))`
   - **Not Expected**: `border-color: #e5e7eb`

4. **Inspect Text Elements**
   - Inspect headings and body text
   - Check font sizes
   - **Expected**: Font sizes like `1rem`, `1.5rem` (from typography tokens)
   - **Not Expected**: Arbitrary sizes like `17px`, `23px`

5. **Check Status Indicators**
   - Find success/error/warning badges
   - Inspect background colors
   - **Expected**: `bg-success-500`, `bg-error-500`, `bg-warning-500`
   - **Not Expected**: `bg-green-500`, `bg-red-500`, `bg-yellow-500`

### Pass Criteria
- ✅ All colors use semantic tokens (primary, success, error, warning, info, neutral)
- ✅ All font sizes use typography scale
- ✅ All spacing uses 8px grid system
- ✅ No hardcoded color values in computed styles

---

## Test Scenario 2: Mobile Responsiveness

### Objective
Verify application is fully functional and usable on mobile devices.

### Steps

1. **Test Responsive Table (Beneficiaries Page)**
   - Navigate to `/beneficiaries`
   - Resize browser to 375px width (iPhone SE)
   - **Expected**: Table transforms to card layout
   - **Expected**: Cards show key information prominently
   - **Expected**: Action buttons are easily tappable
   - **Expected**: No horizontal scrolling required

2. **Test Touch Targets**
   - On mobile view, try tapping all buttons
   - Use ruler extension to measure button sizes
   - **Expected**: All buttons are at least 44px × 44px
   - **Expected**: Buttons don't overlap
   - **Expected**: Easy to tap without mistakes

3. **Test Form on Mobile (Beneficiary Form)**
   - Navigate to beneficiary creation form
   - Resize to mobile viewport
   - **Expected**: Form fields stack vertically
   - **Expected**: Labels are readable
   - **Expected**: Input fields are easy to tap
   - **Expected**: Keyboard doesn't obscure fields
   - **Expected**: Error messages display clearly

4. **Test Navigation on Mobile**
   - Open mobile menu
   - **Expected**: Menu is accessible
   - **Expected**: Menu items are tappable
   - **Expected**: Menu closes when item selected
   - **Expected**: Back button works correctly

5. **Test Different Breakpoints**
   - Test at 375px (iPhone SE)
   - Test at 768px (iPad)
   - Test at 1280px (Desktop)
   - **Expected**: Layout adapts smoothly at each breakpoint
   - **Expected**: No broken layouts or overlapping elements

### Pass Criteria
- ✅ All pages usable on 375px viewport
- ✅ Tables transform to cards on mobile
- ✅ Touch targets meet 44px minimum
- ✅ No horizontal scrolling
- ✅ Forms are mobile-friendly

---

## Test Scenario 3: Keyboard Navigation & Accessibility

### Objective
Verify application is fully accessible via keyboard and screen readers.

### Steps

1. **Test Keyboard Navigation**
   - Navigate to Dashboard
   - **Do not use mouse** - only keyboard
   - Press Tab repeatedly
   - **Expected**: All interactive elements are reachable
   - **Expected**: Tab order is logical (top-to-bottom, left-to-right)
   - **Expected**: Focus indicators are clearly visible (2px outline)
   - **Expected**: Enter/Space activates buttons
   - **Expected**: Escape closes modals

2. **Test Focus Indicators**
   - Tab through the page
   - Observe focus ring on each element
   - **Expected**: 2px outline with primary color
   - **Expected**: Sufficient contrast (visible on all backgrounds)
   - **Expected**: Focus ring appears only on keyboard focus (not mouse click)

3. **Test Skip Links**
   - Refresh page
   - Press Tab once
   - **Expected**: Skip links appear at top of page
   - **Expected**: Links say "Skip to main content", "Skip to navigation"
   - Press Enter on skip link
   - **Expected**: Focus jumps to main content area

4. **Test Form Accessibility**
   - Navigate to any form
   - Tab through form fields
   - **Expected**: Each field has visible label
   - **Expected**: Error messages are announced
   - **Expected**: Required fields are indicated
   - Submit form with errors
   - **Expected**: Focus moves to first error
   - **Expected**: Error message is read by screen reader

5. **Test Screen Reader (VoiceOver/NVDA)**
   - Enable screen reader
   - Navigate through Dashboard
   - **Expected**: Page title is announced
   - **Expected**: Headings are announced with level ("Heading level 1")
   - **Expected**: Button labels are descriptive
   - **Expected**: Form labels are read correctly
   - **Expected**: Status changes are announced
   - Navigate to table
   - **Expected**: Table structure is announced
   - **Expected**: Column headers are read

6. **Test Color Contrast**
   - Run Lighthouse accessibility audit
   - **Expected**: Score ≥ 95
   - **Expected**: No color contrast issues
   - Manually check text on colored backgrounds
   - **Expected**: All text is easily readable

### Pass Criteria
- ✅ All interactive elements keyboard accessible
- ✅ Focus indicators clearly visible
- ✅ Skip links work correctly
- ✅ Screen reader can navigate application
- ✅ Lighthouse accessibility score ≥ 95
- ✅ Color contrast meets WCAG AA (4.5:1)

---

## Test Scenario 4: Form Validation & Error Handling

### Objective
Verify form validation provides clear, helpful feedback to users.

### Steps

1. **Test Inline Validation**
   - Navigate to Beneficiary Form
   - Fill out email field with invalid email (e.g., "test")
   - Tab to next field
   - **Expected**: Error appears inline below field
   - **Expected**: Error icon (red X) appears in input
   - **Expected**: Border turns red
   - **Expected**: Error message is descriptive ("Please enter a valid email")

2. **Test Auto-Scroll to First Error**
   - Fill out long form partially (leave required fields empty)
   - Scroll to bottom of form
   - Click Submit button
   - **Expected**: Page scrolls smoothly to first error
   - **Expected**: First error field is centered in viewport
   - **Expected**: Focus moves to error field

3. **Test Form State Recovery**
   - Start filling out Beneficiary Form
   - Fill out several fields (name, email, phone)
   - Wait 30 seconds (or trigger auto-save manually)
   - Refresh the page
   - **Expected**: Form data is restored
   - **Expected**: All filled fields show previous values
   - **Expected**: Notification shows "Form data recovered"
   - Complete and submit form
   - Refresh page
   - **Expected**: Form is empty (recovery data cleared)

4. **Test Validation States**
   - Test required field validation
     - Leave field empty, submit
     - **Expected**: "This field is required" error
   - Test format validation
     - Enter invalid email: "test@"
     - **Expected**: "Please enter a valid email" error
   - Test async validation (if available)
     - Enter username
     - **Expected**: Loading spinner appears
     - **Expected**: Success checkmark or error appears after validation
   - Test cross-field validation
     - Set end date before start date
     - **Expected**: "End date must be after start date" error

5. **Test Helper Text**
   - Observe helper text below fields
   - **Expected**: Helper text shows format requirements
   - **Expected**: Helper text uses muted color (not error color)
   - **Expected**: Helper text is helpful (e.g., "Format: DD.MM.YYYY")

### Pass Criteria
- ✅ Inline errors display immediately
- ✅ Auto-scroll to first error works
- ✅ Form state recovery saves every 30 seconds
- ✅ All validation states visually distinct
- ✅ Helper text displays format requirements
- ✅ Error messages are clear and actionable

---

## Test Scenario 5: Turkish Locale Date Formatting

### Objective
Verify all dates display in Turkish format and locale.

### Steps

1. **Test Date Format**
   - Navigate to Donations page
   - Observe date column in table
   - **Expected**: Dates display as DD.MM.YYYY (e.g., "15.01.2024")
   - **Not Expected**: MM/DD/YYYY or YYYY-MM-DD format

2. **Test Time Format**
   - Navigate to Recent Activity
   - Observe timestamps
   - **Expected**: Times display as HH:mm (e.g., "14:30")
   - **Expected**: 24-hour format (not 12-hour with AM/PM)

3. **Test Relative Time**
   - Navigate to Recent Activity
   - Observe relative timestamps
   - **Expected**: Shows "2 saat önce" (2 hours ago)
   - **Expected**: Shows "3 gün önce" (3 days ago)
   - **Expected**: Shows "az önce" (just now) for recent items
   - Wait 1 minute
   - **Expected**: Time updates automatically ("az önce" → "1 dakika önce")

4. **Test Date Picker**
   - Open any form with date picker
   - Click on date field
   - **Expected**: Calendar opens
   - **Expected**: Month names in Turkish (Ocak, Şubat, Mart, etc.)
   - **Expected**: Day names in Turkish (Pzt, Sal, Çar, Per, Cum, Cmt, Paz)
   - Select a date
   - **Expected**: Date displays as DD.MM.YYYY

5. **Test Date Range Validation**
   - Open Export Modal or any form with date range
   - Set end date before start date
   - **Expected**: Error message in Turkish
   - **Expected**: "Başlangıç tarihi bitiş tarihinden sonra olamaz"
   - Set valid date range
   - **Expected**: No error, form submits successfully

### Pass Criteria
- ✅ All dates in Turkish format (DD.MM.YYYY)
- ✅ All times in 24-hour format (HH:mm)
- ✅ Relative time in Turkish and auto-updates
- ✅ Date pickers show Turkish month/day names
- ✅ Date range validation works correctly

---

## Test Scenario 6: Icon Consistency & Status Indicators

### Objective
Verify all icons are consistent and status indicators use icon + color + text.

### Steps

1. **Test Action Button Icons**
   - Navigate to Beneficiaries page
   - Observe action buttons (Edit, Delete, View)
   - **Expected**: Edit button uses Pencil icon (not Edit, Edit2, or Edit3)
   - **Expected**: Delete button uses Trash2 icon (not Trash)
   - **Expected**: View button uses Eye icon
   - Navigate to Donations page
   - **Expected**: Same icons used consistently
   - Navigate to Aid Requests page
   - **Expected**: Same icons used consistently

2. **Test Status Badges**
   - Navigate to Donations page
   - Observe status badges (Approved, Pending, Rejected)
   - **Expected**: Approved shows green background + CheckCircle2 icon + "Onaylandı" text
   - **Expected**: Rejected shows red background + XCircle icon + "Reddedildi" text
   - **Expected**: Pending shows gray background + Clock icon + "Beklemede" text
   - **Expected**: Status conveyed through icon + color + text (not color alone)

3. **Test Icon Tooltips**
   - Hover over icon-only buttons
   - **Expected**: Tooltip appears with descriptive text
   - **Expected**: Tooltip says "Edit", "Delete", "View" (not just icon)
   - Tab to icon-only button (keyboard navigation)
   - **Expected**: Tooltip appears on focus
   - **Expected**: Tooltip doesn't block interaction

4. **Test Success/Error/Warning Icons**
   - Trigger success toast (e.g., save data)
   - **Expected**: Green background + CheckCircle2 icon
   - Trigger error toast (e.g., validation error)
   - **Expected**: Red background + XCircle icon
   - Trigger warning toast
   - **Expected**: Yellow background + AlertTriangle icon
   - Trigger info toast
   - **Expected**: Blue background + Info icon

5. **Test Priority Badges (Aid Page)**
   - Navigate to Aid Requests page
   - Observe priority badges
   - **Expected**: High priority shows red with appropriate icon
   - **Expected**: Medium priority shows yellow with appropriate icon
   - **Expected**: Low priority shows blue with appropriate icon

### Pass Criteria
- ✅ All edit actions use Pencil icon
- ✅ All delete actions use Trash2 icon
- ✅ All view actions use Eye icon
- ✅ All status badges use StatusBadge component
- ✅ Status conveyed through icon + color + text
- ✅ All icon-only buttons have tooltips

---

## Test Scenario 7: Typography Hierarchy

### Objective
Verify proper semantic heading structure and typography usage.

### Steps

1. **Test Heading Hierarchy**
   - Navigate to Dashboard
   - Open browser console
   - Run this script:
     ```javascript
     const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
     const hierarchy = Array.from(headings).map(h => ({
       level: h.tagName,
       text: h.textContent?.trim().substring(0, 50)
     }));
     console.table(hierarchy);
     ```
   - **Expected**: Exactly one H1 (page title)
   - **Expected**: H2 for major sections
   - **Expected**: H3 for subsections
   - **Expected**: No skipped levels (e.g., H1 → H3)
   - Repeat for other pages (Beneficiaries, Donations, Aid)

2. **Test Visual Hierarchy**
   - Observe page layout
   - **Expected**: H1 is largest and most prominent
   - **Expected**: H2 is smaller than H1 but larger than H3
   - **Expected**: Body text is clearly distinguishable from headings
   - **Expected**: Important information (numbers, totals) is visually emphasized

3. **Test Card Typography**
   - Observe cards on Dashboard
   - **Expected**: Card titles use appropriate heading level (H3 or H4)
   - **Expected**: Card descriptions use muted color
   - **Expected**: Large numbers use bold weight and tabular-nums
   - **Expected**: Secondary info uses smaller, muted text

4. **Test Text Component Usage**
   - Inspect body text elements
   - **Expected**: Uses Text component (not raw <p> or <span>)
   - **Expected**: Proper variant (body, caption, label)
   - **Expected**: Semantic colors (neutral, muted, etc.)

5. **Test Important Information Positioning**
   - Observe card layouts
   - **Expected**: Most important info positioned top-left (LTR)
   - **Expected**: Primary value/number is prominent
   - **Expected**: Secondary info below or to the right
   - **Expected**: Actions at bottom or right

### Pass Criteria
- ✅ Each page has exactly one H1
- ✅ Heading hierarchy is semantic
- ✅ All headings use Heading component
- ✅ All text uses Text component
- ✅ Important information visually emphasized
- ✅ Card layouts follow top-left prominence

---

## Test Scenario 8: Loading States, Toasts & Empty States

### Objective
Verify consistent feedback mechanisms across the application.

### Steps

1. **Test Loading States**
   - Navigate to Beneficiaries page
   - Refresh page and observe loading
   - **Expected**: Skeleton loaders appear
   - **Expected**: Skeleton has shimmer animation
   - **Expected**: Skeleton matches final content layout
   - Click on a beneficiary to view details
   - **Expected**: Loading spinner appears while fetching
   - **Expected**: Spinner uses design system colors

2. **Test Toast Notifications**
   - Perform action that triggers success (e.g., save data)
   - **Expected**: Green toast with CheckCircle2 icon
   - **Expected**: Toast says "Data saved successfully"
   - **Expected**: Toast auto-dismisses after 4 seconds
   - Perform action that triggers error (e.g., invalid data)
   - **Expected**: Red toast with XCircle icon
   - **Expected**: Toast says "Failed to save data"
   - **Expected**: Toast has "Retry" button
   - Click "Retry" button
   - **Expected**: Action is retried

3. **Test Toast Action Buttons**
   - Delete an item
   - **Expected**: Toast appears with "Undo" button
   - **Expected**: Countdown timer shows (e.g., "Undo (5s)")
   - Click "Undo" before timeout
   - **Expected**: Deletion is reversed
   - **Expected**: Toast closes
   - Delete another item and wait for timeout
   - **Expected**: Deletion is permanent
   - **Expected**: Toast auto-dismisses

4. **Test Empty States**
   - Navigate to page with no data (or clear all filters)
   - **Expected**: Empty state appears
   - **Expected**: Appropriate icon (SearchX for no results)
   - **Expected**: Helpful title ("No results found")
   - **Expected**: Descriptive text ("Try adjusting your search criteria")
   - **Expected**: Action button ("Clear filters")
   - Click action button
   - **Expected**: Filters are cleared
   - **Expected**: Data appears (if available)

5. **Test LoadingButton**
   - Navigate to form with LoadingButton
   - Click submit button
   - **Expected**: Button shows loading spinner
   - **Expected**: Button is disabled during loading
   - On success:
     - **Expected**: Button shows green checkmark
     - **Expected**: Button text changes to "Saved!"
     - **Expected**: Button returns to idle after 2 seconds
   - On error:
     - **Expected**: Button shows red X
     - **Expected**: Button shakes
     - **Expected**: Button text changes to "Failed"
     - **Expected**: Button returns to idle after 2 seconds

6. **Test Animations**
   - Observe all animations
   - **Expected**: Animations are smooth (no jank)
   - **Expected**: Success checkmark animates in
   - **Expected**: Error shake is noticeable but not jarring
   - **Expected**: Toast slides in from top/bottom
   - Enable "Reduce motion" in OS settings
   - **Expected**: Animations are disabled or minimal

### Pass Criteria
- ✅ Loading states use skeletonVariants
- ✅ Toasts show semantic colors + icons
- ✅ Toast action buttons work (Undo, Retry)
- ✅ Empty states provide helpful guidance
- ✅ LoadingButton state transitions work
- ✅ Animations are smooth and accessible

---

## Test Scenario 9: Cross-Browser Testing

### Objective
Verify application works consistently across different browsers.

### Steps

1. **Test on Chrome**
   - Run all above test scenarios
   - **Expected**: All features work correctly
   - **Expected**: No console errors
   - **Expected**: Styles render correctly

2. **Test on Firefox**
   - Run all above test scenarios
   - **Expected**: All features work correctly
   - **Expected**: Focus indicators visible
   - **Expected**: Animations work smoothly

3. **Test on Safari**
   - Run all above test scenarios
   - **Expected**: All features work correctly
   - **Expected**: Date pickers work correctly
   - **Expected**: Touch events work on trackpad

4. **Test on Edge**
   - Run all above test scenarios
   - **Expected**: All features work correctly
   - **Expected**: No compatibility issues

5. **Test on Mobile Safari (iOS)**
   - Test on actual iPhone device
   - **Expected**: Touch targets are tappable
   - **Expected**: Keyboard doesn't obscure inputs
   - **Expected**: Scrolling is smooth
   - **Expected**: Gestures work correctly

6. **Test on Mobile Chrome (Android)**
   - Test on actual Android device
   - **Expected**: Touch targets are tappable
   - **Expected**: Keyboard behavior is correct
   - **Expected**: Back button works
   - **Expected**: No layout issues

### Pass Criteria
- ✅ Works on Chrome (latest)
- ✅ Works on Firefox (latest)
- ✅ Works on Safari (latest)
- ✅ Works on Edge (latest)
- ✅ Works on mobile Safari (iOS)
- ✅ Works on mobile Chrome (Android)

---

## Test Scenario 10: Performance & User Experience

### Objective
Verify application performs well and provides good user experience.

### Steps

1. **Test Page Load Performance**
   - Navigate to Dashboard
   - Open DevTools Network tab
   - Refresh page
   - **Expected**: Page loads in < 3 seconds
   - **Expected**: No layout shifts (CLS < 0.1)
   - **Expected**: Interactive in < 3 seconds (FID < 100ms)

2. **Test Lighthouse Scores**
   - Open Lighthouse in DevTools
   - Run audit on Dashboard
   - **Expected**: Performance ≥ 90
   - **Expected**: Accessibility ≥ 95
   - **Expected**: Best Practices ≥ 90
   - **Expected**: SEO ≥ 90

3. **Test Smooth Interactions**
   - Click buttons, open modals, navigate pages
   - **Expected**: All interactions feel instant
   - **Expected**: No lag or delay
   - **Expected**: Animations are smooth (60fps)
   - **Expected**: No janky scrolling

4. **Test Error Recovery**
   - Disconnect internet
   - Try to submit form
   - **Expected**: Offline indicator appears
   - **Expected**: Error message is helpful
   - **Expected**: Data is not lost
   - Reconnect internet
   - **Expected**: Form can be resubmitted

5. **Test User Feedback**
   - Perform various actions
   - **Expected**: Every action has feedback (toast, loading, etc.)
   - **Expected**: User is never left wondering "did that work?"
   - **Expected**: Error messages are actionable
   - **Expected**: Success messages are encouraging

### Pass Criteria
- ✅ Page loads in < 3 seconds
- ✅ Lighthouse performance ≥ 90
- ✅ All interactions feel instant
- ✅ Error recovery works correctly
- ✅ User feedback is consistent

---

## Bug Reporting Template

If you find issues during testing, report them using this template:

**Title**: [Component/Page] Brief description

**Severity**: Critical / High / Medium / Low

**Phase**: Design Tokens / Mobile / Accessibility / Forms / Dates / Icons / Typography / Loading

**Steps to Reproduce**:
1. Navigate to...
2. Click on...
3. Observe...

**Expected Behavior**:
Describe what should happen

**Actual Behavior**:
Describe what actually happens

**Screenshots**:
Attach screenshots or screen recordings

**Environment**:
- Browser: Chrome 120
- OS: macOS 14
- Device: Desktop / iPhone 14
- Viewport: 1280x720

**Additional Context**:
Any other relevant information

---

## Testing Checklist Summary

Use this checklist to track testing progress:

- [ ] Design Token Compliance
- [ ] Mobile Responsiveness (375px, 768px, 1280px)
- [ ] Keyboard Navigation
- [ ] Focus Indicators
- [ ] ARIA Labels & Screen Reader
- [ ] Color Contrast
- [ ] Form Validation (Inline, Auto-scroll, Recovery)
- [ ] Turkish Date Formatting
- [ ] Date Picker Locale
- [ ] Icon Consistency
- [ ] Status Badges
- [ ] Icon Tooltips
- [ ] Heading Hierarchy
- [ ] Typography Components
- [ ] Loading States
- [ ] Toast Notifications
- [ ] Empty States
- [ ] LoadingButton States
- [ ] Cross-Browser (Chrome, Firefox, Safari, Edge)
- [ ] Mobile Devices (iOS, Android)
- [ ] Performance (Lighthouse)
- [ ] User Experience

---

## Sign-Off

**Tester Name**: _________________

**Date**: _________________

**Overall Status**: ☐ Pass  ☐ Pass with Minor Issues  ☐ Fail

**Notes**:

---

**Next Steps After Testing**:
1. Document all issues found
2. Prioritize issues (Critical → Low)
3. Create tickets for fixes
4. Retest after fixes
5. Get stakeholder approval
6. Deploy to production

