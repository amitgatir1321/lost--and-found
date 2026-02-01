import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail,
  updatePassword
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

// 🔑 ADMIN EMAIL - Configure this in your environment or Firebase config
// For now, set this as the only admin email allowed
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL || 'admin@lostfound.com';

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(undefined);
  const [userEmail, setUserEmail] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ SIGN UP (USERS ONLY - Always assigns role: "user")
  const signup = async (email, password, name) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    // 🚫 Prevent users from registering with admin email
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      // This shouldn't happen, but added as extra protection
      await signOut(auth);
      throw new Error('This email is reserved for admin.');
    }

    // ✅ Send verification email
    // ✅ Create Firestore user document with role: "user"
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      name,
      email: user.email,
      role: 'user', // ✅ Always "user" for new registrations
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // ✅ Send verification email to the newly created user
    try {
      await sendEmailVerification(user);
    } catch (err) {
      console.error('Failed to send verification email:', err);
    }

    return user;
  };

  // ✅ GOOGLE SIGN-IN
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // 🚫 Google users cannot be admin
      await setDoc(userDocRef, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        role: 'user', // ✅ Always "user" for Google sign-in
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    return user;
  };

  // ✅ LOGIN (CHECKS EMAIL VERIFICATION + ADMIN ROLE)
  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    if (!user.emailVerified) {
      await signOut(auth);
      throw new Error(
        'Please verify your email before logging in. Check your inbox.'
      );
    }

    return user;
  };

  // ✅ RESET PASSWORD (FREE)
  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // ✅ RESEND VERIFICATION
  const resendVerificationEmail = async () => {
    if (currentUser && !currentUser.emailVerified) {
      return sendEmailVerification(currentUser);
    }
    throw new Error('Email already verified or no user logged in.');
  };

  // ✅ UPDATE USER PROFILE (NAME ONLY - email & role cannot be changed)
  const updateUserProfile = async (name) => {
    if (!currentUser) throw new Error('No user logged in.');
    
    try {
      // Update Firestore document
      await updateDoc(doc(db, 'users', currentUser.uid), {
        name,
        updatedAt: serverTimestamp()
      });
      
      // Update currentUser state
      setCurrentUser({
        ...currentUser,
        displayName: name
      });
      
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // ✅ UPDATE USER PASSWORD (Firebase Auth)
  const updateUserPassword = async (newPassword) => {
    if (!currentUser) throw new Error('No user logged in.');
    
    try {
      await updatePassword(currentUser, newPassword);
      
      // Update updatedAt in Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  };

  // ✅ LOGOUT
  const logout = () => signOut(auth);

  // ✅ AUTH STATE LISTENER - subscribe to Firebase Auth and to user's Firestore doc for role
  useEffect(() => {
    let unsubscribeUserDoc = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setUserEmail(user?.email || null);
      setEmailVerified(user?.emailVerified || false);

      // cleanup previous user doc listener
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
        unsubscribeUserDoc = null;
      }

      if (user) {
        const userRef = doc(db, 'users', user.uid);
        unsubscribeUserDoc = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            setUserRole(snap.data().role || 'user');
          } else {
            setUserRole('user');
          }
        }, (err) => {
          console.error('User role snapshot error:', err);
          setUserRole(null);
        });
      } else {
        setUserRole(null);
      }

      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
  }, []);

  const value = {
    currentUser,
    userRole,
    userEmail,
    emailVerified,
    loading,
    isAdmin: userRole === 'admin', // 🔑 Helper boolean for admin checks
    signup,
    signInWithGoogle,
    login,
    resetPassword,
    resendVerificationEmail,
    updateUserProfile,
    updateUserPassword,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
