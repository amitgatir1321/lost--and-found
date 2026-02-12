# ⚡ Configuration Quick Reference

Fast lookup for common configuration tasks.

---

## 🔑 Environment Variables

### Create `.env` File in Project Root

```bash
# REQUIRED - Firebase Configuration
REACT_APP_FIREBASE_API_KEY=AIzaSyD_xxxxx
REACT_APP_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:xxxxx

# CRITICAL - Admin Email (Change this!)
REACT_APP_ADMIN_EMAIL=admin@lostfound.com

# OPTIONAL
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXX
```

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Start dev server (port 3000)
npm start

# Create production build
npm run build

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy to Firebase Hosting
firebase deploy

# Check Firebase status
firebase status
```

---

## 📋 Firebase Console Checklist

- [ ] Project created
- [ ] Authentication → Email/Password enabled
- [ ] Authentication → Google OAuth enabled (optional)
- [ ] Firestore Database created
- [ ] Cloud Storage enabled
- [ ] Admin user created (uid: _____________)
- [ ] Admin email verified
- [ ] Firestore rules deployed
- [ ] Storage rules updated
- [ ] Email templates customized

---

## 👨‍💼 Admin Account Setup

### Step 1: Firebase Console
```
Firebase Console
  → Authentication
  → Users
  → Create user
    - Email: admin@lostfound.com
    - Password: [strong password]
  → Copy UID: ________________
```

### Step 2: Firestore Document
```
Firestore Database
  → users collection (create if needed)
  → New document
    - Document ID: [paste UID from above]
    - Fields:
      {
        "uid": "[UID from Firebase Auth]",
        "email": "admin@lostfound.com",
        "name": "Administrator",
        "role": "admin",
        "createdAt": timestamp
      }
```

### Step 3: Verify Email
```
Firebase Console
  → Authentication
  → Users
  → Click admin user
  → Send verification email
  → Go to email inbox
  → Click verification link
  → Status: "Email verified" ✓
```

---

## 🗺️ Route Map

| Path | Type | Protection | Purpose |
|------|------|-----------|---------|
| `/` | Public | None | Home page |
| `/login` | Public | None | User login |
| `/register` | Public | None | User registration |
| `/admin-login` | Public | None | Admin login |
| `/profile` | Protected | PrivateRoute | User profile |
| `/report-lost` | Protected | Email verified | Report lost item |
| `/report-found` | Protected | Email verified | Report found item |
| `/admin` | Protected | AdminRoute | Admin dashboard |

---

## 🔐 Role Permissions Matrix

|Action|User|Admin|Unauthenticated|
|------|:--:|:---:|:---:|
|View lost items|✅|✅|✅|
|Create lost item|✅|✅|❌|
|Edit own lost item|✅|✅|❌|
|Edit other's item|❌|✅|❌|
|Delete own item|✅|✅|❌|
|Delete other's item|❌|✅|❌|
|Create found item|❌|✅|❌|
|Manage claims|❌|✅|❌|
|Access /admin|❌|✅|❌|

---

## 📝 Firestore Collections Schema

### users/
```json
{
  "uid": "string",
  "email": "string",
  "name": "string",
  "role": "user|admin",
  "createdAt": "timestamp"
}
```

### lost_items/
```json
{
  "userId": "string",
  "itemName": "string",
  "category": "string",
  "description": "string",
  "location": "string",
  "date": "timestamp",
  "imageUrl": "string",
  "status": "pending|matched|resolved",
  "createdAt": "timestamp"
}
```

### found_items/
```json
{
  "userId": "string",
  "itemName": "string",
  "category": "string",
  "description": "string",
  "location": "string",
  "date": "timestamp",
  "imageUrl": "string",
  "status": "available|claimed",
  "createdAt": "timestamp"
}
```

### claims/
```json
{
  "lostItemId": "string",
  "foundItemId": "string",
  "claimantId": "string",
  "itemOwnerId": "string",
  "status": "pending|approved|rejected",
  "createdAt": "timestamp"
}
```

---

## 🧪 Test Account Credentials

### Test User
```
Email: testuser@example.com
Password: TestPassword123
Role: user
```

### Test Admin
```
Email: admin@lostfound.com
Password: [Your admin password]
Role: admin
```

---

## 🔧 React Component Usage

### Using useAuth Hook
```javascript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const {
    currentUser,      // Firebase user | null
    userRole,         // "user" | "admin" | null
    isAdmin,          // boolean
    emailVerified,    // boolean
    signup,           // async function
    login,            // async function
    logout,           // async function
    signInWithGoogle  // async function
  } = useAuth();

  return (
    <>
      {currentUser ? (
        <p>Welcome, {currentUser.email}</p>
      ) : (
        <p>Please login</p>
      )}
      
      {isAdmin && <AdminPanel />}
    </>
  );
}
```

### Using PrivateRoute
```javascript
<Route
  path="/profile"
  element={
    <PrivateRoute>
      <Profile />
    </PrivateRoute>
  }
