import * as React from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Radio, LogOut, ExternalLink, Shield } from 'lucide-react'
import { authClient } from '~/lib/auth-client'
import { Button } from '~/components/ui/button'

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
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

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
      {/* Top Bar */}
      <div className="border-b border-[#09090B] px-4 md:px-8 py-2 bg-[#C4B5FD] flex items-center justify-between text-xs font-bold text-[#09090B]">
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

      {/* Main Navbar */}
      <div className="px-4 md:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 border-2 border-[#09090B] bg-[#D9F99D] flex items-center justify-center shadow-[2px_2px_0_0_#09090B]">
              <Radio className="w-5 h-5 text-[#09090B]" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-extrabold text-lg md:text-xl tracking-tight text-[#09090B] leading-none">
                SIPRA-UNTAD
              </div>
              <div className="text-[10px] uppercase font-bold text-[#52525B] tracking-wider mt-0.5">
                Dashboard Panel
              </div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
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
      </div>
    </header>
  )
}
