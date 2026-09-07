import { createFileRoute, redirect } from '@tanstack/react-router'
import { Wrench, Clock, Camera, CheckCircle } from 'lucide-react'
import { getCurrentUserSession } from '~/lib/auth-server'
import { DashboardHeader } from '~/features/dashboard/components/dashboard-header'

export const Route = createFileRoute('/dashboard/technician')({
  beforeLoad: async () => {
    const session = await getCurrentUserSession()
    if (!session?.user) {
      throw redirect({
        to: '/login',
        search: { redirect: '/dashboard/technician' },
      })
    }
    const role = (session.user as any).role
    if (role !== 'technician') {
      throw redirect({ to: '/dashboard' })
    }
    return { user: session.user }
  },
  loader: async ({ context }: { context: { user: any } }) => {
    return { user: context.user }
  },
  component: TechnicianDashboardPage,
})

function TechnicianDashboardPage() {
  const { user } = Route.useLoaderData()

  return (
    <div className="min-h-screen flex flex-col bg-[#DDD6FE]">
      <DashboardHeader
        user={user}
        roleLabel="Teknisi Lapangan"
        roleColor="bg-[#FED7AA]"
      />

      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
        {/* Welcome Banner */}
        <div className="border-2 border-[#09090B] bg-[#FAF8F5] p-6 shadow-[6px_6px_0_0_#09090B] mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase border border-[#09090B] bg-[#FED7AA]">
              Peran: Petugas Teknisi Lapangan
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#09090B]">
            Halo, {user.name}
          </h1>
          <p className="text-xs md:text-sm text-[#52525B] mt-1 max-w-2xl">
            Di sini Anda dapat mengelola tugas penanganan fisik di kampus: mulai mengerjakan laporan, memperbarui status di lokasi, dan mengunggah foto bukti penyelesaian.
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border-2 border-[#09090B] bg-white p-5 shadow-[4px_4px_0_0_#09090B]">
            <div className="w-9 h-9 border border-[#09090B] bg-[#BAE6FD] flex items-center justify-center mb-3">
              <Wrench className="w-5 h-5 text-[#09090B]" strokeWidth={2.5} />
            </div>
            <div className="font-extrabold text-sm text-[#09090B]">
              Tugas Baru
            </div>
            <p className="text-xs text-[#52525B] mt-1">
              Tiket kerusakan yang baru saja didisposisikan oleh Admin Sarpras ke Anda.
            </p>
          </div>

          <div className="border-2 border-[#09090B] bg-white p-5 shadow-[4px_4px_0_0_#09090B]">
            <div className="w-9 h-9 border border-[#09090B] bg-[#FEF08A] flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-[#09090B]" strokeWidth={2.5} />
            </div>
            <div className="font-extrabold text-sm text-[#09090B]">
              Dalam Pengerjaan
            </div>
            <p className="text-xs text-[#52525B] mt-1">
              Pekerjaan yang saat ini sedang aktif diperbaiki oleh tim teknisi.
            </p>
          </div>

          <div className="border-2 border-[#09090B] bg-white p-5 shadow-[4px_4px_0_0_#09090B]">
            <div className="w-9 h-9 border border-[#09090B] bg-[#C4B5FD] flex items-center justify-center mb-3">
              <Camera className="w-5 h-5 text-[#09090B]" strokeWidth={2.5} />
            </div>
            <div className="font-extrabold text-sm text-[#09090B]">
              Upload Bukti
            </div>
            <p className="text-xs text-[#52525B] mt-1">
              Unggah foto hasil perbaikan fisik beserta catatan tindakan teknis.
            </p>
          </div>

          <div className="border-2 border-[#09090B] bg-white p-5 shadow-[4px_4px_0_0_#09090B]">
            <div className="w-9 h-9 border border-[#09090B] bg-[#D9F99D] flex items-center justify-center mb-3">
              <CheckCircle className="w-5 h-5 text-[#09090B]" strokeWidth={2.5} />
            </div>
            <div className="font-extrabold text-sm text-[#09090B]">
              Riwayat Selesai
            </div>
            <p className="text-xs text-[#52525B] mt-1">
              Daftar pekerjaan yang telah diverifikasi dan ditutup selesai oleh admin.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t-2 border-[#09090B] bg-[#FAF8F5] py-4 text-center text-xs font-mono text-[#52525B]">
        Universitas Tadulako • Panel Teknisi Lapangan • WITA (UTC+8)
      </footer>
    </div>
  )
}
