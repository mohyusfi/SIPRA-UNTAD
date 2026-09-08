import * as React from 'react'
import {
  X,
  MapPin,
  Tag,
  Clock,
  Shield,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  Maximize2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '~/components/ui/button'
import { RichTextView } from '~/components/ui/rich-text-view'
import { formatDate } from '~/lib/utils'
import {
  ReportStatusBadge,
  ReportUrgencyBadge,
} from '~/features/admin/components/report-status-badge'

export interface ReporterReportData {
  id: string
  trackingCode: string
  title: string
  descriptionText: string
  descriptionJson: unknown
  urgency: string
  status: string
  isAnonymous: boolean
  createdAt: Date | string
  updatedAt: Date | string
  locationDetail?: string | null
  category?: { id: string; name: string } | null
  location?: {
    id: string
    campus: string
    building: string
    floor?: string | null
    roomOrArea?: string | null
  } | null
  photos: Array<{
    id: string
    fileKey: string
    photoType: string
    url: string
    createdAt: Date | string
  }>
  timeline: Array<{
    id: string
    action: string
    fromStatus?: string | null
    toStatus: string
    notes?: string | null
    createdAt: Date | string
  }>
}

interface ReporterReportDetailDrawerProps {
  report: ReporterReportData | null
  isOpen: boolean
  onClose: () => void
}

export function ReporterReportDetailDrawer({
  report,
  isOpen,
  onClose,
}: ReporterReportDetailDrawerProps) {
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)

  if (!isOpen || !report) return null

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(report.trackingCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  const initialPhotos = report.photos.filter((p) => p.photoType === 'initial')
  const proofPhotos = report.photos.filter((p) => p.photoType === 'proof')

  return (
    <>
      <div className="fixed inset-0 z-40 bg-[#09090B]/60 flex justify-end backdrop-blur-xs animate-in fade-in duration-150">
        <div className="w-full max-w-2xl bg-[#FAF8F5] border-l-3 border-[#09090B] shadow-[-8px_0_0_0_#09090B] h-full flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 md:p-6 bg-white border-b-2 border-[#09090B] flex items-start justify-between gap-4 shrink-0">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="font-mono font-black text-xs px-2.5 py-1 border-2 border-[#09090B] bg-[#FAF8F5] shadow-[2px_2px_0_0_#09090B] hover:bg-neutral-100 flex items-center gap-1.5 cursor-pointer transition-all"
                  title="Salin kode lacak"
                >
                  <span>{report.trackingCode}</span>
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-green-700" strokeWidth={3} />
                  ) : (
                    <Copy className="w-3 h-3 text-[#52525B]" />
                  )}
                </button>
                <ReportStatusBadge status={report.status} />
                <ReportUrgencyBadge urgency={report.urgency} />
                {report.isAnonymous && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold uppercase border border-[#09090B] bg-[#FEF08A] text-[#09090B]">
                    <Shield className="w-3 h-3" />
                    <span>Lapor Anonim</span>
                  </span>
                )}
              </div>
              <h2 className="text-lg md:text-xl font-extrabold text-[#09090B] leading-snug">
                {report.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-[#52525B] mt-1 font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>Diajukan pada {formatDate(report.createdAt)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 border-2 border-[#09090B] bg-white hover:bg-[#FECDD3] shadow-[2px_2px_0_0_#09090B] cursor-pointer transition-all shrink-0"
              title="Tutup Panel"
            >
              <X className="w-5 h-5 text-[#09090B]" strokeWidth={2.5} />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {/* Meta Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Lokasi */}
              <div className="p-3 bg-white border-2 border-[#09090B] shadow-[2px_2px_0_0_#09090B]">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#52525B] mb-1">
                  <MapPin className="w-3.5 h-3.5 text-[#09090B]" />
                  <span>Lokasi Kerusakan</span>
                </div>
                {report.location ? (
                  <div className="text-xs space-y-0.5">
                    <p className="font-extrabold text-[#09090B]">
                      {report.location.building}
                    </p>
                    <p className="text-[#52525B]">
                      {report.location.floor ? `${report.location.floor} • ` : ''}
                      {report.location.roomOrArea || 'Area Umum'}
                    </p>
                    <p className="text-[10px] text-[#A1A1AA] font-mono">
                      {report.location.campus}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-[#52525B]">Lokasi tidak ditentukan</p>
                )}
                {report.locationDetail && (
                  <div className="mt-2 pt-2 border-t border-[#09090B]/10 text-xs">
                    <span className="font-bold text-[#09090B]">Patokan: </span>
                    <span className="text-[#52525B]">{report.locationDetail}</span>
                  </div>
                )}
              </div>

              {/* Kategori & Privasi */}
              <div className="p-3 bg-white border-2 border-[#09090B] shadow-[2px_2px_0_0_#09090B]">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#52525B] mb-1">
                  <Tag className="w-3.5 h-3.5 text-[#09090B]" />
                  <span>Kategori & Privasi</span>
                </div>
                <div className="space-y-1.5">
                  <div>
                    <span className="text-[10px] text-[#52525B] block font-mono">
                      Kategori Fasilitas:
                    </span>
                    <span className="font-extrabold text-xs text-[#09090B]">
                      {report.category?.name || 'Umum'}
                    </span>
                  </div>
                  <div className="pt-1.5 border-t border-[#09090B]/10">
                    <span className="text-[10px] text-[#52525B] block font-mono">
                      Mode Pelaporan:
                    </span>
                    {report.isAnonymous ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800">
                        <Shield className="w-3.5 h-3.5" />
                        <span>Anonim (Nama Anda Disamarkan dari Publik)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Resmi Sivitas Kampus</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Deskripsi Kerusakan */}
            <div className="p-4 bg-white border-2 border-[#09090B] shadow-[3px_3px_0_0_#09090B]">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#09090B] mb-2 pb-2 border-b-2 border-[#09090B]">
                Rincian Deskripsi Kerusakan
              </h3>
              <div className="text-xs text-[#09090B] leading-relaxed">
                <RichTextView
                  content={report.descriptionJson}
                  fallbackText={report.descriptionText}
                />
              </div>
            </div>

            {/* Foto Bukti Fisik Awal */}
            <div className="p-4 bg-white border-2 border-[#09090B] shadow-[3px_3px_0_0_#09090B]">
              <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-[#09090B]">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#09090B]">
                  Foto Bukti Kerusakan Awal ({initialPhotos.length})
                </h3>
                <span className="text-[10px] font-mono text-[#52525B]">
                  Klik untuk memperbesar
                </span>
              </div>
              {initialPhotos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {initialPhotos.map((photo, idx) => (
                    <div
                      key={photo.id}
                      onClick={() => setSelectedImage(photo.url)}
                      className="group relative aspect-video border-2 border-[#09090B] bg-neutral-100 overflow-hidden cursor-pointer shadow-[2px_2px_0_0_#09090B] hover:shadow-[3px_3px_0_0_#09090B] transition-all"
                    >
                      <img
                        src={photo.url}
                        alt={`Bukti awal ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-[#09090B]/0 group-hover:bg-[#09090B]/40 transition-colors flex items-center justify-center">
                        <Maximize2 className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <span className="absolute bottom-1 left-1 bg-[#09090B] text-white text-[9px] font-mono px-1">
                        Foto #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#52525B]">Tidak ada foto terlampir.</p>
              )}
            </div>

            {/* Foto Bukti Hasil Perbaikan (Jika Ada) */}
            {proofPhotos.length > 0 && (
              <div className="p-4 bg-[#D9F99D] border-2 border-[#09090B] shadow-[3px_3px_0_0_#09090B]">
                <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-[#09090B]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#09090B]">
                      Bukti Hasil Kerja Teknisi ({proofPhotos.length})
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-[#09090B]">
                    Klik untuk memperbesar
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {proofPhotos.map((photo, idx) => (
                    <div
                      key={photo.id}
                      onClick={() => setSelectedImage(photo.url)}
                      className="group relative aspect-video border-2 border-[#09090B] bg-white overflow-hidden cursor-pointer shadow-[2px_2px_0_0_#09090B] hover:shadow-[3px_3px_0_0_#09090B] transition-all"
                    >
                      <img
                        src={photo.url}
                        alt={`Bukti perbaikan ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-[#09090B]/0 group-hover:bg-[#09090B]/40 transition-colors flex items-center justify-center">
                        <Maximize2 className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <span className="absolute bottom-1 left-1 bg-[#09090B] text-white text-[9px] font-mono px-1">
                        Selesai #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline Histori Penanganan */}
            <div className="p-4 bg-white border-2 border-[#09090B] shadow-[3px_3px_0_0_#09090B]">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#09090B] mb-3 pb-2 border-b-2 border-[#09090B]">
                Riwayat & Jejak Penanganan
              </h3>

              {report.timeline && report.timeline.length > 0 ? (
                <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#09090B]">
                  {report.timeline.map((item, idx) => (
                    <div key={item.id || idx} className="relative group">
                      <div className="absolute -left-6 top-1 w-3.5 h-3.5 border-2 border-[#09090B] bg-[#D9F99D] shadow-[1px_1px_0_0_#09090B]" />
                      <div className="bg-[#FAF8F5] border-2 border-[#09090B] p-3 shadow-[2px_2px_0_0_#09090B]">
                        <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                          <span className="font-extrabold text-xs text-[#09090B]">
                            {item.action}
                          </span>
                          <span className="text-[10px] font-mono text-[#52525B]">
                            {formatDate(item.createdAt)}
                          </span>
                        </div>

                        {item.toStatus && (
                          <div className="mb-1.5">
                            <ReportStatusBadge status={item.toStatus} />
                          </div>
                        )}

                        {item.notes ? (
                          <p className="text-xs text-[#52525B] bg-white p-2 border border-[#09090B]/30 mt-1.5 leading-relaxed">
                            {item.notes}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-[#FAF8F5] border border-[#09090B] text-xs text-[#52525B] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#52525B]" />
                  <span>Belum ada catatan riwayat penanganan baru.</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer Bar */}
          <div className="p-4 bg-white border-t-2 border-[#09090B] flex items-center justify-between gap-3 shrink-0">
            <Link
              to="/track"
              search={{ code: report.trackingCode }}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#09090B] hover:underline"
            >
              <span>Buka di Halaman Pelacakan Publik</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="cursor-pointer"
            >
              Tutup Panel
            </Button>
          </div>
        </div>
      </div>

      {/* Lightbox Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-[#09090B]/80 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-white border-3 border-[#09090B] shadow-[8px_8px_0_0_#09090B] p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white border-2 border-[#09090B] flex items-center justify-center shadow-[2px_2px_0_0_#09090B] hover:bg-[#FECDD3] cursor-pointer"
            >
              <X className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
            </button>
            <img
              src={selectedImage}
              alt="Detail foto kerusakan"
              className="w-full h-auto max-h-[80vh] object-contain border border-[#09090B]"
            />
          </div>
        </div>
      )}
    </>
  )
}
