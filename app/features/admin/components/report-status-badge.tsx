import * as React from 'react'

export interface ReportStatusBadgeProps {
  status: string
  className?: string
}

export function ReportStatusBadge({
  status,
  className = '',
}: ReportStatusBadgeProps) {
  let label = 'Diajukan'
  let bgClass = 'bg-[#FEF08A]'

  switch (status) {
    case 'verified':
      label = 'Diverifikasi'
      bgClass = 'bg-[#A5F3FC]'
      break
    case 'assigned':
      label = 'Ditugaskan'
      bgClass = 'bg-[#BAE6FD]'
      break
    case 'in_progress':
      label = 'Dalam Perbaikan'
      bgClass = 'bg-[#FED7AA]'
      break
    case 'review':
      label = 'Menunggu Review'
      bgClass = 'bg-[#E9D5FF]'
      break
    case 'completed':
      label = 'Selesai'
      bgClass = 'bg-[#D9F99D]'
      break
    case 'rejected':
      label = 'Ditolak'
      bgClass = 'bg-[#FECDD3]'
      break
    case 'duplicate':
      label = 'Duplikat'
      bgClass = 'bg-[#E2E8F0]'
      break
    case 'submitted':
    default:
      label = 'Diajukan'
      bgClass = 'bg-[#FEF08A]'
      break
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[10px] md:text-xs font-extrabold uppercase tracking-wider border border-[#09090B] shadow-[1px_1px_0_0_#09090B] ${bgClass} text-[#09090B] ${className}`}
    >
      {label}
    </span>
  )
}

export interface ReportUrgencyBadgeProps {
  urgency: string
  className?: string
}

export function ReportUrgencyBadge({
  urgency,
  className = '',
}: ReportUrgencyBadgeProps) {
  let label = 'Normal'
  let bgClass = 'bg-[#E0E7FF]'

  switch (urgency) {
    case 'emergency':
      label = 'Darurat'
      bgClass = 'bg-[#FCA5A5]'
      break
    case 'high':
      label = 'Tinggi'
      bgClass = 'bg-[#FDE68A]'
      break
    case 'normal':
    default:
      label = 'Normal'
      bgClass = 'bg-[#E0E7FF]'
      break
  }

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border border-[#09090B] ${bgClass} text-[#09090B] ${className}`}
    >
      {label}
    </span>
  )
}
