import * as React from 'react'
import {
  X,
  MapPin,
  User,
  Wrench,
  Tag,
  Clock,
  Maximize2,
  ShieldCheck,
  FileText,
  Camera,
  History,
} from 'lucide-react'
import { RichTextView } from '~/components/ui/rich-text-view'
import { formatDate } from '~/lib/utils'
import {
  ReportStatusBadge,
  ReportUrgencyBadge,
} from '~/features/admin/components/report-status-badge'
import type { MonitorReportItem } from '../monitor.fn'

interface MonitorReportDrawerProps {
  report: MonitorReportItem | null
  isOpen: boolean
  onClose: () => void
}

export function MonitorReportDrawer({
  report,
  isOpen,
  onClose,
}: MonitorReportDrawerProps) {
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null)

  if (!isOpen || !report) return null

  const initialPhotos = report.photos.filter((p) => p.photoType === 'initial')
  const proofPhotos = report.photos.filter((p) => p.photoType === 'proof')

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-[#09090B]/60 backdrop-blur-xs flex justify-end"
        onClick={onClose}
      >
        <div
          className="w-full max-w-2xl bg-[#FAF8F5] border-l-2 border-[#09090B] shadow-[-8px_0_0_0_#09090B] h-full flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 md:p-6 bg-white border-b-2 border-[#09090B] flex items-start justify-between gap-4 shrink-0">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-mono font-extrabold text-xs px-2 py-0.5 border border-[#09090B] bg-[#FAF8F5]">
                  {report.trackingCode}
                </span>
                <ReportStatusBadge status={report.status} />
                <ReportUrgencyBadge urgency={report.urgency} />
              </div>
              <h2 className="text-lg md:text-xl font-extrabold text-[#09090B] leading-snug">
                {report.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-[#52525B] mt-1.5 font-mono">
                <Clock className="w-3.5 h-3.5 text-[#09090B]" />
                <span>Diajukan pada {formatDate(report.createdAt)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 border border-[#09090B] bg-white hover:bg-[#FECDD3] shadow-[2px_2px_0_0_#09090B] cursor-pointer transition-all shrink-0"
              title="Tutup Panel"
            >
              <X className="w-5 h-5 text-[#09090B]" strokeWidth={2.5} />
            </button>
          </div>

          {/* Read-Only Notice Bar */}
          <div className="px-4 py-2 bg-[#BAE6FD] border-b-2 border-[#09090B] flex items-center gap-2 text-xs font-bold text-[#09090B]">
            <ShieldCheck className="w-4 h-4 shrink-0" strokeWidth={2.5} />
            <span>Mode Pemantauan &amp; Audit Eksekutif (Akses Read-Only)</span>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {/* Meta Grid */}
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
                  {report.location?.roomOrArea || '-'}
                </div>
                {report.locationDetail && (
                  <div className="mt-1.5 text-[11px] font-mono bg-[#FAF8F5] p-1.5 border border-[#09090B]">
                    Detail: {report.locationDetail}
                  </div>
                )}
              </div>

              {/* Kategori & Pelapor */}
              <div className="p-3 bg-white border-2 border-[#09090B] shadow-[2px_2px_0_0_#09090B]">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#52525B] mb-1">
                  <Tag className="w-3.5 h-3.5 text-[#09090B]" />
                  <span>Kategori Sarana</span>
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
                        {report.isAnonymous ? 'Anonim' : (report.reporterName || 'Sivitas')}
                      </strong>
                    </span>
                  </div>
                  {report.reporterEmail && !report.isAnonymous && (
                    <div className="text-[10px] font-mono text-[#52525B] ml-4.5">
                      {report.reporterEmail}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Teknisi Penanggung Jawab */}
            <div className="p-3 bg-white border-2 border-[#09090B] shadow-[2px_2px_0_0_#09090B] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border border-[#09090B] bg-[#FED7AA] flex items-center justify-center">
                  <Wrench className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#52525B]">
                    Teknisi Penanggung Jawab
                  </div>
                  <div className="font-extrabold text-xs md:text-sm text-[#09090B]">
                    {report.assignedTechnicianName || 'Belum Ditugaskan Teknisi'}
                  </div>
                </div>
              </div>
            </div>

            {/* Deskripsi Masalah */}
            <div className="p-4 bg-white border-2 border-[#09090B] shadow-[2px_2px_0_0_#09090B]">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#09090B] mb-2 pb-1 border-b border-neutral-200">
                <FileText className="w-3.5 h-3.5" />
                <span>Rincian Deskripsi Kerusakan</span>
              </div>
              {report.descriptionJson ? (
                <RichTextView
                  content={report.descriptionJson}
                  fallbackText={report.descriptionText}
                />
              ) : (
                <p className="text-xs md:text-sm text-[#09090B] whitespace-pre-wrap">
                  {report.descriptionText}
                </p>
              )}
            </div>

            {/* Foto Kondisi Awal */}
            <div className="p-4 bg-white border-2 border-[#09090B] shadow-[2px_2px_0_0_#09090B]">
              <div className="text-xs font-bold uppercase tracking-wider text-[#09090B] mb-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Foto Kondisi Awal ({initialPhotos.length})</span>
                </div>
                <span className="text-[10px] font-mono text-[#52525B]">
                  Bukti Pelapor
                </span>
              </div>
              {initialPhotos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {initialPhotos.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => p.url && setSelectedImage(p.url)}
                      className="group relative h-28 border border-[#09090B] overflow-hidden cursor-pointer bg-neutral-100"
                    >
                      {p.url ? (
                        <img
                          src={p.url}
                          alt="Foto awal"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-[#52525B]">
                          Pratinjau tidak tersedia
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-[#52525B] p-3 text-center bg-[#FAF8F5] border border-[#09090B]">
                  Tidak ada foto awal yang dilampirkan.
                </div>
              )}
            </div>

            {/* Foto Bukti Penyelesaian (Proof) */}
            {proofPhotos.length > 0 && (
              <div className="p-4 bg-white border-2 border-[#09090B] shadow-[2px_2px_0_0_#09090B]">
                <div className="text-xs font-bold uppercase tracking-wider text-[#09090B] mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Foto Bukti Penyelesaian ({proofPhotos.length})</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-[#D9F99D] border border-[#09090B]">
                    Hasil Teknisi
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {proofPhotos.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => p.url && setSelectedImage(p.url)}
                      className="group relative h-28 border border-[#09090B] overflow-hidden cursor-pointer bg-neutral-100"
                    >
                      {p.url ? (
                        <img
                          src={p.url}
                          alt="Foto bukti perbaikan"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-[#52525B]">
                          Pratinjau tidak tersedia
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline & Audit Trail */}
            <div className="p-4 bg-white border-2 border-[#09090B] shadow-[2px_2px_0_0_#09090B]">
              <div className="text-xs font-bold uppercase tracking-wider text-[#09090B] mb-4 pb-1 border-b border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" />
                  <span>Jejak Audit &amp; Riwayat Tindakan</span>
                </div>
                <span className="text-[10px] font-mono text-[#52525B]">
                  {report.timeline.length} Aktivitas
                </span>
              </div>

              {report.timeline.length === 0 ? (
                <div className="text-xs text-[#52525B] p-3 text-center bg-[#FAF8F5] border border-[#09090B]">
                  Belum ada catatan riwayat tindakan.
                </div>
              ) : (
                <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#09090B]">
                  {report.timeline.map((t) => (
                    <div key={t.id} className="relative pl-7">
                      <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 -translate-x-1/2 rounded-full border-2 border-[#09090B] bg-[#BAE6FD]" />
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
                          Oleh: <strong>{t.actorName || 'Sistem'}</strong>
                          {t.actorRole ? ` (${t.actorRole})` : ''}
                        </div>
                        {t.notes && (
                          <div className="mt-1 text-xs text-[#09090B] font-medium bg-white p-2 border border-[#09090B]">
                            {t.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Preview Zoom Foto */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
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
              alt="Zoom foto"
              className="max-h-[75vh] w-auto object-contain border border-[#09090B]"
            />
          </div>
        </div>
      )}
    </>
  )
}
