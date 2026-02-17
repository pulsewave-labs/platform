import * as React from 'react'
import { cn } from '@/lib/utils'

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    hover?: boolean
    gradient?: boolean
  }
>(({ className, hover = false, gradient = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border border-dark-border bg-dark-surface shadow-sm',
      hover && 'transition-all duration-200 hover:border-primary-600/30 hover:shadow-md hover:-translate-y-0.5',
      gradient && 'bg-gradient-to-br from-dark-surface to-dark-surface/50',
      className
    )}
    {...props}
  />
))
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  }
>(({ className, as: Component = 'h3', ...props }, ref) => (
  <Component
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight text-dark-text',
      className
    )}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-dark-muted', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

// Specialized card variants for trading
const SignalCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    direction: 'LONG' | 'SHORT'
    active?: boolean
  }
>(({ className, direction, active = false, ...props }, ref) => (
  <Card
    ref={ref}
    className={cn(
      'transition-all duration-200 cursor-pointer',
      direction === 'LONG' && 'bg-long-500/5 border-long-500/20 hover:border-long-500/40',
      direction === 'SHORT' && 'bg-short-500/5 border-short-500/20 hover:border-short-500/40',
      active && 'ring-2 ring-primary-600/50',
      'hover:translate-x-1',
      className
    )}
    {...props}
  />
))
SignalCard.displayName = 'SignalCard'

const StatCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    trend?: 'up' | 'down' | 'neutral'
  }
>(({ className, trend, ...props }, ref) => (
  <Card
    ref={ref}
    className={cn(
      'text-center p-6 transition-all duration-200',
      trend === 'up' && 'hover:bg-long-500/5 hover:border-long-500/30',
      trend === 'down' && 'hover:bg-short-500/5 hover:border-short-500/30',
      trend === 'neutral' && 'hover:bg-yellow-500/5 hover:border-yellow-500/30',
      'hover:-translate-y-1',
      className
    )}
    {...props}
  />
))
StatCard.displayName = 'StatCard'

const NewsCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    impact?: 'low' | 'medium' | 'high'
  }
>(({ className, impact, ...props }, ref) => (
  <Card
    ref={ref}
    className={cn(
      'cursor-pointer transition-all duration-200 hover:translate-x-1',
      impact === 'high' && 'border-l-4 border-l-short-500',
      impact === 'medium' && 'border-l-4 border-l-yellow-500',
      impact === 'low' && 'border-l-4 border-l-dark-muted',
      className
    )}
    {...props}
  />
))
NewsCard.displayName = 'NewsCard'

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  SignalCard,
  StatCard,
  NewsCard,
}