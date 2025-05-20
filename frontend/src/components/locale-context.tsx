'use client'; // This context provider and hook are for client components

import { Dictionary } from '@/lib/dictionaries';
import { AppLocale, getSupportedLocales } from '@/locales/config';
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

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
  const [locale, setLocaleState] = useState<AppLocale>(initialLocale);
  const [dictionary, setDictionary] = useState<Dictionary | null>(initialDictionary);

  const supportedLocales = getSupportedLocales();

  // Function to change locale (e.g., called by a language switcher)
  // This would typically involve navigating with a query param to trigger middleware
  const setLocale = (newLocale: AppLocale) => {
    if (supportedLocales.includes(newLocale)) {
      // The actual navigation with query param will be handled by the switcher component
      // This function is more for updating context if locale changes via other means
      // or if you want to optimistically update and then navigate.
      // For now, we assume navigation handles the cookie and server-side reload.
      // On reload, initialLocale and initialDictionary will be updated.
      console.log("Locale change requested in context to:", newLocale, "(actual change via navigation)");
      // To reflect change immediately IF dictionary for newLocale is available client-side:
      // async function loadNewDict() {
      //   const newDict = await fetch(`/locales/${newLocale}.json`).then(res => res.json());
      //   setDictionary(newDict);
      //   setLocaleState(newLocale);
      // }
      // loadNewDict();
    }
  };

  // Update dictionary if initialDictionary changes (e.g., after locale change and server reload)
  useEffect(() => {
    setDictionary(initialDictionary);
    setLocaleState(initialLocale); // Ensure context locale matches server-provided initial locale
  }, [initialLocale, initialDictionary]);


  // Simple translation function (can be made more robust)
  const t = (key: string, scope?: string): string => {
    if (!dictionary) return key; // Fallback if dictionary not loaded
    let path = key.split('.');
    if (scope) {
      path = [scope, ...path];
    }

    let result: any = dictionary;
    for (const p of path) {
      result = result?.[p];
      if (result === undefined) {
        console.warn(`Translation key not found: ${scope ? scope + '.' : ''}${key}`);
        return key; // Return key if not found
      }
    }
    return typeof result === 'string' ? result : key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dictionary }}>
      {children}
    </I18nContext.Provider>
  );
};
