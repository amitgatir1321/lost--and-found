# 🏗️ Architecture & Implementation Overview

Visual guide to the Lost & Found authentication and authorization system.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     LOST & FOUND APP                        │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
   ┌─────────┐         ┌─────────┐        ┌──────────┐
   │  Login  │         │Register │        │AdminLogin│
   └────┬────┘         └────┬────┘        └────┬─────┘
        │                   │                   │
        │     ┌─────────────┴─────────────┐    │
        │     ▼                           ▼    ▼
        │  ┌──────────────────────────────────────┐
        │  │   Firebase Authentication            │
        │  │   (Email/Password + Google OAuth)    │
        │  └─────────────┬──────────────┬─────────┘
        │                │              │
        └────────────────┼──────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │   AuthContext (React Context)  │
        │                                │
        │  - currentUser                 │
        │  - userRole ("user"|"admin")   │
        │  - userEmail                   │
        │  - isAdmin (boolean)           │
        │  - emailVerified               │
        └─────────────┬──────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
    ┌────────┐  ┌──────────┐  ┌─────────┐
    │Private │  │  Admin   │  │ Public  │
    │ Route  │  │  Route   │  │ Routes  │
    └────────┘  └──────────┘  └─────────┘
        │             │
        ▼             ▼
   ┌─────────────────────────┐
   │    Firestore Database    │
   │  (with Security Rules)   │
   └─────────────────────────┘
```

---

## Authentication Flow

### User Registration

```
    ┌──────────────┐
    │  User Visits │
    │  /register   │
    └──────┬───────┘
           │
           ▼
    ┌──────────────────────────┐
    │  Enter email, password,  │
    │  password confirmation   │
    └──────┬───────────────────┘
           │
           ▼
    ┌──────────────────────────┐
    │ AuthContext.signup()     │
    │                          │
    │ 1. Firebase creates user │
    │ 2. Sends verification    │
    │ 3. Creates Firestore doc │
    │    role: "user"          │
    └──────┬───────────────────┘
           │
           ▼
    ┌──────────────────────────┐
    │  ✓ Account Created       │
    │  ✓ Verification Sent     │
    │  Redirect to /login      │
    └──────┬───────────────────┘
           │
           ▼
    ┌──────────────────────────┐
    │ User verifies email      │
    │ from inbox               │
    └──────┬───────────────────┘
           │
           ▼
    ┌──────────────────────────┐
    │ ✓ Email Verified         │
    │ Can now login!           │
    └──────────────────────────┘
```

### User Login

```
    ┌──────────────┐
    │  User Visits │
    │  /login      │
    └──────┬───────┘
           │
           ▼
    ┌──────────────────────────┐
    │  Enter email & password  │
    └──────┬───────────────────┘
           │
           ▼
    ┌──────────────────────────┐
    │ AuthContext.login()      │
    │                          │
    │ 1. Firebase authenticates│
    │ 2. Checks email verified │
    └──────┬───────────────────┘
           │
           ▼
    ┌──────────────────────────┐
    │  Auth state updates      │
    │  • currentUser set       │
    │  • Role fetched from DB  │
    │  • emailVerified = true  │
    └──────┬───────────────────┘
           │
           ▼
    ┌──────────────────────────┐
    │ ✓ Logged in as User      │
    │ Dashboard accessible     │
    └──────────────────────────┘
```

### Admin Login

```
    ┌──────────────────┐
    │  Admin Visits    │
    │  /admin-login    │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────────────┐
    │ Enter admin email &      │
    │ password                 │
    └──────┬───────────────────┘
           │
           ▼
    ┌──────────────────────────┐
    │ AuthContext.login()      │
    │                          │
    │ 1. Firebase authenticates│
    │ 2. Checks email verified │
    └──────┬───────────────────┘
           │
           ▼
    ┌──────────────────────────┐
    │ Check if admin:          │
    │                          │
    │ • Email ==               │
    │   ADMIN_EMAIL? → ADMIN   │
    │ • Firestore role ==      │
    │   "admin"? → ADMIN       │
    └──────┬───────────────────┘
           │
    ┌──────┴──────┐
    │             │
YES │             │ NO
    ▼             ▼
