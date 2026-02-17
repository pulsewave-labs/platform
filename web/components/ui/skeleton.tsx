// Pulse animation skeleton for loading states
export function Skeleton({ className = "", ...props }: { className?: string }) {
  return <div className={`animate-pulse bg-white/[0.06] rounded ${className}`} {...props} />
}

// Specific skeleton components for different use cases
export function StatCardSkeleton() {
  return (
    <div className="bg-[#0d1117] border border-[#1b2332] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="w-8 h-8 rounded-xl" />
        <Skeleton className="w-6 h-6 rounded-full" />
      </div>
      <Skeleton className="w-20 h-8 mb-2" />
      <Skeleton className="w-16 h-4" />
    </div>
  )
}

export function SignalCardSkeleton() {
  return (
    <div className="bg-[#0a0e17] border border-[#1b2332] border-l-2 border-l-[#4ade80] rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div>
            <Skeleton className="w-20 h-5 mb-2" />
            <div className="flex items-center gap-2">
              <Skeleton className="w-12 h-6 rounded" />
              <Skeleton className="w-8 h-4" />
            </div>
          </div>
        </div>
        <div className="text-right">
          <Skeleton className="w-10 h-5 mb-2" />
          <Skeleton className="w-16 h-6 rounded-md" />
        </div>
      </div>
      <div className="space-y-2 mb-3">
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-full h-4" />
      </div>
      <Skeleton className="w-full h-1 rounded-full" />
    </div>
  )
}

export function NewsItemSkeleton() {
  return (
    <div className="py-3 border-b border-[#1b2332]/50 last:border-b-0">
      <div className="flex items-start justify-between mb-2">
        <Skeleton className="w-3/4 h-5" />
        <Skeleton className="w-16 h-5 rounded-md" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="w-20 h-4" />
        <Skeleton className="w-12 h-4 rounded-md" />
      </div>
    </div>
  )
}

export function TradeRowSkeleton() {
  return (
    <div className="grid grid-cols-8 gap-4 py-4 border-b border-[#1b2332]/50">
      <Skeleton className="w-12 h-4" />
      <Skeleton className="w-16 h-4" />
      <Skeleton className="w-12 h-6 rounded" />
      <Skeleton className="w-16 h-4" />
      <Skeleton className="w-16 h-4" />
      <Skeleton className="w-20 h-4" />
      <Skeleton className="w-12 h-4" />
      <Skeleton className="w-16 h-4" />
    </div>
  )
}