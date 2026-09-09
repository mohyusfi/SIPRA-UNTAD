import * as React from 'react'
import {
  AlertTriangle,
  Info,
  Shield,
  ShieldCheck,
  User,
  Mail,
  Send,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '~/components/ui/button'
import { TiptapEditor } from './tiptap-editor'
import { PhotoUploader, type UploadedPhoto } from './photo-uploader'
import {
  LocationCascadingSelect,
  type LocationItem,
} from './location-cascading-select'
import { SuccessTicketModal } from './success-ticket-modal'
import { submitReport } from '../reports.fn'
import { cn, formatErrorMessage } from '~/lib/utils'
import { authClient } from '~/lib/auth-client'

interface CategoryItem {
  id: string
  name: string
}

interface ReportFormProps {
  categories: CategoryItem[]
  locations: LocationItem[]
}

export function ReportForm({ categories, locations }: ReportFormProps) {
  const [title, setTitle] = React.useState('')
  const [categoryId, setCategoryId] = React.useState(categories[0]?.id || '')
  const [locationId, setLocationId] = React.useState(locations[0]?.id || '')
  const [locationDetail, setLocationDetail] = React.useState('')
  const [urgency, setUrgency] = React.useState<'normal' | 'high' | 'emergency'>(
    'normal',
  )
  const [description, setDescription] = React.useState({
    json: JSON.stringify({ type: 'doc', content: [] }),
    text: '',
  })
  const [photos, setPhotos] = React.useState<UploadedPhoto[]>([])
  const [isAnonymous, setIsAnonymous] = React.useState(false)
  const [reporterName, setReporterName] = React.useState('')
  const [reporterEmail, setReporterEmail] = React.useState('')
  const [honeypot, setHoneypot] = React.useState('')

  const { data: session } = authClient.useSession()
  const currentUser = session?.user

  const [loading, setLoading] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({})
  const [createdTrackingCode, setCreatedTrackingCode] = React.useState<string | null>(
    null,
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFieldErrors({})

    const errors: Record<string, string> = {}
    if (title.trim().length < 5) {
      errors.title = 'Judul minimal 5 karakter'
    } else if (title.trim().length > 120) {
      errors.title = 'Judul maksimal 120 karakter'
    }

    if (!categoryId) {
      errors.categoryId = 'Pilih salah satu kategori'
    }

    if (!locationId) {
      errors.locationId = 'Pilih lokasi kerusakan'
    }

    if (description.text.trim().length < 20) {
      errors.description = 'Deskripsi kerusakan minimal 20 karakter'
    }

    if (photos.length === 0) {
      errors.photos = 'Wajib melampirkan minimal 1 foto bukti kerusakan'
    }

    if (!isAnonymous && !currentUser) {
      if (!reporterName.trim()) {
        errors.reporterName = 'Nama pelapor wajib diisi (atau centang Lapor Anonim)'
      }
      if (!reporterEmail.trim()) {
        errors.reporterEmail = 'Email pelapor wajib diisi'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reporterEmail.trim())) {
        errors.reporterEmail = 'Format email tidak valid'
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setFormError('Harap periksa kembali isian formulir di atas.')
      return
    }

    setLoading(true)

    try {
      const res = await submitReport({
        data: {
          honeypot,
          title: title.trim(),
          descriptionJson: description.json,
          descriptionText: description.text.trim(),
          categoryId,
          locationId,
          locationDetail: locationDetail.trim(),
          urgency,
          isAnonymous,
          reporterName: isAnonymous
            ? undefined
            : currentUser
              ? currentUser.name
              : reporterName.trim(),
          reporterEmail: isAnonymous
            ? undefined
            : currentUser
              ? currentUser.email
              : reporterEmail.trim(),
          photos,
        },
      })

      if (res.success && res.trackingCode) {
        setCreatedTrackingCode(res.trackingCode)
        setTitle('')
        setDescription({
          json: JSON.stringify({ type: 'doc', content: [] }),
          text: '',
        })
        setLocationDetail('')
        setPhotos([])
        setReporterName('')
        setReporterEmail('')
      } else {
        setFormError(res.error || 'Pengajuan gagal diproses oleh server.')
      }
    } catch (err: unknown) {
      setFormError(
        formatErrorMessage(
          err,
          'Terjadi kesalahan sistem saat mengirim laporan.',
        ),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Honeypot hidden input */}
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />

        {/* Section: Mode Identitas */}
        <div className="border-2 border-[#09090B] bg-[#FAF8F5] p-4 shadow-[3px_3px_0_0_#09090B]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 border-2 border-[#09090B] bg-white flex items-center justify-center shadow-[1px_1px_0_0_#09090B]">
                {currentUser ? (
                  <ShieldCheck className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
                ) : (
                  <Shield className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
                )}
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-[#09090B]">
                  {currentUser ? 'Identitas Pelapor Sivitas' : 'Pilihan Privasi Pelapor'}
                </h4>
                <p className="text-xs text-[#52525B]">
                  {currentUser
                    ? 'Akun Anda terhubung otomatis. Anda juga dapat memilih opsi anonim.'
                    : 'Laporkan secara terbuka atau gunakan proteksi anonim.'}
                </p>
              </div>
            </div>

            <label className="inline-flex items-center gap-2 cursor-pointer bg-white border-2 border-[#09090B] px-3 py-1.5 shadow-[2px_2px_0_0_#09090B] hover:bg-neutral-50 transition-all">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 accent-[#09090B] border-2 border-[#09090B]"
              />
              <span className="text-xs font-bold text-[#09090B] uppercase tracking-wider">
                Kirim Laporan Secara Anonim
              </span>
            </label>
          </div>

          {isAnonymous ? (
            <div className="mt-3 p-2.5 bg-[#FEF08A] border-2 border-[#09090B] text-xs text-[#09090B] font-medium flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-[#09090B]" strokeWidth={2.5} />
              <span>
                {currentUser ? (
                  <>
                    <strong>Mode Anonim Aktif:</strong> Identitas nama & email Anda disembunyikan dari admin, teknisi, dan publik. Namun laporan ini <strong>tetap tersimpan di dashboard pribadi Anda</strong>.
                  </>
                ) : (
                  <>
                    Identitas Anda dirahasiakan total. Perkembangan penanganan hanya
                    dapat dipantau menggunakan <strong>Kode Lacak</strong> yang
                    diberikan setelah pengiriman.
                  </>
                )}
              </span>
            </div>
          ) : currentUser ? (
            <div className="mt-4 pt-3 border-t-2 border-[#09090B]/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border-2 border-[#09090B] p-3.5 shadow-[2px_2px_0_0_#09090B]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 border-2 border-[#09090B] bg-[#C4B5FD] flex items-center justify-center shrink-0 shadow-[1px_1px_0_0_#09090B]">
                    <User className="w-5 h-5 text-[#09090B]" strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm text-[#09090B]">
                        {currentUser.name}
                      </span>
                      <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase border border-[#09090B] bg-[#D9F99D]">
                        Sivitas Terverifikasi
                      </span>
                    </div>
                    <div className="text-xs text-[#52525B] font-mono mt-0.5">
                      {currentUser.email}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 bg-[#FAF8F5] border border-[#09090B] text-[#52525B] self-start sm:self-auto">
                  Profil Login Aktif
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t-2 border-[#09090B]/20">
              <div>
                <label className="block text-xs font-bold uppercase text-[#09090B] mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#09090B]" strokeWidth={2.5} />
                  <span>Nama Lengkap Pelapor</span>
                </label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full bg-white border-2 border-[#09090B] p-2.5 text-xs md:text-sm text-[#09090B] shadow-[2px_2px_0_0_#09090B] focus:outline-none focus:ring-2 focus:ring-[#09090B]"
                />
                {fieldErrors.reporterName && (
                  <p className="text-[11px] font-mono text-red-600 font-bold mt-1">
                    * {fieldErrors.reporterName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#09090B] mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#09090B]" strokeWidth={2.5} />
                  <span>Email Aktif Pelapor</span>
                </label>
                <input
                  type="email"
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                  placeholder="nama@untad.ac.id atau email pribadi"
                  className="w-full bg-white border-2 border-[#09090B] p-2.5 text-xs md:text-sm text-[#09090B] shadow-[2px_2px_0_0_#09090B] focus:outline-none focus:ring-2 focus:ring-[#09090B]"
                />
                {fieldErrors.reporterEmail && (
                  <p className="text-[11px] font-mono text-red-600 font-bold mt-1">
                    * {fieldErrors.reporterEmail}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Section: Judul & Kategori */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase text-[#09090B] mb-1.5">
              Judul Kerusakan Fasilitas *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: AC Ruang Kuliah GKB-201 Mati Total & Berbau Hangus"
              maxLength={120}
              className="w-full bg-white border-2 border-[#09090B] p-2.5 text-xs md:text-sm font-bold text-[#09090B] shadow-[2px_2px_0_0_#09090B] focus:outline-none focus:ring-2 focus:ring-[#09090B]"
            />
            {fieldErrors.title && (
              <p className="text-[11px] font-mono text-red-600 font-bold mt-1">
                * {fieldErrors.title}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#09090B] mb-1.5">
              Kategori Infrastruktur *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-white border-2 border-[#09090B] p-2.5 text-xs md:text-sm font-bold text-[#09090B] shadow-[2px_2px_0_0_#09090B] focus:outline-none focus:ring-2 focus:ring-[#09090B]"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {fieldErrors.categoryId && (
              <p className="text-[11px] font-mono text-red-600 font-bold mt-1">
                * {fieldErrors.categoryId}
              </p>
            )}
          </div>
        </div>

        {/* Section: Lokasi Bertingkat */}
        <div className="border-2 border-[#09090B] bg-[#FAF8F5] p-4 shadow-[3px_3px_0_0_#09090B]">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#09090B] mb-3">
            Penetapan Lokasi Kampus
          </h4>
          <LocationCascadingSelect
            locations={locations}
            selectedLocationId={locationId}
            locationDetail={locationDetail}
            onLocationChange={setLocationId}
            onDetailChange={setLocationDetail}
            error={fieldErrors.locationId}
          />
        </div>

        {/* Section: Tingkat Urgensi */}
        <div>
          <label className="block text-xs font-bold uppercase text-[#09090B] mb-2">
            Tingkat Urgensi Penanganan *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setUrgency('normal')}
              className={cn(
                'border-2 border-[#09090B] p-3 text-left transition-all cursor-pointer flex flex-col justify-between',
                urgency === 'normal'
                  ? 'bg-[#E0E7FF] shadow-[4px_4px_0_0_#09090B] translate-x-[1px] translate-y-[1px]'
                  : 'bg-white hover:bg-neutral-50 shadow-[2px_2px_0_0_#09090B]',
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-xs uppercase text-[#09090B]">
                  Normal
                </span>
                {urgency === 'normal' && (
                  <CheckCircle2 className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
                )}
              </div>
              <p className="text-[11px] text-[#52525B]">
                Kerusakan non-kritis yang tidak langsung menghentikan kegiatan.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setUrgency('high')}
              className={cn(
                'border-2 border-[#09090B] p-3 text-left transition-all cursor-pointer flex flex-col justify-between',
                urgency === 'high'
                  ? 'bg-[#FDE68A] shadow-[4px_4px_0_0_#09090B] translate-x-[1px] translate-y-[1px]'
                  : 'bg-white hover:bg-neutral-50 shadow-[2px_2px_0_0_#09090B]',
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-xs uppercase text-[#09090B]">
                  Tinggi
                </span>
                {urgency === 'high' && (
                  <CheckCircle2 className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
                )}
              </div>
              <p className="text-[11px] text-[#52525B]">
                Mengganggu proses perkuliahan atau mobilitas umum sivitas.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setUrgency('emergency')}
              className={cn(
                'border-2 border-[#09090B] p-3 text-left transition-all cursor-pointer flex flex-col justify-between',
                urgency === 'emergency'
                  ? 'bg-[#FCA5A5] shadow-[4px_4px_0_0_#09090B] translate-x-[1px] translate-y-[1px]'
                  : 'bg-white hover:bg-neutral-50 shadow-[2px_2px_0_0_#09090B]',
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-xs uppercase text-[#09090B]">
                  Darurat
                </span>
                {urgency === 'emergency' && (
                  <CheckCircle2 className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
                )}
              </div>
              <p className="text-[11px] text-[#52525B]">
                Membahayakan keselamatan jiwa / risiko kebakaran / korsleting fatal.
              </p>
            </button>
          </div>
        </div>

        {/* Section: Deskripsi Tiptap */}
        <div>
          <label className="block text-xs font-bold uppercase text-[#09090B] mb-1.5">
            Deskripsi Rinci Kerusakan *
          </label>
          <TiptapEditor
            valueText={description.text}
            onChange={(data) => setDescription(data)}
          />
          {fieldErrors.description && (
            <p className="text-[11px] font-mono text-red-600 font-bold mt-1">
              * {fieldErrors.description}
            </p>
          )}
        </div>

        {/* Section: Upload Foto */}
        <div>
          <label className="block text-xs font-bold uppercase text-[#09090B] mb-1.5">
            Unggah Foto Bukti Fisik Kerusakan (Minimal 1 Foto) *
          </label>
          <PhotoUploader
            photos={photos}
            onChange={setPhotos}
            error={fieldErrors.photos}
          />
        </div>

        {/* Form Error Banner */}
        {formError ? (
          <div className="p-3 border-2 border-[#09090B] bg-[#FECDD3] flex items-center gap-2 text-xs font-bold text-[#09090B] shadow-[2px_2px_0_0_#09090B]">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#09090B]" strokeWidth={2.5} />
            <span>{formError}</span>
          </div>
        ) : null}

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="lime"
            size="lg"
            disabled={loading}
            className="w-full text-sm md:text-base py-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-[#09090B]" />
                <span>Memproses & Mengunggah Bukti...</span>
              </>
            ) : (
              <>
                <span>Kirim Laporan Kerusakan Sekarang</span>
                <Send className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
              </>
            )}
          </Button>
          <p className="text-center text-[11px] text-[#52525B] mt-2 font-mono">
            Sistem Pelaporan Resmi Universitas Tadulako (SIPENAD)
          </p>
        </div>
      </form>

      {/* Success Modal */}
      {createdTrackingCode && (
        <SuccessTicketModal
          isOpen={true}
          trackingCode={createdTrackingCode}
          onClose={() => setCreatedTrackingCode(null)}
        />
      )}
    </>
  )
}
