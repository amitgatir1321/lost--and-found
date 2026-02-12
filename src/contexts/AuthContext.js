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
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

// 🔑 ADMIN EMAIL
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL || 'admin@lostfound.com';

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(undefined);
  const [userEmail, setUserEmail] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ SIGN UP (EMAIL/PASSWORD)
  const signup = async (email, password, name) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      await signOut(auth);
      throw new Error('This email is reserved for admin.');
    }

    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      name,
      email: user.email,
      whatsapp: '',
      role: 'user',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    try {
      await sendEmailVerification(user);
    } catch (err) {
      console.error('Verification email error:', err);
    }

    return user;
  };

  // ✅ GOOGLE SIGN-IN
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        whatsapp: '',
        role: 'user',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    return user;
  };

  // ✅ LOGIN
  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    if (!user.emailVerified) {
      await signOut(auth);
      throw new Error('Please verify your email before logging in.');
    }

    return user;
  };

  // ✅ RESET PASSWORD
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

  // ✅ UPDATE USER PROFILE (NAME + WHATSAPP)
  const updateUserProfile = async (name, whatsapp = null) => {
    if (!currentUser) throw new Error('No user logged in.');

    try {
      const updateData = {
        name,
        updatedAt: serverTimestamp()
      };

      // Only add whatsapp if it's provided and not empty
      if (whatsapp !== null && whatsapp !== undefined && whatsapp.trim()) {
        updateData.whatsapp = whatsapp.trim();
      }

      await setDoc(
        doc(db, 'users', currentUser.uid),
        updateData,
        { merge: true }
      );

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

  // ✅ UPDATE USER PASSWORD
  const updateUserPassword = async (newPassword) => {
    if (!currentUser) throw new Error('No user logged in.');

    try {
      await updatePassword(currentUser, newPassword);

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

  // ✅ AUTH STATE LISTENER
  useEffect(() => {
    let unsubscribeUserDoc = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setUserEmail(user?.email || null);
      setEmailVerified(user?.emailVerified || false);

      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
        unsubscribeUserDoc = null;
      }

      if (user) {
        const userRef = doc(db, 'users', user.uid);
        unsubscribeUserDoc = onSnapshot(
          userRef,
          (snap) => {
            if (snap.exists()) {
              setUserRole(snap.data().role || 'user');
            } else {
              setUserRole('user');
            }
          },
          (err) => {
            console.error('Role snapshot error:', err);
            setUserRole(null);
          }
        );
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
    isAdmin: userRole === 'admin',
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
      {!loading && children}
    </AuthContext.Provider>
  );
};
