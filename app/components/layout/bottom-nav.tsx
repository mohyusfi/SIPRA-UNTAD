import * as React from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { Home, PlusCircle, Search, LogIn, LayoutDashboard } from 'lucide-react'
import { authClient } from '~/lib/auth-client'
import { cn } from '~/lib/utils'

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const pathname = location.pathname
  const { data: session } = authClient.useSession()
  const user = session?.user
  const userRole = (user as any)?.role
  const dashboardPath = userRole ? `/dashboard/${userRole}` : '/dashboard'

  const handleLaporClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (pathname === '/') {
      const el = document.getElementById('report-form-section')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      navigate({ to: '/', hash: 'report-form-section' })
    }
  }

  const isHome = pathname === '/'
  const isTrack = pathname === '/track'
  const isLogin = pathname === '/login'
  const isDashboard = pathname.startsWith('/dashboard')

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5] border-t-2 border-[#09090B] shadow-[0_-2px_0_0_#09090B] px-3 py-2">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <Link
          to="/"
          preload="intent"
          className={cn(
            'flex flex-col items-center justify-center py-1 px-3 border-2 border-transparent transition-all cursor-pointer min-w-[60px]',
            isHome
              ? 'border-[#09090B] bg-[#C4B5FD] shadow-[2px_2px_0_0_#09090B]'
              : 'hover:bg-neutral-100 text-[#52525B]',
          )}
        >
          <Home className="w-5 h-5 text-[#09090B]" strokeWidth={2.5} />
          <span className="text-[10px] font-extrabold uppercase tracking-tight text-[#09090B] mt-0.5">
            Beranda
          </span>
        </Link>

        <button
          type="button"
          onClick={handleLaporClick}
          className="flex flex-col items-center justify-center py-1 px-3 border-2 border-[#09090B] bg-[#D9F99D] shadow-[2px_2px_0_0_#09090B] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer min-w-[60px]"
        >
          <PlusCircle className="w-5 h-5 text-[#09090B]" strokeWidth={2.5} />
          <span className="text-[10px] font-extrabold uppercase tracking-tight text-[#09090B] mt-0.5">
            Lapor
          </span>
        </button>

        <Link
          to="/track"
          preload="intent"
          className={cn(
            'flex flex-col items-center justify-center py-1 px-3 border-2 border-transparent transition-all cursor-pointer min-w-[60px]',
            isTrack
              ? 'border-[#09090B] bg-[#C4B5FD] shadow-[2px_2px_0_0_#09090B]'
              : 'hover:bg-neutral-100 text-[#52525B]',
          )}
        >
          <Search className="w-5 h-5 text-[#09090B]" strokeWidth={2.5} />
          <span className="text-[10px] font-extrabold uppercase tracking-tight text-[#09090B] mt-0.5">
            Lacak
          </span>
        </Link>

        {user ? (
          <Link
            to={dashboardPath as any}
            preload="intent"
            className={cn(
              'flex flex-col items-center justify-center py-1 px-3 border-2 border-transparent transition-all cursor-pointer min-w-[60px]',
              isDashboard
                ? 'border-[#09090B] bg-[#C4B5FD] shadow-[2px_2px_0_0_#09090B]'
                : 'hover:bg-neutral-100 text-[#52525B]',
            )}
          >
            <LayoutDashboard className="w-5 h-5 text-[#09090B]" strokeWidth={2.5} />
            <span className="text-[10px] font-extrabold uppercase tracking-tight text-[#09090B] mt-0.5">
              Dashboard
            </span>
          </Link>
        ) : (
          <Link
            to="/login"
            preload="intent"
            className={cn(
              'flex flex-col items-center justify-center py-1 px-3 border-2 border-transparent transition-all cursor-pointer min-w-[60px]',
              isLogin
                ? 'border-[#09090B] bg-[#C4B5FD] shadow-[2px_2px_0_0_#09090B]'
                : 'hover:bg-neutral-100 text-[#52525B]',
            )}
          >
            <LogIn className="w-5 h-5 text-[#09090B]" strokeWidth={2.5} />
            <span className="text-[10px] font-extrabold uppercase tracking-tight text-[#09090B] mt-0.5">
              Masuk
            </span>
          </Link>
        )}
      </div>
    </div>
  )
}
