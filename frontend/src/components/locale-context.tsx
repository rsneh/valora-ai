'use client'; // This context provider and hook are for client components

import { Dictionary } from '@/lib/dictionaries';
import { translate } from '@/lib/utils';
import { AppLocale, getLocaleCookieName, getSupportedLocales } from '@/locales/config';
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { setCookie } from 'cookies-next/client';
import { useRouter } from 'next/navigation';


interface I18nContextType {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void; // For client-side locale changes
  t: (key: string, scope?: string) => string; // Simple translation function
  dictionary: Dictionary | null;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const useI18nContext = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18nContext must be used within an I18nProvider');
  }
  return context;
};

interface I18nProviderProps {
  children: ReactNode;
  initialLocale: AppLocale;
  initialDictionary: Dictionary; // Pass dictionary fetched on server
}

export const I18nProvider: React.FC<I18nProviderProps> = ({
  children,
  initialLocale,
  initialDictionary,
}) => {
  const router = useRouter();
  const [locale, setLocaleState] = useState<AppLocale>(initialLocale);
  const [dictionary, setDictionary] = useState<Dictionary | null>(initialDictionary);

  const supportedLocales = getSupportedLocales();
  const localeCookieParam = getLocaleCookieName();

  const setLocale = (newLocale: AppLocale) => {
    if (supportedLocales.includes(newLocale)) {
      setCookie(localeCookieParam, newLocale, { path: '/' }); // Set cookie for client-side use
      setLocaleState(newLocale); // Update context state immediately
      router.refresh();
    }
  };

  // Update dictionary if initialDictionary changes (e.g., after locale change and server reload)
  useEffect(() => {
    setDictionary(initialDictionary);
    setLocaleState(initialLocale); // Ensure context locale matches server-provided initial locale
  }, [initialLocale, initialDictionary]);


  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [locale]);

  const t = (key: string, scope?: string): string => translate(dictionary, key, scope);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dictionary }}>
      {children}
    </I18nContext.Provider>
  );
};
