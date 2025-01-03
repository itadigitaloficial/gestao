import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCDyC0pBxmKNEaAIHryZd22rEJD-SqJS_Q",
  authDomain: "gestaoita-1926e.firebaseapp.com",
  projectId: "gestaoita-1926e",
  storageBucket: "gestaoita-1926e.firebasestorage.app",
  messagingSenderId: "981790273400",
  appId: "1:981790273400:web:bf83c74a90b1408543228d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app); 