'use client'


export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center p-4">
      {/* Subtle background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#00F0B5] opacity-[0.03] blur-[120px]" />
      </div>
      
      <div className="relative z-10 w-full max-w-sm">
        {children}
      </div>
    </div>
  )
}
