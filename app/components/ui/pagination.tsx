import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  className = '',
}: PaginationProps) {
  if (totalCount === 0) return null

  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalCount)
  const endItem = Math.min(currentPage * pageSize, totalCount)

  // Generate page numbers to show with ellipsis
  const getPageNumbers = () => {
    const pages: Array<number | string> = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always include first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push('...')
      }

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i)
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('...')
      }

      // Always include last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t-2 border-[#09090B] text-xs font-mono ${className}`}
    >
      {/* Range Info */}
      <div className="text-[#52525B]">
        Menampilkan <strong>{startItem}</strong> - <strong>{endItem}</strong> dari{' '}
        <strong>{totalCount}</strong> data
      </div>

      {/* Controls Container */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Page Size Selector */}
        {onPageSizeChange ? (
          <div className="flex items-center gap-1.5 mr-2">
            <span className="text-[11px] text-[#52525B]">Baris:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-2 py-1 text-xs font-bold border-2 border-[#09090B] bg-white shadow-[1px_1px_0_0_#09090B] focus:outline-none cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 border-2 border-[#09090B] bg-white hover:bg-[#FAF8F5] shadow-[2px_2px_0_0_#09090B] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer transition-all flex items-center justify-center"
          title="Halaman Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
        </button>

        {/* Page Number Buttons */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, idx) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-xs font-bold text-[#52525B]"
                >
                  ...
                </span>
              )
            }

            const pageNum = page as number
            const isActive = pageNum === currentPage

            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={`min-w-[28px] h-7 px-2 border-2 border-[#09090B] text-xs font-extrabold cursor-pointer transition-all ${
                  isActive
                    ? 'bg-[#BAE6FD] text-[#09090B] shadow-[2px_2px_0_0_#09090B] translate-x-[-1px] translate-y-[-1px]'
                    : 'bg-white hover:bg-[#FAF8F5] text-[#09090B]'
                }`}
              >
                {pageNum}
              </button>
            )
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 border-2 border-[#09090B] bg-white hover:bg-[#FAF8F5] shadow-[2px_2px_0_0_#09090B] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer transition-all flex items-center justify-center"
          title="Halaman Selanjutnya"
        >
          <ChevronRight className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}
