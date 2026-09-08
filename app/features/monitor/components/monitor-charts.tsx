import * as React from 'react'
import { Layers, MapPin, AlertTriangle } from 'lucide-react'
import type { CategoryDistribution, BuildingHotspot } from '../monitor.fn'

interface MonitorChartsProps {
  categories: CategoryDistribution[]
  locations: BuildingHotspot[]
  totalReports: number
}

const CATEGORY_COLORS = [
  'bg-[#BAE6FD]',
  'bg-[#C4B5FD]',
  'bg-[#D9F99D]',
  'bg-[#FED7AA]',
  'bg-[#FEF08A]',
  'bg-[#FECDD3]',
]

export function MonitorCharts({
  categories,
  locations,
  totalReports,
}: MonitorChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Kategori Kerusakan */}
      <div className="border-2 border-[#09090B] bg-white p-5 md:p-6 shadow-[4px_4px_0_0_#09090B] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-[#09090B]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 border-2 border-[#09090B] bg-[#C4B5FD] flex items-center justify-center shadow-[2px_2px_0_0_#09090B]">
                <Layers className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-extrabold text-sm md:text-base text-[#09090B]">
                  Distribusi Kategori Kerusakan
                </h3>
                <p className="text-[11px] text-[#52525B]">
                  Proporsi frekuensi laporan berdasarkan kategori sarana
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 border border-[#09090B] bg-[#FAF8F5]">
              {categories.length} Kategori
            </span>
          </div>

          {categories.length === 0 ? (
            <div className="p-8 text-center bg-[#FAF8F5] border-2 border-dashed border-[#09090B] text-xs font-bold text-[#52525B]">
              Belum ada data kategori pada rentang waktu ini.
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((cat, idx) => {
                const colorClass = CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
                return (
                  <div key={cat.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-[#09090B] truncate mr-2">
                        {cat.name}
                      </span>
                      <div className="flex items-center gap-2 shrink-0 font-mono">
                        <span className="text-[#52525B] text-[11px]">
                          {cat.count} Lap.
                        </span>
                        <span className="font-extrabold px-1.5 py-0.2 border border-[#09090B] bg-[#FAF8F5] text-[10px]">
                          {cat.percentage}%
                        </span>
                      </div>
                    </div>
                    {/* Meter Progress Bar */}
                    <div className="h-4 w-full border-2 border-[#09090B] bg-[#FAF8F5] overflow-hidden p-0.5">
                      <div
                        className={`h-full border-r border-[#09090B] ${colorClass} transition-all duration-500`}
                        style={{ width: `${Math.max(cat.percentage, 2)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="mt-6 pt-3 border-t border-neutral-200 flex items-center justify-between text-[11px] text-[#52525B] font-mono">
          <span>Total sampel: {totalReports} laporan</span>
          <span>Analisis proporsi kategori</span>
        </div>
      </div>

      {/* 2. Hotspot Gedung / Lokasi */}
      <div className="border-2 border-[#09090B] bg-white p-5 md:p-6 shadow-[4px_4px_0_0_#09090B] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-[#09090B]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 border-2 border-[#09090B] bg-[#FEF08A] flex items-center justify-center shadow-[2px_2px_0_0_#09090B]">
                <MapPin className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-extrabold text-sm md:text-base text-[#09090B]">
                  Hotspot Fasilitas Terbanyak
                </h3>
                <p className="text-[11px] text-[#52525B]">
                  5 Gedung/Area kampus dengan akumulasi insiden tertinggi
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 border border-[#09090B] bg-[#FAF8F5]">
              Top 5 Lokasi
            </span>
          </div>

          {locations.length === 0 ? (
            <div className="p-8 text-center bg-[#FAF8F5] border-2 border-dashed border-[#09090B] text-xs font-bold text-[#52525B]">
              Belum ada data gedung pada rentang waktu ini.
            </div>
          ) : (
            <div className="space-y-3.5">
              {locations.map((loc, idx) => {
                const isTop1 = idx === 0 && loc.count > 0
                return (
                  <div
                    key={loc.building}
                    className={`p-2.5 border-2 border-[#09090B] transition-colors ${
                      isTop1 ? 'bg-[#FFFBEB]' : 'bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-5 h-5 flex items-center justify-center text-[10px] font-mono font-black border border-[#09090B] shrink-0 ${
                            isTop1 ? 'bg-[#FCA5A5] text-[#991B1B]' : 'bg-white'
                          }`}
                        >
                          #{idx + 1}
                        </span>
                        <span className="font-extrabold text-[#09090B] truncate">
                          {loc.building}
                        </span>
                        {isTop1 && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-1.5 py-0.2 border border-[#09090B] bg-[#FECDD3] text-[#991B1B] shrink-0">
                            <AlertTriangle className="w-2.5 h-2.5" /> Perhatian
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                        <span className="font-bold text-[#09090B]">
                          {loc.count}
                        </span>
                        <span className="text-[#52525B]">
                          ({loc.percentage}%)
                        </span>
                      </div>
                    </div>
                    {/* Meter Progress Bar */}
                    <div className="h-2.5 w-full border border-[#09090B] bg-white overflow-hidden">
                      <div
                        className={`h-full ${
                          isTop1 ? 'bg-[#F87171]' : 'bg-[#BAE6FD]'
                        } transition-all duration-500`}
                        style={{ width: `${Math.max(loc.percentage, 2)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="mt-6 pt-3 border-t border-neutral-200 flex items-center justify-between text-[11px] text-[#52525B] font-mono">
          <span>Identifikasi beban pemeliharaan</span>
          <span>Audit Lokasi Fisik</span>
        </div>
      </div>
    </div>
  )
}
