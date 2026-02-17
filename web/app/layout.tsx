import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { createServerClient } from '@/lib/supabase/server'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'PulseWave — Your Complete Trading Command Center',
  description: 'Stop juggling 5 trading apps. PulseWave combines AI-powered signals, auto-journaling, risk management, and real-time news in one platform.',
  keywords: [
    'trading',
    'cryptocurrency',
    'signals',
    'AI trading',
    'portfolio management',
    'risk management',
    'trading journal',
    'market analysis'
  ],
  authors: [{ name: 'PulseWave Labs' }],
  creator: 'PulseWave Labs',
  publisher: 'PulseWave Labs',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pulsewave.app',
    siteName: 'PulseWave',
    title: 'PulseWave — Your Complete Trading Command Center',
    description: 'AI-powered trading platform with signals, auto-journaling, and risk management.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PulseWave Trading Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@PulseWaveLabs',
    creator: '@PulseWaveLabs',
    title: 'PulseWave — Your Complete Trading Command Center',
    description: 'AI-powered trading platform with signals, auto-journaling, and risk management.',
    images: ['/twitter-image.png'],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: '#58a6ff',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Initialize Supabase on server side for SSR
  const supabase = createServerClient()
  
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <head>
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* PWA meta tags */}
        <meta name="application-name" content="PulseWave" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PulseWave" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Performance hints */}
        <link rel="dns-prefetch" href="https://api.stripe.com" />
        <link rel="dns-prefetch" href="https://js.stripe.com" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Critical CSS for FOUC prevention */}
        <style dangerouslySetInnerHTML={{
          __html: `
            body {
              background-color: #0a0e17;
              color: #e1e4e8;
              font-family: 'Inter', system-ui, sans-serif;
            }
            .loading-screen {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: #0a0e17;
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 9999;
            }
            .pulse-logo {
              font-size: 2rem;
              animation: pulse 2s infinite;
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `
        }} />
      </head>
      <body className={`${inter.className} antialiased min-h-screen bg-dark-bg text-dark-text`}>
        {/* Loading screen - will be hidden by hydration */}
        <div id="loading-screen" className="loading-screen">
          <div className="pulse-logo">⚡</div>
        </div>
        
        {/* Main app content */}
        <main className="relative">
          {children}
        </main>
        
        {/* Global toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: 'toast',
            style: {
              background: '#0d1117',
              color: '#e1e4e8',
              border: '1px solid #1b2332',
            },
            success: {
              className: 'toast-success',
              iconTheme: {
                primary: '#4ade80',
                secondary: '#0d1117',
              },
            },
            error: {
              className: 'toast-error',
              iconTheme: {
                primary: '#f87171',
                secondary: '#0d1117',
              },
            },
            loading: {
              className: 'toast-info',
              iconTheme: {
                primary: '#58a6ff',
                secondary: '#0d1117',
              },
            },
          }}
        />
        
        {/* Performance monitoring script */}
        {process.env.NODE_ENV === 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Hide loading screen after hydration
                document.addEventListener('DOMContentLoaded', function() {
                  const loading = document.getElementById('loading-screen');
                  if (loading) {
                    setTimeout(() => loading.style.display = 'none', 100);
                  }
                });
                
                // Basic performance monitoring
                window.addEventListener('load', function() {
                  if ('performance' in window) {
                    const perf = performance.getEntriesByType('navigation')[0];
                    console.log('Page load time:', perf.loadEventEnd - perf.fetchStart, 'ms');
                  }
                });
              `
            }}
          />
        )}
        
        {/* WebSocket connection indicator (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div id="ws-indicator" className="fixed bottom-4 right-4 w-3 h-3 rounded-full bg-short-500 opacity-50 transition-colors duration-300" title="WebSocket: Disconnected" />
        )}
      </body>
    </html>
  )
}