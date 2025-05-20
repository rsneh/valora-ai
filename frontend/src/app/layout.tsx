import type { Metadata, ResolvingMetadata } from 'next';
import { GoogleTagManager } from '@next/third-parties/google'
import { Inter } from "next/font/google"
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

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.valorra.net"

const inter = Inter({ subsets: ["latin"] })

const metadata = {
  icons: {
    icon: [
      { rel: "icon”", type: "image/png", sizes: "16x16", url: "/favicon-16x16.png" },
      { rel: "icon”", type: "image/png", sizes: "32x32", url: "/favicon-32x32.png" },
      { rel: "icon”", type: "image/png", sizes: "96x96", url: "/favicon-96x96.png" },
    ],
  },
}

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
      template: `%s | ${t("site.name")}`, // Template for child page titles
    },
    description: t("site.description"),
    openGraph: {
      title: t("site.title"),
      description: t("site.description"),
      siteName: t("site.name"),
      images: [{ url: '/images/og-image.png' }], // Add your default OG image
      locale: locale,
      type: 'website',
    },
    icons: {
      ...metadata.icons,
    }
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

  return (
    <html lang={locale} dir={locale === "he" ? "rtl" : "ltr"} suppressHydrationWarning>
      {isProduction && (
        <GoogleTagManager gtmId="GTM-WFNRK2VR" />
      )}
      <body className={inter.className}>
        <Loader />
        <I18nProvider initialLocale={locale} initialDictionary={dictionary}>
          <ThemeProvider>
            <AuthProvider>
              <LocationProvider>
                {children}
              </LocationProvider>
            </AuthProvider>
            <Toaster />
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
