# 🚀 Quick Developer Reference

## File Locations

### Authentication & Context
- `src/contexts/AuthContext.js` - Main authentication logic
- `src/firebase/config.js` - Firebase configuration

### Pages (User Facing)
- `src/pages/Profile.js` - User profile with edit/password change dialogs
- `src/pages/ReportLost.js` - Report lost items (4-step form)
- `src/pages/ReportFound.js` - Report found items (4-step form)
- `src/pages/MyItems.js` - View & manage personal items

### Components
- `src/components/PrivateRoute.js` - Protect authenticated-only routes
- `src/components/AdminRoute.js` - Protect admin-only routes
- `src/components/EmailVerificationRoute.js` - Require email verification

### Security Rules
- `firestore.rules` - Firestore security rules
- `storage.rules` - Cloud Storage rules

---

## Key Functions in AuthContext

### Authentication
```javascript
const { 
  currentUser,           // Firebase user object
  userRole,              // 'user' or 'admin'
  userEmail,             // User's email
  emailVerified,         // Boolean
  isAdmin,               // Helper boolean
  signup,                // async (email, password, name)
  login,                 // async (email, password)
  logout,                // async
  resetPassword,         // async (email)
  resendVerificationEmail // async
} = useAuth();
```

### Profile Updates
```javascript
const {
  updateUserProfile,     // async (name) - Updates name in Firestore
  updateUserPassword     // async (newPassword) - Updates Firebase Auth password
} = useAuth();
```

---

## Firestore Collections Reference

