import type { Metadata, Viewport } from 'next'
import { fontVariables } from '@/styles/fonts'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Felice Endomarketing',
    template: '%s | Felice Endomarketing',
  },
  description:
    'Sistema de captação de leads e endomarketing do Complexo Felice. Preencha o formulário de interesses e conheça nossos profissionais.',
  applicationName: 'Felice Endomarketing',
  authors: [{ name: 'Complexo Felice' }],
  generator: 'Next.js',
  keywords: [
    'Complexo Felice',
    'endomarketing',
    'cirurgia plástica',
    'dermatologia',
    'estética',
    'Uberlândia',
  ],
  referrer: 'origin-when-cross-origin',
  creator: 'Complexo Felice',
  publisher: 'Complexo Felice',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    siteName: 'Felice Endomarketing',
    title: 'Felice Endomarketing',
    description:
      'Sistema de captação de leads e endomarketing do Complexo Felice.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Complexo Felice',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Felice Endomarketing',
    description:
      'Sistema de captação de leads e endomarketing do Complexo Felice.',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: false, // Sistema interno, não indexar
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  icons: {
    icon: [
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/icons/safari-pinned-tab.svg',
        color: '#c29863',
      },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Felice',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#c29863' },
    { media: '(prefers-color-scheme: dark)', color: '#322b29' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Importante para kiosk
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Preconnect para performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* DNS prefetch para Supabase */}
        <link
          rel="dns-prefetch"
          href="https://okyyutsjkmdzoysqiayy.supabase.co"
        />
      </head>
      <body className={`${fontVariables} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
