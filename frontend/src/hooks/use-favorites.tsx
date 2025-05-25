"use client"

import { useState, useEffect, useMemo, createContext, ReactNode, useContext } from 'react';
import { useAuth } from '@/components/auth/auth-context';

const FAVORITES_STORAGE_KEY = 'user_favorites';

interface FavoritesContextType {
  favorites: number[];
  toggleFavorite: (productId: number) => void;
  isFavorite: (productId: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();

  const storageKey = useMemo(() => currentUser
    ? `${FAVORITES_STORAGE_KEY}_${currentUser.uid}`
    : FAVORITES_STORAGE_KEY, [currentUser]);

  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem(storageKey);
      console.log({ savedFavorites });

      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }, [favorites, storageKey]);

  const toggleFavorite = (productId: number) => {
    const oldFavorites = [...favorites];
    let newFavorites: number[] = [];
    if (oldFavorites.includes(productId)) {
      newFavorites = oldFavorites.filter((id) => id !== productId);
    } else {
      newFavorites = [...oldFavorites, productId];
    }
    setFavorites(newFavorites);
  };

  const isFavorite = (productId: number): boolean => {
    return favorites.includes(productId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
