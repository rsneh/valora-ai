"use client"

import { useState, useEffect, createContext, ReactNode, useContext } from 'react';

const FAVORITES_STORAGE_KEY = 'user_favorites';
const initialFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY) ? JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY)!) : []

interface FavoritesContextType {
  favorites: number[];
  toggleFavorite: (productId: number) => void;
  isFavorite: (productId: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<number[]>(initialFavorites);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }, [favorites]);

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
