import * as React from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  UserPlus,
  AlertTriangle,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { z } from 'zod'
import { authClient } from '~/lib/auth-client'
import { Button } from '~/components/ui/button'
import { formatErrorMessage } from '~/lib/utils'

const registerSchema = z
  .object({
    name: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
    email: z.string().email('Format alamat email tidak valid'),
    password: z.string().min(8, 'Kata sandi minimal 8 karakter'),
    confirmPassword: z.string().min(1, 'Konfirmasi kata sandi wajib diisi'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi kata sandi tidak cocok',
    path: ['confirmPassword'],
  })

export function RegisterForm() {
  const navigate = useNavigate()

  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({})
  const [globalError, setGlobalError] = React.useState<string | null>(null)
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})
    setGlobalError(null)
    setSuccessMsg(null)

    const parseResult = registerSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
    })

    if (!parseResult.success) {
      const errors: Record<string, string> = {}
      parseResult.error.issues.forEach((issue) => {
        const key = issue.path[0] as string
        if (!errors[key]) {
          errors[key] = issue.message
        }
      })
      setFieldErrors(errors)
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await authClient.signUp.email({
        name,
        email,
        password,
      })

      if (error) {
        setGlobalError(
          formatErrorMessage(
            error.message,
            'Gagal mendaftar akun. Kemungkinan email sudah digunakan.',
          ),
        )
        setIsLoading(false)
        return
      }

      if (data) {
        setSuccessMsg('Akun berhasil dibuat! Mengalihkan ke dasbor...')
        setTimeout(() => {
          navigate({ to: '/dashboard' as any })
        }, 500)
      }
    } catch (err: unknown) {
      setGlobalError(
        formatErrorMessage(
          err,
          'Terjadi kesalahan sistem saat pendaftaran akun.',
        ),
      )
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="border-2 border-[#09090B] bg-white p-6 md:p-8 shadow-[6px_6px_0_0_#09090B]">
        {/* Header */}
        <div className="mb-6">
          <div className="inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase border border-[#09090B] bg-[#D9F99D] mb-2">
            Pendaftaran Sivitas
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-[#09090B] tracking-tight">
            Buat Akun Pelapor Baru
          </h2>
          <p className="text-xs md:text-sm text-[#52525B] mt-1">
            Daftarkan diri Anda untuk melacak riwayat perbaikan sarana kampus UNTAD secara transparan.
          </p>
        </div>

        {/* Global Error Alert */}
        {globalError ? (
          <div className="mb-6 p-3.5 bg-[#FECDD3] border-2 border-[#09090B] shadow-[2px_2px_0_0_#09090B] flex items-start gap-3">
            <AlertTriangle
              className="w-5 h-5 text-[#09090B] shrink-0 mt-0.5"
              strokeWidth={2.5}
            />
            <div className="text-xs font-bold text-[#09090B]">{globalError}</div>
          </div>
        ) : null}

        {/* Success Alert */}
        {successMsg ? (
          <div className="mb-6 p-3.5 bg-[#D9F99D] border-2 border-[#09090B] shadow-[2px_2px_0_0_#09090B] flex items-center gap-3">
            <CheckCircle2
              className="w-5 h-5 text-[#09090B] shrink-0"
              strokeWidth={2.5}
            />
            <div className="text-xs font-bold text-[#09090B]">{successMsg}</div>
          </div>
        ) : null}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#09090B] mb-1.5">
              Nama Lengkap
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-[#52525B]" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Yusril Rahmat"
                className={`w-full pl-9 pr-3 py-2.5 bg-[#FAF8F5] border-2 text-xs md:text-sm font-medium focus:bg-white focus:outline-none transition-all ${
                  fieldErrors.name
                    ? 'border-red-600 focus:ring-2 focus:ring-red-200'
                    : 'border-[#09090B] focus:ring-2 focus:ring-[#C4B5FD]'
                }`}
              />
            </div>
            {fieldErrors.name ? (
              <p className="text-[11px] text-red-600 font-bold mt-1">
                {fieldErrors.name}
              </p>
            ) : null}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#09090B] mb-1.5">
              Alamat Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-[#52525B]" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@untad.ac.id atau email pribadi"
                className={`w-full pl-9 pr-3 py-2.5 bg-[#FAF8F5] border-2 text-xs md:text-sm font-medium focus:bg-white focus:outline-none transition-all ${
                  fieldErrors.email
                    ? 'border-red-600 focus:ring-2 focus:ring-red-200'
                    : 'border-[#09090B] focus:ring-2 focus:ring-[#C4B5FD]'
                }`}
              />
            </div>
            {fieldErrors.email ? (
              <p className="text-[11px] text-red-600 font-bold mt-1">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#09090B] mb-1.5">
              Kata Sandi (Minimal 8 Karakter)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-[#52525B]" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-9 pr-3 py-2.5 bg-[#FAF8F5] border-2 text-xs md:text-sm font-medium focus:bg-white focus:outline-none transition-all ${
                  fieldErrors.password
                    ? 'border-red-600 focus:ring-2 focus:ring-red-200'
                    : 'border-[#09090B] focus:ring-2 focus:ring-[#C4B5FD]'
                }`}
              />
            </div>
            {fieldErrors.password ? (
              <p className="text-[11px] text-red-600 font-bold mt-1">
                {fieldErrors.password}
              </p>
            ) : null}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#09090B] mb-1.5">
              Konfirmasi Kata Sandi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-[#52525B]" />
              </div>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-9 pr-3 py-2.5 bg-[#FAF8F5] border-2 text-xs md:text-sm font-medium focus:bg-white focus:outline-none transition-all ${
                  fieldErrors.confirmPassword
                    ? 'border-red-600 focus:ring-2 focus:ring-red-200'
                    : 'border-[#09090B] focus:ring-2 focus:ring-[#C4B5FD]'
                }`}
              />
            </div>
            {fieldErrors.confirmPassword ? (
              <p className="text-[11px] text-red-600 font-bold mt-1">
                {fieldErrors.confirmPassword}
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            variant="lime"
            size="md"
            disabled={isLoading}
            className="w-full mt-2"
          >
            <UserPlus className="w-4 h-4" strokeWidth={2.5} />
            <span>{isLoading ? 'Mendaftarkan...' : 'Daftar Akun Pelapor'}</span>
          </Button>
        </form>

        {/* Login Link */}
        <div className="mt-6 pt-4 border-t-2 border-[#09090B] flex items-center justify-between text-xs text-[#52525B]">
          <span>Sudah memiliki akun?</span>
          <Link
            to="/login"
            className="font-bold text-[#09090B] underline hover:text-[#C4B5FD] flex items-center gap-1 cursor-pointer"
          >
            <span>Masuk di Sini</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
