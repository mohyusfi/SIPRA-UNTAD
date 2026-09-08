import * as React from 'react'
import { Key, X, Eye, EyeOff, AlertTriangle, Lock } from 'lucide-react'
import { authClient } from '~/lib/auth-client'
import { Button } from '~/components/ui/button'
import { formatErrorMessage } from '~/lib/utils'

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (message: string) => void
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  onSuccess,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')

  const [showCurrent, setShowCurrent] = React.useState(false)
  const [showNew, setShowNew] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)

  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowCurrent(false)
      setShowNew(false)
      setShowConfirm(false)
      setErrorMessage(null)
      setIsLoading(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleInputChange = (setter: (val: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value)
    if (errorMessage) {
      setErrorMessage(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    // Validasi Formulir
    if (!currentPassword) {
      setErrorMessage('Kata sandi lama wajib diisi.')
      return
    }

    if (!newPassword) {
      setErrorMessage('Kata sandi baru wajib diisi.')
      return
    }

    if (newPassword.length < 8) {
      setErrorMessage('Kata sandi baru minimal harus 8 karakter.')
      return
    }

    if (newPassword === currentPassword) {
      setErrorMessage('Kata sandi baru tidak boleh sama dengan kata sandi lama.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      })

      if (error) {
        // Terjemahkan pesan kesalahan Better Auth ke Bahasa Indonesia yang ramah
        const errLower = (error.message || '').toLowerCase()
        if (errLower.includes('current password') || errLower.includes('invalid') || errLower.includes('incorrect') || error.status === 400) {
          setErrorMessage('Kata sandi lama yang Anda masukkan salah. Silakan periksa kembali.')
        } else {
          setErrorMessage(formatErrorMessage(error.message, 'Gagal mengubah kata sandi. Silakan coba lagi.'))
        }
        setIsLoading(false)
        return
      }

      // Berhasil
      setIsLoading(false)
      onSuccess('Kata sandi Anda berhasil diperbarui!')
      onClose()
    } catch (err: unknown) {
      setErrorMessage(formatErrorMessage(err, 'Terjadi kesalahan sistem saat mengubah kata sandi.'))
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white border-2 border-[#09090B] shadow-[8px_8px_0_0_#09090B] overflow-hidden">
        {/* Header Modal */}
        <div className="p-4 bg-[#FAF8F5] border-b-2 border-[#09090B] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 border-2 border-[#09090B] bg-[#FEF08A] flex items-center justify-center shadow-[2px_2px_0_0_#09090B]">
              <Key className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-black text-sm md:text-base text-[#09090B] leading-none">
                Ganti Kata Sandi
              </h3>
              <p className="text-[11px] font-medium text-[#52525B] mt-1">
                Perbarui kata sandi akun SIPRA-UNTAD Anda
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1 border-2 border-[#09090B] bg-white hover:bg-[#FAF8F5] shadow-[2px_2px_0_0_#09090B] active:shadow-none cursor-pointer transition-all disabled:opacity-50"
            title="Tutup Modal"
          >
            <X className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
          </button>
        </div>

        {/* Body Formulir */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Pesan Error Inline */}
          {errorMessage ? (
            <div className="p-3 bg-[#FEE2E2] border-2 border-[#09090B] shadow-[2px_2px_0_0_#09090B] flex items-start gap-2.5 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" strokeWidth={2.5} />
              <div className="text-xs font-bold text-red-900 leading-tight">
                {errorMessage}
              </div>
            </div>
          ) : null}

          {/* Kolom 1: Kata Sandi Lama */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold uppercase text-[#09090B] tracking-wider">
              Kata Sandi Lama <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={handleInputChange(setCurrentPassword)}
                placeholder="Masukkan kata sandi saat ini"
                disabled={isLoading}
                className="w-full pl-3 pr-10 py-2 text-xs md:text-sm font-medium border-2 border-[#09090B] bg-[#FAF8F5] focus:bg-white focus:outline-none shadow-[2px_2px_0_0_#09090B] placeholder:text-[#71717A]"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                tabIndex={-1}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#52525B] hover:text-[#09090B] cursor-pointer"
                title={showCurrent ? 'Sembunyikan' : 'Lihat kata sandi'}
              >
                {showCurrent ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Kolom 2: Kata Sandi Baru */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold uppercase text-[#09090B] tracking-wider">
              Kata Sandi Baru <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={handleInputChange(setNewPassword)}
                placeholder="Minimal 8 karakter"
                disabled={isLoading}
                className="w-full pl-3 pr-10 py-2 text-xs md:text-sm font-medium border-2 border-[#09090B] bg-[#FAF8F5] focus:bg-white focus:outline-none shadow-[2px_2px_0_0_#09090B] placeholder:text-[#71717A]"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                tabIndex={-1}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#52525B] hover:text-[#09090B] cursor-pointer"
                title={showNew ? 'Sembunyikan' : 'Lihat kata sandi'}
              >
                {showNew ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-[11px] font-medium text-[#52525B]">
              Gunakan minimal 8 karakter agar akun tetap aman.
            </p>
          </div>

          {/* Kolom 3: Konfirmasi Kata Sandi Baru */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold uppercase text-[#09090B] tracking-wider">
              Ulangi Kata Sandi Baru <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={handleInputChange(setConfirmPassword)}
                placeholder="Ketik ulang kata sandi baru"
                disabled={isLoading}
                className="w-full pl-3 pr-10 py-2 text-xs md:text-sm font-medium border-2 border-[#09090B] bg-[#FAF8F5] focus:bg-white focus:outline-none shadow-[2px_2px_0_0_#09090B] placeholder:text-[#71717A]"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                tabIndex={-1}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#52525B] hover:text-[#09090B] cursor-pointer"
                title={showConfirm ? 'Sembunyikan' : 'Lihat kata sandi'}
              >
                {showConfirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t-2 border-[#09090B]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
              className="cursor-pointer"
            >
              <span>Batal</span>
            </Button>
            <Button
              type="submit"
              variant="lime"
              size="sm"
              disabled={isLoading}
              className="cursor-pointer font-black"
            >
              <Lock className="w-3.5 h-3.5 text-[#09090B]" strokeWidth={2.5} />
              <span>{isLoading ? 'Menyimpan...' : 'Simpan Kata Sandi'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
