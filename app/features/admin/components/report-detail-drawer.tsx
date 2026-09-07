import * as React from 'react'
import {
  X,
  MapPin,
  User,
  Wrench,
  Tag,
  Clock,
  CheckCircle,
  AlertTriangle,
  Copy,
  CheckSquare,
  Maximize2,
} from 'lucide-react'
import { Button } from '~/components/ui/button'
import { RichTextView } from '~/components/ui/rich-text-view'
import { formatDate } from '~/lib/utils'
import { ReportStatusBadge, ReportUrgencyBadge } from './report-status-badge'

export interface ReportDetailData {
  id: string
  trackingCode: string
  title: string
  descriptionText: string
  descriptionJson: any
  urgency: string
  status: string
  isAnonymous: boolean
  duplicateOfId?: string | null
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
  reporterName: string
  reporterEmail?: string | null
  assignedTechnician?: {
    id: string
    name: string
    email: string
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
    actorName: string
    createdAt: Date | string
  }>
}

interface ReportDetailDrawerProps {
  report: ReportDetailData | null
  isOpen: boolean
  onClose: () => void
  onVerifyClick: () => void
  onAssignClick: () => void
  onRejectClick: () => void
  onDuplicateClick: () => void
  onReviewClick: () => void
}

export function ReportDetailDrawer({
  report,
  isOpen,
  onClose,
  onVerifyClick,
  onAssignClick,
  onRejectClick,
  onDuplicateClick,
  onReviewClick,
}: ReportDetailDrawerProps) {
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null)

  if (!isOpen || !report) return null

  const initialPhotos = report.photos.filter((p) => p.photoType === 'initial')
  const proofPhotos = report.photos.filter((p) => p.photoType === 'proof')

  return (
    <>
      <div className="fixed inset-0 z-40 bg-[#09090B]/60 flex justify-end">
        <div className="w-full max-w-2xl bg-[#FAF8F5] border-l-2 border-[#09090B] shadow-[-8px_0_0_0_#09090B] h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 md:p-6 bg-white border-b-2 border-[#09090B] flex items-start justify-between gap-4 shrink-0">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="font-mono font-extrabold text-xs px-2 py-0.5 border border-[#09090B] bg-[#FAF8F5]">
                  {report.trackingCode}
                </span>
                <ReportStatusBadge status={report.status} />
                <ReportUrgencyBadge urgency={report.urgency} />
              </div>
              <h2 className="text-lg md:text-xl font-extrabold text-[#09090B] leading-snug">
                {report.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-[#52525B] mt-1 font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>Dilaporkan pada {formatDate(report.createdAt)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 border border-[#09090B] bg-white hover:bg-[#FECDD3] shadow-[2px_2px_0_0_#09090B] cursor-pointer transition-all shrink-0"
            >
              <X className="w-5 h-5 text-[#09090B]" strokeWidth={2.5} />
            </button>
          </div>

          {/* Action Bar */}
          <div className="p-3 bg-[#FAF8F5] border-b-2 border-[#09090B] flex flex-wrap items-center gap-2 shrink-0">
            {report.status === 'submitted' ? (
              <>
                <Button
                  variant="lime"
                  size="sm"
                  onClick={onVerifyClick}
                  className="cursor-pointer"
                >
                  <CheckCircle className="w-3.5 h-3.5" strokeWidth={2.5} />
                  <span>Verifikasi</span>
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={onRejectClick}
                  className="cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2.5} />
                  <span>Tolak</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onDuplicateClick}
                  className="cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" strokeWidth={2.5} />
                  <span>Duplikat</span>
                </Button>
              </>
            ) : null}

            {report.status === 'verified' ? (
              <Button
                variant="primary"
                size="sm"
                onClick={onAssignClick}
                className="cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5" strokeWidth={2.5} />
                <span>Tugaskan Teknisi</span>
              </Button>
            ) : null}

            {report.status === 'review' ? (
              <Button
                variant="lime"
                size="sm"
                onClick={onReviewClick}
                className="cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5" strokeWidth={2.5} />
                <span>Review Bukti Hasil Kerja</span>
              </Button>
            ) : null}

            {['completed', 'rejected', 'duplicate'].includes(report.status) ? (
              <div className="text-xs font-bold text-[#52525B] px-2 py-1 bg-white border border-[#09090B]">
                Laporan ini telah berstatus akhir dan ditutup (bersifat mutlak).
              </div>
            ) : null}
          </div>

          {/* Content Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {/* Meta Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Lokasi */}
              <div className="p-3 bg-white border-2 border-[#09090B] shadow-[2px_2px_0_0_#09090B]">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#52525B] mb-1">
                  <MapPin className="w-3.5 h-3.5 text-[#09090B]" />
                  <span>Lokasi Kampus</span>
                </div>
                <div className="font-extrabold text-sm text-[#09090B]">
                  {report.location?.building || 'Area Kampus'}
                </div>
                <div className="text-xs text-[#52525B] mt-0.5">
                  {report.location?.floor ? `${report.location.floor} • ` : ''}
                  {report.location?.roomOrArea || ''}
                </div>
                {report.locationDetail ? (
                  <div className="mt-1.5 text-[11px] font-mono bg-[#FAF8F5] p-1.5 border border-[#09090B]">
                    Catatan: {report.locationDetail}
                  </div>
                ) : null}
              </div>

              {/* Kategori & Pelapor */}
              <div className="p-3 bg-white border-2 border-[#09090B] shadow-[2px_2px_0_0_#09090B]">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#52525B] mb-1">
                  <Tag className="w-3.5 h-3.5 text-[#09090B]" />
                  <span>Kategori Fasilitas</span>
                </div>
                <div className="font-extrabold text-sm text-[#09090B]">
                  {report.category?.name || 'Tanpa Kategori'}
                </div>

                <div className="mt-2 pt-2 border-t border-neutral-200">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#52525B]">
                    <User className="w-3 h-3 text-[#09090B]" />
                    <span>
                      Pelapor:{' '}
                      <strong className="text-[#09090B]">
                        {report.isAnonymous ? 'Anonim' : report.reporterName}
                      </strong>
                    </span>
                  </div>
                  {report.reporterEmail ? (
                    <div className="text-[10px] font-mono text-[#52525B] ml-4.5">
                      {report.reporterEmail}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Teknisi Ditugaskan */}
            <div className="p-3 bg-white border-2 border-[#09090B] shadow-[2px_2px_0_0_#09090B] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border border-[#09090B] bg-[#BAE6FD] flex items-center justify-center">
                  <Wrench className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#52525B]">
                    Teknisi Penanggung Jawab
                  </div>
                  <div className="font-extrabold text-xs md:text-sm text-[#09090B]">
                    {report.assignedTechnician
                      ? report.assignedTechnician.name
                      : 'Belum Ditugaskan'}
                  </div>
                </div>
              </div>

              {report.assignedTechnician ? (
                <span className="font-mono text-xs text-[#52525B]">
                  {report.assignedTechnician.email}
                </span>
              ) : null}
            </div>

            {/* Deskripsi Laporan */}
            <div className="p-4 bg-white border-2 border-[#09090B] shadow-[2px_2px_0_0_#09090B]">
              <div className="text-xs font-bold uppercase tracking-wider text-[#09090B] mb-2 pb-1 border-b border-neutral-200">
                Deskripsi Lengkap Kerusakan
              </div>
              {report.descriptionJson ? (
                <RichTextView content={report.descriptionJson} />
              ) : (
                <p className="text-xs md:text-sm text-[#09090B] whitespace-pre-wrap">
                  {report.descriptionText}
                </p>
              )}
            </div>

            {/* Foto Awal */}
            <div className="p-4 bg-white border-2 border-[#09090B] shadow-[2px_2px_0_0_#09090B]">
              <div className="text-xs font-bold uppercase tracking-wider text-[#09090B] mb-3 flex items-center justify-between">
                <span>Foto Kondisi Awal ({initialPhotos.length})</span>
                <span className="text-[10px] font-mono text-[#52525B]">
                  Signed URL Supabase Storage
                </span>
              </div>
              {initialPhotos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {initialPhotos.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedImage(p.url)}
                      className="group relative h-28 border border-[#09090B] overflow-hidden cursor-pointer bg-neutral-100"
                    >
                      <img
                        src={p.url}
                        alt="Foto awal"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-[#52525B] p-4 text-center bg-[#FAF8F5] border border-[#09090B]">
                  Tidak ada foto awal yang dilampirkan.
                </div>
              )}
            </div>

            {/* Foto Bukti Teknisi */}
            {proofPhotos.length > 0 ? (
              <div className="p-4 bg-white border-2 border-[#09090B] shadow-[2px_2px_0_0_#09090B]">
                <div className="text-xs font-bold uppercase tracking-wider text-[#09090B] mb-3 flex items-center justify-between">
                  <span>Foto Bukti Penyelesaian Fisik ({proofPhotos.length})</span>
                  <span className="text-[10px] font-mono text-[#52525B] px-1.5 py-0.5 bg-[#D9F99D] border border-[#09090B]">
                    Hasil Teknisi
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {proofPhotos.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedImage(p.url)}
                      className="group relative h-28 border border-[#09090B] overflow-hidden cursor-pointer bg-neutral-100"
                    >
                      <img
                        src={p.url}
                        alt="Foto bukti selesai"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Timeline Audit Trail */}
            <div className="p-4 bg-white border-2 border-[#09090B] shadow-[2px_2px_0_0_#09090B]">
              <div className="text-xs font-bold uppercase tracking-wider text-[#09090B] mb-4 pb-1 border-b border-neutral-200 flex items-center justify-between">
                <span>Riwayat Perkembangan &amp; Audit Trail</span>
                <span className="text-[10px] font-mono text-[#52525B]">
                  Terekam Database
                </span>
              </div>

              <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#09090B]">
                {report.timeline.map((t) => (
                  <div key={t.id} className="relative pl-7">
                    <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 -translate-x-1/2 rounded-full border-2 border-[#09090B] bg-[#C4B5FD]" />
                    <div className="p-2.5 bg-[#FAF8F5] border border-[#09090B]">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className="font-extrabold text-xs text-[#09090B]">
                          {t.action}
                        </span>
                        <span className="font-mono text-[10px] text-[#52525B]">
                          {formatDate(t.createdAt)}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#52525B] mt-0.5">
                        Oleh: <strong>{t.actorName}</strong>
                      </div>
                      {t.notes ? (
                        <div className="mt-1 text-xs text-[#09090B] font-medium bg-white p-2 border border-[#09090B]">
                          {t.notes}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Preview Gambar Pembesar */}
      {selectedImage ? (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-3xl max-h-[85vh] bg-white border-2 border-[#09090B] shadow-[8px_8px_0_0_#09090B] p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute -top-3 -right-3 p-1.5 bg-[#FECDD3] border-2 border-[#09090B] font-bold text-xs shadow-[2px_2px_0_0_#09090B] cursor-pointer"
            >
              <X className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
            </button>
            <img
              src={selectedImage}
              alt="Pembesar foto"
              className="max-h-[75vh] w-auto object-contain border border-[#09090B]"
            />
          </div>
        </div>
      ) : null}
    </>
  )
}
