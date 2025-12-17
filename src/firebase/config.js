import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDbs3oiqtzcOkxUzEokwvTU_Fo1gNE7XXg",
  authDomain: "lost-and-found-7eb18.firebaseapp.com",
  projectId: "lost-and-found-7eb18",
  storageBucket: "lost-and-found-7eb18.firebasestorage.app",
  messagingSenderId: "185986458650",
  appId: "1:185986458650:web:0fec3389e2ce06b6c41da3",
  measurementId: "G-WHDMLGB5BG"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
export default app;
