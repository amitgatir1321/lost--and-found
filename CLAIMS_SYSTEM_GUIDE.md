# Lost & Found Claims System - Implementation Guide

## 📋 Overview

A complete Lost & Found claim system has been implemented with the following features:

✅ Users can submit claims on found items (claiming they lost it)
✅ Found item owners can view and manage claims on their items
✅ Lost item owners can view claims submitted for their items
✅ Admins have a centralized dashboard to manage all claims
✅ Approval/Rejection with WhatsApp and email notifications
✅ Secure Firestore rules protecting claim data
✅ Contact information sharing between claimant and item owner

---

## 🏗️ System Architecture

### Collections & Relationships

```
claims/
├── claimId (document)
│   ├── claimantId: string (user who claims)
│   ├── itemOwnerId: string (owner of lost/found item)
│   ├── lostItemId or foundItemId: string (reference to item)
│   ├── claimMessage: string (proof/details from claimant)
│   ├── status: "pending" | "approved" | "rejected" | "resolved"
│   ├── ownerContactInfo: {name, email, phone, whatsapp}
│   ├── createdAt, updatedAt, approvedAt, rejectedAt, resolvedAt
│   └── rejectionReason: string (optional)
```

---

## 📁 Files Created/Modified

### 1. **Services** (Backend Logic)

#### `src/services/claimsService.js` ✨ NEW
Handles all claim operations:
- `submitClaim()` - User submits a claim
- `getClaimsForLostItem()` - Get claims on a lost item
- `getClaimsForFoundItem()` - Get claims on a found item
- `getUserClaimsAsClaimant()` - User's submitted claims
- `getUserClaimsAsItemOwner()` - Claims on user's items
- `getAllClaims()` - Admin view all claims
- `approveClaim()` - Item owner approves claim
- `rejectClaim()` - Item owner rejects claim
- `shareOwnerContact()` - Item owner shares contact info
- `checkExistingClaim()` - Prevent duplicate claims

#### `src/services/emailService.js` ✨ NEW
Generates HTML email templates for:
- Claim approval notification
- Claim rejection notification
- Contact information sharing
- New claim notification to item owner

### 2. **Components** (UI)

#### `src/components/ClaimForm.js` ✨ NEW
Modal dialog for users to submit claims on items:
- Validates minimum claim details (20 chars)
- Shows item information
- Terms agreement checkbox
- Real-time character counter
- Success/error feedback

### 3. **Pages** (Full Screen Views)

#### `src/pages/AdminClaimsPage.js` ✨ NEW
Admin dashboard for managing all claims:
- Statistics cards (pending, approved, rejected, resolved)
- Search and status filters
- Table view of all claims
- Approve/Reject/Resolve actions
- View detailed claim information
- Resolution notes

#### `src/pages/MyClaims.js` (Modified)
Enhanced with claims management:
- Tab 1: Claims submitted by user
- Tab 2: Claims received on user's items
- Approve/Reject interface
- Contact sharing dialog
- Rejection reason dialog

### 4. **Utilities**

#### `src/utils/whatsappNotifications.js` (Enhanced)
Added functions for:
- `sendApprovalNotification()` - Approval message
- `sendRejectionNotification()` - Rejection message
- `generateApprovalMessage()` - Formatted approval text
- `generateRejectionMessage()` - Formatted rejection text

### 5. **Configuration**

#### `src/App.js` (Modified)
Added new routes:
- `/admin/claims` → AdminClaimsPage (admin only)

#### `src/components/Navbar.js` (Modified)
Added navigation:
- Admin dropdown menu with "Claims Management" link
- Mobile drawer updated with admin claims link
- Badge support for pending claims count

#### `firestore.rules` (Modified)
**Enhanced security rules for claims:**

**READ:**
- Admins can read all claims
- Claimants can read their own claims
- Item owners can read claims on their items

**CREATE:**
- Only authenticated users
- Status must be "pending"
- Claimant ID must match current user

**UPDATE:**
- Item owners can approve or reject
- Item owners can share contact info (after approval)
- Admins can update any claim

**DELETE:**
- Only admins can delete

---

## 🔐 Security Features

### Firestore Rules
✅ Row-level security (claimant-specific access)
✅ Role-based access (admin vs user)
✅ Status-based permissions (can only approve if pending)
✅ Reference validation (verify item exists in Firestore)
✅ Timestamp validation (server timestamps)

### Data Validation
✅ Claim message minimum length (20 characters)
✅ Status enum validation (only valid statuses allowed)
✅ User ownership verification
✅ Duplicate claim prevention

