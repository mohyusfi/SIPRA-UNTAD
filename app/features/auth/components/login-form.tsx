import * as React from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  LogIn,
  AlertTriangle,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
} from 'lucide-react'
import { authClient } from '~/lib/auth-client'
import { Button } from '~/components/ui/button'
import { QuickFillDemo } from './quick-fill-demo'

interface LoginFormProps {
  initialError?: string
  redirectUrl?: string
}

export function LoginForm({
  initialError,
  redirectUrl = '/dashboard',
}: LoginFormProps) {
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = React.useState<'reporter' | 'staff'>(
    initialError === 'staff_oauth_forbidden' ? 'staff' : 'reporter',
  )
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [errorMsg, setErrorMsg] = React.useState<string | null>(
    initialError === 'staff_oauth_forbidden'
      ? 'Akun staf/petugas wajib masuk menggunakan kata sandi institusi pada tab Petugas.'
      : null,
  )
  const [isLoading, setIsLoading] = React.useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false)
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    setErrorMsg(null)
    setIsGoogleLoading(true)
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: redirectUrl,
      })
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Gagal terhubung dengan layanan Google.'
      setErrorMsg(message)
      setIsGoogleLoading(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!email || !password) {
      setErrorMsg('Email dan kata sandi wajib diisi.')
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      })

      if (error) {
        setErrorMsg(
          error.message || 'Kredensial tidak valid. Silakan periksa kembali email dan kata sandi.',
        )
        setIsLoading(false)
        return
      }

      if (data) {
        setSuccessMsg('Login berhasil! Mengalihkan ke dashboard...')
        const role = (data.user as any)?.role || 'reporter'
        let targetUrl = redirectUrl
        if (!redirectUrl || redirectUrl === '/dashboard') {
          switch (role) {
            case 'admin':
              targetUrl = '/dashboard/admin'
              break
            case 'technician':
              targetUrl = '/dashboard/technician'
              break
            case 'monitor':
              targetUrl = '/dashboard/monitor'
              break
            case 'reporter':
            default:
              targetUrl = '/dashboard/reporter'
              break
          }
        }
        window.location.href = targetUrl
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan sistem saat proses masuk.'
      setErrorMsg(message)
      setIsLoading(false)
    }
  }

  const handleQuickFill = (
    fillEmail: string,
    fillPass: string,
    tab: 'reporter' | 'staff',
  ) => {
    setEmail(fillEmail)
    setPassword(fillPass)
    setActiveTab(tab)
    setErrorMsg(null)
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Tab Switcher */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          type="button"
          onClick={() => {
            setActiveTab('reporter')
            setErrorMsg(null)
          }}
          className={`py-3 px-4 font-bold text-xs md:text-sm border-2 border-[#09090B] flex items-center justify-center gap-2 cursor-pointer transition-all ${
            activeTab === 'reporter'
              ? 'bg-[#C4B5FD] shadow-[3px_3px_0_0_#09090B] translate-x-[1px] translate-y-[1px]'
              : 'bg-white hover:bg-neutral-50'
          }`}
        >
          <UserCheck className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
          <span>Sivitas / Pelapor</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('staff')
            setErrorMsg(null)
          }}
          className={`py-3 px-4 font-bold text-xs md:text-sm border-2 border-[#09090B] flex items-center justify-center gap-2 cursor-pointer transition-all ${
            activeTab === 'staff'
              ? 'bg-[#FEF08A] shadow-[3px_3px_0_0_#09090B] translate-x-[1px] translate-y-[1px]'
              : 'bg-white hover:bg-neutral-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
          <span>Petugas & Admin</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="border-2 border-[#09090B] bg-white p-6 md:p-8 shadow-[6px_6px_0_0_#09090B]">
        {/* Card Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-2 py-0.5 text-[10px] font-extrabold uppercase border border-[#09090B] ${
                activeTab === 'reporter' ? 'bg-[#D9F99D]' : 'bg-[#FEF08A]'
              }`}
            >
              {activeTab === 'reporter' ? 'Portal Sivitas' : 'Portal Manajemen Kampus'}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-[#09090B] tracking-tight">
            {activeTab === 'reporter'
              ? 'Masuk sebagai Pelapor'
              : 'Masuk Petugas & Administrator'}
          </h2>
          <p className="text-xs md:text-sm text-[#52525B] mt-1">
            {activeTab === 'reporter'
              ? 'Gunakan akun Google atau akun lokal untuk memantau dan mengelola laporan Anda.'
              : 'Akses khusus staf sarana-prasarana, teknisi perbaikan, dan pimpinan kampus.'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg ? (
          <div className="mb-6 p-3.5 bg-[#FECDD3] border-2 border-[#09090B] shadow-[2px_2px_0_0_#09090B] flex items-start gap-3">
            <AlertTriangle
              className="w-5 h-5 text-[#09090B] shrink-0 mt-0.5"
              strokeWidth={2.5}
            />
            <div className="text-xs font-bold text-[#09090B] leading-relaxed">
              {errorMsg}
            </div>
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

        {/* Tab 1: Sivitas / Pelapor */}
        {activeTab === 'reporter' ? (
          <div className="space-y-5">
            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
              className="w-full py-3 px-4 font-bold text-sm bg-white text-[#09090B] border-2 border-[#09090B] shadow-[3px_3px_0_0_#09090B] hover:bg-neutral-50 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#09090B] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>
                {isGoogleLoading ? 'Menghubungkan ke Google...' : 'Masuk dengan Google'}
              </span>
            </button>

            {/* Divider */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t-2 border-[#09090B]"></div>
              <span className="shrink-0 mx-3 px-2 text-[11px] font-bold text-[#52525B] uppercase tracking-wider bg-white">
                atau masuk dengan email lokal
              </span>
              <div className="flex-grow border-t-2 border-[#09090B]"></div>
            </div>

            {/* Email & Password Form */}
            <form onSubmit={handleEmailSignIn} className="space-y-4">
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
                    className="w-full pl-9 pr-3 py-2.5 bg-[#FAF8F5] border-2 border-[#09090B] text-xs md:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#09090B]">
                    Kata Sandi
                  </label>
                </div>
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
                    className="w-full pl-9 pr-3 py-2.5 bg-[#FAF8F5] border-2 border-[#09090B] text-xs md:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isLoading || isGoogleLoading}
                className="w-full"
              >
                <LogIn className="w-4 h-4" strokeWidth={2.5} />
                <span>{isLoading ? 'Memverifikasi...' : 'Masuk sebagai Sivitas'}</span>
              </Button>
            </form>

            {/* Registration link */}
            <div className="pt-2 text-center text-xs text-[#52525B]">
              Belum memiliki akun pelapor?{' '}
              <Link
                to="/register"
                className="font-bold text-[#09090B] underline hover:text-[#C4B5FD] cursor-pointer"
              >
                Daftar Akun Baru
              </Link>
            </div>
          </div>
        ) : (
          /* Tab 2: Petugas & Admin */
          <div className="space-y-4">
            <div className="p-3 bg-[#FEF08A] border-2 border-[#09090B] text-xs font-bold text-[#09090B] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" strokeWidth={2.5} />
              <span>
                Login petugas dilindungi kata sandi internal institusi UNTAD.
              </span>
            </div>

            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#09090B] mb-1.5">
                  Email Institusi Staf
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
                    placeholder="admin@untad.ac.id atau teknisi@untad.ac.id"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#FAF8F5] border-2 border-[#09090B] text-xs md:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FEF08A] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#09090B] mb-1.5">
                  Kata Sandi Petugas
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
                    className="w-full pl-9 pr-3 py-2.5 bg-[#FAF8F5] border-2 border-[#09090B] text-xs md:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FEF08A] transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="lime"
                size="md"
                disabled={isLoading}
                className="w-full"
              >
                <ShieldCheck className="w-4 h-4" strokeWidth={2.5} />
                <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Sistem Petugas'}</span>
              </Button>
            </form>
          </div>
        )}

        {/* Quick Back to Home Link */}
        <div className="mt-6 pt-4 border-t-2 border-[#09090B] flex items-center justify-between text-xs text-[#52525B]">
          <Link to="/" className="hover:underline flex items-center gap-1">
            <span>Kembali ke Beranda Utama</span>
          </Link>
          <Link to="/track" className="hover:underline flex items-center gap-1 font-bold text-[#09090B]">
            <span>Lacak Status Tiket</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Demo Account Quick Fill Widget */}
      <QuickFillDemo onSelect={handleQuickFill} />
    </div>
  )
}
