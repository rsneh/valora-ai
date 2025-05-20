const localesList = ['en', 'he'] as const; // Supported locales
const defaultLocaleConst = 'en' as const; // Default locale
const localeCookieName = 'VALORA_LOCALE'; // Define cookie name
const localeQueryParam = 'lang'; // Define query parameter name

export type AppLocale = typeof localesList[number];

export function getSupportedLocales(): ReadonlyArray<AppLocale> {
  return localesList;
}

export function getDefaultLocale(): AppLocale {
  return defaultLocaleConst;
}

export function getLocaleCookieName(): string {
  return localeCookieName;
}

export function getLocaleQueryParam(): string {
  return localeQueryParam;
}

export const getLocaleClientSide = (): AppLocale => {
  if (typeof window !== 'undefined') {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${localeCookieName}=`))
      ?.split('=')[1] as AppLocale | undefined;
    const supportedLocales = getSupportedLocales();
    if (cookieValue && supportedLocales.includes(cookieValue)) {
      return cookieValue;
    }
  }
  return getDefaultLocale();
};