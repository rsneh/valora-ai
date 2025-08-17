"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithPopup,
  UserCredential,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, googleProvider, twitterProvider, facebookProvider } from '@/services/firebase';
import { getMyUser, createUser, updateMyUser } from '@/services/api/user';
import { User } from '@/types/user';

export type RegisterDialogDetails = {
  title: string;
  description: string;
  onSuccess?: () => void;
}

interface AuthContextType {
  currentUser: User | null;
  firebaseIdToken: string | null;
  loadingAuth: boolean;
  showRegisterDialog: boolean;
  showLoginDialog: boolean;
  registerDialogDetails?: RegisterDialogDetails;
  updateProfile: ({ fullName }: { fullName?: string; }) => Promise<void>
  setShowRegisterDialog: (value: boolean) => void;
  setRegisterDialogDetails: (details: RegisterDialogDetails) => void;
  setShowLoginDialog: (value: boolean) => void;
  resetPassword: (email: string) => void;
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [firebaseIdToken, setFirebaseIdToken] = useState<string | null>(null);
  const [showRegisterDialog, setShowRegisterDialog] = useState<boolean>(false);
  const [showLoginDialog, setShowLoginDialog] = useState<boolean>(false);
  const [registerDialogDetails, setRegisterDialogDetails] = useState<RegisterDialogDetails>();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken(true);
          setFirebaseIdToken(token);
          try {
            const _backendUser = await getMyUser(token);
            setCurrentUser(_backendUser);
          } catch (error) {
            // Assuming a 404 error means the user doesn't exist in the backend
            const newUser = await createUser({ uid: user.uid, full_name: user.displayName ?? undefined }, token);
            setCurrentUser(newUser);
          }
        } catch (error) {
          console.error("Error during auth process:", error);
          setFirebaseIdToken(null);
          setCurrentUser(null);
          // Optionally sign out the user if token refresh fails critically
          await firebaseSignOut(auth);
        }
      } else {
        setFirebaseIdToken(null);
        setCurrentUser(null);
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


  const signInWithGoogle = async (): Promise<UserCredential> => signInWithPopup(auth, googleProvider);
  const signInWithFacebook = async (): Promise<UserCredential> => signInWithPopup(auth, facebookProvider);
  const signInWithTwitter = async (): Promise<UserCredential> => signInWithPopup(auth, twitterProvider);
  const resetPassword = async (email: string): Promise<void> => sendPasswordResetEmail(auth, email);
  const signInEmailAndPassword = async (
    email: string,
    password: string
  ): Promise<UserCredential> => signInWithEmailAndPassword(auth, email, password);

  const updateProfile = async ({ fullName }: { fullName?: string; }) => {
    if (!firebaseIdToken) return;
    await updateMyUser({ full_name: fullName }, firebaseIdToken);
  };

  const value: AuthContextType = {
    currentUser,
    firebaseIdToken,
    loadingAuth: loading,
    showRegisterDialog,
    showLoginDialog,
    registerDialogDetails,
    logout,
    updateProfile,
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter,
    signInEmailAndPassword,
    resetPassword,
    setRegisterDialogDetails,
    setShowRegisterDialog,
    setShowLoginDialog
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}