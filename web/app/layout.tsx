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
  description: 'AI-powered crypto signal bot with 2,084% verified returns. Get the same signals that generated $208K+ in profits. Market Structure analysis, 88% profitable months.',
  keywords: 'crypto signals, trading bot, AI trading, crypto trading signals, market structure, bitcoin signals, ethereum signals',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.pulsewavelabs.io',
    siteName: 'PulseWave Signals',
    title: 'PulseWave Signals — AI Bot That Turned $10K Into $218K',
    description: 'AI-powered crypto signal bot with 2,084% verified returns. 624 trades, 88% profitable months.',
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
    description: 'AI-powered crypto signal bot with 2,084% verified returns. 624 trades, 88% profitable months.',
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','1381341602998432');fbq('track','PageView');`,
          }}
        />
        <noscript>
          <img height="1" width="1" style={{display:'none'}} src="https://www.facebook.com/tr?id=1381341602998432&ev=PageView&noscript=1" />
        </noscript>
      </head>
      <body className="font-sans antialiased bg-zinc-950 text-white min-h-screen">
        {children}
      </body>
    </html>
  )
}