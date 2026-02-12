# 🔐 Authentication & Authorization Guide

Complete guide for the Lost & Found application's authentication and role-based access control system.

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [User Roles](#user-roles)
3. [Authentication Flow](#authentication-flow)
4. [Authorization Implementation](#authorization-implementation)
5. [Setup Instructions](#setup-instructions)
6. [Security Best Practices](#security-best-practices)

---

## Architecture Overview

### Technology Stack
- **Authentication:** Firebase Authentication (Email/Password + Google OAuth)
- **Database:** Firestore
- **Frontend:** React.js with Context API
- **Authorization:** Role-based access control (RBAC)

### Key Components

```
AuthContext (React Context)
├── currentUser: Firebase user object
├── userRole: "user" | "admin"
├── userEmail: User's email
├── isAdmin: Boolean helper
└── Methods: signup(), login(), logout(), etc.

Routes
├── Public Routes (no authentication needed)
├── Protected Routes (PrivateRoute - user must be logged in)
└── Admin Routes (AdminRoute - user must be admin)
```

---

## User Roles

### 👤 Regular User
- **What they can do:**
  - Register with email/password
  - Report lost items
  - View all lost/found items
  - Claim found items
  - Manage their own reports
  - View their claims

- **What they cannot do:**
  - Register as admin
  - Access admin dashboard
  - Modify other users' items
  - Add found items (admin only)
  - Delete accounts

**Firestore Role:** `role: "user"`

### 🧑‍💼 Admin
- **What they can do:**
  - Login with dedicated admin email
  - Access admin dashboard
  - View all items (lost & found)
  - Add found items
  - Match lost & found items
  - Manage claims
  - Moderate user reports
  - Delete fake/duplicate items
  - View contact messages

- **What they cannot do:**
  - Register through user signup
  - Be created via UI (manual only)

**Firestore Role:** `role: "admin"`

---

## Authentication Flow

### 🔐 User Signup Flow

```
1. User visits /register
   ↓
2. User submits:
   - Full Name
   - Email
   - Password (min 6 chars)
   - Password Confirmation
   ↓
3. AuthContext.signup():
   - Creates Firebase user account
   - Sends verification email
   - Creates Firestore user document with role: "user"
   ↓
4. Verification email sent
   ↓
5. User must verify email
   ↓
6. User can then login
```

**Code Example:**
```javascript
const { signup } = useAuth();

await signup(email, password, name);
// ✅ User created with role: "user"
// ✅ Verification email sent
```

---

### 🔑 User Login Flow

```
1. User visits /login
   ↓
2. User submits:
   - Email
   - Password
   ↓
3. AuthContext.login():
   - Verifies email/password with Firebase
   - Checks if email is verified
   - Returns user on success
   ↓
4. Auth state updates
   ↓
5. User redirected to dashboard
```

**Code Example:**
```javascript
const { login } = useAuth();

await login(email, password);
// ✅ User verified
// ✅ Can now access protected routes
```

---

### 🧑‍💼 Admin Login Flow

```
1. Admin visits /admin-login
   ↓
2. Admin submits:
   - Email (must be REACT_APP_ADMIN_EMAIL)
   - Password
   ↓
3. AuthContext.login():
   - Verifies with Firebase
   - Checks email verification
   ↓
4. AuthContext checks admin status:
   - Option A: Email matches ADMIN_EMAIL env var
   - Option B: Firestore role == "admin"
   ↓
5. If admin → redirect to /admin
   ↓
6. If not admin → show error
```

**Code Example:**
```javascript
const { login, isAdmin } = useAuth();

const user = await login(email, password);
if (isAdmin) {
  navigate('/admin');
} else {
  setError('Only administrators can access this page');
}
```

---

## Authorization Implementation

### 1️⃣ AdminRoute Component

**Location:** `src/components/AdminRoute.js`

Protects routes that only admins should access.

```javascript
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const { currentUser, userRole } = useAuth();

  if (!currentUser) {
    return <Navigate to="/admin-login" />;
  }

  if (userRole !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
};
```

**Usage:**
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

### 2️⃣ PrivateRoute Component

**Location:** `src/components/PrivateRoute.js`

Protects routes that require user authentication.

```javascript
const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
};
```

**Usage:**
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

---

### 3️⃣ AuthContext Hook

**Location:** `src/contexts/AuthContext.js`

Provides authentication state and methods.

```javascript
const { 
  currentUser,      // Firebase user object
  userRole,         // "user" | "admin" | null
  userEmail,        // User's email
  isAdmin,          // Boolean: true if role == "admin"
  emailVerified,    // Boolean: email verification status
  signup,           // Method to register
  login,            // Method to login
  logout,           // Method to logout
  signInWithGoogle  // OAuth method
} = useAuth();
```

**Key Implementation Details:**

1. **Admin Detection:**
   ```javascript
   // Checks in this order:
   // 1. Email matches REACT_APP_ADMIN_EMAIL
   // 2. Firestore role == "admin"
   
   const isAdminByEmail = user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
   const firestoreRole = userDoc.data().role;
   const finalRole = isAdminByEmail ? 'admin' : firestoreRole;
   ```

2. **Role Assignment on Signup:**
   ```javascript
   // Always "user" for regular registration
   await setDoc(doc(db, 'users', user.uid), {
     uid: user.uid,
     name,
     email: user.email,
     role: 'user'  // ✅ Enforced at signup
   });
   ```

3. **Email Verification Requirement:**
   ```javascript
   // Must verify email before login
   if (!user.emailVerified) {
     await signOut(auth);
     throw new Error('Please verify your email...');
   }
   ```

---

### 4️⃣ Route Structure

**Location:** `src/App.js`

```javascript
<Routes>
  {/* PUBLIC */}
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/admin-login" element={<AdminLogin />} />
  
  {/* USER PROTECTED */}
  <Route
    path="/profile"
    element={
      <PrivateRoute>
        <Profile />
      </PrivateRoute>
    }
  />
  
  {/* ADMIN PROTECTED */}
  <Route
    path="/admin"
    element={
      <AdminRoute>
        <AdminDashboard />
      </AdminRoute>
    }
  />
</Routes>
```

---

## Setup Instructions

### 1️⃣ Environment Variables

Create or update `.env` file:

```bash
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Admin Email (IMPORTANT!)
REACT_APP_ADMIN_EMAIL=admin@lostfound.com
```

### 2️⃣ Create Admin Account

**Step 1: Firebase Console**
- Go to Firebase Console → Authentication
- Create new user with email: `admin@lostfound.com`
- Generate a temporary password

**Step 2: Create Firestore Document**
- Go to Firestore → users collection
- Create document with ID matching the admin's uid
- Add fields:
  ```json
  {
    "uid": "admin_uid_here",
    "email": "admin@lostfound.com",
    "name": "Administrator",
    "role": "admin",
    "createdAt": "timestamp"
  }
  ```

**Step 3: Verify Email**
- Click "Send verification email" in Firebase Console
- Admin confirms verification

### 3️⃣ Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

Or manually in Firebase Console:
- Firestore → Rules
- Paste the content from `firestore.rules`
- Click Publish

### 4️⃣ Test the Flow

**Test User Registration:**
```
1. Go to /register
2. Fill form with new user details
3. Submit
4. Verify email from inbox
5. Go to /login
6. Login with verified email
7. Should redirect to home as regular user
```

**Test Admin Login:**
```
1. Go to /admin-login
2. Enter: admin@lostfound.com
3. Enter: admin password
4. Should redirect to /admin dashboard
5. Non-admin users trying /admin-login should see error
```

---

## Security Best Practices

### ✅ DO's

1. **Always use HTTPS** - Firebase automatically enforces this
2. **Store sensitive data in environment variables** - Never hardcode API keys
3. **Validate on both frontend and backend** - Firestore rules are mandatory
4. **Use email verification** - Required before user login
5. **Implement rate limiting** - Prevent brute force attacks
6. **Monitor authentication logs** - Check Firebase console regularly

### 🚫 DON'Ts

1. **Don't store passwords in Firestore** - Firebase Auth handles this
2. **Don't allow role changes via UI** - Make role immutable
3. **Don't expose admin email in frontend code** - Use environment variables
4. **Don't trust client-side role checks** - Always verify in Firestore rules
5. **Don't create multiple admin accounts** - Maintain single admin principle
6. **Don't skip email verification** - It's a security feature

### 🔒 Firestore Rules Security

Our rules enforce:
- ✅ **No privilege escalation** - Users can't become admins
- ✅ **Ownership validation** - Users can only modify their own data
- ✅ **Role enforcement** - Each operation checks user role
- ✅ **Email protection** - Can't change email field
- ✅ **Immutable fields** - uid, role, createdAt cannot be modified

---

## Troubleshooting

### Problem: User can't login
**Solution:**
1. Verify email is confirmed in Firebase Console
2. Check if email matches Firebase user
3. Verify password is correct
4. Check browser console for error messages

### Problem: Admin can't access /admin
**Solution:**
1. Verify admin email matches `REACT_APP_ADMIN_EMAIL`
2. Check Firestore rules are deployed
3. Verify admin user has `role: "admin"` in Firestore
4. Clear browser cache and try again

### Problem: "Permission denied" errors
**Solution:**
1. Check Firestore rules are published
2. Verify user has necessary permissions
3. Check document structure matches rules
4. Look at Firestore rule simulator

### Problem: Email verification not working
**Solution:**
1. Check Firebase Email configuration
2. Verify email sending is enabled
3. Check spam folder
4. Re-send verification email from UI

---

## Advanced Topics

### Customizing Admin Detection

To change how admins are identified, edit `AuthContext.js`:

```javascript
// Option 1: Email only (current)
const isAdmin = user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

// Option 2: Firestore role only
const isAdmin = userRole === 'admin';

// Option 3: Both (email takes precedence)
const isAdmin = isAdminByEmail || userRole === 'admin';
```

### Adding More Roles

To add roles like "moderator":

1. Update Firestore schema
2. Modify AuthContext role detection
3. Create MeratorRoute component
4. Update security rules
5. Create corresponding UI

---

## API Reference

### useAuth() Hook

```javascript
const {
  currentUser,              // Firebase User | null
  userRole,                 // "user" | "admin" | null
  userEmail,                // string
  isAdmin,                  // boolean
  emailVerified,            // boolean
  signup,                   // (email, password, name) => Promise
  login,                    // (email, password) => Promise
  logout,                   // () => Promise
  signInWithGoogle,         // () => Promise
  resetPassword,            // (email) => Promise
  resendVerificationEmail   // () => Promise
} = useAuth();
```

---

**Last Updated:** January 30, 2026  
**Version:** 1.0
