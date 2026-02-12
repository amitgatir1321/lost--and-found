# 🚀 Setup & Configuration Guide

Step-by-step instructions to properly configure the Lost & Found application.

---

## 📋 Prerequisites

- Node.js (v16+)
- Firebase project (free tier available)
- npm or yarn
- Git
- Text editor (VS Code recommended)

---

## 🔧 Step 1: Environment Configuration

### Create .env file

In the root directory, create a `.env` file with your Firebase credentials:

```bash
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=AIzaSyD...your_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=lostfound-12345.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=lostfound-12345
REACT_APP_FIREBASE_STORAGE_BUCKET=lostfound-12345.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Admin Email (CRITICAL!)
REACT_APP_ADMIN_EMAIL=admin@lostfound.com
```

### Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click Settings (gear icon) → Project Settings
4. Go to "Your apps" section
5. Select your web app
6. Copy the configuration object
7. Paste values into `.env`

### Important: Admin Email

**Choose your admin email carefully!**

```bash
# Example 1: Your personal email
REACT_APP_ADMIN_EMAIL=yourname@gmail.com

# Example 2: Organization email
REACT_APP_ADMIN_EMAIL=admin@lostfound.com

# Example 3: Support email
REACT_APP_ADMIN_EMAIL=support@company.com
```

Only this email can access the admin dashboard!

---

## 🔐 Step 2: Firebase Authentication Setup

### Enable Email/Password Authentication

1. Go to Firebase Console → Authentication
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable **Email/Password**
5. Enable **Email link (passwordless sign-in)** (optional)

### Enable Google OAuth (Optional but Recommended)

1. In Authentication → Sign-in method
2. Click Google
3. Enable it
4. Add your domain to authorized redirect URIs

### Configure Email Templates

1. Authentication → Email Templates
2. Customize:
   - Email verification
   - Password reset
   - Email change confirmation

---

## 👨‍💼 Step 3: Create Admin Account

### Create Admin User in Firebase Auth

1. Go to Firebase Console → Authentication → Users
2. Click "Create user"
3. Enter:
   - **Email:** `admin@lostfound.com` (or your chosen admin email)
   - **Password:** Generate a strong password
4. Click "Create user"
5. **Important:** Copy the new user's UID (you'll need it)

### Create Admin Document in Firestore

1. Go to Firestore Database
2. Create collection: `users`
3. Create new document with ID = **admin's UID** (from previous step)
4. Add these fields:

```json
{
  "uid": "paste_admin_uid_here",
  "email": "admin@lostfound.com",
  "name": "Administrator",
  "role": "admin",
  "createdAt": Timestamp(current date)
}
```

### Verify Admin Email

1. In Firebase Console → Authentication → Users
2. Click the admin user
3. Click "Send email verification"
4. Go to email inbox
5. Click verification link
6. Confirm verified status

**Screenshot of User Setup:**
```
Firebase Console → Authentication → Users
┌─────────────────────────────────┐
│ Email: admin@lostfound.com      │
│ Status: Email verified ✓        │
│ UID: abc123def456...            │
│ Created: Jan 30, 2024           │
└─────────────────────────────────┘
```

---

## 🗄️ Step 4: Configure Firestore

### Enable Firestore Database

