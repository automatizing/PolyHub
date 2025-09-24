import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: '%s | PolyHub',
    default: 'PolyHub | Prediction Markets Platform',
  },
  description: 'The ultimate prediction markets information hub. Monitor real-world events, track forecasting trends, and connect with fellow predictors.',
  keywords: ['prediction markets', 'trading', 'forecasting', 'polymarket', 'betting'],
  authors: [{ name: 'PolyHub Team' }],
  creator: 'PolyHub',
  metadataBase: new URL('https://polyhub.app/'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://polyhub.app/',
    siteName: 'PolyHub',
    title: 'PolyHub | Prediction Markets Platform',
    description: 'The ultimate prediction markets information hub. Monitor real-world events, track forecasting trends, and connect with fellow predictors.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PolyHub | Prediction Markets Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PolyHub | Prediction Markets Platform',
    description: 'The ultimate prediction markets information hub. Monitor real-world events, track forecasting trends, and connect with fellow predictors.',
    images: ['/og-image.png'],
    creator: '@polyhub',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  alternates: {
    canonical: 'https://polyhub.app/',
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/poly.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
