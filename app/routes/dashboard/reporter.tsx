import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import { PlusCircle, Search, Clock, CheckCircle2 } from 'lucide-react'
import { getCurrentUserSession } from '~/lib/auth-server'
import { DashboardHeader } from '~/features/dashboard/components/dashboard-header'

export const Route = createFileRoute('/dashboard/reporter')({
  beforeLoad: async () => {
    const session = await getCurrentUserSession()
    if (!session?.user) {
      throw redirect({
        to: '/login',
        search: { redirect: '/dashboard/reporter' },
      })
    }
    const role = (session.user as any).role
    if (role !== 'reporter') {
      throw redirect({ to: '/dashboard' })
    }
    return { user: session.user }
  },
  loader: async ({ context }: { context: { user: any } }) => {
    return { user: context.user }
  },
  component: ReporterDashboardPage,
})

function ReporterDashboardPage() {
  const { user } = Route.useLoaderData()

  return (
    <div className="min-h-screen flex flex-col bg-[#DDD6FE]">
      <DashboardHeader
        user={user}
        roleLabel="Pelapor Sivitas"
        roleColor="bg-[#D9F99D]"
      />

      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
        {/* Welcome Banner */}
        <div className="border-2 border-[#09090B] bg-[#FAF8F5] p-6 shadow-[6px_6px_0_0_#09090B] mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase border border-[#09090B] bg-[#D9F99D]">
              Peran: Sivitas Akademika / Pelapor
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#09090B]">
                Selamat Datang, {user.name}
              </h1>
              <p className="text-xs md:text-sm text-[#52525B] mt-1 max-w-2xl">
                Pantau seluruh pengaduan kerusakan sarana kampus yang Anda kirimkan. Setiap perkembangan perbaikan tercatat secara transparan di sini.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/"
                className="px-4 py-2.5 font-bold text-xs md:text-sm bg-[#D9F99D] text-[#09090B] border-2 border-[#09090B] shadow-[3px_3px_0_0_#09090B] hover:bg-[#BEF264] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#09090B] transition-all flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" strokeWidth={2.5} />
                <span>Buat Laporan Baru</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="border-2 border-[#09090B] bg-white p-5 shadow-[4px_4px_0_0_#09090B]">
            <div className="w-9 h-9 border border-[#09090B] bg-[#FEF08A] flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-[#09090B]" strokeWidth={2.5} />
            </div>
            <div className="font-extrabold text-sm text-[#09090B]">
              Menunggu Tindakan
            </div>
            <p className="text-xs text-[#52525B] mt-1">
              Laporan Anda yang sedang dalam antrean verifikasi petugas admin.
            </p>
          </div>

          <div className="border-2 border-[#09090B] bg-white p-5 shadow-[4px_4px_0_0_#09090B]">
            <div className="w-9 h-9 border border-[#09090B] bg-[#FED7AA] flex items-center justify-center mb-3">
              <Search className="w-5 h-5 text-[#09090B]" strokeWidth={2.5} />
            </div>
            <div className="font-extrabold text-sm text-[#09090B]">
              Dalam Penanganan
            </div>
            <p className="text-xs text-[#52525B] mt-1">
              Laporan yang telah ditugaskan dan sedang diperbaiki oleh teknisi lapangan.
            </p>
          </div>

          <div className="border-2 border-[#09090B] bg-white p-5 shadow-[4px_4px_0_0_#09090B]">
            <div className="w-9 h-9 border border-[#09090B] bg-[#D9F99D] flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5 text-[#09090B]" strokeWidth={2.5} />
            </div>
            <div className="font-extrabold text-sm text-[#09090B]">
              Tuntas Diperbaiki
            </div>
            <p className="text-xs text-[#52525B] mt-1">
              Laporan yang pekerjaannya telah selesai dan diverifikasi mutunya.
            </p>
          </div>
        </div>

        {/* Quick Help Card */}
        <div className="border-2 border-[#09090B] bg-white p-6 shadow-[4px_4px_0_0_#09090B]">
          <div className="font-extrabold text-sm text-[#09090B] mb-2">
            Punya Kode Lacak dari Laporan Sebelumnya?
          </div>
          <p className="text-xs text-[#52525B] mb-4">
            Jika Anda pernah membuat laporan tanpa login (anonim), Anda tetap dapat memeriksa status perbaikannya melalui halaman lacak publik.
          </p>
          <Link
            to="/track"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#FAF8F5] text-[#09090B] border-2 border-[#09090B] shadow-[2px_2px_0_0_#09090B] hover:bg-neutral-100 transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Buka Pelacakan Tiket</span>
          </Link>
        </div>
      </main>

      <footer className="border-t-2 border-[#09090B] bg-[#FAF8F5] py-4 text-center text-xs font-mono text-[#52525B]">
        Universitas Tadulako • Panel Pelapor Sivitas • WITA (UTC+8)
      </footer>
    </div>
  )
}