1. Go to Firebase Console → Firestore Database
2. Click "Create database"
3. Choose:
   - **Location:** Select nearest region
   - **Security rules:** Start in test mode (we'll update)
4. Click "Create"

### Deploy Security Rules

1. In your project root, install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. Initialize Firebase in your project:
   ```bash
   firebase init firestore
   ```

3. Update `firestore.rules` with the complete rules from the repo

4. Deploy rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

**Or manually in Firebase Console:**
1. Firestore → Rules tab
2. Copy entire content of `firestore.rules`
3. Paste into editor
4. Click "Publish"

### Create Required Collections

Firestore will auto-create collections when first document is added. Or manually create:

1. Click "Start collection"
2. Create these collections:
   - `users`
   - `lost_items`
   - `found_items`
   - `claims`
   - `contactMessages`

### Setup Indexes (for better performance)

Go to Firestore → Indexes and create:

**For lost_items:**
- Ascending: status, createdAt
- Ascending: category, createdAt
- Ascending: userId, createdAt

**For found_items:**
- Ascending: status, createdAt

**For claims:**
- Ascending: status, createdAt
- Ascending: claimantId, createdAt

Firestore will prompt you to create indexes when needed.

---

## 📦 Step 5: Configure Cloud Storage (for images)

### Enable Cloud Storage

1. Firebase Console → Storage
2. Click "Get started"
3. Choose:
   - **Location:** Same as Firestore
   - **Rules:** Start in test mode
4. Click "Done"

### Update Storage Rules

1. Storage → Rules tab
2. Replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to read/write images
    match /lost_items/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /found_items/{adminId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
                     exists(/databases/(default)/documents/users/$(request.auth.uid)) &&
                     get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

3. Click "Publish"

---

## 💾 Step 6: Install Dependencies

```bash
# Install all npm packages
npm install

# Or with yarn
yarn install
```

### Key Dependencies

```json
{
  "react": "^18.x",
  "react-dom": "^18.x",
  "react-router-dom": "^6.x",
  "firebase": "^9.x",
  "@mui/material": "^5.x",
  "@mui/icons-material": "^5.x"
}
```

---

## 🏃 Step 7: Run Development Server

```bash
# Start development server
npm start

# Default: http://localhost:3000
```

The app will open in your browser. You should see:
- Home page
- Navigation with Login/Register links
- No errors in console

---

## ✅ Step 8: Test the Setup

### Test 1: User Registration
```
1. Go to http://localhost:3000/register
2. Fill in:
   - Name: Test User
   - Email: testuser@example.com
   - Password: TestPassword123
   - Confirm: TestPassword123
3. Click "Create Account"
4. Check email for verification link
5. Click verification link
```

### Test 2: User Login
```
1. Go to http://localhost:3000/login
2. Enter verified email and password
3. Should redirect to home page
4. Navbar should show "Logout" button
```

### Test 3: Admin Login
```
1. Go to http://localhost:3000/admin-login
2. Enter: admin@lostfound.com
3. Enter: admin password (from step 3)
4. Should redirect to /admin dashboard
5. Should see admin menu in navbar
```

### Test 4: Authorization
```
1. Login as regular user
2. Try to access http://localhost:3000/admin
3. Should redirect to home page
4. Try /admin-login as regular user
5. Should show error: "Only administrators can access"
```

---

## 🔄 Step 9: Build for Production

```bash
# Create optimized build
npm run build

# Build output in /build directory
# Ready to deploy to Netlify, Vercel, Firebase Hosting, etc.
```

---

## 🚢 Step 10: Deploy to Firebase Hosting (Optional)

### Install Firebase Tools
```bash
npm install -g firebase-tools
firebase login
```

### Initialize Hosting
```bash
firebase init hosting
# Select your project
# Public directory: build
# Configure SPA rewrites: Yes
```

### Deploy
```bash
npm run build
firebase deploy
```

---

## 📋 Configuration Checklist

- [ ] `.env` file created with all Firebase keys
- [ ] `REACT_APP_ADMIN_EMAIL` set correctly
- [ ] Firebase Authentication enabled (Email/Password)
- [ ] Admin user created in Firebase Auth
- [ ] Admin UID matches Firestore document
- [ ] Admin email verified
- [ ] Firestore rules deployed
- [ ] Collections created (or will auto-create)
- [ ] Cloud Storage enabled
- [ ] Dependencies installed (`npm install`)
- [ ] Dev server running (`npm start`)
- [ ] User registration tested
- [ ] Admin login tested
- [ ] Authorization rules tested

---

## 🔒 Security Checklist

- [ ] `.env` file added to `.gitignore`
- [ ] No sensitive keys in code
- [ ] Firestore rules published (not in test mode)
- [ ] Email verification required
- [ ] Admin email not hardcoded
- [ ] HTTPS enabled (Firebase automatic)
- [ ] CORS properly configured if needed
- [ ] Rate limiting considered
- [ ] Backups enabled

---

## 📞 Troubleshooting

### "Firebase app not initialized"
**Solution:** Check `.env` file has all required variables

### "Permission denied" errors
**Solution:** 
1. Deploy Firestore rules: `firebase deploy --only firestore:rules`
2. Verify user role in Firestore document

### "Email not verified" error
**Solution:**
1. Check inbox for verification email
2. Check spam folder
3. In Firebase Console, resend verification email

### "Admin login not working"
**Solution:**
1. Verify email matches `REACT_APP_ADMIN_EMAIL`
2. Check admin user exists in Firebase Auth
3. Check admin document exists in Firestore with `role: "admin"`
4. Verify email is verified

### "Images not uploading"
**Solution:**
1. Check Cloud Storage enabled
2. Deploy Storage rules
3. Check user has write permission

---

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Router Docs](https://reactrouter.com/)
- [Material-UI Docs](https://mui.com/)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)

---

**Last Updated:** January 30, 2026  
**Version:** 1.0
