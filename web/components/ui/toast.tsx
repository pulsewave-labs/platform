'use client'

import { useState, useCallback, createContext, useContext, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, AlertTriangle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

const toastIcons = {
  success: Check,
  error: X,
  warning: AlertTriangle,
  info: Info
}

const toastColors = {
  success: 'border-[#4ade80] bg-[#4ade80]/10',
  error: 'border-[#f87171] bg-[#f87171]/10',
  warning: 'border-[#fbbf24] bg-[#fbbf24]/10',
  info: 'border-[#00F0B5] bg-[#00F0B5]/10'
}

const toastIconColors = {
  success: 'text-[#4ade80]',
  error: 'text-[#f87171]',
  warning: 'text-[#fbbf24]',
  info: 'text-[#00F0B5]'
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const Icon = toastIcons[toast.type]
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`bg-[#0d1117] border rounded-xl p-4 shadow-lg max-w-sm ${toastColors[toast.type]}`}
    >
      <div className="flex items-start gap-3">
        <Icon size={20} className={toastIconColors[toast.type]} />
        <div className="flex-1">
          <div className="text-sm font-medium text-white">{toast.title}</div>
          {toast.message && (
            <div className="text-xs text-[#9ca3af] mt-1">{toast.message}</div>
          )}
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="text-[#6b7280] hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </motion.div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((toastData: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const toast: Toast = {
      ...toastData,
      id,
      duration: toastData.duration ?? 5000
    }

    setToasts(prev => [...prev, toast])

    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, toast.duration)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        <AnimatePresence>
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

// Convenience hooks for different toast types
export function useSuccessToast() {
  const { showToast } = useToast()
  return useCallback((title: string, message?: string) => {
    showToast({ type: 'success', title, message })
  }, [showToast])
}

export function useErrorToast() {
  const { showToast } = useToast()
  return useCallback((title: string, message?: string) => {
    showToast({ type: 'error', title, message })
  }, [showToast])
}

export function useWarningToast() {
  const { showToast } = useToast()
  return useCallback((title: string, message?: string) => {
    showToast({ type: 'warning', title, message })
  }, [showToast])
}

export function useInfoToast() {
  const { showToast } = useToast()
  return useCallback((title: string, message?: string) => {
    showToast({ type: 'info', title, message })
  }, [showToast])
}