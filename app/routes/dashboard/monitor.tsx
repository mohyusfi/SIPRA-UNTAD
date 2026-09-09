import * as React from 'react'
import { createFileRoute, redirect, useNavigate, useRouter, Link } from '@tanstack/react-router'
import { z } from 'zod'
import {
  Calendar,
  RefreshCw,
  ShieldCheck,
  ArrowLeftRight,
} from 'lucide-react'
import { getCurrentUserSession } from '~/lib/auth-server'
import { DashboardHeader } from '~/features/dashboard/components/dashboard-header'
import {
  getMonitorDashboardData,
  type TimeRangeOption,
  type MonitorReportItem,
} from '~/features/monitor/monitor.fn'
import { MonitorKPICards } from '~/features/monitor/components/monitor-kpi-cards'
import { MonitorCharts } from '~/features/monitor/components/monitor-charts'
import { MonitorReportsTable } from '~/features/monitor/components/monitor-reports-table'
import { MonitorReportDrawer } from '~/features/monitor/components/monitor-report-drawer'

const monitorSearchSchema = z.object({
  range: z.enum(['7d', '30d', 'semester', 'all']).default('30d').catch('30d'),
})

type MonitorSearch = z.infer<typeof monitorSearchSchema>

export const Route = createFileRoute('/dashboard/monitor')({
  head: () => ({
    meta: [
      { title: 'Monitor Dashboard | SIPANTAD' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): MonitorSearch =>
    monitorSearchSchema.parse(search),
  beforeLoad: async () => {
    const session = await getCurrentUserSession()
    if (!session?.user) {
      throw redirect({
        to: '/login',
        search: { redirect: '/dashboard/monitor' },
      })
    }
    const role = (session.user as any).role
    if (role !== 'monitor' && role !== 'admin') {
      throw redirect({ to: '/dashboard' })
    }
    return { user: session.user }
  },
  loaderDeps: ({ search }: { search: MonitorSearch }) => ({
    range: search.range,
  }),
  loader: async ({
    deps,
    context,
  }: {
    deps: { range?: TimeRangeOption }
    context: { user: any }
  }) => {
    const data = await getMonitorDashboardData({
      data: { timeRange: deps.range || '30d' },
    })
    return { user: context.user, dashboardData: data }
  },
  component: MonitorDashboardPage,
})

const TIME_RANGE_TABS: Array<{ value: TimeRangeOption; label: string }> = [
  { value: '7d', label: '7 Hari Terakhir' },
  { value: '30d', label: '30 Hari Terakhir' },
  { value: 'semester', label: '1 Semester (6 Bulan)' },
  { value: 'all', label: 'Semua Waktu' },
]

function MonitorDashboardPage() {
  const { user, dashboardData } = Route.useLoaderData()
  const search = Route.useSearch()
  const router = useRouter()
  const navigate = useNavigate({ from: Route.fullPath })

  const [selectedReport, setSelectedReport] =
    React.useState<MonitorReportItem | null>(null)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const activeRange: TimeRangeOption = search.range || '30d'

  const handleRangeChange = (range: TimeRangeOption) => {
    navigate({
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        range,
      }),
    })
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await router.invalidate()
    } finally {
      setIsRefreshing(false)
    }
  }

  const role = (user as any).role

  return (
    <div className="min-h-screen flex flex-col bg-[#DDD6FE]">
      <DashboardHeader
        user={user}
        roleLabel={role === 'admin' ? 'Admin Sarpras (Mode Pemantau)' : 'Pemantau & Pimpinan'}
        roleColor="bg-[#BAE6FD]"
      />

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Executive Header Banner */}
        <div className="border-2 border-[#09090B] bg-[#FAF8F5] p-5 md:p-6 shadow-[6px_6px_0_0_#09090B]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase border border-[#09090B] bg-[#BAE6FD] text-[#09090B]">
                  Peran: {role === 'admin' ? 'Administrator (Executive View)' : 'Pemantau Eksekutif'}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold uppercase border border-[#09090B] bg-[#D9F99D] text-[#09090B]">
                  <ShieldCheck className="w-3 h-3" />
                  Audit Transparan Read-Only
                </span>
                {role === 'admin' && (
                  <Link
                    to="/dashboard/admin"
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold uppercase border border-[#09090B] bg-white hover:bg-[#FEF08A] text-[#09090B] cursor-pointer transition-colors shadow-[1px_1px_0_0_#09090B]"
                  >
                    <ArrowLeftRight className="w-3 h-3" />
                    Buka Panel Admin Operasional
                  </Link>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-[#09090B] tracking-tight">
                Panel Pemantau &amp; Pimpinan Eksekutif
              </h1>
              <p className="text-xs md:text-sm text-[#52525B] mt-1.5 max-w-2xl">
                Pemantauan terpadu performa sarana prasarana Universitas Tadulako:
                volume pengaduan, kecepatan respon teknisi (SLA), pemetaan hotspot kerusakan gedung, serta riwayat audit tiket.
              </p>
            </div>

            {/* Time Range Selector & Refresh */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
              <div className="flex items-center gap-1 bg-white border-2 border-[#09090B] p-1 shadow-[2px_2px_0_0_#09090B] overflow-x-auto max-w-full">
                <div className="px-2 py-1 flex items-center gap-1 text-[10px] font-bold text-[#52525B] border-r border-neutral-200">
                  <Calendar className="w-3 h-3" />
                  <span className="hidden sm:inline">Periode:</span>
                </div>
                {TIME_RANGE_TABS.map((tab) => {
                  const isActive = activeRange === tab.value
                  return (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => handleRangeChange(tab.value)}
                      className={`px-2.5 py-1 text-[11px] font-extrabold border shrink-0 cursor-pointer transition-all ${
                        isActive
                          ? 'border-[#09090B] bg-[#BAE6FD] text-[#09090B] shadow-[1px_1px_0_0_#09090B]'
                          : 'border-transparent text-[#52525B] hover:text-[#09090B] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2.5 bg-white border-2 border-[#09090B] shadow-[2px_2px_0_0_#09090B] hover:bg-[#FAF8F5] active:shadow-none cursor-pointer disabled:opacity-50 transition-all shrink-0"
                title="Muat Ulang Data Terbaru"
              >
                <RefreshCw
                  className={`w-4 h-4 text-[#09090B] ${
                    isRefreshing ? 'animate-spin' : ''
                  }`}
                  strokeWidth={2.5}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Section 1: KPI Metrics */}
        <section aria-label="Ringkasan Metrik KPI">
          <MonitorKPICards stats={dashboardData.stats} />
        </section>

        {/* Section 2: Distribution Charts */}
        <section aria-label="Grafik Sebaran Kategori dan Hotspot Gedung">
          <MonitorCharts
            categories={dashboardData.categories}
            locations={dashboardData.locations}
            totalReports={dashboardData.stats.total}
          />
        </section>

        {/* Section 3: Audit Table */}
        <section aria-label="Tabel Audit Pengaduan Kampus">
          <MonitorReportsTable
            reports={dashboardData.reports}
            onSelectReport={(report) => setSelectedReport(report)}
          />
        </section>
      </main>

      {/* Read-Only Detail Drawer */}
      <MonitorReportDrawer
        report={selectedReport}
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
      />

      <footer className="border-t-2 border-[#09090B] bg-[#FAF8F5] py-4 text-center text-xs font-mono text-[#52525B]">
        Universitas Tadulako • Panel Pemantau &amp; Pimpinan Eksekutif • WITA (UTC+8)
      </footer>
    </div>
  )
}
