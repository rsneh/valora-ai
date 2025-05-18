"use client"

import { getLocation } from '@/services/api/location';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from './auth/auth-context';
import { Location } from '@/types/location';
import Cookies from 'js-cookie';

interface LocationContextType {
  location: Location | null;
  loading: boolean;
  setLocation: (location: Location | null) => void;
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
  const [location, setLocationState] = useState<Location | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedLocation = Cookies.get('userLocation');
    if (storedLocation) {
      setLocationState(JSON.parse(storedLocation));
      setLoading(false);
    } else {
      const handleUseCurrentLocation = async () => {
        if (navigator.geolocation) {
          setLoading(true);
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              try {
                const locationData = await getLocation(firebaseIdToken!, latitude, longitude);
                setLocationState(locationData);
                Cookies.set('userLocation', JSON.stringify(locationData), { expires: 7 }); // Save to cookie for 7 days
              } catch (error) {
                console.error("Reverse geocoding failed:", error);
              } finally {
                setLoading(false);
              }
            },
            async (error) => {
              console.warn("Geolocation error:", error);
              try {
                // Fallback to IP-based location if geolocation fails or is denied
                const locationData = await getLocation(firebaseIdToken!);
                setLocationState(locationData);
                Cookies.set('userLocation', JSON.stringify(locationData), { expires: 7 }); // Save to cookie for 7 days
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
          // Attempt to get location by IP as a fallback
          try {
            const locationData = await getLocation(firebaseIdToken!);
            setLocationState(locationData);
            Cookies.set('userLocation', JSON.stringify(locationData), { expires: 7 }); // Save to cookie for 7 days
          } catch (error) {
            console.error("Get location by IP failed:", error);
          } finally {
            setLoading(false);
          }
        }
      };
      handleUseCurrentLocation();
    }
  }, [firebaseIdToken]);

  const setLocation = (newLocation: Location | null) => {
    setLocationState(newLocation);
    if (newLocation) {
      Cookies.set('userLocation', JSON.stringify(newLocation), { expires: 7 });
    } else {
      Cookies.remove('userLocation');
    }
  };

  return (
    <LocationContext.Provider value={{ location, loading, setLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

