import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCprAN5XsCtf256D2sa4eUl7QJAXLIPVJU",
  authDomain: "darajaatapp.firebaseapp.com",
  projectId: "darajaatapp",
  storageBucket: "darajaatapp.firebasestorage.app",
  messagingSenderId: "252226300695",
  appId: "1:252226300695:web:f6a75f550401410af52552",
  measurementId: "G-PJ131YSSWJ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
