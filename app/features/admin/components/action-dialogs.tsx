import * as React from 'react'
import {
  X,
  CheckCircle,
  UserCheck,
  AlertTriangle,
  Copy,
  RotateCcw,
  CheckSquare,
} from 'lucide-react'
import { Button } from '~/components/ui/button'

interface BaseDialogProps {
  isOpen: boolean
  onClose: () => void
  isLoading?: boolean
}

interface VerifyDialogProps extends BaseDialogProps {
  reportTitle: string
  currentUrgency: string
  onConfirm: (urgency: 'normal' | 'high' | 'emergency') => Promise<void>
}

export function VerifyDialog({
  isOpen,
  onClose,
  isLoading = false,
  reportTitle,
  currentUrgency,
  onConfirm,
}: VerifyDialogProps) {
  const [urgency, setUrgency] = React.useState<'normal' | 'high' | 'emergency'>(
    (currentUrgency as any) || 'normal',
  )

  if (!isOpen) return null

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    await onConfirm(urgency)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/60">
      <div className="w-full max-w-md bg-white border-2 border-[#09090B] shadow-[8px_8px_0_0_#09090B]">
        <div className="p-4 bg-[#A5F3FC] border-b-2 border-[#09090B] flex items-center justify-between">
          <div className="flex items-center gap-2 font-extrabold text-sm text-[#09090B]">
            <CheckCircle className="w-4 h-4" strokeWidth={2.5} />
            <span>Verifikasi Laporan Masuk</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-black/10 cursor-pointer"
          >
            <X className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleVerify} className="p-6 space-y-4">
          <div>
            <div className="text-xs text-[#52525B] uppercase font-bold tracking-wider">
              Judul Laporan
            </div>
            <div className="font-extrabold text-sm text-[#09090B] mt-0.5">
              {reportTitle}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#09090B] mb-1.5">
              Tingkat Urgensi Akhir
            </label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as any)}
              className="w-full p-2.5 bg-[#FAF8F5] border-2 border-[#09090B] text-xs md:text-sm font-bold focus:outline-none cursor-pointer"
            >
              <option value="normal">Normal (Penanganan Terjadwal)</option>
              <option value="high">Tinggi (Mendesak & Mengganggu Perkuliahan)</option>
              <option value="emergency">Darurat (Membahayakan Keselamatan Fisik)</option>
            </select>
          </div>

          <div className="p-3 bg-[#FAF8F5] border border-[#09090B] text-xs text-[#52525B] leading-relaxed">
            Menyetujui laporan ini akan mengubah statusnya menjadi <strong>Diverifikasi</strong>, dan membuka opsi penugasan ke teknisi lapangan.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="lime"
              size="sm"
              disabled={isLoading}
            >
              <CheckCircle className="w-4 h-4" strokeWidth={2.5} />
              <span>{isLoading ? 'Menyimpan...' : 'Setujui & Verifikasi'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface AssignDialogProps extends BaseDialogProps {
  reportTitle: string
  technicians: Array<{ id: string; name: string; email: string }>
  onConfirm: (technicianId: string, notes?: string) => Promise<void>
}

export function AssignTechnicianDialog({
  isOpen,
  onClose,
  isLoading = false,
  reportTitle,
  technicians,
  onConfirm,
}: AssignDialogProps) {
  const [selectedTechId, setSelectedTechId] = React.useState('')
  const [taskNotes, setTaskNotes] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (technicians.length > 0 && !selectedTechId) {
      setSelectedTechId(technicians[0].id)
    }
  }, [technicians, selectedTechId])

  if (!isOpen) return null

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!selectedTechId) {
      setError('Pilih teknisi penanggung jawab.')
      return
    }
    await onConfirm(selectedTechId, taskNotes)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/60">
      <div className="w-full max-w-md bg-white border-2 border-[#09090B] shadow-[8px_8px_0_0_#09090B]">
        <div className="p-4 bg-[#BAE6FD] border-b-2 border-[#09090B] flex items-center justify-between">
          <div className="flex items-center gap-2 font-extrabold text-sm text-[#09090B]">
            <UserCheck className="w-4 h-4" strokeWidth={2.5} />
            <span>Disposisi ke Teknisi Lapangan</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-black/10 cursor-pointer"
          >
            <X className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleAssign} className="p-6 space-y-4">
          <div>
            <div className="text-xs text-[#52525B] uppercase font-bold tracking-wider">
              Laporan Yang Ditugaskan
            </div>
            <div className="font-extrabold text-sm text-[#09090B] mt-0.5">
              {reportTitle}
            </div>
          </div>

          {error ? (
            <div className="p-2 bg-[#FECDD3] border border-[#09090B] text-xs font-bold text-[#09090B]">
              {error}
            </div>
          ) : null}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#09090B] mb-1.5">
              Pilih Teknisi Penanggung Jawab
            </label>
            <select
              value={selectedTechId}
              onChange={(e) => setSelectedTechId(e.target.value)}
              className="w-full p-2.5 bg-[#FAF8F5] border-2 border-[#09090B] text-xs md:text-sm font-bold focus:outline-none cursor-pointer"
            >
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#09090B] mb-1.5">
              Catatan Instruksi untuk Teknisi (Opsional)
            </label>
            <textarea
              rows={3}
              value={taskNotes}
              onChange={(e) => setTaskNotes(e.target.value)}
              placeholder="Contoh: Bawa tangga lipat dan obeng, cek saklar MCB terlebih dahulu."
              className="w-full p-2.5 bg-[#FAF8F5] border-2 border-[#09090B] text-xs md:text-sm font-medium focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="lime"
              size="sm"
              disabled={isLoading}
            >
              <UserCheck className="w-4 h-4" strokeWidth={2.5} />
              <span>{isLoading ? 'Menugaskan...' : 'Tugaskan Sekarang'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface RejectDialogProps extends BaseDialogProps {
  reportTitle: string
  onConfirm: (reason: string) => Promise<void>
}

export function RejectReportDialog({
  isOpen,
  onClose,
  isLoading = false,
  reportTitle,
  onConfirm,
}: RejectDialogProps) {
  const [reason, setReason] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)

  if (!isOpen) return null

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (reason.trim().length < 5) {
      setError('Alasan penolakan wajib diisi minimal 5 karakter.')
      return
    }
    await onConfirm(reason)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/60">
      <div className="w-full max-w-md bg-white border-2 border-[#09090B] shadow-[8px_8px_0_0_#09090B]">
        <div className="p-4 bg-[#FECDD3] border-b-2 border-[#09090B] flex items-center justify-between">
          <div className="flex items-center gap-2 font-extrabold text-sm text-[#09090B]">
            <AlertTriangle className="w-4 h-4" strokeWidth={2.5} />
            <span>Tolak Laporan Kerusakan</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-black/10 cursor-pointer"
          >
            <X className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleReject} className="p-6 space-y-4">
          <div>
            <div className="text-xs text-[#52525B] uppercase font-bold tracking-wider">
              Laporan Yang Ditolak
            </div>
            <div className="font-extrabold text-sm text-[#09090B] mt-0.5">
              {reportTitle}
            </div>
          </div>

          {error ? (
            <div className="p-2 bg-[#FECDD3] border border-[#09090B] text-xs font-bold text-[#09090B]">
              {error}
            </div>
          ) : null}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#09090B] mb-1.5">
              Alasan Penolakan (Wajib Diisi)
            </label>
            <textarea
              required
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Jelaskan alasan mengapa laporan ini tidak dapat ditindaklanjuti (contoh: lokasi bukan fasilitas kampus UNTAD, foto tidak jelas, atau masalah sudah diselesaikan sebelumnya)."
              className="w-full p-2.5 bg-[#FAF8F5] border-2 border-[#09090B] text-xs md:text-sm font-medium focus:bg-white focus:outline-none"
            />
          </div>

          <div className="p-3 bg-[#FECDD3]/30 border border-[#09090B] text-[11px] text-[#09090B]">
            <strong>Perhatian:</strong> Penolakan laporan bersifat mutlak (<em>immutable</em>) dan alasan ini akan ditampilkan kepada pelapor saat melacak kode tiket.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              disabled={isLoading}
            >
              <AlertTriangle className="w-4 h-4" strokeWidth={2.5} />
              <span>{isLoading ? 'Menolak...' : 'Konfirmasi Tolak'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface DuplicateDialogProps extends BaseDialogProps {
  reportTitle: string
  otherReports: Array<{ id: string; trackingCode: string; title: string }>
  onConfirm: (duplicateOfId: string, reason: string) => Promise<void>
}

export function MarkDuplicateDialog({
  isOpen,
  onClose,
  isLoading = false,
  reportTitle,
  otherReports,
  onConfirm,
}: DuplicateDialogProps) {
  const [selectedParentId, setSelectedParentId] = React.useState('')
  const [reason, setReason] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (otherReports.length > 0 && !selectedParentId) {
      setSelectedParentId(otherReports[0].id)
    }
  }, [otherReports, selectedParentId])

  if (!isOpen) return null

  const handleDuplicate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!selectedParentId) {
      setError('Pilih laporan induk rujukan.')
      return
    }
    if (reason.trim().length < 5) {
      setError('Catatan penjelasan minimal 5 karakter.')
      return
    }
    await onConfirm(selectedParentId, reason)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/60">
      <div className="w-full max-w-md bg-white border-2 border-[#09090B] shadow-[8px_8px_0_0_#09090B]">
        <div className="p-4 bg-[#E2E8F0] border-b-2 border-[#09090B] flex items-center justify-between">
          <div className="flex items-center gap-2 font-extrabold text-sm text-[#09090B]">
            <Copy className="w-4 h-4" strokeWidth={2.5} />
            <span>Tandai Sebagai Duplikat</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-black/10 cursor-pointer"
          >
            <X className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleDuplicate} className="p-6 space-y-4">
          <div>
            <div className="text-xs text-[#52525B] uppercase font-bold tracking-wider">
              Laporan Duplikat
            </div>
            <div className="font-extrabold text-sm text-[#09090B] mt-0.5">
              {reportTitle}
            </div>
          </div>

          {error ? (
            <div className="p-2 bg-[#FECDD3] border border-[#09090B] text-xs font-bold text-[#09090B]">
              {error}
            </div>
          ) : null}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#09090B] mb-1.5">
              Pilih Laporan Induk Rujukan
            </label>
            <select
              value={selectedParentId}
              onChange={(e) => setSelectedParentId(e.target.value)}
              className="w-full p-2.5 bg-[#FAF8F5] border-2 border-[#09090B] text-xs md:text-sm font-bold focus:outline-none cursor-pointer"
            >
              {otherReports.map((r) => (
                <option key={r.id} value={r.id}>
                  [{r.trackingCode}] {r.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#09090B] mb-1.5">
              Catatan Penjelasan Duplikasi (Wajib)
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Kerusakan kran air ini sama dengan laporan terdahulu yang saat ini sudah ditugaskan ke teknisi."
              className="w-full p-2.5 bg-[#FAF8F5] border-2 border-[#09090B] text-xs md:text-sm font-medium focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="lime"
              size="sm"
              disabled={isLoading}
            >
              <Copy className="w-4 h-4" strokeWidth={2.5} />
              <span>{isLoading ? 'Menyimpan...' : 'Tandai Duplikat'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface ReviewDialogProps extends BaseDialogProps {
  reportTitle: string
  initialPhotos: Array<{ id: string; url: string }>
  proofPhotos: Array<{ id: string; url: string }>
  onConfirm: (decision: 'approve' | 'return', feedback?: string) => Promise<void>
}

export function ReviewCompletionDialog({
  isOpen,
  onClose,
  isLoading = false,
  reportTitle,
  initialPhotos,
  proofPhotos,
  onConfirm,
}: ReviewDialogProps) {
  const [activeAction, setActiveAction] = React.useState<'idle' | 'return'>('idle')
  const [feedback, setFeedback] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)

  if (!isOpen) return null

  const handleApprove = async () => {
    await onConfirm('approve')
  }

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (feedback.trim().length < 5) {
      setError('Catatan alasan pengembalian minimal 5 karakter.')
      return
    }
    await onConfirm('return', feedback)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/60">
      <div className="w-full max-w-2xl bg-white border-2 border-[#09090B] shadow-[8px_8px_0_0_#09090B] max-h-[90vh] overflow-y-auto">
        <div className="p-4 bg-[#E9D5FF] border-b-2 border-[#09090B] flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2 font-extrabold text-sm text-[#09090B]">
            <CheckSquare className="w-4 h-4" strokeWidth={2.5} />
            <span>Review &amp; Konfirmasi Bukti Perbaikan</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-black/10 cursor-pointer"
          >
            <X className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="text-xs text-[#52525B] uppercase font-bold tracking-wider">
              Judul Laporan
            </div>
            <div className="font-extrabold text-base text-[#09090B] mt-0.5">
              {reportTitle}
            </div>
          </div>

          {/* Photo Comparison Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Foto Sebelum */}
            <div className="border-2 border-[#09090B] p-3 bg-[#FAF8F5]">
              <div className="text-xs font-bold uppercase tracking-wider text-[#09090B] mb-2 flex items-center justify-between">
                <span>Foto Awal Pelapor</span>
                <span className="text-[10px] bg-neutral-200 px-1.5 py-0.5 border border-[#09090B]">Sebelum</span>
              </div>
              {initialPhotos.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {initialPhotos.map((p) => (
                    <img
                      key={p.id}
                      src={p.url}
                      alt="Sebelum perbaikan"
                      className="w-full h-28 object-cover border border-[#09090B]"
                    />
                  ))}
                </div>
              ) : (
                <div className="h-28 flex items-center justify-center text-xs text-[#52525B] bg-white border border-[#09090B]">
                  Tidak ada foto awal
                </div>
              )}
            </div>

            {/* Foto Sesudah */}
            <div className="border-2 border-[#09090B] p-3 bg-[#FAF8F5]">
              <div className="text-xs font-bold uppercase tracking-wider text-[#09090B] mb-2 flex items-center justify-between">
                <span>Bukti Kerja Teknisi</span>
                <span className="text-[10px] bg-[#D9F99D] px-1.5 py-0.5 border border-[#09090B]">Sesudah</span>
              </div>
              {proofPhotos.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {proofPhotos.map((p) => (
                    <img
                      key={p.id}
                      src={p.url}
                      alt="Sesudah perbaikan"
                      className="w-full h-28 object-cover border border-[#09090B]"
                    />
                  ))}
                </div>
              ) : (
                <div className="h-28 flex items-center justify-center text-xs text-[#52525B] bg-white border border-[#09090B]">
                  Belum ada foto bukti fisik
                </div>
              )}
            </div>
          </div>

          {error ? (
            <div className="p-2 bg-[#FECDD3] border border-[#09090B] text-xs font-bold text-[#09090B]">
              {error}
            </div>
          ) : null}

          {/* Action Choice */}
          {activeAction === 'idle' ? (
            <div className="p-4 bg-[#FAF8F5] border-2 border-[#09090B] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-[#52525B]">
                Periksa apakah kerusakan fisik telah benar-benar ditangani dengan baik.
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => setActiveAction('return')}
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  <RotateCcw className="w-4 h-4" strokeWidth={2.5} />
                  <span>Kembalikan</span>
                </Button>
                <Button
                  type="button"
                  variant="lime"
                  size="sm"
                  onClick={handleApprove}
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  <CheckSquare className="w-4 h-4" strokeWidth={2.5} />
                  <span>{isLoading ? 'Menyimpan...' : 'Tutup Selesai'}</span>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReturn} className="p-4 bg-[#FECDD3]/20 border-2 border-[#09090B] space-y-3">
              <div className="text-xs font-bold text-[#09090B]">
                Alasan Pengembalian ke Teknisi (Wajib Diisi):
              </div>
              <textarea
                required
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Contoh: Pipa masih menetes air, tolong eratkan sambungan kran."
                className="w-full p-2.5 bg-white border-2 border-[#09090B] text-xs font-medium focus:outline-none"
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveAction('idle')}
                  disabled={isLoading}
                >
                  Kembali
                </Button>
                <Button
                  type="submit"
                  variant="danger"
                  size="sm"
                  disabled={isLoading}
                >
                  <RotateCcw className="w-4 h-4" strokeWidth={2.5} />
                  <span>{isLoading ? 'Memproses...' : 'Kirim Catatan & Kembalikan'}</span>
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