/>
```

### Using AdminRoute
```javascript
<Route
  path="/admin"
  element={
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  }
/>
```

---

## 🚨 Common Errors & Solutions

### "Firebase app not initialized"
```bash
# Check .env file exists with all vars
# Restart dev server: npm start
```

### "Permission denied" in Firestore
```bash
# Deploy rules: firebase deploy --only firestore:rules
# Check rule simulator in Firebase Console
```

### "User not found" error
```bash
# Verify user exists in Firebase Auth
# Check email matches exactly
```

### "Email not verified" error
```bash
# Check inbox for verification email
# Check spam folder
# Resend from Firebase Console
```

### "Admin cannot access dashboard"
```bash
# Verify REACT_APP_ADMIN_EMAIL matches user email
# Check Firestore has admin document with role: "admin"
# Verify email is verified
```

---

## 📱 Endpoints & Status Codes

### Authentication Responses
```
Success: User object with { uid, email, ... }
Error: { code: "auth/...", message: "..." }

Common Codes:
- auth/user-not-found
- auth/wrong-password
- auth/email-already-in-use
- auth/weak-password
```

---

## 🔒 Security Checklist

**Before Production:**
- [ ] .env file in .gitignore
- [ ] Firestore rules deployed
- [ ] Email verification enabled
- [ ] Admin email configured
- [ ] HTTPS enforced
- [ ] Cloud Storage rules set
- [ ] No hardcoded API keys
- [ ] No admin email in frontend code
- [ ] Rate limiting considered
- [ ] Error messages don't expose info

---

## 📞 Firebase CLI Commands

```bash
# Login to Firebase
firebase login

# Initialize project
firebase init

# Deploy specific service
firebase deploy --only firestore:rules
firebase deploy --only storage
firebase deploy --only hosting

# View logs
firebase functions:log

# Emulator
firebase emulators:start
```

---

## 🔗 Important Links

- **Firebase Console:** https://console.firebase.google.com
- **Firestore Documentation:** https://firebase.google.com/docs/firestore
- **Firebase Auth Docs:** https://firebase.google.com/docs/auth
- **React Firebase Hooks:** https://github.com/CSFrequency/react-firebase-hooks
- **Material-UI Docs:** https://mui.com

---

## 💾 Database Backup

```bash
# Enable automatic backups in Firebase Console
Firestore → Backups → Create on-demand backup

# Or via CLI
firebase firestore:backups:list
```

---

## 📊 Monitoring

**Check in Firebase Console:**
- Authentication → Sign-in methods & users
- Firestore → Database usage
- Storage → Files and usage
- Hosting → Analytics
- Functions → Logs

---

## 🎯 Key Files

| File | Purpose |
|------|---------|
| `src/contexts/AuthContext.js` | Auth logic & state management |
| `src/pages/AdminLogin.js` | Admin login UI |
| `src/App.js` | Routing configuration |
| `firestore.rules` | Security rules |
| `.env` | Environment configuration |
| `firebase.json` | Firebase project config |

---

## 📚 Reference Documents

- **FIRESTORE_SCHEMA.md** - Database schema details
- **AUTHENTICATION_GUIDE.md** - Full auth documentation
- **SETUP_GUIDE.md** - Complete setup instructions
- **README_AUTHENTICATION.md** - Implementation summary

---

**Last Updated:** January 30, 2026  
**Quick Reference Version:** 1.0
