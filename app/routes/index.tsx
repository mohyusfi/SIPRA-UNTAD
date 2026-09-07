import { createFileRoute } from '@tanstack/react-router'
import { Radio, CheckCircle2, ShieldCheck, Wrench, ArrowUpRight } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#DDD6FE]">
      {/* Tier 1: Utility Bar */}
      <header className="h-9 bg-[#C4B5FD] border-b-2 border-[#09090B] flex items-center justify-between px-4 text-xs font-bold text-[#09090B]">
        <span>Universitas Tadulako • Kampus Bumi Tadulako Tondo</span>
        <span className="font-mono">WITA (UTC+8)</span>
      </header>

      {/* Tier 2: Main Navigation Bar */}
      <nav className="h-16 bg-[#FAF8F5] border-b-2 border-[#09090B] flex items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#09090B] bg-[#D9F99D] flex items-center justify-center shadow-[2px_2px_0_0_#09090B]">
            <Radio className="w-5 h-5 text-[#09090B]" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-extrabold text-lg md:text-xl tracking-tight text-[#09090B]">
              SIPRA-UNTAD
            </h1>
            <p className="text-[10px] uppercase font-bold text-[#52525B] tracking-wider">
              Sistem Pelaporan Infrastruktur Kampus
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-block transform -rotate-2 bg-[#D9F99D] border-2 border-[#09090B] px-3 py-1 text-xs font-black text-[#09090B] shadow-[2px_2px_0_0_#09090B]">
            SETUP FONDASI AKTIF
          </span>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 flex flex-col items-center justify-center">
        <div className="w-full bg-[#FAF8F5] border-2 border-[#09090B] shadow-[6px_6px_0_0_#09090B] p-6 md:p-8">
          <div className="border-b-2 border-[#09090B] pb-4 mb-6">
            <span className="inline-block transform -rotate-1 bg-[#FEF08A] border-2 border-[#09090B] px-2.5 py-0.5 text-xs font-black font-mono mb-2 shadow-[2px_2px_0_0_#09090B]">
              STATUS SISTEM: SIAP
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#09090B]">
              Fondasi Proyek Berhasil Dikonfigurasi
            </h2>
            <p className="text-sm text-[#52525B] mt-1">
              TanStack Start, React 19, Tailwind CSS v4, Drizzle ORM, dan Better Auth telah terkonfigurasi sesuai spesifikasi PRD.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="border-2 border-[#09090B] bg-white p-4 shadow-[3px_3px_0_0_#09090B]">
              <div className="w-8 h-8 border-2 border-[#09090B] bg-[#BAE6FD] flex items-center justify-center mb-2 shadow-[2px_2px_0_0_#09090B]">
                <CheckCircle2 className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
              </div>
              <h3 className="font-extrabold text-sm text-[#09090B]">Full-stack Core</h3>
              <p className="text-xs text-[#52525B] mt-1">
                TanStack Start SSR, Router berbasis file, dan TanStack Query v5.
              </p>
            </div>

            <div className="border-2 border-[#09090B] bg-white p-4 shadow-[3px_3px_0_0_#09090B]">
              <div className="w-8 h-8 border-2 border-[#09090B] bg-[#FED7AA] flex items-center justify-center mb-2 shadow-[2px_2px_0_0_#09090B]">
                <Wrench className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
              </div>
              <h3 className="font-extrabold text-sm text-[#09090B]">Database & ORM</h3>
              <p className="text-xs text-[#52525B] mt-1">
                PostgreSQL Supabase dengan Drizzle ORM skema relasional lengkap.
              </p>
            </div>

            <div className="border-2 border-[#09090B] bg-white p-4 shadow-[3px_3px_0_0_#09090B]">
              <div className="w-8 h-8 border-2 border-[#09090B] bg-[#FECDD3] flex items-center justify-center mb-2 shadow-[2px_2px_0_0_#09090B]">
                <ShieldCheck className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
              </div>
              <h3 className="font-extrabold text-sm text-[#09090B]">Autentikasi & RBAC</h3>
              <p className="text-xs text-[#52525B] mt-1">
                Better Auth siap dengan 4 peran pengguna dan integrasi Google OAuth.
              </p>
            </div>
          </div>

          <div className="bg-[#E0E7FF] border-2 border-[#09090B] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-[2px_2px_0_0_#09090B]">
            <div>
              <p className="text-xs font-bold text-[#09090B]">
                Siap untuk fase pengembangan fitur
              </p>
              <p className="text-xs text-[#52525B]">
                Struktur proyek telah mengikuti arsitektur modular pada PRD.md.
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D9F99D] border-2 border-[#09090B] shadow-[2px_2px_0_0_#09090B] text-xs font-black uppercase text-[#09090B]">
              <span>Fondasi Selesai</span>
              <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-10 bg-[#FAF8F5] border-t-2 border-[#09090B] flex items-center justify-center px-4 text-xs font-bold text-[#52525B]">
        SIPRA-UNTAD • Sistem Pelaporan Infrastruktur Kampus Universitas Tadulako
      </footer>
    </div>
  )
}
