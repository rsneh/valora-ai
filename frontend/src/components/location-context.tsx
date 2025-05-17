"use client"

import { getLocation } from '@/services/api/location';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from './auth/auth-context';
import { Location } from '@/types/location';

interface LocationContextType {
  location: Location | null;
  loading: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function useLocation(): LocationContextType {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within an LocationProvider');
  }
  return context;
}

interface LocationProviderProps {
  children: ReactNode;
}

export function LocationProvider({ children }: LocationProviderProps) {
  const { firebaseIdToken } = useAuth();
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const handleUseCurrentLocation = async () => {
      if (navigator.geolocation) {
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const locationData = await getLocation(firebaseIdToken!, latitude, longitude);
              setLocation(locationData);
            } catch (error) {
              console.error("Reverse geocoding failed:", error);
            } finally {
              setLoading(false);
            }
          },
          async (error) => {
            console.warn("Geolocation error:", error);
            try {
              const locationData = await getLocation(firebaseIdToken!);
              setLocation(locationData);
            } catch (error) {
              console.error("Get location failed:", error);
            } finally {
              setLoading(false);
            }
          }
        );
      } else {
        // Geolocation not supported by browser
        console.error("Geolocation is not supported by this browser.");
      }
    };
    handleUseCurrentLocation();
  }, []);

  return (
    <LocationContext.Provider value={{ location, loading }}>
      {children}
    </LocationContext.Provider>
  );
}

