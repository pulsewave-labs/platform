import * as React from 'react'
import { cn } from '@/lib/utils'
import { EyeIcon, EyeOffIcon, SearchIcon } from 'lucide-react'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onRightIconClick?: () => void
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, leftIcon, rightIcon, onRightIconClick, ...props }, ref) => {
    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-lg border border-dark-border bg-dark-surface px-3 py-2 text-sm text-dark-text placeholder:text-dark-muted focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-short-500 focus:ring-short-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-muted hover:text-dark-text transition-colors"
          >
            {rightIcon}
          </button>
        )}
        {error && (
          <p className="mt-1 text-sm text-short-400">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

// Password input with show/hide toggle
const PasswordInput = React.forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    return (
      <Input
        {...props}
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        rightIcon={showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
        onRightIconClick={() => setShowPassword(!showPassword)}
        className={className}
      />
    )
  }
)
PasswordInput.displayName = 'PasswordInput'

// Search input with search icon
const SearchInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        placeholder="Search..."
        leftIcon={<SearchIcon size={18} />}
        className={className}
      />
    )
  }
)
SearchInput.displayName = 'SearchInput'

// Number input for trading quantities and prices
const NumberInput = React.forwardRef<HTMLInputElement, 
  Omit<InputProps, 'type'> & {
    min?: number
    max?: number
    step?: number
    precision?: number
    prefix?: string
    suffix?: string
  }
>(({ className, min, max, step, precision = 2, prefix, suffix, onChange, ...props }, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    
    // Remove non-numeric characters except decimal point and minus
    value = value.replace(/[^0-9.-]/g, '')
    
    // Ensure only one decimal point
    const parts = value.split('.')
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('')
    }
    
    // Limit decimal places
    if (parts[1] && parts[1].length > precision) {
      value = parts[0] + '.' + parts[1].slice(0, precision)
    }
    
    // Apply min/max constraints
    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      if (min !== undefined && numValue < min) {
        value = min.toString()
      }
      if (max !== undefined && numValue > max) {
        value = max.toString()
      }
    }
    
    e.target.value = value
    onChange?.(e)
  }

  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted text-sm">
          {prefix}
        </span>
      )}
      <Input
        {...props}
        ref={ref}
        type="text"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        onChange={handleChange}
        className={cn(
          prefix && 'pl-8',
          suffix && 'pr-8',
          'text-right font-mono',
          className
        )}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-muted text-sm">
          {suffix}
        </span>
      )}
    </div>
  )
})
NumberInput.displayName = 'NumberInput'

// Price input specifically for trading
const PriceInput = React.forwardRef<HTMLInputElement, 
  Omit<InputProps, 'type'> & {
    currency?: string
  }
>(({ currency = '$', className, ...props }, ref) => {
  return (
    <NumberInput
      {...props}
      ref={ref}
      prefix={currency}
      precision={2}
      step={0.01}
      min={0}
      className={className}
    />
  )
})
PriceInput.displayName = 'PriceInput'

// Quantity input for trading
const QuantityInput = React.forwardRef<HTMLInputElement, 
  Omit<InputProps, 'type'> & {
    asset?: string
  }
>(({ asset, className, ...props }, ref) => {
  return (
    <NumberInput
      {...props}
      ref={ref}
      suffix={asset}
      precision={8}
      step={0.001}
      min={0}
      className={className}
    />
  )
})
QuantityInput.displayName = 'QuantityInput'

// Percentage input
const PercentageInput = React.forwardRef<HTMLInputElement, 
  Omit<InputProps, 'type'>
>(({ className, ...props }, ref) => {
  return (
    <NumberInput
      {...props}
      ref={ref}
      suffix="%"
      precision={2}
      step={0.1}
      min={0}
      max={100}
      className={className}
    />
  )
})
PercentageInput.displayName = 'PercentageInput'

// Textarea component
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div>
        <textarea
          className={cn(
            'flex min-h-[80px] w-full rounded-lg border border-dark-border bg-dark-surface px-3 py-2 text-sm text-dark-text placeholder:text-dark-muted focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-colors',
            error && 'border-short-500 focus:ring-short-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-short-400">{error}</p>
        )}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

export {
  Input,
  PasswordInput,
  SearchInput,
  NumberInput,
  PriceInput,
  QuantityInput,
  PercentageInput,
  Textarea,
}