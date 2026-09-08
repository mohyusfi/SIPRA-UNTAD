import * as React from 'react'
import { Link, useNavigate, useLocation } from '@tanstack/react-router'
import { Radio, LogOut, ExternalLink, Shield, Key, CheckCircle2, Menu, X } from 'lucide-react'
import { authClient } from '~/lib/auth-client'
import { Button } from '~/components/ui/button'
import { ChangePasswordModal } from '~/features/auth/components/change-password-modal'

interface DashboardHeaderProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string | null
  }
  roleLabel: string
  roleColor: string
}

export function DashboardHeader({
  user,
  roleLabel,
  roleColor,
}: DashboardHeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [successToast, setSuccessToast] = React.useState<string | null>(null)

  React.useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  const handlePasswordSuccess = (message: string) => {
    setSuccessToast(message)
    setTimeout(() => {
      setSuccessToast(null)
    }, 4000)
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await authClient.signOut()
      navigate({ to: '/login' as any })
    } catch {
      window.location.href = '/login'
    }
  }

  return (
    <header className="border-b-2 border-[#09090B] bg-[#FAF8F5]">
      {/* Top Bar - Desktop Only */}
      <div className="hidden md:flex border-b border-[#09090B] px-4 md:px-8 py-2 bg-[#C4B5FD] items-center justify-between text-xs font-bold text-[#09090B]">
        <div className="flex items-center gap-2">
          <span>Universitas Tadulako</span>
          <span>•</span>
          <span>Panel Operasional Kampus</span>
        </div>
        <div className="flex items-center gap-3">
          {user.role === 'admin' && (
            <Link
              to="/dashboard/monitor"
              className="hover:underline flex items-center gap-1 cursor-pointer font-bold border-r border-[#09090B] pr-3"
            >
              <span>Panel Eksekutif (Pemantau)</span>
            </Link>
          )}
          <Link
            to="/"
            className="hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Buka Beranda Publik</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Main Navbar - Fixed height and single row on mobile */}
      <div className="px-4 md:px-8 py-3 md:py-4 flex items-center justify-between relative">
        <Link to="/" className="flex items-center gap-2.5 md:gap-3 cursor-pointer">
          <div className="w-9 h-9 md:w-10 md:h-10 border-2 border-[#09090B] bg-[#D9F99D] flex items-center justify-center shadow-[2px_2px_0_0_#09090B] shrink-0">
            <Radio className="w-4 h-4 md:w-5 md:h-5 text-[#09090B]" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-extrabold text-base md:text-xl tracking-tight text-[#09090B] leading-none">
              SIPRA-UNTAD
            </div>
            <div className="text-[9px] md:text-[10px] uppercase font-bold text-[#52525B] tracking-wider mt-0.5">
              Dashboard Panel
            </div>
          </div>
        </Link>

        {/* Desktop Controls (hidden on mobile) */}
        <div className="hidden md:flex items-center gap-3">
          {/* User Profile Card */}
          <div className="px-3 py-1.5 border-2 border-[#09090B] bg-white shadow-[2px_2px_0_0_#09090B] flex items-center gap-2.5">
            <div
              className={`w-7 h-7 border border-[#09090B] flex items-center justify-center font-bold text-xs ${roleColor}`}
            >
              <Shield className="w-3.5 h-3.5 text-[#09090B]" strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <div className="font-bold text-xs text-[#09090B] leading-none">
                {user.name || 'Pengguna'}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-mono text-[#52525B]">
                  {user.email}
                </span>
                <span
                  className={`text-[9px] font-extrabold uppercase px-1 py-0.2 border border-[#09090B] ${roleColor}`}
                >
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Change Password Button */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setIsChangePasswordOpen(true)}
            className="cursor-pointer"
            title="Ganti kata sandi akun Anda"
          >
            <Key className="w-3.5 h-3.5 text-[#09090B]" strokeWidth={2.5} />
            <span>Ganti Password</span>
          </Button>

          {/* Logout Button */}
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span>{isLoggingOut ? 'Keluar...' : 'Keluar'}</span>
          </Button>
        </div>

        {/* Mobile Controls (hidden on desktop) */}
        <div className="flex md:hidden items-center gap-2">
          {/* Role Pill */}
          <span
            className={`text-[10px] font-extrabold uppercase px-2 py-1 border-2 border-[#09090B] shadow-[1px_1px_0_0_#09090B] ${roleColor}`}
          >
            {roleLabel}
          </span>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`px-2.5 py-1.5 border-2 border-[#09090B] bg-white shadow-[2px_2px_0_0_#09090B] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer ${
              isMobileMenuOpen ? 'bg-[#FAF8F5]' : ''
            }`}
            title="Menu Akun"
          >
            <div className={`w-4 h-4 border border-[#09090B] flex items-center justify-center ${roleColor}`}>
              <Shield className="w-2.5 h-2.5 text-[#09090B]" strokeWidth={2.5} />
            </div>
            {isMobileMenuOpen ? (
              <X className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
            ) : (
              <Menu className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
            )}
          </button>
        </div>

        {/* Mobile Dropdown Menu Sheet */}
        {isMobileMenuOpen ? (
          <>
            {/* Backdrop to close on tap outside */}
            <div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <div className="absolute top-full left-3 right-3 mt-2 z-50 md:hidden bg-white border-2 border-[#09090B] shadow-[6px_6px_0_0_#09090B] p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* User Identity Info */}
              <div className="p-3 bg-[#FAF8F5] border-2 border-[#09090B] flex items-center gap-3">
                <div
                  className={`w-9 h-9 border-2 border-[#09090B] flex items-center justify-center font-bold text-xs shrink-0 shadow-[1px_1px_0_0_#09090B] ${roleColor}`}
                >
                  <Shield className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
                </div>
                <div className="overflow-hidden min-w-0 flex-1">
                  <div className="font-extrabold text-xs text-[#09090B] truncate">
                    {user.name || 'Pengguna'}
                  </div>
                  <div className="font-mono text-[10px] text-[#52525B] truncate mt-0.5">
                    {user.email}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    setIsChangePasswordOpen(true)
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold border-2 border-[#09090B] bg-white hover:bg-[#FAF8F5] shadow-[2px_2px_0_0_#09090B] active:shadow-none cursor-pointer text-[#09090B] text-left transition-all"
                >
                  <Key className="w-3.5 h-3.5 text-[#09090B]" strokeWidth={2.5} />
                  <span>Ganti Kata Sandi</span>
                </button>

                {user.role === 'admin' && (
                  <Link
                    to="/dashboard/monitor"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold border-2 border-[#09090B] bg-white hover:bg-[#FAF8F5] shadow-[2px_2px_0_0_#09090B] active:shadow-none cursor-pointer text-[#09090B] text-left transition-all"
                  >
                    <Shield className="w-3.5 h-3.5 text-[#09090B]" strokeWidth={2.5} />
                    <span>Panel Eksekutif (Pemantau)</span>
                  </Link>
                )}

                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold border-2 border-[#09090B] bg-white hover:bg-[#FAF8F5] shadow-[2px_2px_0_0_#09090B] active:shadow-none cursor-pointer text-[#09090B] transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <ExternalLink className="w-3.5 h-3.5 text-[#09090B]" strokeWidth={2.5} />
                    <span>Buka Beranda Publik</span>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    handleLogout()
                  }}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold border-2 border-[#09090B] bg-[#FECDD3] hover:bg-[#FDA4AF] shadow-[2px_2px_0_0_#09090B] active:shadow-none cursor-pointer text-[#09090B] text-left transition-all"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#09090B]" strokeWidth={2.5} />
                  <span>{isLoggingOut ? 'Keluar...' : 'Keluar dari Akun'}</span>
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Success Toast */}
      {successToast ? (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 bg-[#D9F99D] border-2 border-[#09090B] shadow-[4px_4px_0_0_#09090B] text-xs font-bold text-[#09090B] animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#09090B] shrink-0" strokeWidth={2.5} />
          <span>{successToast}</span>
        </div>
      ) : null}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        onSuccess={handlePasswordSuccess}
      />
    </header>
  )
}
