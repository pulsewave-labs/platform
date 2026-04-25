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
  metadataBase: new URL('https://www.pulsewavelabs.io'),
  title: 'PulseWave Journal — AI Trading Journal for Serious Traders',
  description:
    'PulseWave Journal turns every trade into feedback. Log trades, detect leaks, track rules, review screenshots, and get AI-powered trading debriefs.',
  keywords:
    'AI trading journal, trading journal, crypto trading journal, trade review, trading analytics, trading psychology, trading rules, trade tracker',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.pulsewavelabs.io',
    siteName: 'PulseWave Journal',
    title: 'PulseWave Journal — Turn Every Trade Into Feedback',
    description:
      'The AI trading journal that helps you spot leaks, build rules, and improve from your own trading data.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PulseWave Journal - AI trading journal dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PulseWave Journal — AI Trading Journal',
    description:
      'Log trades. Spot leaks. Build rules from your own data.',
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
  themeColor: '#06060a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${jakarta.variable} ${mono.variable} dark`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* Existing Meta pixel preserved during the reposition so ad/retargeting access is not broken. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','1381341602998432');fbq('track','PageView');`,
          }}
        />
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }} src="https://www.facebook.com/tr?id=1381341602998432&ev=PageView&noscript=1" alt="" />
        </noscript>
      </head>
      <body className="font-sans antialiased bg-zinc-950 text-white min-h-screen">
        {children}
      </body>
    </html>
  )
}