┌─────────┐  ┌──────────┐
│ ✓ Admin │  │  Error!  │
│ Dashboard   │Non-admin │
└─────────┘  └──────────┘
```

---

## Authorization Structure

### Role Matrix

```
┌─────────────────────────────────────────────────────────┐
│                 USER ROLES & PERMISSIONS                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  👤 REGULAR USER                                        │
│  ├─ Can read public items                              │
│  ├─ Can create lost items                              │
│  ├─ Can edit own lost items                            │
│  ├─ Can delete own lost items                          │
│  ├─ Can claim found items                              │
│  ├─ Can view own profile                               │
│  ├─ Can view own claims                                │
│  └─ CANNOT change role                                 │
│                                                         │
│  🧑‍💼 ADMIN                                              │
│  ├─ Can do everything users can                        │
│  ├─ Can create found items                             │
│  ├─ Can edit any item                                  │
│  ├─ Can delete any item                                │
│  ├─ Can manage all claims                              │
│  ├─ Can view all contact messages                      │
│  └─ Can access admin dashboard                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Route Protection

```
┌─────────────────────────────────────────┐
│          ROUTE PROTECTION               │
├─────────────────────────────────────────┤
│                                         │
│  PUBLIC ROUTES (No Protection)          │
│  ├─ /                                   │
│  ├─ /login                              │
│  ├─ /register                           │
│  ├─ /admin-login                        │
│  ├─ /browse-items                       │
│  └─ /how-it-works                       │
│                                         │
│  USER PROTECTED (PrivateRoute)          │
│  ├─ /profile                            │
│  ├─ /my-claims                          │
│  └─ /report-lost                        │
│                                         │
│  ADMIN PROTECTED (AdminRoute)           │
│  └─ /admin                              │
│                                         │
└─────────────────────────────────────────┘
```

---

## Data Security Model

### Firestore Rules Enforcement

```
REQUEST                    FIRESTORE RULES              DECISION
─────────────────         ─────────────────            ────────

Read /users/{uid}   →  isOwner(uid) ||         →  ✅ Allow
                       isAdmin(auth.uid)         

Create /lost_items  →  isAuthenticated()  &&  →  ✅ Allow
                       auth.uid == request        
                       .resource.userId

Update /lost_items  →  isOwner(userId) ||     →  ✅ Allow
/{id}                   isAdmin(auth.uid)

Delete /lost_items  →  isOwner(userId) ||     →  ✅ Allow
/{id}                   isAdmin(auth.uid)

Create /found_items →  isAdmin(auth.uid)      →  ✅ Allow
                                                  (Admin only)

Update /found_items →  isAdmin(auth.uid)      →  ✅ Allow
/{id}                                           (Admin only)

Read /lost_items    →  true (public)           →  ✅ Allow
                                                  (Everyone)
```

---

## Component Hierarchy

```
┌─ App.js
│
├─ AuthProvider (Context)
│  │
│  └─ Router
│     │
│     ├─ Navbar
│     │
│     ├─ Routes
│     │  │
│     │  ├─ <Route path="/" element={<Home />} />
│     │  │
│     │  ├─ <Route path="/login" element={<Login />} />
│     │  │
│     │  ├─ <Route path="/register" element={<Register />} />
│     │  │
│     │  ├─ <Route path="/admin-login" element={<AdminLogin />} />
│     │  │
│     │  ├─ <Route path="/profile" element={
│     │  │    <PrivateRoute>
│     │  │      <Profile />
│     │  │    </PrivateRoute>
│     │  │  } />
│     │  │
│     │  └─ <Route path="/admin" element={
│     │     <AdminRoute>
│     │       <AdminDashboard />
│     │     </AdminRoute>
│     │   } />
│     │
│     └─ Footer
```

---

## Authentication State Management

```
┌──────────────────────────────────────┐
│      AuthContext State & Methods     │
├──────────────────────────────────────┤
│                                      │
│  STATE:                              │
│  ├─ currentUser (Firebase user)     │
│  ├─ userRole ("user" | "admin")     │
│  ├─ userEmail (string)              │
│  ├─ emailVerified (boolean)         │
│  ├─ isAdmin (boolean)               │
│  └─ loading (boolean)               │
│                                      │
│  METHODS:                            │
│  ├─ signup(email, pwd, name)        │
│  ├─ login(email, password)          │
│  ├─ logout()                        │
│  ├─ signInWithGoogle()              │
│  ├─ resetPassword(email)            │
│  └─ resendVerificationEmail()       │
│                                      │
└──────────────────────────────────────┘
```

---

## Database Collections

