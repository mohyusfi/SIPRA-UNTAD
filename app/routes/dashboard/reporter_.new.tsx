import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import { ArrowLeft, Sparkles, ShieldCheck } from 'lucide-react'
import { getCurrentUserSession } from '~/lib/auth-server'
import { getMasterData } from '~/features/reports/reports.fn'
import { DashboardHeader } from '~/features/dashboard/components/dashboard-header'
import { ReportForm } from '~/features/reports/components/report-form'

export const Route = createFileRoute('/dashboard/reporter_/new')({
  head: () => ({
    meta: [
      { title: 'Buat Laporan Baru | SIPRA-UNTAD' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  beforeLoad: async () => {
    const session = await getCurrentUserSession()
    if (!session?.user) {
      throw redirect({
        to: '/login',
        search: { redirect: '/dashboard/reporter/new' },
      })
    }
    const role = (session.user as any).role
    if (role !== 'reporter') {
      throw redirect({ to: '/dashboard' })
    }
    return { user: session.user }
  },
  loader: async ({ context }: { context: { user: any } }) => {
    const masterData = await getMasterData()
    return {
      user: context.user,
      categories: masterData.categories,
      locations: masterData.locations,
    }
  },
  component: ReporterNewReportPage,
})

function ReporterNewReportPage() {
  const data = Route.useLoaderData() as unknown as {
    user: any
    categories: Array<{ id: string; name: string }>
    locations: Array<{
      id: string
      campus: string
      building: string
      floor: string | null
      roomOrArea: string | null
    }>
  }
  const { user, categories, locations } = data

  return (
    <div className="min-h-screen flex flex-col bg-[#DDD6FE]">
      <DashboardHeader
        user={user}
        roleLabel="Pelapor Sivitas"
        roleColor="bg-[#D9F99D]"
      />

      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
        {/* Navigation / Back Bar */}
        <div className="mb-6">
          <Link
            to="/dashboard/reporter"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold bg-[#FAF8F5] text-[#09090B] border-2 border-[#09090B] shadow-[2px_2px_0_0_#09090B] hover:bg-white hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_0_#09090B] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span>Kembali ke Dashboard Pelapor</span>
          </Link>
        </div>

        {/* Header Title Box */}
        <div className="border-2 border-[#09090B] bg-[#FAF8F5] p-6 shadow-[6px_6px_0_0_#09090B] mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase border border-[#09090B] bg-[#D9F99D] flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Formulir Pengaduan Baru</span>
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase border border-[#09090B] bg-white text-[#52525B] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#09090B]" />
              <span>Identitas Sivitas Terhubung</span>
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-[#09090B]">
            Laporkan Kerusakan Fasilitas Kampus
          </h1>
          <p className="text-xs md:text-sm text-[#52525B] mt-1.5 leading-relaxed max-w-2xl">
            Sampaikan permasalahan sarana atau prasarana kampus yang membutuhkan perbaikan. Data identitas Anda otomatis terhubung tanpa perlu mengisi nama dan email lagi.
          </p>
        </div>

        {/* Report Form Container */}
        <div className="border-2 border-[#09090B] bg-white p-6 md:p-8 shadow-[6px_6px_0_0_#09090B] mb-12">
          <ReportForm categories={categories} locations={locations} />
        </div>
      </main>

      <footer className="border-t-2 border-[#09090B] bg-[#FAF8F5] py-4 text-center text-xs font-mono text-[#52525B]">
        Universitas Tadulako • Panel Pelapor Sivitas • WITA (UTC+8)
      </footer>
    </div>
  )
}
