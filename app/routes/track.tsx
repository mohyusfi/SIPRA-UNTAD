import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import {
  Search,
  Calendar,
  Building2,
  Tag,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ImageIcon,
  Wrench,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'
import { getReportByTrackingCode } from '~/features/reports/reports.fn'
import {
  Badge,
  getStatusBadgeConfig,
  getUrgencyBadgeConfig,
} from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'
import { PublicNavbar } from '~/components/layout/public-navbar'
import { BottomNav } from '~/components/layout/bottom-nav'
import { RichTextView } from '~/components/ui/rich-text-view'

const trackSearchSchema = z.object({
  code: z.string().optional(),
})

type TrackReport = NonNullable<
  Awaited<ReturnType<typeof getReportByTrackingCode>>
>

type TrackLoaderData = {
  report: TrackReport | null
  searchedCode: string
}

export const Route = createFileRoute('/track')({
  validateSearch: (search: Record<string, unknown>) =>
    trackSearchSchema.parse(search),
  loaderDeps: ({ search }: { search: z.infer<typeof trackSearchSchema> }) => ({
    code: search.code,
  }),
  loader: async ({
    deps,
  }: {
    deps: { code?: string }
  }): Promise<TrackLoaderData> => {
    if (!deps.code || deps.code.trim() === '') {
      return { report: null, searchedCode: '' }
    }
    const report = await getReportByTrackingCode({
      data: { trackingCode: deps.code.trim() },
    })
    return { report, searchedCode: deps.code.trim() }
  },
  component: TrackPage,
})

function formatWITA(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleString('id-ID', {
    timeZone: 'Asia/Makassar',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) + ' WITA'
}

const STEPPER_STEPS = [
  { key: 'submitted', label: 'Diajukan', icon: Clock },
  { key: 'verified', label: 'Diverifikasi', icon: ShieldCheck },
  { key: 'assigned', label: 'Ditugaskan', icon: UserCheck },
  { key: 'in_progress', label: 'Perbaikan', icon: Wrench },
  { key: 'completed', label: 'Selesai', icon: CheckCircle2 },
]

function getStepIndex(status: string): number {
  switch (status) {
    case 'submitted':
      return 0
    case 'verified':
      return 1
    case 'assigned':
      return 2
    case 'in_progress':
    case 'review':
      return 3
    case 'completed':
      return 4
    case 'rejected':
    case 'duplicate':
      return -1
    default:
      return 0
  }
}

function TrackPage() {
  const { report, searchedCode } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = useNavigate()
  const [inputCode, setInputCode] = React.useState(search.code || '')
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputCode.trim()) {
      navigate({
        to: '/track',
        search: { code: inputCode.trim().toUpperCase() },
      })
    }
  }

  const stepIndex = report ? getStepIndex(report.status) : 0
  const isTerminalNegative =
    report?.status === 'rejected' || report?.status === 'duplicate'

  return (
    <div className="min-h-screen flex flex-col bg-[#DDD6FE]">
      <PublicNavbar subtitle="Pelacakan Status Publik" isTrackPage={true} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 pb-24 md:pb-8 space-y-6">
        {/* Search Box */}
        <div className="bg-[#FAF8F5] border-2 border-[#09090B] shadow-[4px_4px_0_0_#09090B] p-6">
          <form onSubmit={handleSearch} className="space-y-2">
            <label className="block text-xs font-bold uppercase text-[#09090B]">
              Masukkan Kode Pelacakan (Tracking Code)
            </label>
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="Contoh: UNTAD-2026-X8K2M1"
                className="flex-1 bg-white border-2 border-[#09090B] p-3 font-mono font-black text-base text-[#09090B] tracking-wider uppercase shadow-[2px_2px_0_0_#09090B] focus:outline-none focus:ring-2 focus:ring-[#09090B]"
              />
              <Button type="submit" variant="lime" size="md">
                <Search className="w-4 h-4" strokeWidth={2.5} />
                <span>Lacak Status</span>
              </Button>
            </div>
            <p className="text-[11px] text-[#52525B] font-mono">
              Format kode tiket: UNTAD-[TAHUN]-[6 KARAKTER ALFANUMERIK]
            </p>
          </form>
        </div>

        {/* Results View */}
        {searchedCode && !report && (
          <div className="bg-[#FAF8F5] border-2 border-[#09090B] shadow-[4px_4px_0_0_#09090B] p-8 text-center space-y-3">
            <div className="w-12 h-12 mx-auto border-2 border-[#09090B] bg-[#FECDD3] flex items-center justify-center shadow-[3px_3px_0_0_#09090B]">
              <XCircle className="w-6 h-6 text-[#09090B]" strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-extrabold text-[#09090B]">
              Tiket Tidak Ditemukan
            </h3>
            <p className="text-xs md:text-sm text-[#52525B] max-w-md mx-auto">
              Tidak ada data laporan dengan kode tiket{' '}
              <strong className="font-mono text-[#09090B]">
                {searchedCode}
              </strong>
              . Pastikan kode yang Anda masukkan sesuai dengan yang tertera pada
              tiket pelaporan Anda.
            </p>
          </div>
        )}

        {report && (
          <div className="space-y-6">
            {/* Header Tiket Resmi */}
            <div className="bg-[#FAF8F5] border-2 border-[#09090B] shadow-[6px_6px_0_0_#09090B] p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#09090B] pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#52525B]">
                    TIKET:
                  </span>
                  <span className="font-mono text-base md:text-lg font-black tracking-wider text-[#09090B] bg-white px-2.5 py-0.5 border border-[#09090B]">
                    {report.trackingCode}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge {...getUrgencyBadgeConfig(report.urgency)}>
                    {getUrgencyBadgeConfig(report.urgency).label}
                  </Badge>
                  <Badge {...getStatusBadgeConfig(report.status)}>
                    {getStatusBadgeConfig(report.status).label}
                  </Badge>
                </div>
              </div>

              <h2 className="text-xl md:text-2xl font-black text-[#09090B] leading-snug">
                {report.title}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-[#09090B]/20 text-xs text-[#52525B]">
                <div className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-[#09090B]" strokeWidth={2.5} />
                  <span>Diajukan: {formatWITA(report.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Tag className="w-3.5 h-3.5 text-[#09090B]" strokeWidth={2.5} />
                  <span>Kategori: {report.category?.name || '-'}</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-[#09090B]" strokeWidth={2.5} />
                  <span>
                    Lokasi: {report.location?.building || '-'}{' '}
                    {report.location?.roomOrArea ? `(${report.location.roomOrArea})` : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Stepper Status Visual */}
            {!isTerminalNegative && (
              <div className="bg-[#FAF8F5] border-2 border-[#09090B] shadow-[4px_4px_0_0_#09090B] p-6">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#09090B] mb-6">
                  Tahapan Penanganan Laporan
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 relative">
                  {STEPPER_STEPS.map((step, idx) => {
                    const isDone = idx < stepIndex
                    const isCurrent = idx === stepIndex
                    const Icon = step.icon

                    return (
                      <div
                        key={step.key}
                        className={cn(
                          'border-2 border-[#09090B] p-3 flex flex-col items-center text-center transition-all',
                          isDone
                            ? 'bg-[#D9F99D] shadow-[2px_2px_0_0_#09090B]'
                            : isCurrent
                              ? 'bg-[#FEF08A] shadow-[4px_4px_0_0_#09090B] scale-102'
                              : 'bg-white opacity-60',
                        )}
                      >
                        <div className="w-8 h-8 border-2 border-[#09090B] bg-white flex items-center justify-center mb-1.5 shadow-[1px_1px_0_0_#09090B]">
                          <Icon className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
                        </div>
                        <span className="text-xs font-black text-[#09090B]">
                          {step.label}
                        </span>
                        <span className="text-[10px] font-mono text-[#52525B] mt-0.5">
                          {isDone ? 'Selesai' : isCurrent ? 'Berlangsung' : 'Antre'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Terminal State Banner if Rejected/Duplicate */}
            {isTerminalNegative && (
              <div className="bg-[#FECDD3] border-2 border-[#09090B] shadow-[4px_4px_0_0_#09090B] p-5 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-[#09090B] mt-0.5" strokeWidth={2.5} />
                <div>
                  <h4 className="text-sm font-black text-[#09090B]">
                    Status Penanganan:{' '}
                    {report.status === 'rejected' ? 'Laporan Ditolak' : 'Laporan Duplikat'}
                  </h4>
                  <p className="text-xs text-[#09090B] mt-1 leading-relaxed">
                    Laporan ini telah ditutup oleh administrator sarana prasarana.
                    Silakan tinjau catatan pada riwayat penanganan di bawah.
                  </p>
                </div>
              </div>
            )}

            {/* Detail Laporan & Bukti Foto */}
            <div className="bg-[#FAF8F5] border-2 border-[#09090B] shadow-[4px_4px_0_0_#09090B] p-6 space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#09090B] border-b-2 border-[#09090B] pb-2">
                Rincian Kerusakan & Bukti Foto Awal
              </h3>

              <div>
                <p className="text-xs font-bold uppercase text-[#52525B] mb-1">
                  Deskripsi Kerusakan:
                </p>
                <div className="bg-white border-2 border-[#09090B] p-4 text-xs md:text-sm text-[#09090B] leading-relaxed shadow-[2px_2px_0_0_#09090B]">
                  <RichTextView
                    content={report.descriptionJson}
                    fallbackText={report.descriptionText}
                  />
                </div>
              </div>

              {report.locationDetail && (
                <div>
                  <p className="text-xs font-bold uppercase text-[#52525B] mb-1">
                    Detail Lokasi Tambahan:
                  </p>
                  <p className="text-xs md:text-sm font-medium text-[#09090B]">
                    {report.locationDetail}
                  </p>
                </div>
              )}

              {/* Foto Awal */}
              {report.photos && report.photos.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase text-[#52525B] mb-2 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#09090B]" strokeWidth={2.5} />
                    <span>Foto Bukti Fisik Kerusakan:</span>
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {report.photos.map((p: TrackReport['photos'][number]) => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedImage(p.url)}
                        className="cursor-pointer group relative border-2 border-[#09090B] bg-white p-1.5 shadow-[2px_2px_0_0_#09090B] hover:shadow-[3px_3px_0_0_#09090B] transition-all"
                      >
                        <div className="aspect-square overflow-hidden bg-neutral-100 border border-[#09090B]">
                          <img
                            src={p.url}
                            alt="Bukti kerusakan"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <p className="text-[10px] font-mono text-center mt-1 text-[#52525B]">
                          {p.photoType === 'proof' ? 'Bukti Selesai' : 'Foto Awal'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Riwayat Linimasa (Timeline) */}
            <div className="bg-[#FAF8F5] border-2 border-[#09090B] shadow-[4px_4px_0_0_#09090B] p-6">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#09090B] border-b-2 border-[#09090B] pb-2 mb-4">
                Linimasa Penanganan & Catatan Petugas
              </h3>

              {report.timeline.length === 0 ? (
                <p className="text-xs text-[#52525B]">
                  Belum ada riwayat penanganan tambahan.
                </p>
              ) : (
                <div className="space-y-4">
                  {report.timeline.map((item: TrackReport['timeline'][number], idx: number) => (
                    <div
                      key={item.id || idx}
                      className="border-2 border-[#09090B] bg-white p-3.5 shadow-[2px_2px_0_0_#09090B] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-extrabold text-xs md:text-sm text-[#09090B]">
                            {item.action}
                          </span>
                          <Badge {...getStatusBadgeConfig(item.toStatus)}>
                            {getStatusBadgeConfig(item.toStatus).label}
                          </Badge>
                        </div>
                        {item.notes && (
                          <p className="text-xs text-[#52525B] leading-relaxed">
                            {item.notes}
                          </p>
                        )}
                      </div>
                      <span className="font-mono text-[11px] text-[#52525B] shrink-0">
                        {formatWITA(item.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Lightbox Image Preview Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/80 backdrop-blur-xs cursor-pointer animate-in fade-in"
        >
          <div className="relative max-w-3xl max-h-[85vh] bg-white border-3 border-[#09090B] p-2 shadow-[8px_8px_0_0_#09090B]">
            <img
              src={selectedImage}
              alt="Preview bukti"
              className="max-h-[80vh] w-auto object-contain"
            />
            <p className="text-center text-xs font-bold text-[#09090B] mt-2 font-mono">
              Klik di mana saja untuk menutup
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#FAF8F5] border-t-2 border-[#09090B] py-6 px-4 text-xs font-bold text-[#52525B] text-center mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            SIPRA-UNTAD • Sistem Pelaporan Infrastruktur Kampus Universitas Tadulako
          </span>
          <span className="font-mono text-[11px]">
            Biro Umum dan Keuangan (BUK) UNTAD
          </span>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
