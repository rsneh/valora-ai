import { NextRequest, NextResponse } from 'next/server';
import { getLocaleQueryParam, getLocaleCookieName, getSupportedLocales, AppLocale } from './locales/config';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const queryParamName = getLocaleQueryParam();
  const cookieName = getLocaleCookieName();
  const supportedLocales = getSupportedLocales();

  let localeToSet: AppLocale | undefined = undefined;

  // 1. Check for locale in query parameter
  const queryLocale = request.nextUrl.searchParams.get(queryParamName) as AppLocale | null;

  if (queryLocale && supportedLocales.includes(queryLocale)) {
    localeToSet = queryLocale;
    // Set cookie if query param is present and valid
    response.cookies.set(cookieName, localeToSet, { path: '/' });
  } else {
    // 2. If no valid query param, check for existing cookie
    const cookieLocale = request.cookies.get(cookieName)?.value as AppLocale | undefined;
    if (cookieLocale && supportedLocales.includes(cookieLocale)) {
      localeToSet = cookieLocale;
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};