---

## 🔄 Claim Workflow

### Step 1: User Submits Claim
```javascript
// User views found/lost item and clicks "Claim Item"
User clicks → ClaimForm opens
    ↓
User provides details + agrees to terms
    ↓
submitClaim() creates document in claims collection
    ↓
Status: "pending" (awaiting item owner review)
    ↓
Item owner receives email notification
```

### Step 2: Item Owner Reviews Claim
```javascript
// Item owner views claims in "My Claims" tab
Item owner sees pending claim
    ↓
Item owner clicks "Approve" or "Reject"
    ↓
If APPROVED:
  ├─ Approval email sent to claimant
  ├─ WhatsApp notification sent
  ├─ Status changed to "approved"
  └─ Item owner sees "Share Contact" button
    ↓
If REJECTED:
  ├─ Rejection email sent to claimant
  ├─ WhatsApp notification sent
  ├─ Rejection reason included
  └─ Status changed to "rejected"
  └─ User can submit new claim
```

### Step 3: Contact Sharing (After Approval)
```javascript
Item owner clicks "Share Contact"
    ↓
Dialog prompts for name, email, phone, WhatsApp
    ↓
Contact info stored in claim document
    ↓
Claimant receives email with owner's contact details
    ↓
Both parties coordinate recovery
```

### Step 4: Admin Resolution
```javascript
Admin views claim in Admin Dashboard
    ↓
Admin can approve/reject (if pending)
    ↓
Admin can mark as "resolved" with notes
    ↓
Status: "resolved" (item successfully returned)
```

---

## 📧 Notification System

### Email Notifications
**Approval Email:**
- HTML formatted with branding
- Item details summary
- Next steps instructions
- Admin contact information

**Rejection Email:**
- Clear rejection notice
- Optional rejection reason
- Encouragement to resubmit with more details
- Admin contact for questions

**Contact Sharing Email:**
- Owner's name, email, phone, WhatsApp
- Item description
- Safety reminder (meet in public place)
- Verification steps

### WhatsApp Notifications
**Approval Message:**
```
✅ CLAIM APPROVED
Item: [Name]
Category: [Category]
Status: Approved by Owner
📞 Admin Contact: [Phone]
```

**Rejection Message:**
```
❌ CLAIM REJECTED
Item: [Name]
Reason: [Optional reason]
📋 Next Steps: Resubmit with more details
```

---

## 🎨 User Interfaces

### ClaimForm Component
- Modal dialog with item preview
- Multi-line text area for claim details
- Character counter (0/500)
- Terms agreement checkbox
- Success notification on submission
- Error handling with user feedback

### MyClaims Page
**Tab 1: Claims I've Made**
- List of all claims user submitted
- Status badges (pending, approved, rejected, resolved)
- View details button
- Category and submission date

**Tab 2: Claims on My Items**
- List of claims received from others
- Claimant information display
- Approve/Reject action buttons
- Share Contact button (after approval)
- Rejection reason dialog

### AdminClaimsPage
- Statistics cards (4 columns)
  - Pending count
  - Approved count
  - Rejected count
  - Resolved count
- Filters: Search by item name/claimant + Status dropdown
- Table with columns:
  - Item Name
  - Claimant Name
  - Category
  - Status (chip with color)
  - Submitted Date
  - View Action
- Details dialog showing full claim information
- Approve/Reject/Resolve action buttons

---

## 🚀 How to Use

### For Item Reporters (Lost/Found)
1. Login to account
2. View found items or lost items
3. Click "Report Found" or "Report Lost"
4. Fill form and submit
5. Wait for claims
6. Navigate to "My Claims"
7. Review each claim
8. Approve or Reject
9. If approved, click "Share Contact"
10. Provide contact details
11. Coordinate with claimant

### For Claimants (Users Claiming Items)
1. Login to account
2. Browse "Browse Items" page
3. Find item that matches yours
4. Click item details
5. Click "Claim Item" button
6. Fill claim form with proof
7. Submit claim
8. Check "My Claims" for status
9. Wait for item owner review
10. Receive email/WhatsApp notification
11. If approved, contact owner using shared details

### For Administrators
1. Login as admin
2. Click "Admin Dashboard" or "Claims Management" in dropdown
3. View statistics and filters
4. Search for specific claims
5. Click "View" to see details
6. Can approve, reject, or resolve claims
7. Add notes when resolving
8. Monitor all claims system-wide

---

## ✅ Features Implemented

