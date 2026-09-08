import {
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
} from 'lucide-react'
import type { MonitorKPIStats } from '../monitor.fn'

interface MonitorKPICardsProps {
  stats: MonitorKPIStats
}

export function MonitorKPICards({ stats }: MonitorKPICardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Total Laporan */}
      <div className="border-2 border-[#09090B] bg-white p-4 md:p-5 shadow-[4px_4px_0_0_#09090B] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 border-2 border-[#09090B] bg-[#C4B5FD] flex items-center justify-center shadow-[2px_2px_0_0_#09090B]">
              <Layers className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 border border-[#09090B] bg-[#FAF8F5]">
              Volume
            </span>
          </div>
          <div className="font-mono text-2xl md:text-3xl font-black text-[#09090B]">
            {stats.total}
          </div>
          <div className="font-extrabold text-xs text-[#09090B] mt-1">
            Total Pengaduan
          </div>
        </div>
        <p className="text-[11px] text-[#52525B] mt-2 border-t border-neutral-200 pt-2 font-medium">
          Seluruh tiket terdaftar
        </p>
      </div>

      {/* 2. Selesai & Rasio */}
      <div className="border-2 border-[#09090B] bg-white p-4 md:p-5 shadow-[4px_4px_0_0_#09090B] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 border-2 border-[#09090B] bg-[#D9F99D] flex items-center justify-center shadow-[2px_2px_0_0_#09090B]">
              <CheckCircle2 className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 border border-[#09090B] bg-[#D9F99D]">
              {stats.completionRate}% Tuntas
            </span>
          </div>
          <div className="font-mono text-2xl md:text-3xl font-black text-[#09090B]">
            {stats.completed}
          </div>
          <div className="font-extrabold text-xs text-[#09090B] mt-1">
            Tuntas Diperbaiki
          </div>
        </div>
        <p className="text-[11px] text-[#52525B] mt-2 border-t border-neutral-200 pt-2 font-medium">
          Diverifikasi bukti fisik
        </p>
      </div>

      {/* 3. Dalam Penanganan */}
      <div className="border-2 border-[#09090B] bg-white p-4 md:p-5 shadow-[4px_4px_0_0_#09090B] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 border-2 border-[#09090B] bg-[#FED7AA] flex items-center justify-center shadow-[2px_2px_0_0_#09090B]">
              <Clock className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 border border-[#09090B] bg-[#FED7AA]">
              {stats.pending} Antrean
            </span>
          </div>
          <div className="font-mono text-2xl md:text-3xl font-black text-[#09090B]">
            {stats.inProgress}
          </div>
          <div className="font-extrabold text-xs text-[#09090B] mt-1">
            Dalam Penanganan
          </div>
        </div>
        <p className="text-[11px] text-[#52525B] mt-2 border-t border-neutral-200 pt-2 font-medium">
          Sedang dikerjakan teknisi
        </p>
      </div>

      {/* 4. Masalah Darurat */}
      <div className="border-2 border-[#09090B] bg-white p-4 md:p-5 shadow-[4px_4px_0_0_#09090B] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 border-2 border-[#09090B] bg-[#FECDD3] flex items-center justify-center shadow-[2px_2px_0_0_#09090B]">
              <AlertCircle className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 border border-[#09090B] bg-[#FECDD3] text-[#991B1B]">
              Prioritas
            </span>
          </div>
          <div className="font-mono text-2xl md:text-3xl font-black text-[#E11D48]">
            {stats.emergency}
          </div>
          <div className="font-extrabold text-xs text-[#09090B] mt-1">
            Laporan Darurat
          </div>
        </div>
        <p className="text-[11px] text-[#52525B] mt-2 border-t border-neutral-200 pt-2 font-medium">
          Potensi bahaya keselamatan
        </p>
      </div>

      {/* 5. Rata-rata Durasi SLA */}
      <div className="border-2 border-[#09090B] bg-white p-4 md:p-5 shadow-[4px_4px_0_0_#09090B] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 border-2 border-[#09090B] bg-[#BAE6FD] flex items-center justify-center shadow-[2px_2px_0_0_#09090B]">
              <TrendingUp className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 border border-[#09090B] bg-[#BAE6FD]">
              SLA Respon
            </span>
          </div>
          <div className="font-mono text-2xl md:text-3xl font-black text-[#09090B]">
            {stats.avgTurnaroundDisplay}
          </div>
          <div className="font-extrabold text-xs text-[#09090B] mt-1">
            Rata-rata Resolusi
          </div>
        </div>
        <p className="text-[11px] text-[#52525B] mt-2 border-t border-neutral-200 pt-2 font-medium">
          Waktu lapor s/d selesai
        </p>
      </div>
    </div>
  )
}
