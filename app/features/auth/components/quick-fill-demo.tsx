import * as React from 'react'
import { ShieldCheck, Wrench, BarChart3, User, KeyRound } from 'lucide-react'

export interface QuickFillAccount {
  label: string
  role: 'admin' | 'technician' | 'monitor' | 'reporter'
  email: string
  password: string
  tab: 'reporter' | 'staff'
  badgeBg: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
}

const DEMO_ACCOUNTS: QuickFillAccount[] = [
  {
    label: 'Admin Sarpras',
    role: 'admin',
    email: 'admin@untad.ac.id',
    password: 'Password123!',
    tab: 'staff',
    badgeBg: 'bg-[#FECDD3]',
    icon: ShieldCheck,
  },
  {
    label: 'Teknisi Lapangan',
    role: 'technician',
    email: 'teknisi@untad.ac.id',
    password: 'Password123!',
    tab: 'staff',
    badgeBg: 'bg-[#FED7AA]',
    icon: Wrench,
  },
  {
    label: 'Pemantau & Pimpinan',
    role: 'monitor',
    email: 'pemantau@untad.ac.id',
    password: 'Password123!',
    tab: 'staff',
    badgeBg: 'bg-[#BAE6FD]',
    icon: BarChart3,
  },
  {
    label: 'Pelapor Sivitas',
    role: 'reporter',
    email: 'pelapor@untad.ac.id',
    password: 'Password123!',
    tab: 'reporter',
    badgeBg: 'bg-[#D9F99D]',
    icon: User,
  },
]

interface QuickFillDemoProps {
  onSelect: (email: string, password: string, tab: 'reporter' | 'staff') => void
}

export function QuickFillDemo({ onSelect }: QuickFillDemoProps) {
  return (
    <div className="mt-8 border-2 border-[#09090B] bg-[#FAF8F5] p-4 shadow-[4px_4px_0_0_#09090B]">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-[#09090B]">
        <div className="w-6 h-6 bg-[#FEF08A] border border-[#09090B] flex items-center justify-center shadow-[1px_1px_0_0_#09090B]">
          <KeyRound className="w-3.5 h-3.5 text-[#09090B]" strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="font-extrabold text-xs tracking-wider uppercase text-[#09090B]">
            Akun Uji Coba Demo (1-Klik Isi)
          </h3>
          <p className="text-[11px] text-[#52525B]">
            Klik salah satu akun di bawah untuk otomatis mengisi form kredensial
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {DEMO_ACCOUNTS.map((acc) => {
          const IconComp = acc.icon
          return (
            <button
              key={acc.email}
              type="button"
              onClick={() => onSelect(acc.email, acc.password, acc.tab)}
              className="p-2.5 bg-white border-2 border-[#09090B] shadow-[2px_2px_0_0_#09090B] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_#09090B] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-left flex items-start gap-2.5 cursor-pointer"
            >
              <div
                className={`w-7 h-7 rounded-none border border-[#09090B] flex items-center justify-center shrink-0 ${acc.badgeBg}`}
              >
                <IconComp className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-xs text-[#09090B] truncate">
                    {acc.label}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1 border border-[#09090B] bg-[#FAF8F5]">
                    {acc.tab === 'staff' ? 'Petugas' : 'Sivitas'}
                  </span>
                </div>
                <div className="font-mono text-[11px] text-[#52525B] truncate mt-0.5">
                  {acc.email}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
