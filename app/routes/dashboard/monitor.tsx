import { createFileRoute, redirect } from '@tanstack/react-router'
import { BarChart3, TrendingUp, MapPin, Layers } from 'lucide-react'
import { getCurrentUserSession } from '~/lib/auth-server'
import { DashboardHeader } from '~/features/dashboard/components/dashboard-header'

export const Route = createFileRoute('/dashboard/monitor')({
  beforeLoad: async () => {
    const session = await getCurrentUserSession()
    if (!session?.user) {
      throw redirect({
        to: '/login',
        search: { redirect: '/dashboard/monitor' },
      })
    }
    const role = (session.user as any).role
    if (role !== 'monitor') {
      throw redirect({ to: '/dashboard' })
    }
    return { user: session.user }
  },
  loader: async ({ context }: { context: { user: any } }) => {
    return { user: context.user }
  },
  component: MonitorDashboardPage,
})

function MonitorDashboardPage() {
  const { user } = Route.useLoaderData()

  return (
    <div className="min-h-screen flex flex-col bg-[#DDD6FE]">
      <DashboardHeader
        user={user}
        roleLabel="Pemantau & Pimpinan"
        roleColor="bg-[#BAE6FD]"
      />

      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
        {/* Welcome Banner */}
        <div className="border-2 border-[#09090B] bg-[#FAF8F5] p-6 shadow-[6px_6px_0_0_#09090B] mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase border border-[#09090B] bg-[#BAE6FD]">
              Peran: Pemantau Eksekutif & Pimpinan
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#09090B]">
            Selamat Datang, {user.name}
          </h1>
          <p className="text-xs md:text-sm text-[#52525B] mt-1 max-w-2xl">
            Panel analitik eksekutif untuk mengamati metrik performa penanganan sarana prasarana kampus UNTAD secara transparan dan terukur (read-only).
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border-2 border-[#09090B] bg-white p-5 shadow-[4px_4px_0_0_#09090B]">
            <div className="w-9 h-9 border border-[#09090B] bg-[#BAE6FD] flex items-center justify-center mb-3">
              <BarChart3 className="w-5 h-5 text-[#09090B]" strokeWidth={2.5} />
            </div>
            <div className="font-extrabold text-sm text-[#09090B]">
              Statistik Laporan
            </div>
            <p className="text-xs text-[#52525B] mt-1">
              Ringkasan volume total laporan yang masuk, diproses, dan diselesaikan.
            </p>
          </div>

          <div className="border-2 border-[#09090B] bg-white p-5 shadow-[4px_4px_0_0_#09090B]">
            <div className="w-9 h-9 border border-[#09090B] bg-[#D9F99D] flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-[#09090B]" strokeWidth={2.5} />
            </div>
            <div className="font-extrabold text-sm text-[#09090B]">
              Rata-rata SLA
            </div>
            <p className="text-xs text-[#52525B] mt-1">
              Kecepatan respon teknisi dan durasi penyelesaian kerusakan fasilitas.
            </p>
          </div>

          <div className="border-2 border-[#09090B] bg-white p-5 shadow-[4px_4px_0_0_#09090B]">
            <div className="w-9 h-9 border border-[#09090B] bg-[#FEF08A] flex items-center justify-center mb-3">
              <MapPin className="w-5 h-5 text-[#09090B]" strokeWidth={2.5} />
            </div>
            <div className="font-extrabold text-sm text-[#09090B]">
              Sebaran Gedung
            </div>
            <p className="text-xs text-[#52525B] mt-1">
              Pemetaan fakultas atau area kampus dengan tingkat kerusakan tertinggi.
            </p>
          </div>

          <div className="border-2 border-[#09090B] bg-white p-5 shadow-[4px_4px_0_0_#09090B]">
            <div className="w-9 h-9 border border-[#09090B] bg-[#C4B5FD] flex items-center justify-center mb-3">
              <Layers className="w-5 h-5 text-[#09090B]" strokeWidth={2.5} />
            </div>
            <div className="font-extrabold text-sm text-[#09090B]">
              Distribusi Kategori
            </div>
            <p className="text-xs text-[#52525B] mt-1">
              Proporsi masalah kelistrikan, sanitasi, gedung, dan fasilitas TI.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t-2 border-[#09090B] bg-[#FAF8F5] py-4 text-center text-xs font-mono text-[#52525B]">
        Universitas Tadulako • Panel Pemantau & Pimpinan Eksekutif • WITA (UTC+8)
      </footer>
    </div>
  )
}
