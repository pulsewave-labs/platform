import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'PulseWave Signals — AI Bot That Turned $10K Into $218K',
  description: 'AI-powered crypto signal bot with real backtested performance. Get the same signals that generated 2,084% returns over 2 years. Market Structure analysis, 88% profitable months.',
  keywords: 'crypto signals, trading bot, AI trading, crypto trading signals, market structure, bitcoin signals, ethereum signals',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://signals.pulsewave.app',
    siteName: 'PulseWave Signals',
    title: 'PulseWave Signals — AI Bot That Turned $10K Into $218K',
    description: 'AI-powered crypto signal bot with 2,084% backtested returns. Real performance data from 624 trades.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PulseWave Signals - $10K to $218K Performance',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PulseWave Signals — AI Bot That Turned $10K Into $218K',
    description: 'AI-powered crypto signal bot with 2,084% backtested returns. Real performance data from 624 trades.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#09090b',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${jakarta.variable} ${mono.variable} dark`}>
      <body className="font-sans antialiased bg-zinc-950 text-white min-h-screen">
        {children}
      </body>
    </html>
  )
}