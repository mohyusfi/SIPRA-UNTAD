import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { Radio, Search, LogIn, ArrowLeft, LayoutDashboard } from 'lucide-react'
import { authClient } from '~/lib/auth-client'

interface PublicNavbarProps {
  subtitle?: string
  isTrackPage?: boolean
}

export function PublicNavbar({
  subtitle = 'Sistem Pelaporan Infrastruktur Kampus',
  isTrackPage = false,
}: PublicNavbarProps) {
  const { data: session } = authClient.useSession()
  const user = session?.user

  return (
    <>
      {/* Tier 1: Utility Bar (Desktop Only) */}
      <header className="hidden md:flex h-9 bg-[#C4B5FD] border-b-2 border-[#09090B] items-center justify-between px-4 lg:px-8 text-xs font-bold text-[#09090B]">
        <div className="flex items-center gap-2 truncate">
          {isTrackPage ? (
            <Link
              to="/"
              className="flex items-center gap-1 hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span>Kembali ke Beranda</span>
            </Link>
          ) : (
            <>
              <span>Universitas Tadulako</span>
              <span>•</span>
              <span>Kampus Bumi Tadulako Tondo</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-mono">WITA (UTC+8)</span>
          {!isTrackPage ? (
            <>
              <span>•</span>
              {user ? (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" strokeWidth={2.5} />
                  <span>Dashboard ({user.name || 'Pengguna'})</span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" strokeWidth={2.5} />
                  <span>Masuk Sivitas</span>
                </Link>
              )}
            </>
          ) : null}
        </div>
      </header>

      {/* Tier 2: Main Navigation Bar */}
      <nav className="h-16 bg-[#FAF8F5] border-b-2 border-[#09090B] flex items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#09090B] bg-[#D9F99D] flex items-center justify-center shadow-[2px_2px_0_0_#09090B]">
            <Radio className="w-5 h-5 text-[#09090B]" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-extrabold text-lg md:text-xl tracking-tight text-[#09090B] leading-none">
              SIPRA-UNTAD
            </h1>
            <p className="hidden sm:block text-[10px] uppercase font-bold text-[#52525B] tracking-wider mt-0.5">
              {subtitle}
            </p>
          </div>
        </Link>

        {/* Action Buttons (Desktop Only - Mobile actions handled by BottomNav) */}
        <div className="hidden md:flex items-center gap-3">
          {isTrackPage ? (
            <Link
              to="/"
              className="px-4 py-2 font-bold text-xs md:text-sm bg-white text-[#09090B] border-2 border-[#09090B] shadow-[3px_3px_0_0_#09090B] hover:bg-neutral-100 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#09090B] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Buat Laporan Baru</span>
            </Link>
          ) : (
            <>
              <Link
                to="/track"
                className="px-4 py-2 font-bold text-xs md:text-sm bg-white text-[#09090B] border-2 border-[#09090B] shadow-[3px_3px_0_0_#09090B] hover:bg-neutral-100 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#09090B] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Search className="w-4 h-4" strokeWidth={2.5} />
                <span>Lacak Tiket</span>
              </Link>

              {user ? (
                <Link
                  to="/dashboard"
                  className="px-4 py-2 font-bold text-xs md:text-sm bg-[#D9F99D] text-[#09090B] border-2 border-[#09090B] shadow-[3px_3px_0_0_#09090B] hover:bg-[#BEF264] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#09090B] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4" strokeWidth={2.5} />
                  <span>Panel Dashboard</span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 font-bold text-xs md:text-sm bg-[#C4B5FD] text-[#09090B] border-2 border-[#09090B] shadow-[3px_3px_0_0_#09090B] hover:bg-[#A78BFA] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#09090B] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" strokeWidth={2.5} />
                  <span>Masuk</span>
                </Link>
              )}
            </>
          )}
        </div>
      </nav>
    </>
  )
}
