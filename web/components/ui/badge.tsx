import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary-600/20 text-primary-400 hover:bg-primary-600/30',
        secondary: 'border-transparent bg-dark-border text-dark-accent hover:bg-dark-border/80',
        destructive: 'border-transparent bg-short-500/20 text-short-400 hover:bg-short-500/30',
        success: 'border-transparent bg-long-500/20 text-long-400 hover:bg-long-500/30',
        warning: 'border-transparent bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30',
        outline: 'border-dark-border text-dark-text',
        ghost: 'border-transparent text-dark-muted hover:bg-dark-border/50',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  pulse?: boolean
  dot?: boolean
}

function Badge({ className, variant, size, pulse = false, dot = false, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span 
          className={cn(
            'mr-1.5 h-2 w-2 rounded-full',
            pulse && 'animate-pulse',
            variant === 'success' && 'bg-long-400',
            variant === 'destructive' && 'bg-short-400',
            variant === 'warning' && 'bg-yellow-400',
            variant === 'default' && 'bg-primary-600',
            variant === 'secondary' && 'bg-dark-accent',
          )} 
        />
      )}
      {children}
    </div>
  )
}

// Specialized badge variants for trading
const DirectionBadge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    direction: 'LONG' | 'SHORT'
    size?: 'sm' | 'default' | 'lg'
  }
>(({ className, direction, size = 'default', ...props }, ref) => (
  <Badge
    ref={ref}
    variant={direction === 'LONG' ? 'success' : 'destructive'}
    size={size}
    className={cn(
      'font-bold uppercase',
      direction === 'LONG' && 'bg-long-500 text-white',
      direction === 'SHORT' && 'bg-short-500 text-white',
      className
    )}
    {...props}
  >
    {direction}
  </Badge>
))
DirectionBadge.displayName = 'DirectionBadge'

const RegimeBadge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    regime: 'TRENDING_UP' | 'TRENDING_DOWN' | 'RANGING' | 'VOLATILE'
    showDot?: boolean
  }
>(({ className, regime, showDot = true, children, ...props }, ref) => {
  const getRegimeConfig = (regime: string) => {
    switch (regime) {
      case 'TRENDING_UP':
      case 'TRENDING_DOWN':
        return { variant: 'success' as const, color: 'bg-trending' }
      case 'RANGING':
        return { variant: 'warning' as const, color: 'bg-ranging' }
      case 'VOLATILE':
        return { variant: 'destructive' as const, color: 'bg-volatile' }
      default:
        return { variant: 'secondary' as const, color: 'bg-dark-accent' }
    }
  }

  const config = getRegimeConfig(regime)

  return (
    <Badge
      ref={ref}
      variant={config.variant}
      dot={showDot}
      pulse={showDot}
      className={cn('font-medium', className)}
      {...props}
    >
      {children || regime.replace('_', ' ')}
    </Badge>
  )
})
RegimeBadge.displayName = 'RegimeBadge'

const ConfidenceBadge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    confidence: number
  }
>(({ className, confidence, ...props }, ref) => {
  const getVariant = (confidence: number) => {
    if (confidence >= 75) return 'success'
    if (confidence >= 50) return 'warning'
    return 'destructive'
  }

  return (
    <Badge
      ref={ref}
      variant={getVariant(confidence)}
      className={cn('font-bold', className)}
      {...props}
    >
      {confidence}%
    </Badge>
  )
})
ConfidenceBadge.displayName = 'ConfidenceBadge'

const RiskBadge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    risk: 'low' | 'medium' | 'high'
    showIcon?: boolean
  }
>(({ className, risk, showIcon = true, children, ...props }, ref) => {
  const getVariant = (risk: string) => {
    switch (risk) {
      case 'low': return 'success'
      case 'medium': return 'warning'
      case 'high': return 'destructive'
      default: return 'secondary'
    }
  }

  const getIcon = (risk: string) => {
    switch (risk) {
      case 'low': return '🛡️'
      case 'medium': return '⚠️'
      case 'high': return '🚨'
      default: return ''
    }
  }

  return (
    <Badge
      ref={ref}
      variant={getVariant(risk)}
      className={cn('font-medium capitalize', className)}
      {...props}
    >
      {showIcon && <span className="mr-1">{getIcon(risk)}</span>}
      {children || `Risk ${risk}`}
    </Badge>
  )
})
RiskBadge.displayName = 'RiskBadge'

const ImpactBadge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    impact: 'low' | 'medium' | 'high'
  }
>(({ className, impact, ...props }, ref) => {
  const getVariant = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive'
      case 'medium': return 'warning'
      case 'low': return 'ghost'
      default: return 'secondary'
    }
  }

  return (
    <Badge
      ref={ref}
      variant={getVariant(impact)}
      size="sm"
      className={cn('font-bold uppercase', className)}
      {...props}
    >
      {impact}
    </Badge>
  )
})
ImpactBadge.displayName = 'ImpactBadge'

const StatusBadge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    status: 'active' | 'pending' | 'completed' | 'failed' | 'canceled'
    showDot?: boolean
  }
>(({ className, status, showDot = true, ...props }, ref) => {
  const getVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'pending': return 'warning'
      case 'completed': return 'default'
      case 'failed': return 'destructive'
      case 'canceled': return 'ghost'
      default: return 'secondary'
    }
  }

  return (
    <Badge
      ref={ref}
      variant={getVariant(status)}
      dot={showDot}
      pulse={status === 'active' && showDot}
      className={cn('font-medium capitalize', className)}
      {...props}
    >
      {status}
    </Badge>
  )
})
StatusBadge.displayName = 'StatusBadge'

export {
  Badge,
  badgeVariants,
  DirectionBadge,
  RegimeBadge,
  ConfidenceBadge,
  RiskBadge,
  ImpactBadge,
  StatusBadge,
}