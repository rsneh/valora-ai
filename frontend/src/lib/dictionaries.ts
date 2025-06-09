import 'server-only'

import { AppLocale, getDefaultLocale, getLocaleCookieName, getSupportedLocales } from '@/locales/config';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

// Define a type for our dictionary
export type Dictionary = {
  [key: string]: string | Dictionary;
};

const dictionaries: Record<AppLocale, () => Promise<Dictionary>> = {
  // Ensure the imported module's default export is spread into a new plain object
  en: () => import('@/dictionaries/en.json').then((module) => ({ ...module.default } as Dictionary)),
  he: () => import('@/dictionaries/he.json').then((module) => ({ ...module.default } as Dictionary)),
};

export const getDictionary = async (locale: AppLocale): Promise<Dictionary> => {
  const defaultLocale = getDefaultLocale();
  const loadFn = dictionaries[locale] || dictionaries[defaultLocale];
  try {
    const dictionaryModule = await loadFn();
    // Ensure it's a plain object. The spread in the loader function should handle this.
    // For extra safety, you could do another spread here, but it's likely redundant.
    // return { ...dictionaryModule }; 
    return dictionaryModule;
  } catch (error) {
    console.error(`Error loading dictionary for locale '${locale}':`, error);
    // Fallback to default dictionary if specific one fails to load for any reason
    if (locale !== defaultLocale) {
      console.warn(`Falling back to default locale '${defaultLocale}' due to error.`);
      const defaultLoadFn = dictionaries[defaultLocale];
      try {
        return await defaultLoadFn();
      } catch (defaultError) {
        console.error(`FATAL: Error loading default dictionary for locale '${defaultLocale}':`, defaultError);
        // If default also fails, return a minimal or empty dictionary to prevent app crash
        // This should be a very rare case.
        return {};
      }
    }
    // If it was already the default locale that failed
    return {};
  }
};

export async function getLocaleFromRequest(request?: NextRequest): Promise<AppLocale> {
  // For middleware or API routes that have direct access to NextRequest
  const localeCookieName = getLocaleCookieName();
  const supportedLocales = getSupportedLocales();
  const defaultLocale = getDefaultLocale();

  if (request) {
    const cookieStore = request.cookies;
    const locale = cookieStore.get(localeCookieName)?.value as AppLocale | undefined;
    if (locale && supportedLocales.includes(locale)) {
      return locale;
    }
    // Add Accept-Language header parsing here if desired as a fallback
  }

  // For Server Components (Pages, Layouts)
  try {
    const cookieStore = await cookies();
    const locale = cookieStore.get(localeCookieName)?.value as AppLocale | undefined;
    if (locale && supportedLocales.includes(locale)) {
      return locale;
    }
  } catch (error: Error | any) {
    console.log("Error accessing cookies in Server Component:", error.message);
    return defaultLocale;
  }
  return defaultLocale;
}
