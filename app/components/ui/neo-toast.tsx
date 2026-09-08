import * as React from 'react'
import { CheckCircle2, AlertTriangle, X } from 'lucide-react'
import { cn } from '~/lib/utils'

export interface ToastData {
  message: string
  type: 'success' | 'error'
}

interface NeoToastProps {
  toast: ToastData | null
  onClose?: () => void
  className?: string
}

export function NeoToast({ toast, onClose, className }: NeoToastProps) {
  if (!toast) return null

  const isSuccess = toast.type === 'success'

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'fixed bottom-6 right-6 z-50 max-w-md border-2 border-[#09090B] p-4 shadow-[4px_4px_0_0_#09090B] flex items-start gap-3 transition-all',
        isSuccess ? 'bg-[#D9F99D]' : 'bg-[#FECDD3]',
        className,
      )}
    >
      <div className="border-2 border-[#09090B] bg-white p-1 shadow-[1px_1px_0_0_#09090B] shrink-0 mt-0.5">
        {isSuccess ? (
          <CheckCircle2 className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
        ) : (
          <AlertTriangle className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
        )}
      </div>

      <div className="flex-1 text-xs md:text-sm font-bold text-[#09090B] leading-snug">
        {toast.message}
      </div>

      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup notifikasi"
          className="border-2 border-[#09090B] bg-white p-1 hover:bg-neutral-100 shadow-[1px_1px_0_0_#09090B] shrink-0 cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
        >
          <X className="w-3.5 h-3.5 text-[#09090B]" strokeWidth={2.5} />
        </button>
      ) : null}
    </div>
  )
}
