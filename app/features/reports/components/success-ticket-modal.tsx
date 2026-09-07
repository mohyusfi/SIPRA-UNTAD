import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { Ticket, Copy, Check, ArrowUpRight, X } from 'lucide-react'
import { Button } from '~/components/ui/button'

interface SuccessTicketModalProps {
  isOpen: boolean
  trackingCode: string
  onClose: () => void
}

export function SuccessTicketModal({
  isOpen,
  trackingCode,
  onClose,
}: SuccessTicketModalProps) {
  const [copied, setCopied] = React.useState(false)

  if (!isOpen) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(trackingCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#FAF8F5] border-3 border-[#09090B] shadow-[8px_8px_0_0_#09090B] p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 border-2 border-[#09090B] bg-white flex items-center justify-center text-[#09090B] shadow-[2px_2px_0_0_#09090B] hover:bg-neutral-100 cursor-pointer"
          title="Tutup"
        >
          <X className="w-4 h-4" strokeWidth={2.5} />
        </button>

        <div className="flex items-center gap-3 border-b-2 border-[#09090B] pb-4 mb-5">
          <div className="w-10 h-10 border-2 border-[#09090B] bg-[#D9F99D] flex items-center justify-center shadow-[2px_2px_0_0_#09090B]">
            <Ticket className="w-5 h-5 text-[#09090B]" strokeWidth={2.5} />
          </div>
          <div>
            <span className="inline-block transform -rotate-1 bg-[#FEF08A] border border-[#09090B] px-2 py-0.2 text-[10px] font-black uppercase tracking-wider">
              Laporan Berhasil Diterima
            </span>
            <h3 className="text-xl font-extrabold text-[#09090B]">
              Tiket Laporan Resmi
            </h3>
          </div>
        </div>

        <p className="text-xs md:text-sm text-[#52525B] mb-5 leading-relaxed">
          Laporan kerusakan fasilitas fisik Anda telah masuk ke sistem antrean
          verifikasi SIPRA-UNTAD. Simpan kode lacak di bawah ini untuk memantau
          perkembangan pengerjaan teknisi.
        </p>

        <div className="border-2 border-dashed border-[#09090B] bg-white p-5 mb-5 relative">
          <p className="text-[11px] font-bold text-[#52525B] uppercase tracking-wider mb-1">
            Kode Pelacakan Anda
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="font-mono text-xl sm:text-2xl font-black tracking-widest text-[#09090B]">
              {trackingCode}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 border-2 border-[#09090B] bg-[#E0E7FF] text-[#09090B] text-xs font-bold font-mono shadow-[2px_2px_0_0_#09090B] hover:bg-indigo-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-700" strokeWidth={3} />
                  <span>TERTSALIN</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" strokeWidth={2.5} />
                  <span>SALIN KODE</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-[#09090B]/20 flex items-center justify-between text-[10px] font-mono text-[#52525B]">
            <span>KAMPUS BUMI TADULAKO TONDO</span>
            <span>WITA (UTC+8)</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            to="/track"
            search={{ code: trackingCode }}
            className="w-full sm:flex-1"
          >
            <Button variant="lime" className="w-full">
              <span>Buka Halaman Pelacakan</span>
              <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
            </Button>
          </Link>
          <Button
            variant="secondary"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Selesai
          </Button>
        </div>
      </div>
    </div>
  )
}
