"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
  signInWithEmailAndPassword,
  type User as FirebaseUser,
  FacebookAuthProvider,
  TwitterAuthProvider,
} from 'firebase/auth';
import { auth } from '@/services/firebase';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  firebaseIdToken: string | null;
  loadingAuth: boolean;
  showRegisterDialog: boolean;
  showLoginDialog: boolean;
  setShowRegisterDialog: (value: boolean) => void;
  setShowLoginDialog: (value: boolean) => void;
  signInWithGoogle: () => Promise<UserCredential>;
  signInWithFacebook: () => Promise<UserCredential>;
  signInWithTwitter: () => Promise<UserCredential>;
  signInEmailAndPassword: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [firebaseIdToken, setFirebaseIdToken] = useState<string | null>(null);
  const [showRegisterDialog, setShowRegisterDialog] = useState<boolean>(false);
  const [showLoginDialog, setShowLoginDialog] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const token = await user.getIdToken(true);
          setFirebaseIdToken(token);
        } catch (error) {
          console.error("Error getting ID token:", error);
          setFirebaseIdToken(null);
          // Optionally sign out the user if token refresh fails critically
          await firebaseSignOut(auth);
        }
      } else {
        setFirebaseIdToken(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      // currentUser and firebaseIdToken will be set to null by onAuthStateChanged
    } catch (error) {
      console.error("Error signing out:", error);
      // Handle sign-out error (e.g., display a message to the user)
    }
  };

  const signInWithGoogle = async (): Promise<UserCredential> => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const signInEmailAndPassword = async (
    email: string,
    password: string
  ): Promise<UserCredential> => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithFacebook = async (): Promise<UserCredential> => {
    const provider = new FacebookAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const signInWithTwitter = async (): Promise<UserCredential> => {
    const provider = new TwitterAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const value: AuthContextType = {
    currentUser,
    firebaseIdToken,
    loadingAuth: loading,
    showRegisterDialog,
    showLoginDialog,
    logout,
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter,
    signInEmailAndPassword,
    setShowRegisterDialog,
    setShowLoginDialog
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}