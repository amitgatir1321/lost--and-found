# 🗄️ Firestore Database Schema & Authorization

This document outlines the complete database structure for the Lost & Found application.

---

## 📋 Collections Overview

### 1. **users** Collection
Store user profile and role information.

**Path:** `users/{userId}`

**Document Fields:**
```javascript
{
  uid: string,                    // Firebase Authentication UID (matches document ID)
  email: string,                  // User email address
  name: string,                   // Full name
  role: "user" | "admin",         // User role (only "user" for regular users)
  createdAt: timestamp,           // Account creation timestamp
  updatedAt: timestamp,           // Last profile update (optional)
  phoneNumber: string,            // Phone number (optional)
  avatar: string,                 // Avatar image URL (optional)
  bio: string                     // User bio (optional)
}
```

**Authorization Rules:**
- ✅ Users can READ/WRITE their own document only
- ✅ Admins can READ/WRITE all user documents
- 🚫 Users CANNOT change their `role` field (immutable)
- 🚫 Users CANNOT create admin accounts via signup

**Example:**
```javascript
{
  uid: "user_123abc",
  email: "john@example.com",
  name: "John Doe",
  role: "user",
  createdAt: Timestamp(1234567890),
  phoneNumber: "+1-555-0100"
}
```

---

### 2. **lost_items** Collection
Store lost item reports submitted by users.

**Path:** `lost_items/{itemId}`

**Document Fields:**
```javascript
{
  itemId: string,                 // Unique item ID (document ID)
  userId: string,                 // UID of the user who reported (matches users collection)
  itemName: string,               // Name/type of item (e.g., "iPhone 14")
  category: string,               // Category (e.g., "electronics", "jewelry", "documents")
  description: string,            // Detailed description of the item
  location: string,               // Where it was lost (e.g., "Coffee shop on 5th Ave")
  date: timestamp,                // Date when item was lost
  imageUrl: string,               // Image URL of the item (optional, stored in Cloud Storage)
  status: "pending" | "matched" | "resolved" | "closed",
  createdAt: timestamp,           // When report was created
  updatedAt: timestamp,           // Last update timestamp
  contact: {
    email: string,                // Reporter's email
    phone: string                 // Reporter's phone (optional)
  }
}
```

**Authorization Rules:**
- ✅ EVERYONE can READ lost items
- ✅ Authenticated users can CREATE lost item reports (role must be "user")
- ✅ Item owner OR admin can UPDATE
- ✅ Item owner OR admin can DELETE

**Example:**
```javascript
{
  itemId: "lost_item_001",
  userId: "user_123abc",
  itemName: "Silver Apple Watch",
  category: "electronics",
  description: "Series 7, 45mm, silver aluminum with black sport band",
  location: "Central Park, near the main entrance",
  date: Timestamp(1704067200),
  imageUrl: "gs://bucket/lost_items/watch_001.jpg",
  status: "pending",
  createdAt: Timestamp(1704153600),
  contact: {
    email: "john@example.com",
    phone: "+1-555-0100"
  }
}
```

---

### 3. **found_items** Collection
Store found item reports posted by admins.

**Path:** `found_items/{itemId}`

**Document Fields:**
```javascript
{
  itemId: string,                 // Unique item ID (document ID)
  userId: string,                 // Admin's UID who posted the item
  itemName: string,               // Name/type of item
  category: string,               // Category
  description: string,            // Detailed description
  location: string,               // Where item was found
  date: timestamp,                // Date when item was found
  imageUrl: string,               // Image URL of the item
  status: "available" | "claimed" | "returned",
  createdAt: timestamp,           // When report was created
  updatedAt: timestamp,           // Last update timestamp
  notes: string                   // Admin notes (optional)
}
```

**Authorization Rules:**
- ✅ EVERYONE can READ found items
- ✅ ONLY ADMINS can CREATE found item reports
- ✅ ONLY ADMINS can UPDATE
- ✅ ONLY ADMINS can DELETE

**Example:**
```javascript
{
  itemId: "found_item_001",
  userId: "admin_456def",
  itemName: "Lost Keys",
  category: "miscellaneous",
  description: "Set of 3 keys (car key + house keys) with blue keychain",
  location: "Turn-in desk at the airport",
  date: Timestamp(1704153600),
  imageUrl: "gs://bucket/found_items/keys_001.jpg",
  status: "available",
  createdAt: Timestamp(1704240000),
  notes: "Found near check-in counter"
}
```

---

### 4. **claims** Collection
Store claims/matching between lost and found items.

**Path:** `claims/{claimId}`

**Document Fields:**
```javascript
{
  claimId: string,                // Unique claim ID (document ID)
  lostItemId: string,             // Reference to lost_items document
  foundItemId: string,            // Reference to found_items document
  claimantId: string,             // UID of the person claiming the lost item
  itemOwnerId: string,            // UID of the person who reported the lost item
  claimMessage: string,           // Message from claimant about the item
  status: "pending" | "approved" | "rejected" | "completed",
  createdAt: timestamp,           // When claim was created
  updatedAt: timestamp,           // Last update
  resolvedAt: timestamp,          // When claim was resolved (optional)
  resolutionNotes: string         // Admin notes on resolution (optional)
}
```