### Users Collection
```javascript
collection(db, 'users')
document: {uid}
{
  uid: string,
  name: string,
  email: string,
  role: 'user' | 'admin',
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Lost Items Collection
```javascript
collection(db, 'lost_items')
document: {uid}_{timestamp}
{
  id: string,
  userId: string,
  itemName: string,
  category: string,
  description: string,
  location: string,
  date: string (YYYY-MM-DD),
  imageURL: string,
  status: 'pending' | 'matched' | 'resolved',
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Found Items Collection
```javascript
collection(db, 'found_items')
// Same structure as lost_items
```

---

## Common Code Patterns

### Check User Authentication
```javascript
const { currentUser } = useAuth();

if (!currentUser) {
  return <Navigate to="/login" />;
}
```

### Check Admin Status
```javascript
const { isAdmin } = useAuth();

if (!isAdmin) {
  return <Navigate to="/" />;
}
```

### Query User's Items
```javascript
const { currentUser } = useAuth();
const q = query(
  collection(db, 'lost_items'),
  where('userId', '==', currentUser.uid)
);
const snapshot = await getDocs(q);
```

### Update User Profile
```javascript
const { updateUserProfile } = useAuth();
await updateUserProfile(newName);
```

### Change Password
```javascript
const { updateUserPassword } = useAuth();
await updateUserPassword(newPassword);
```

### Create Lost Item
```javascript
await setDoc(doc(db, 'lost_items', docId), {
  id: docId,
  userId: currentUser.uid,
  itemName: formData.itemName,
  category: formData.category,
  description: formData.description,
  location: formData.location,
  date: formData.date,
  imageURL: imageURL,
  status: 'pending',
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
});
```

### Upload Image to Storage
```javascript
const imageRef = ref(storage, `lost_items/${uid}/${timestamp}_${filename}`);
await uploadBytes(imageRef, file);
const imageURL = await getDownloadURL(imageRef);
```

---

## Routes

### Public Routes
```
/                    - Home
/login               - Login
/register            - Register
/admin-login         - Admin Login
/auth/verify-email   - Email Verification
/how-it-works        - How It Works
/browse-items        - Browse Items
/item/:itemType/:id  - Item Detail
/setup-admin         - Admin Setup
/contact             - Contact
```

### Protected Routes (Login Required)
```
/profile             - User Profile
/report-lost         - Report Lost Item
/report-found        - Report Found Item
/my-items            - My Items
```

### Admin Routes (Admin Only)
```
/admin               - Admin Dashboard
```

---

## Material-UI Components Used

Common imports in pages:
```javascript
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Dialog,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Select,
  MenuItem,
  FormControl,
  InputAdornment
} from '@mui/material';
```

---

## Color Scheme

```javascript
// Primary Colors
#414A37 - Dark Green (Primary)
#99744A - Brown (Accent)
#DBC2A6 - Tan (Light Accent)

// Status Colors
#d32f2f - Red (Lost Items)
#2e7d32 - Green (Found/Resolved)
#F57C00 - Orange (Pending)
#1976D2 - Blue (Matched)

// Utility Colors
#FFF8F0 - Light Red Background
#F0FFF4 - Light Green Background
#FFF3E0 - Light Orange Background
#E3F2FD - Light Blue Background
```

---

## Error Handling Patterns

### In Components
```javascript
const [error, setError] = useState('');

try {
  // Do something
} catch (err) {
  setError(err.message || 'An error occurred');
}

// In JSX
{error && <Alert severity="error">{error}</Alert>}
```

### Firebase Auth Errors
```javascript
try {
  await login(email, password);
} catch (error) {
  if (error.code === 'auth/user-not-found') {
    setError('User not found');
  } else if (error.code === 'auth/wrong-password') {
    setError('Wrong password');
  } else {
    setError(error.message);
  }
}
```

---

## Testing Tips

### 1. Local Testing
```bash
npm start
```

### 2. Firebase Emulator
```bash
firebase emulators:start
```

### 3. Test Accounts
- Regular User: test@example.com / password123
- Admin: admin@example.com / adminpass123

### 4. Test Admin Creation
```javascript
// In Firestore Console, create:
users/{admin_uid}
{
  uid: "admin_uid",
  name: "Admin",
  email: "admin@example.com",
  role: "admin",
  createdAt: now,
  updatedAt: now
}
```

---

## Security Best Practices

### ✅ DO:
- ✅ Always check `currentUser` before accessing protected data
- ✅ Use Firestore security rules to enforce access
- ✅ Validate data on client AND server
- ✅ Use HTTPS for all requests
- ✅ Never store sensitive data in localStorage
- ✅ Update timestamps on every change

### ❌ DON'T:
- ❌ Expose Firebase keys in source code
- ❌ Trust client-side role checks alone
- ❌ Allow users to change their own role
- ❌ Store passwords in Firestore
- ❌ Bypass security rules with admin SDK
- ❌ Trust `updatedAt` without validation

---

## Future Enhancements

### Possible Features:
1. **Messaging System**
   - Collection: `messages`
   - Between item reporters and potential matches

2. **Reviews/Ratings**
   - Collection: `reviews`
   - User reliability ratings

3. **Item Matching**
   - Automatic matching algorithm
   - ML-based category suggestions

4. **Notifications**
   - FCM integration
   - Email notifications

5. **Search & Filter**
   - Full-text search
   - Filter by date range, category, location

6. **Export Data**
   - User data download
   - Report generation

---

## Database Backup Strategy

### Recommended:
1. Enable Firestore automated backups
2. Export data periodically
3. Test restore procedures

```bash
# Export Firestore data
gcloud firestore export gs://your-bucket/backup

# Import Firestore data
gcloud firestore import gs://your-bucket/backup
```

---

## Monitoring & Analytics

### Track:
- User signups
- Item reports (lost & found)
- Item recovery rate
- User engagement
- Error rates

### Tools:
- Firebase Analytics
- Firebase Crashlytics
- Custom logging

---

## Support & Documentation

### Official Docs:
- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Material-UI Docs](https://mui.com)
- [React Router Docs](https://reactrouter.com)

### Community:
- Stack Overflow
- Firebase Support
- GitHub Issues

---

## Version Information

- React: 18.2.0
- Firebase: 9.23.0
- Material-UI: 7.3.6
- React Router: 6.30.2

---

Last Updated: January 30, 2026
Implementation Status: ✅ COMPLETE
