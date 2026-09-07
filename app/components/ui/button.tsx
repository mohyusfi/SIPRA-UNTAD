import * as React from 'react'
import { cn } from '~/lib/utils'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'lime' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles =
      'font-bold tracking-wider border-2 border-[#09090B] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_0_#09090B]'

    const variants = {
      primary:
        'bg-[#C4B5FD] text-[#09090B] shadow-[4px_4px_0_0_#09090B] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#09090B] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none',
      secondary:
        'bg-white text-[#09090B] shadow-[4px_4px_0_0_#09090B] hover:bg-neutral-50 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#09090B] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none',
      lime:
        'bg-[#D9F99D] text-[#09090B] shadow-[4px_4px_0_0_#09090B] hover:bg-[#BEF264] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#09090B] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none',
      danger:
        'bg-[#FECDD3] text-[#09090B] shadow-[4px_4px_0_0_#09090B] hover:bg-[#FDA4AF] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#09090B] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none',
      ghost:
        'bg-transparent text-[#09090B] border-transparent hover:border-[#09090B] hover:bg-[#FAF8F5]',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-5 py-2.5 text-xs md:text-sm',
      lg: 'px-6 py-3.5 text-sm md:text-base',
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'
