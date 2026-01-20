# Testing Checklist for BudgetWise AI
## Pre-Production Testing Guide

### Environment Setup
- [ ] Create `.env` file based on `.env.example`
- [ ] Add valid `EXPO_PUBLIC_GEMINI_API_KEY`
- [ ] Verify API URL is correct for environment
- [ ] Test app starts without errors

---

## 🔐 Authentication Flow

### Login
- [ ] Login with valid credentials succeeds
- [ ] Login with invalid email shows error
- [ ] Login with invalid password shows error  
- [ ] Login with empty fields shows validation error
- [ ] "Forgot Password?" link works
- [ ] "Sign Up" link navigates correctly
- [ ] Session persists after app restart
- [ ] Loading state shows during login

### Signup
- [ ] Signup with valid data creates account
- [ ] Signup with existing email shows error
- [ ] Password confirmation validation works
- [ ] Empty field validation works
- [ ] Auto-login after signup works
- [ ] Navigation to dashboard after signup works
- [ ] "Log In" link works

### Password Reset
- [ ] Forgot password sends reset email
- [ ] Reset password with token works
- [ ] Invalid token shows error
- [ ] Expired token shows error

### Logout
- [ ] Logout clears session
- [ ] Logout redirects to login
- [ ] Session token is removed

---

## 🏠 Dashboard

### Display
- [ ] Dashboard loads without errors
- [ ] Welcome message shows user's name
- [ ] Monthly income displays correctly
- [ ] Savings rate displays correctly
- [ ] Industry insight shows relevant message
- [ ] Profile avatar displays (if set)
- [ ] Profile placeholder shows (if no avatar)

### Actions
- [ ] Menu dropdown opens on avatar click
- [ ] "Edit Profile" navigates correctly
- [ ] "Log Out" works
- [ ] All quick action buttons navigate correctly:
  - [ ] Add transaction
  - [ ] Scan receipt
  - [ ] Budget planner
  - [ ] Analyze

### Recent Transactions
- [ ] Recent transactions load and display
- [ ] Empty state shows when no transactions
- [ ] Loading indicator shows while fetching
- [ ] "View Ledger" link works
- [ ] Transaction icons display correctly
- [ ] Transaction amounts formatted correctly

---

## 💰 Transactions

### Add Transaction Manually
- [ ] Form loads correctly
- [ ] Type toggle (Income/Expense) works
- [ ] Amount input accepts decimals
- [ ] Description input works
- [ ] Category selection works
- [ ] All categories are available
- [ ] Validation prevents empty submission
- [ ] Validation prevents invalid amount
- [ ] Success message shows after save
- [ ] Redirects to dashboard after save
- [ ] New transaction appears in list

### View Transactions
- [ ] Transaction list loads
- [ ] Search functionality works
- [ ] Filter by type works (All/Income/Expense)
- [ ] Transaction details display correctly
- [ ] Empty state shows when no results
- [ ] Back button works

### Delete Transaction
- [ ] Delete button is visible
- [ ] Delete confirmation works
- [ ] Transaction removed from list
- [ ] Error shown if delete fails

---

## 📸 Receipt Scanning

### Camera (Native)
- [ ] Camera permission request works
- [ ] Camera opens on native devices
- [ ] Capture button works
- [ ] Flash/torch controls work (if applicable)
- [ ] Cancel/back button works
- [ ] Photo preview shows after capture

### AI Processing
- [ ] Receipt image uploads successfully
- [ ] AI processing shows loading state
- [ ] Extracted data shows in review modal:
  - [ ] Merchant name
  - [ ] Amount
  - [ ] Category
  - [ ] Date
- [ ] Can edit extracted data
- [ ] Cancel retake works
- [ ] Save adds transaction
- [ ] Error shown if API key missing
- [ ] Error shown if AI processing fails

### Web Upload
- [ ] File picker opens on web
- [ ] Can upload image file
- [ ] Can take photo via webcam
- [ ] Processing works same as native

---

## 📊 Budget Planning

### View Budgets
- [ ] Budget list loads
- [ ] Shows total monthly budget
- [ ] Shows total spent
- [ ] Progress bars display correctly
- [ ] Over-budget items show in red
- [ ] Empty state shows when no budgets

### Create Budget
- [ ] Modal opens on + button
- [ ] All categories selectable
- [ ] Category selection highlights
- [ ] Amount input works
- [ ] Validation prevents empty limit
- [ ] Save creates new budget
- [ ] New budget appears in list
- [ ] Cancel closes modal

### Edit Budget
- [ ] Can select existing budget
- [ ] Pre-fills current values
- [ ] Save updates budget
- [ ] Cancel discards changes

---

## 📈 Financial Analysis

### Display
- [ ] Analysis screen loads
- [ ] Total expenses calculate correctly
- [ ] Category breakdown displays
- [ ] Percentages calculate correctly
- [ ] Categories sorted by spending
- [ ] Progress bars display correctly
- [ ] Colors differentiate categories
- [ ] Empty state shows when no data

---

## 👤 Profile Management

### View Profile
- [ ] Profile screen loads
- [ ] Current data pre-fills form:
  - [ ] Name
  - [ ] Industry
  - [ ] Monthly income
  - [ ] Savings rate
  - [ ] Bio
- [ ] Avatar displays if set
- [ ] Placeholder shows if no avatar

