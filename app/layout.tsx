import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ANIMOV - Your Entertainment Hub",
  description: "Discover and track movies, TV series, anime, manga, and books all in one place",
  keywords: ["movies", "tv series", "anime", "manga", "books", "entertainment", "tracking"],
  authors: [{ name: "ANIMOV Team" }],
  creator: "ANIMOV",
  publisher: "ANIMOV",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://animov.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ANIMOV - Your Entertainment Hub",
    description: "Discover and track movies, TV series, anime, manga, and books all in one place",
    url: "https://animov.app",
    siteName: "ANIMOV",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ANIMOV - Your Entertainment Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ANIMOV - Your Entertainment Hub",
    description: "Discover and track movies, TV series, anime, manga, and books all in one place",
    images: ["/og-image.jpg"],
    creator: "@animov_app",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1e1b4b" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">{children}</div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