- [x] Claim submission by claimant
- [x] Claim view by item owner
- [x] Approve claim with contact sharing
- [x] Reject claim with reason
- [x] Admin claims dashboard
- [x] Email notifications (approval, rejection)
- [x] WhatsApp notifications
- [x] Contact information encryption/sharing
- [x] Firestore security rules
- [x] Duplicate claim prevention
- [x] Status tracking (pending → approved/rejected → resolved)
- [x] Navigation & UI integration
- [x] Mobile responsive design

---

## 🔧 Configuration

### Environment Variables
Ensure these are set in your `.env` file:
```
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_ADMIN_EMAIL=admin@lostfound.com
```

### Firestore Indexes
The system queries on multiple fields. Ensure indexes are created:
```
Collection: claims
  Index 1: claimantId + createdAt (desc)
  Index 2: itemOwnerId + createdAt (desc)
  Index 3: status + createdAt (desc)
```

---

## 📊 Database Schema

### Claims Collection Document Structure
```javascript
{
  // IDs
  claimantId: "user_123",              // Who is claiming
  itemOwnerId: "user_456",             // Who reported the item
  
  // Item Reference (one of these will be set)
  lostItemId: "lost_item_789" | null,
  foundItemId: "found_item_101" | null,
  
  // Claim Information
  itemName: "Apple Watch",
  category: "electronics",
  claimMessage: "This is my watch from XYZ store...",
  
  // Contact Information (for claimant)
  claimantName: "John Doe",
  claimantEmail: "john@example.com",
  
  // Owner's Contact (shared after approval)
  ownerContactInfo: {
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+1-555-0100",
    whatsapp: "+1-555-0100"
  },
  
  // Status Management
  status: "approved",                  // pending | approved | rejected | resolved
  approvedAt: Timestamp,
  rejectedAt: Timestamp,
  rejectionReason: "Item already claimed"
  resolvedAt: Timestamp,
  resolutionNotes: "Item successfully returned to user"
  contactSharedAt: Timestamp,
  
  // Audit Trail
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 🐛 Troubleshooting

### Claim Not Appearing
- Check user is logged in and email verified
- Verify item exists in lost_items or found_items
- Check Firestore rules allow create operation
- Check browser console for errors

### Email Not Sent
- Verify email address in claim is valid
- Check SMTP configuration (if using backend)
- Verify email domain whitelist settings
- Check spam folder

### WhatsApp Link Not Opening
- Verify phone number format with country code
- Ensure user has WhatsApp installed
- Check buildWhatsAppUrl() function in utils/whatsapp.js

### Cannot Approve Claim
- Verify you are the item owner
- Verify claim status is "pending" (not already approved/rejected)
- Check Firestore rules allow update
- Verify you're logged in with correct account

---

## 📚 API Reference

### Claims Service Functions

#### `submitClaim(claimData)`
Submits a new claim.
```javascript
const result = await submitClaim({
  claimantId: currentUser.uid,
  claimantName: currentUser.displayName,
  claimantEmail: currentUser.email,
  itemId: item.id,
  itemType: 'lost' | 'found',
  itemOwnerId: item.userId,
  claimMessage: 'Detailed claim message...',
  itemName: 'Item Name',
  category: 'Category'
});
// Returns: { success: true, claimId: '...' } or { success: false, error: '...' }
```

#### `approveClaim(claimId, contactInfo)`
Approves a pending claim.
```javascript
const result = await approveClaim(claimId, {
  name: 'Owner Name',
  email: 'owner@example.com',
  phone: '+1-555-0100',
  whatsapp: '+1-555-0100'
});
// Returns: { success: true } or { success: false, error: '...' }
```

#### `rejectClaim(claimId, rejectionReason)`
Rejects a pending claim.
```javascript
const result = await rejectClaim(claimId, 'Item already returned');
// Returns: { success: true } or { success: false, error: '...' }
```

---

## 📞 Support

For issues or questions:
1. Check browser console for error messages
2. Verify Firestore rules are properly deployed
3. Check Firebase project settings
4. Review security rules in `firestore.rules`
5. Contact admin at configured email address

---

## 🎯 Future Enhancements

Possible future features:
- [ ] AI-powered item matching (computer vision)
- [ ] Automated verification using item photos
- [ ] SMS notifications in addition to WhatsApp
- [ ] In-app messaging between claimant and owner
- [ ] Escrow system for valuable items
- [ ] Reputation/trust scores
- [ ] Multi-language support
- [ ] Integration with local police/lost & found services
- [ ] QR code generation for items
- [ ] Mobile app version

---

**Version:** 1.0  
**Last Updated:** February 12, 2026  
**Status:** ✅ Production Ready
