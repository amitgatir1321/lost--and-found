// ⚠️ SECURITY WARNING ⚠️
// These functions are DISABLED for security reasons.
// Normal users cannot change roles via client-side code.
// Firestore security rules prevent role modifications by non-admins.
// 
// To make a user admin:
// 1. Use Firebase Admin SDK (server-side)
// 2. Or use Firebase Console directly
// 3. Or use a secure Cloud Function with proper authentication
//
// Example Cloud Function approach:
// exports.makeAdmin = functions.https.onCall(async (data, context) => {
//   if (!context.auth || context.auth.token.admin !== true) {
//     throw new functions.https.HttpsError('permission-denied', 'Only admins can make users admin');
//   }
//   await admin.firestore().collection('users').doc(data.uid).update({ role: 'admin' });
// });

import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';

// DISABLED: Make current logged-in user an admin
export const makeCurrentUserAdmin = async () => {
  console.error('⚠️ Security Error: This function is disabled. Normal users cannot assign admin roles.');
  console.error('Please use Firebase Admin SDK or Firebase Console to assign admin roles.');
  return;
  
  // Original code disabled for security
  // const user = auth.currentUser;
  // if (!user) {
  //   console.error('No user is logged in');
  //   return;
  // }
  // 
  // try {
  //   const userRef = doc(db, 'users', user.uid);
  //   await updateDoc(userRef, {
  //     role: 'admin'
  //   });
  //   console.log(`✅ User ${user.email} is now an admin! Please refresh the page.`);
  // } catch (error) {
  //   console.error('Error making user admin:', error);
  // }
};

// DISABLED: Make any user admin by UID
export const makeUserAdmin = async (uid) => {
  console.error('⚠️ Security Error: This function is disabled. Normal users cannot assign admin roles.');
  console.error('Please use Firebase Admin SDK or Firebase Console to assign admin roles.');
  return;
  
  // Original code disabled for security
  // try {
  //   const userRef = doc(db, 'users', uid);
  //   const userDoc = await getDoc(userRef);
  //   
  //   if (!userDoc.exists()) {
  //     console.error('User not found');
  //     return;
  //   }
  //   
  //   await updateDoc(userRef, {
  //     role: 'admin'
  //   });
  //   console.log(`✅ User with UID ${uid} is now an admin!`);
  // } catch (error) {
  //   console.error('Error making user admin:', error);
  // }
};

// DISABLED: Make user admin by email
export const makeUserAdminByEmail = async (email) => {
  console.error('⚠️ Security Error: This function is disabled. Normal users cannot assign admin roles.');
  console.error('Please use Firebase Admin SDK or Firebase Console to assign admin roles.');
  return;
  
  // Original code disabled
  // console.log('Search for user with email:', email);
  // console.log('Then use makeUserAdmin(uid) with their UID');
};
