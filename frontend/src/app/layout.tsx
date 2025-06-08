import type { Metadata } from 'next';
import { GoogleTagManager } from '@next/third-parties/google'
import { Rubik } from "next/font/google"
import "./globals.css"
import type React from "react"
import Loader from "@/components/loader"
import { AuthProvider } from "@/components/auth/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { LocationProvider } from "@/components/location-context"
import { getDictionary, getLocaleFromRequest } from "@/lib/dictionaries"
import { I18nProvider } from "@/components/locale-context"
import { translate } from '@/lib/utils';
import { getCategories } from '@/services/api/categories';
import { CategoriesProvider } from '@/components/categories-context';
import { FavoritesProvider } from '@/hooks/use-favorites';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.valorra.net"

const rubik = Rubik({ subsets: ["latin", "hebrew"] })

export async function generateMetadata(
  // props: { params: { locale?: AppLocale } }, // locale might not be in params here
  // parent: ResolvingMetadata // Optional: to access parent metadata
): Promise<Metadata> {
  const locale = await getLocaleFromRequest(); // Get current locale for root
  const dictionary = await getDictionary(locale);
  const t = (key: string, scope?: string): string => translate(dictionary, key, scope);

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: t("site.title"),
      template: `%s | ${t("site.name")}`,
    },
    description: t("site.description"),
    openGraph: {
      title: t("site.title"),
      description: t("site.description"),
      siteName: t("site.name"),
      images: [{ url: '/images/og-image.jpg' }],
      locale: locale,
      type: 'website',
    },
  };
}

const isProduction = process.env.NODE_ENV === "production"

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocaleFromRequest();
  const dictionary = await getDictionary(locale);
  const categories = await getCategories(locale);

  return (
    <html lang={locale} dir={locale === "he" ? "rtl" : "ltr"} suppressHydrationWarning>
      {isProduction && (
        <GoogleTagManager gtmId="GTM-WFNRK2VR" />
      )}
      <body className={rubik.className}>
        <Loader />
        <I18nProvider initialLocale={locale} initialDictionary={dictionary}>
          <ThemeProvider>
            <AuthProvider>
              <LocationProvider>
                <CategoriesProvider categories={categories}>
                  <FavoritesProvider>
                    {children}
                  </FavoritesProvider>
                </CategoriesProvider>
              </LocationProvider>
            </AuthProvider>
            <Toaster />
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
