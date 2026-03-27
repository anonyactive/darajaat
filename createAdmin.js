import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdmin() {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, 'admin@darajaat.com', 'admin123456');
    const user = userCredential.user;
    
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      role: 'superadmin',
      createdAt: new Date().toISOString()
    });
    
    console.log("SUPERADMIN_CREATED_SUCCESS");
    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
       console.log("ALREADY_EXISTS");
    } else {
       console.error("ERROR:", error.message);
    }
    process.exit(1);
  }
}

createAdmin();