### Edit Profile
- [ ] Can edit all fields
- [ ] Name updates save
- [ ] Industry updates save
- [ ] Income updates save (numeric validation)
- [ ] Savings rate updates save (0-100 validation)
- [ ] Bio updates save
- [ ] Success message shows
- [ ] Returns to previous screen

### Avatar Upload
- [ ] Picker opens on avatar tap
- [ ] Can select from gallery
- [ ] Avatar preview updates immediately
- [ ] Upload shows loading state
- [ ] Success message shows
- [ ] Avatar persists after save
- [ ] Error shown if upload fails

### PWA Install (Web)
- [ ] Install prompt shows on web
- [ ] Install button works (browser-dependent)
- [ ] Prompt dismisses correctly
- [ ] Doesn't show if already installed

---

## 💎 Subscription/Paywall

### Trial Status
- [ ] Trial days remaining calculate correctly
- [ ] Countdown updates daily
- [ ] Paywall shows after trial expires
- [ ] Paywall blocks access to features

### Paywall Modal
- [ ] Modal displays correctly
- [ ] Cannot dismiss during trial expiration
- [ ] Subscribe button shows
- [ ] Restore purchase button shows
- [ ] Subscribe action triggers (currently alerts)
- [ ] Restore action triggers (currently alerts)

---

## 🌐 Cross-Platform Testing

### iOS
- [ ] App installs via TestFlight/Expo Go
- [ ] All features work
- [ ] Camera permissions work
- [ ] Photo library permissions work
- [ ] SafeArea respected (notch/home indicator)
- [ ] Keyboard doesn't cover inputs
- [ ] App doesn't crash
- [ ] Performance is smooth

### Android
- [ ] App installs via APK/Expo Go
- [ ] All features work  
- [ ] Camera permissions work
- [ ] Storage permissions work
- [ ] Back button behavior correct
- [ ] Keyboard doesn't cover inputs
- [ ] App doesn't crash
- [ ] Performance is smooth

### Web
- [ ] App loads in browser
- [ ] All navigation works
- [ ] Receipt upload fallback works
- [ ] LocalStorage persistence works
- [ ] Responsive on mobile viewport
- [ ] Responsive on tablet viewport
- [ ] Responsive on desktop viewport
- [ ] PWA installable

---

## 🔒 Security Testing

### Authentication
- [ ] JWT tokens stored securely
- [ ] Tokens cleared on logout
- [ ] Expired tokens handled correctly
- [ ] Unauthorized access redirects to login

### Data Privacy
- [ ] User data only accessible when authenticated
- [ ] Cannot access other users' data
- [ ] API endpoints require authentication

---

## ⚡ Performance Testing

### Load Times
- [ ] App splash screen shows < 3 seconds
- [ ] Dashboard loads < 2 seconds
- [ ] Transaction list loads < 2 seconds
- [ ] Images load progressively

### Responsiveness
- [ ] No lag when scrolling
- [ ] Buttons respond immediately
- [ ] Animations are smooth (60fps)
- [ ] No memory leaks (test after 5+ minutes)

---

## 🐛 Error Handling

### Network Errors
- [ ] Offline shows appropriate message
- [ ] Timeout shows retry option
- [ ] 500 error shows friendly message
- [ ] 404 error handled gracefully

### User Errors
- [ ] Invalid form data shows validation
- [ ] Missing required fields highlighted
- [ ] Clear error messages shown

### App Errors
- [ ] Error boundary catches crashes
- [ ] Fallback UI shows
- [ ] "Try Again" button works

---

## 📱 Device Testing

### Test on Multiple Devices
- [ ] iPhone 15 Pro (or latest)
- [ ] iPhone SE (small screen)
- [ ] iPad (tablet)
- [ ] Android flagship (Samsung/Pixel)
- [ ] Android budget device
- [ ] Desktop browser (Chrome)
- [ ] Desktop browser (Safari)
- [ ] Desktop browser (Firefox)

---

## 🚀 Pre-Launch Checklist

### Code Quality
- [ ] No console.log in production code
- [ ] No TODO/FIXME in critical paths
- [ ] TypeScript errors fixed
- [ ] ESLint warnings addressed
- [ ] Code formatted consistently

### Environment
- [ ] Production API URL configured
- [ ] API keys secured in .env
- [ ] .env not committed to git
- [ ] Environment variables documented

### Performance
- [ ] App bundle size optimized
- [ ] Images compressed
- [ ] Unused dependencies removed
- [ ] Source maps configured for production

### Analytics & Monitoring
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Analytics configured (if any)
- [ ] Crash reporting enabled

### App Store Preparation
- [ ] App icons all sizes prepared
- [ ] Splash screens configured
- [ ] App screenshots taken
- [ ] Privacy policy uploaded
- [ ] Terms of service uploaded
- [ ] App description written
- [ ] Keywords optimized

---

## ✅ Sign-Off

### Tested By
- Name: _______________
- Date: _______________
- Environment: _______________
- Build Number: _______________

### Issues Found
List any issues discovered:
1. 
2. 
3. 

### Approval
- [ ] All critical tests passed
- [ ] All high-priority tests passed
- [ ] Known issues documented
- [ ] Ready for production release

---

**Notes:** 
- Mark items not applicable with N/A
- Document any blocked tests and why
- Include device/OS versions tested
- Note any workarounds needed
