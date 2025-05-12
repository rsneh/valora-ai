import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import type React from "react" // Import React
import { AuthProvider } from "@/contexts/AuthContext"
// import { AuthProvider } from "@/contexts/AuthContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AidSell: AI-Powered Marketplace for Effortless Selling",
  description: "Sell your used electronics, gadgets, and more with ease on AidSell! Our AI helps you create perfect listings from photos, suggests categories, and streamlines your selling process.",
  icons: {
    icon: [
      { rel: "icon”", type: "image/png", sizes: "16x16", url: "/favicon-16x16.png" },
      { rel: "icon”", type: "image/png", sizes: "32x32", url: "/favicon-32x32.png" },
      { rel: "icon”", type: "image/png", sizes: "96x96", url: "/favicon-96x96.png" },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