**Authorization Rules:**
- ✅ Claimant, item owner, or admin can READ
- ✅ Authenticated users can CREATE claims
- ✅ Item owner or admin can UPDATE status
- ✅ ONLY ADMINS can DELETE

**Example:**
```javascript
{
  claimId: "claim_001",
  lostItemId: "lost_item_001",
  foundItemId: "found_item_001",
  claimantId: "user_789ghi",
  itemOwnerId: "user_123abc",
  claimMessage: "These are my keys! I have the receipt.",
  status: "approved",
  createdAt: Timestamp(1704326400),
  updatedAt: Timestamp(1704412800),
  resolvedAt: Timestamp(1704412800),
  resolutionNotes: "Claimant verified with receipt. Item returned."
}
```

---

### 5. **contactMessages** Collection
Store messages from the contact form.

**Path:** `contactMessages/{messageId}`

**Document Fields:**
```javascript
{
  messageId: string,              // Unique message ID (document ID)
  name: string,                   // Sender's name
  email: string,                  // Sender's email
  subject: string,                // Message subject
  message: string,                // Message content
  read: boolean,                  // Whether admin has read it
  createdAt: timestamp,           // When message was sent
  userId: string                  // UID if sender was authenticated (optional)
}
```

**Authorization Rules:**
- ✅ ONLY ADMINS can READ
- ✅ ANYONE can CREATE (unauthenticated allowed)
- ✅ ONLY ADMINS can UPDATE/DELETE

**Example:**
```javascript
{
  messageId: "contact_001",
  name: "Jane Smith",
  email: "jane@example.com",
  subject: "Lost passport",
  message: "I lost my passport at the airport. Can you help?",
  read: false,
  createdAt: Timestamp(1704499200),
  userId: "user_101jkl"
}
```

---

## 🔐 Authorization Summary

| Collection | Read | Create | Update | Delete |
|:---|:---|:---|:---|:---|
| **users** | Owner / Admin | Self | Owner / Admin | Admin |
| **lost_items** | Everyone | Authenticated | Owner / Admin | Owner / Admin |
| **found_items** | Everyone | Admin Only | Admin Only | Admin Only |
| **claims** | Involved / Admin | Authenticated | Owner / Admin | Admin Only |
| **contactMessages** | Admin Only | Everyone | Admin Only | Admin Only |

---

## 🏗️ Database Architecture Best Practices

### Indexing
For optimal query performance, create these Firestore indexes:

```
Collection: lost_items
  - Ascending: status
  - Ascending: createdAt
  - Ascending: category

Collection: found_items
  - Ascending: status
  - Ascending: createdAt

Collection: claims
  - Ascending: status
  - Ascending: createdAt
```

### Naming Conventions
- Collection names: **snake_case** (e.g., `lost_items`, `found_items`)
- Document IDs: **lowercase with underscores** (auto-generated or meaningful)
- Field names: **camelCase** (e.g., `itemName`, `createdAt`)

### Timestamps
Always use Firebase `serverTimestamp()` for consistency across regions.

---

## 🔄 Data Flow Examples

### Example 1: User Reports Lost Item
1. User authenticates with email/password
2. User submits lost item form
3. Frontend calls Firestore: `lost_items.add({...})`
4. Firestore rules validate:
   - ✅ User is authenticated
   - ✅ `userId` matches `request.auth.uid`
   - ✅ `role == "user"`
   - ✅ `status == "pending"`

### Example 2: Admin Matching Items
1. Admin logs in with email matching `ADMIN_EMAIL`
2. Admin browses lost and found items
3. Admin creates a claim matching them
4. Firestore rules validate:
   - ✅ User is authenticated and is admin
   - ✅ Both referenced items exist
   - ✅ Initial `status == "pending"`

### Example 3: User Claiming Found Item
1. User views found item
2. User submits claim with message
3. Frontend calls Firestore: `claims.add({...})`
4. Firestore rules validate:
   - ✅ User is authenticated
   - ✅ `claimantId == request.auth.uid`

---

## 📊 Query Examples

### Get all lost items by a user:
```javascript
db.collection('lost_items')
  .where('userId', '==', uid)
  .orderBy('createdAt', 'desc')
```

### Get pending claims for an item:
```javascript
db.collection('claims')
  .where('lostItemId', '==', itemId)
  .where('status', '==', 'pending')
```

### Get all contact messages (admin only):
```javascript
db.collection('contactMessages')
  .where('read', '==', false)
  .orderBy('createdAt', 'asc')
```

---

## ⚠️ Security Considerations

1. **Admin Email**: Set in environment variable `REACT_APP_ADMIN_EMAIL`
2. **No Role Modification**: Users cannot change their role via API
3. **No Signup Registration**: Admin must be created manually in Firebase Console
4. **Email Verification**: Required for user login
5. **Ownership Validation**: All operations verify user ownership before modification

---

## 🚀 Deployment Checklist

- [ ] Set `REACT_APP_ADMIN_EMAIL` environment variable
- [ ] Deploy Firestore security rules
- [ ] Create admin user in Firebase Authentication
- [ ] Create admin user document in Firestore with `role: "admin"`
- [ ] Enable email verification requirement
- [ ] Configure email domain whitelist if needed
- [ ] Set up Cloud Storage rules for image uploads
- [ ] Enable Firebase backups

---

**Version:** 1.0  
**Last Updated:** January 30, 2026
