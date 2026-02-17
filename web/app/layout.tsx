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
  title: 'PulseWave — Your Complete Trading Command Center',
  description: 'Stop juggling 5 trading apps. PulseWave combines AI-powered signals, auto-journaling, risk management, and real-time news in one platform.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pulsewave.app',
    siteName: 'PulseWave',
    title: 'PulseWave — Your Complete Trading Command Center',
    description: 'AI-powered trading platform with signals, auto-journaling, and risk management.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0a0e17',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${jakarta.variable} ${mono.variable}`}>
      <body className="font-sans antialiased bg-[#0a0e17] text-white min-h-screen">
        {children}
      </body>
    </html>
  )
}
