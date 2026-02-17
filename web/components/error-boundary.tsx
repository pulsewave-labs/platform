'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // In production, you might want to log to an error reporting service
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      // Log to error service (e.g., Sentry, LogRocket, etc.)
      console.error('Production error:', error, errorInfo)
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }

      return (
        <DefaultErrorFallback 
          error={this.state.error} 
          resetError={this.resetError} 
        />
      )
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error?: Error
  resetError: () => void
}

function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost'

  return (
    <motion.div 
      className="min-h-screen bg-[#0a0e17] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <div className="w-16 h-16 bg-[#f87171]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} className="text-[#f87171]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
          <p className="text-[#6b7280] text-sm">
            Don't worry, this is probably just a temporary issue. Try refreshing the page or go back to the dashboard.
          </p>
        </motion.div>

        {isDevelopment && error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-6"
          >
            <details className="bg-[#1b2332] border border-[#374151] rounded-lg p-4 text-left">
              <summary className="text-[#f87171] font-medium cursor-pointer mb-2">
                Error Details (Development Only)
              </summary>
              <pre className="text-xs text-[#9ca3af] whitespace-pre-wrap break-words">
                {error.name}: {error.message}
                {error.stack && '\n\nStack trace:\n' + error.stack}
              </pre>
            </details>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <button
            onClick={resetError}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#00F0B5] text-white font-medium rounded-xl hover:bg-[#00F0B5]/90 transition-colors"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-[#1b2332] text-[#9ca3af] hover:text-white hover:border-[#374151] font-medium rounded-xl transition-colors"
          >
            <Home size={16} />
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}

// Hook version for functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error) => {
    console.error('Captured error:', error)
    setError(error)
  }, [])

  // Reset error when component unmounts or location changes
  React.useEffect(() => {
    return () => {
      setError(null)
    }
  }, [])

  if (error) {
    return {
      hasError: true,
      error,
      resetError,
      ErrorComponent: () => <DefaultErrorFallback error={error} resetError={resetError} />
    }
  }

  return {
    hasError: false,
    error: null,
    resetError,
    captureError,
    ErrorComponent: null
  }
}

// Page-level error boundary wrapper
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<ErrorFallbackProps>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}