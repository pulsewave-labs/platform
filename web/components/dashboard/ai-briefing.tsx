'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Sparkles } from 'lucide-react'

interface AIBriefingProps {
  content: string
}

export default function AIBriefing({ content }: AIBriefingProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Extract first sentence for preview
  const firstSentence = content.split('.')[0] + '.'
  const remainingContent = content.substring(firstSentence.length).trim()
  
  return (
    <motion.div 
      className="bg-[#0d1117] border border-[#1b2332] border-l-[#4ade80] border-l-2 rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-8 h-8 bg-gradient-to-br from-[#4ade80] to-[#22c55e] rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles size={16} className="text-white" />
          </div>
          
          <div className="flex-1">
            <div className="text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">
              AI Market Briefing
            </div>
            
            <div className="text-sm text-[#9ca3af] leading-relaxed">
              <span dangerouslySetInnerHTML={{ __html: firstSentence }} />
              
              <AnimatePresence>
                {isExpanded && remainingContent && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    dangerouslySetInnerHTML={{ __html: ' ' + remainingContent }}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        
        {remainingContent && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-[#00F0B5] hover:text-[#00F0B5]/80 font-medium transition-colors ml-4"
          >
            {isExpanded ? 'Less' : 'Read more'}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={14} />
            </motion.div>
          </button>
        )}
      </div>
    </motion.div>
  )
}