import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { app } from './firebase';

const AuthContext = createContext({
  currentUser: null,
  isAuthReady: false,
  login: () => {},
  logout: () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthReady(true); // 인증 상태 로딩 완료
    });
    return unsubscribe;
  }, [auth]);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth).then(() => setCurrentUser(null));
  };

  const value = {
    currentUser,
    isAuthReady,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
