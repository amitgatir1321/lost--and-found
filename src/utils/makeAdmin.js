// Run this in the browser console when logged in to make a user admin
// 1. Login to your app
// 2. Open browser console (F12)
// 3. Copy and paste this code
// 4. Run: makeAdmin('user-uid-here') or makeCurrentUserAdmin()

import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';

// Make current logged-in user an admin
export const makeCurrentUserAdmin = async () => {
  const user = auth.currentUser;
  if (!user) {
    console.error('No user is logged in');
    return;
  }
  
  try {
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      role: 'admin'
    });
    console.log(`✅ User ${user.email} is now an admin! Please refresh the page.`);
  } catch (error) {
    console.error('Error making user admin:', error);
  }
};

// Make any user admin by UID
export const makeUserAdmin = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.error('User not found');
      return;
    }
    
    await updateDoc(userRef, {
      role: 'admin'
    });
    console.log(`✅ User with UID ${uid} is now an admin!`);
  } catch (error) {
    console.error('Error making user admin:', error);
  }
};

// Make user admin by email
export const makeUserAdminByEmail = async (email) => {
  // Note: You'll need to implement a query to find user by email
  console.log('Search for user with email:', email);
  console.log('Then use makeUserAdmin(uid) with their UID');
};
