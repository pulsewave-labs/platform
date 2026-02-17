'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { ReactNode, useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  // Handle escape key
  useEffect(() => {
    if (!isOpen) return
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
            <motion.div
              initial={{ 
                opacity: 0, 
                scale: 0.95, 
                y: '100%'
              }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0 
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.95, 
                y: '100%'
              }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className={`bg-[#0d1117] border-0 md:border border-[#1b2332] rounded-t-xl md:rounded-xl shadow-xl w-full overflow-hidden h-[90vh] md:h-auto md:max-h-[90vh] ${sizeClasses[size]}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-[#1b2332]">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <button
                  onClick={onClose}
                  className="text-[#6b7280] hover:text-white transition-colors w-11 h-11 flex items-center justify-center -mr-2 min-w-[44px] min-h-[44px]"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-4 md:p-6 overflow-y-auto flex-1 max-h-[calc(90vh-80px)]">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

// Confirmation Modal variant
interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger'
}: ConfirmModalProps) {
  const buttonColors = {
    danger: 'bg-[#f87171] hover:bg-[#f87171]/90',
    warning: 'bg-[#fbbf24] hover:bg-[#fbbf24]/90',
    info: 'bg-[#00F0B5] hover:bg-[#00F0B5]/90'
  }
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-6">
        <p className="text-[#9ca3af]">{message}</p>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[#6b7280] hover:text-white border border-[#1b2332] rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`px-4 py-2 text-white rounded-lg transition-colors ${buttonColors[type]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}