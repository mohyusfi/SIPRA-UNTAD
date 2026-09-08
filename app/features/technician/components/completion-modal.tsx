import * as React from 'react'
import { X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import {
  PhotoUploader,
  type UploadedPhoto,
} from '~/features/reports/components/photo-uploader'
import { completeTaskAction } from '../technician.fn'
import { formatErrorMessage } from '~/lib/utils'

export interface TechnicianTaskSummary {
  id: string
  trackingCode: string
  title: string
  building: string
  floor?: string
  roomOrArea?: string
  locationDetail?: string | null
}

interface CompletionModalProps {
  task: TechnicianTaskSummary | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CompletionModal({
  task,
  isOpen,
  onClose,
  onSuccess,
}: CompletionModalProps) {
  const [notes, setNotes] = React.useState('')
  const [photos, setPhotos] = React.useState<UploadedPhoto[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (isOpen) {
      setNotes('')
      setPhotos([])
      setErrorMessage(null)
    }
  }, [isOpen, task])

  if (!isOpen || !task) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (notes.trim().length < 5) {
      setErrorMessage('Catatan perbaikan teknis wajib diisi minimal 5 karakter.')
      return
    }

    if (photos.length === 0) {
      setErrorMessage('Wajib mengunggah minimal 1 foto bukti fisik perbaikan.')
      return
    }

    setIsSubmitting(true)

    try {
      await completeTaskAction({
        data: {
          reportId: task.id,
          notes: notes.trim(),
          photos,
        },
      })
      onSuccess()
      onClose()
    } catch (err: unknown) {
      setErrorMessage(
        formatErrorMessage(
          err,
          'Terjadi kesalahan saat menyimpan bukti perbaikan.',
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
      <div className="border-2 border-[#09090B] bg-[#FAF8F5] shadow-[8px_8px_0_0_#09090B] w-full max-w-2xl my-8 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-2 border-[#09090B] bg-[#FED7AA] px-5 py-4">
          <div>
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase border border-[#09090B] bg-white text-[#09090B] font-mono">
              {task.trackingCode}
            </span>
            <h2 className="text-lg font-black text-[#09090B] mt-1">
              Penyelesaian Perbaikan Fisik
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 border border-[#09090B] bg-white hover:bg-[#F4F4F5] transition-colors"
          >
            <X className="w-5 h-5 text-[#09090B]" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-5">
          {/* Target Info */}
          <div className="border-2 border-[#09090B] bg-white p-3.5">
            <div className="text-xs text-[#52525B] font-bold">Judul Masalah:</div>
            <div className="font-extrabold text-[#09090B] text-sm md:text-base">
              {task.title}
            </div>
            <div className="text-xs text-[#52525B] mt-1 flex flex-wrap gap-2">
              <span>
                <strong>Gedung:</strong> {task.building}
              </span>
              {task.floor && (
                <span>
                  • <strong>Lantai:</strong> {task.floor}
                </span>
              )}
              {task.roomOrArea && (
                <span>
                  • <strong>Ruang:</strong> {task.roomOrArea}
                </span>
              )}
            </div>
          </div>

          {errorMessage && (
            <div className="border-2 border-[#09090B] bg-[#FCA5A5] p-3 text-xs font-bold text-[#09090B] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#09090B]" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Photo Uploader */}
          <div>
            <label className="block text-xs md:text-sm font-extrabold text-[#09090B] uppercase tracking-wider mb-1">
              Foto Bukti Hasil Perbaikan <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-[#52525B] mb-2">
              Unggah 1 hingga 5 foto bukti fisik hasil perbaikan (Otomatis dikompresi ke WebP).
            </p>
            <PhotoUploader
              photos={photos}
              onChange={setPhotos}
              maxPhotos={5}
            />
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-xs md:text-sm font-extrabold text-[#09090B] uppercase tracking-wider mb-1">
              Catatan Tindakan Teknis <span className="text-red-600">*</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Penggantian saklar lampu dan kabel grounding baru. Lampu telah diuji coba menyala stabil."
              className="w-full border-2 border-[#09090B] p-3 text-xs md:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#09090B] font-sans placeholder:text-gray-400"
            />
            <div className="flex justify-between text-[11px] text-[#71717A] mt-1 font-mono">
              <span>Minimal 5 karakter</span>
              <span>{notes.length} karakter</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-[#09090B]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs md:text-sm font-extrabold uppercase border-2 border-[#09090B] bg-white hover:bg-[#F4F4F5] shadow-[2px_2px_0_0_#09090B] transition-transform active:translate-x-[2px] active:translate-y-[2px]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || photos.length === 0 || notes.trim().length < 5}
              className="px-5 py-2 text-xs md:text-sm font-extrabold uppercase border-2 border-[#09090B] bg-[#D9F99D] hover:bg-[#BEF264] shadow-[3px_3px_0_0_#09090B] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-transform active:translate-x-[2px] active:translate-y-[2px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#09090B]" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#09090B]" />
                  <span>Kirim Bukti & Selesaikan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
