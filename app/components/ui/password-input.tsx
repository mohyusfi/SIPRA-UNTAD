import * as React from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { cn } from '~/lib/utils'

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  focusVariant?: 'lilac' | 'yellow'
  hasError?: boolean
  leftIcon?: React.ReactNode | null
  containerClassName?: string
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      className,
      containerClassName,
      focusVariant = 'lilac',
      hasError = false,
      leftIcon,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = React.useState(false)

    const toggleVisibility = React.useCallback(() => {
      setShowPassword((prev) => !prev)
    }, [])

    const focusStyles = {
      lilac: 'focus:ring-2 focus:ring-[#C4B5FD]',
      yellow: 'focus:ring-2 focus:ring-[#FEF08A]',
    }

    const defaultLeftIcon =
      leftIcon === undefined ? (
        <Lock className="h-4 w-4 text-[#52525B]" aria-hidden="true" />
      ) : (
        leftIcon
      )

    return (
      <div className={cn('relative w-full', containerClassName)}>
        {defaultLeftIcon ? (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {defaultLeftIcon}
          </div>
        ) : null}

        <input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          disabled={disabled}
          className={cn(
            'w-full py-2.5 bg-[#FAF8F5] border-2 text-xs md:text-sm font-medium focus:bg-white focus:outline-none transition-all',
            defaultLeftIcon ? 'pl-9' : 'pl-3',
            'pr-10',
            hasError
              ? 'border-red-600 focus:ring-2 focus:ring-red-200'
              : cn('border-[#09090B]', focusStyles[focusVariant]),
            disabled && 'opacity-50 cursor-not-allowed',
            className,
          )}
          {...props}
        />

        <button
          type="button"
          onClick={toggleVisibility}
          onMouseDown={(e) => e.preventDefault()}
          disabled={disabled}
          tabIndex={0}
          aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
          aria-pressed={showPassword}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#52525B] hover:text-[#09090B] focus:outline-none focus-visible:text-[#09090B] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4 shrink-0" aria-hidden="true" />
          )}
        </button>
      </div>
    )
  },
)

PasswordInput.displayName = 'PasswordInput'
