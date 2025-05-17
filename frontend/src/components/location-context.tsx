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
            console.log("Current position:", position);

            const { latitude, longitude } = position.coords;
            // Now call your reverse geocoding function
            try {
              const locationData = await getLocation(latitude, longitude, firebaseIdToken!);
              console.log("Location from reverse geocoding:", locationData);
              setLocation(locationData);
            } catch (error) {
              console.error("Reverse geocoding failed:", error);
              // Handle error (e.g., show a message to the user)
            } finally {
              setLoading(false);
            }
          },
          (error) => {
            console.error("Error getting location:", error);
            // Handle errors (PERMISSION_DENIED, POSITION_UNAVAILABLE, TIMEOUT)
            // e.g., show a message like "Could not get your location. Please enter manually."
            setLoading(false);
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

