import type { Metadata } from "next"
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

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Valora: AI for Effortless Selling",
  description: "Sell your used electronics, gadgets, and more with ease on Valora! Our AI helps you create perfect listings from photos, suggests categories, and streamlines your selling process.",
  icons: {
    icon: [
      { rel: "icon”", type: "image/png", sizes: "16x16", url: "/favicon-16x16.png" },
      { rel: "icon”", type: "image/png", sizes: "32x32", url: "/favicon-32x32.png" },
      { rel: "icon”", type: "image/png", sizes: "96x96", url: "/favicon-96x96.png" },
    ],
  },
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