```
┌─────────────────────────────────────────────────────────┐
│         FIRESTORE DATABASE STRUCTURE                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  users/                                                 │
│  ├─ {userId}                                            │
│  │  ├─ uid: string                                      │
│  │  ├─ email: string                                    │
│  │  ├─ name: string                                     │
│  │  ├─ role: "user" | "admin"                           │
│  │  └─ createdAt: timestamp                             │
│  │                                                      │
│  lost_items/                                            │
│  ├─ {itemId}                                            │
│  │  ├─ userId: string (owner)                           │
│  │  ├─ itemName: string                                 │
│  │  ├─ category: string                                 │
│  │  ├─ description: string                              │
│  │  ├─ location: string                                 │
│  │  ├─ date: timestamp                                  │
│  │  ├─ imageUrl: string                                 │
│  │  ├─ status: "pending|matched|resolved"              │
│  │  └─ createdAt: timestamp                             │
│  │                                                      │
│  found_items/                                           │
│  ├─ {itemId}                                            │
│  │  ├─ userId: string (admin)                           │
│  │  ├─ itemName: string                                 │
│  │  ├─ description: string                              │
│  │  ├─ status: "available|claimed"                      │
│  │  └─ createdAt: timestamp                             │
│  │                                                      │
│  claims/                                                │
│  ├─ {claimId}                                           │
│  │  ├─ lostItemId: string                               │
│  │  ├─ claimantId: string                               │
│  │  ├─ status: "pending|approved|rejected"              │
│  │  └─ createdAt: timestamp                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Security Layers

```
┌────────────────────────────────────────────────────────┐
│                  SECURITY LAYERS                       │
├────────────────────────────────────────────────────────┤
│                                                        │
│  LAYER 1: Firebase Authentication                     │
│  └─ Password hashing & management                     │
│  └─ Session tokens                                    │
│  └─ HTTPS enforcement                                 │
│                                                        │
│  LAYER 2: Email Verification                          │
│  └─ Required before login                             │
│  └─ Prevents spam accounts                            │
│                                                        │
│  LAYER 3: Role-Based Access Control                   │
│  └─ Admin email configuration                         │
│  └─ Firestore role field                              │
│  └─ Route protection (React Router)                   │
│                                                        │
│  LAYER 4: Firestore Security Rules                    │
│  └─ Database-level access control                     │
│  └─ Ownership validation                              │
│  └─ Role enforcement                                  │
│  └─ Field-level protection (immutable fields)         │
│                                                        │
│  LAYER 5: Application Logic                           │
│  └─ AuthContext role detection                        │
│  └─ PrivateRoute & AdminRoute guards                  │
│  └─ Authorization checks before operations            │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## Implementation Timeline

```
PHASE 1: Authentication Foundation
├─ Firebase setup
├─ AuthContext implementation
└─ Signup/Login flows

PHASE 2: Authorization System
├─ Role detection logic
├─ Firestore rules
├─ Route protection components
└─ Admin login page

PHASE 3: Documentation
├─ Firestore schema docs
├─ Authentication guide
├─ Setup instructions
└─ Quick reference

PHASE 4: Testing & Validation
├─ User registration tests
├─ Admin access tests
├─ Permission tests
└─ Production readiness
```

---

## Key Configuration Points

```
Environment Variables (.env)
├─ REACT_APP_FIREBASE_API_KEY
├─ REACT_APP_FIREBASE_AUTH_DOMAIN
├─ REACT_APP_FIREBASE_PROJECT_ID
├─ REACT_APP_FIREBASE_STORAGE_BUCKET
├─ REACT_APP_FIREBASE_MESSAGING_SENDER_ID
├─ REACT_APP_FIREBASE_APP_ID
└─ REACT_APP_ADMIN_EMAIL ⭐ CRITICAL

Firebase Console Configuration
├─ Authentication (Email/Password + Google)
├─ Firestore Database
├─ Cloud Storage
├─ Email Templates
└─ Security Rules

Admin Account Setup
├─ Create user in Firebase Auth
├─ Copy UID
├─ Create Firestore /users/{uid} document
├─ Set role: "admin"
└─ Verify email
```

---

## Testing Matrix

```
┌──────────────────────────────────────┐
│         TESTING SCENARIOS            │
├──────────────────────────────────────┤
│                                      │
│  ✓ User Registration                 │
│    - Can register with email/pwd     │
│    - Gets role: "user"               │
│    - Receives verification email     │
│    - Cannot login without verify     │
│                                      │
│  ✓ User Login                        │
│    - Can login after verify          │
│    - Redirects to dashboard          │
│    - Cannot login unverified         │
│    - Password reset works            │
│                                      │
│  ✓ Admin Login                       │
│    - Admin can access /admin-login   │
│    - Redirects to dashboard          │
│    - Only admin email allowed        │
│    - Proper error for non-admin      │
│                                      │
│  ✓ Authorization                     │
│    - User cannot access /admin       │
│    - Admin can access /admin         │
│    - Users see only own items        │
│    - Firestore rules enforced        │
│                                      │
│  ✓ Security                          │
│    - Role immutable                  │
│    - Email immutable                 │
│    - No privilege escalation         │
│    - Ownership validated             │
│                                      │
└──────────────────────────────────────┘
```

---

**Last Updated:** January 30, 2026  
**Version:** 1.0
