import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [activeClassId, setActiveClassId] = useState(null);
  const [activeClassName, setActiveClassName] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setRole(data.role || 'user');
            setActiveClassId(data.activeClassId || null);
            setActiveClassName(data.activeClassName || null);
          } else {
            await setDoc(docRef, {
              email: currentUser.email,
              role: 'user',
              createdAt: new Date().toISOString()
            });
            setRole('user');
            setActiveClassId(null);
            setActiveClassName(null);
          }
        } catch (error) {
          console.error("Error fetching user data: ", error);
          setRole('user');
        }
      } else {
        setUser(null);
        setRole(null);
        setActiveClassId(null);
        setActiveClassName(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Called after user successfully joins or switches a class
  const switchClass = async (classId, className) => {
    if (!user) return;
    setActiveClassId(classId);
    setActiveClassName(className);
    await setDoc(doc(db, 'users', user.uid), { activeClassId: classId, activeClassName: className }, { merge: true });
  };

  const value = {
    user,
    role,
    activeClassId,
    activeClassName,
    switchClass,
    isAdmin: role === 'admin' || role === 'superadmin',
    isSuperAdmin: role === 'superadmin'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
