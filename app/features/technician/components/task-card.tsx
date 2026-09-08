import * as React from 'react'
import {
  MapPin,
  Clock,
  Play,
  Camera,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Loader2,
  FileText,
} from 'lucide-react'
import { formatDate } from '~/lib/utils'
import {
  ReportStatusBadge,
  ReportUrgencyBadge,
} from '~/features/admin/components/report-status-badge'

export interface TechnicianTaskPhoto {
  id: string
  photoType: string
  fileKey: string
  url: string
  createdAt?: string | Date
}

export interface TechnicianTaskItem {
  id: string
  trackingCode: string
  title: string
  descriptionText: string
  urgency: string
  status: string
  categoryName: string
  building: string
  floor?: string
  roomOrArea?: string
  locationDetail?: string | null
  createdAt: string | Date
  updatedAt: string | Date
  photos: TechnicianTaskPhoto[]
  timeline: Array<{
    id: string
    action: string
    fromStatus?: string | null
    toStatus?: string | null
    notes?: string | null
    createdAt: string | Date
  }>
}

interface TaskCardProps {
  task: TechnicianTaskItem
  onStart: (taskId: string) => Promise<void>
  onOpenCompleteModal: (task: TechnicianTaskItem) => void
  isStarting?: boolean
}

export function TaskCard({
  task,
  onStart,
  onOpenCompleteModal,
  isStarting = false,
}: TaskCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [selectedPhoto, setSelectedPhoto] = React.useState<string | null>(null)

  const initialPhotos = task.photos.filter((p) => p.photoType === 'initial')
  const proofPhotos = task.photos.filter((p) => p.photoType === 'proof')

  return (
    <div className="border-2 border-[#09090B] bg-white shadow-[4px_4px_0_0_#09090B] flex flex-col justify-between transition-all">
      {/* Card Header */}
      <div className="p-4 md:p-5 border-b-2 border-[#09090B] bg-[#FAF8F5]">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black px-2 py-0.5 border border-[#09090B] bg-[#FEF08A]">
              {task.trackingCode}
            </span>
            <span className="text-xs font-extrabold uppercase px-2 py-0.5 border border-[#09090B] bg-white text-[#09090B]">
              {task.categoryName}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <ReportUrgencyBadge urgency={task.urgency} />
            <ReportStatusBadge status={task.status} />
          </div>
        </div>

        <h3 className="text-base md:text-lg font-black text-[#09090B] leading-snug">
          {task.title}
        </h3>

        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-[#52525B] mt-2 font-medium">
          <span className="flex items-center gap-1 font-semibold text-[#09090B]">
            <MapPin className="w-3.5 h-3.5 text-[#09090B] flex-shrink-0" />
            {task.building} {task.floor ? `(Lt. ${task.floor})` : ''}{' '}
            {task.roomOrArea ? `• ${task.roomOrArea}` : ''}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            {formatDate(task.createdAt)}
          </span>
        </div>

        {task.locationDetail && (
          <div className="mt-2 text-xs bg-white border border-[#09090B] p-2 text-[#27272A]">
            <span className="font-bold">Detail Lokasi:</span> {task.locationDetail}
          </div>
        )}
      </div>

      {/* Card Body / Description */}
      <div className="p-4 md:p-5 flex-1">
        <p className="text-xs md:text-sm text-[#27272A] line-clamp-2">
          {task.descriptionText}
        </p>

        {/* Thumbnail Preview Foto Awal */}
        {initialPhotos.length > 0 && (
          <div className="mt-3">
            <div className="text-[11px] font-extrabold uppercase text-[#71717A] tracking-wider mb-1 flex items-center gap-1">
              <ImageIcon className="w-3 h-3" /> Foto Kondisi Awal ({initialPhotos.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {initialPhotos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setSelectedPhoto(photo.url)}
                  className="w-14 h-14 border border-[#09090B] overflow-hidden bg-gray-100 hover:opacity-80 transition-opacity"
                >
                  <img
                    src={photo.url}
                    alt="Foto Kerusakan"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Thumbnail Preview Foto Bukti (Jika Ada) */}
        {proofPhotos.length > 0 && (
          <div className="mt-3">
            <div className="text-[11px] font-extrabold uppercase text-green-800 tracking-wider mb-1 flex items-center gap-1">
              <Camera className="w-3 h-3" /> Foto Bukti Selesai ({proofPhotos.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {proofPhotos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setSelectedPhoto(photo.url)}
                  className="w-14 h-14 border border-[#09090B] overflow-hidden bg-green-50 hover:opacity-80 transition-opacity"
                >
                  <img
                    src={photo.url}
                    alt="Foto Bukti Perbaikan"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Expandable Section */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-[#E4E4E7] space-y-3">
            <div>
              <div className="text-xs font-bold text-[#09090B] mb-1">
                Deskripsi Lengkap:
              </div>
              <div className="text-xs text-[#52525B] bg-[#FAF8F5] p-3 border border-[#09090B]">
                {task.descriptionText}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-[#09090B] mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Riwayat Progres Tiket:
              </div>
              <div className="space-y-2 border border-[#09090B] bg-[#FAF8F5] p-3 max-h-40 overflow-y-auto">
                {task.timeline.map((t) => (
                  <div
                    key={t.id}
                    className="text-[11px] border-b border-gray-200 pb-1.5 last:border-b-0 last:pb-0"
                  >
                    <div className="font-extrabold text-[#09090B] flex justify-between">
                      <span>{t.action}</span>
                      <span className="font-normal text-[#71717A] text-[10px]">
                        {formatDate(t.createdAt)}
                      </span>
                    </div>
                    {t.notes && (
                      <div className="text-[#52525B] italic mt-0.5">"{t.notes}"</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card Action Footer */}
      <div className="p-4 border-t-2 border-[#09090B] bg-[#FAF8F5] flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-extrabold text-[#09090B] flex items-center gap-1 hover:underline"
        >
          {isExpanded ? (
            <>
              Tutup Detail <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              Lihat Riwayat & Detail <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>

        <div className="flex items-center gap-2">
          {task.status === 'assigned' && (
            <button
              type="button"
              disabled={isStarting}
              onClick={() => onStart(task.id)}
              className="px-4 py-2 text-xs font-extrabold uppercase border-2 border-[#09090B] bg-[#BAE6FD] hover:bg-[#7DD3FC] shadow-[2px_2px_0_0_#09090B] flex items-center gap-1.5 transition-transform active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50"
            >
              {isStarting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Memulai...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Mulai Kerjakan</span>
                </>
              )}
            </button>
          )}

          {task.status === 'in_progress' && (
            <button
              type="button"
              onClick={() => onOpenCompleteModal(task)}
              className="px-4 py-2 text-xs font-extrabold uppercase border-2 border-[#09090B] bg-[#D9F99D] hover:bg-[#BEF264] shadow-[2px_2px_0_0_#09090B] flex items-center gap-1.5 transition-transform active:translate-x-[2px] active:translate-y-[2px]"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Unggah Bukti & Selesaikan</span>
            </button>
          )}

          {task.status === 'review' && (
            <div className="px-3 py-1.5 text-[11px] font-extrabold uppercase border border-[#09090B] bg-[#E9D5FF] text-[#09090B] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Menunggu Konfirmasi Admin</span>
            </div>
          )}

          {task.status === 'completed' && (
            <div className="px-3 py-1.5 text-[11px] font-extrabold uppercase border border-[#09090B] bg-[#D9F99D] text-[#09090B] flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-green-700" />
              <span>Selesai & Disetujui</span>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox / Foto Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] border-2 border-[#09090B] bg-white p-2">
            <img
              src={selectedPhoto}
              alt="Foto Detail"
              className="max-h-[80vh] w-auto object-contain"
            />
            <div className="text-center text-xs font-mono mt-2 text-[#52525B]">
              Klik di mana saja untuk menutup
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
