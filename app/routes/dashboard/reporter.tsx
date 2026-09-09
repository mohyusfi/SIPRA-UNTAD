import * as React from 'react'
import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import {
  PlusCircle,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Tag,
  Shield,
  ArrowRight,
  Sparkles,
  Inbox,
  X,
  Copy,
  Check,
  ImageIcon,
} from 'lucide-react'
import { getCurrentUserSession } from '~/lib/auth-server'
import { getReporterDashboardData } from '~/features/reports/reports.fn'
import { DashboardHeader } from '~/features/dashboard/components/dashboard-header'
import { Button } from '~/components/ui/button'
import { formatDate, cn } from '~/lib/utils'
import {
  ReportStatusBadge,
  ReportUrgencyBadge,
} from '~/features/admin/components/report-status-badge'
import {
  ReporterReportDetailDrawer,
  type ReporterReportData,
} from '~/features/reports/components/reporter-report-detail-drawer'

type StatusFilterType = 'all' | 'pending' | 'in_progress' | 'completed' | 'other'

export const Route = createFileRoute('/dashboard/reporter')({
  head: () => ({
    meta: [
      { title: 'Reporter Dashboard | SIPANTAD' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
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
    const dashboardData = await getReporterDashboardData({ data: { page: 1, limit: 6 } })
    return {
      user: context.user,
      stats: dashboardData.stats,
      initialReports: dashboardData.reports as ReporterReportData[],
      initialPagination: dashboardData.pagination,
    }
  },
  component: ReporterDashboardPage,
})

function ReporterDashboardPage() {
  const data = Route.useLoaderData() as unknown as {
    user: any
    stats: {
      total: number
      pending: number
      inProgress: number
      completed: number
      other: number
    }
    initialReports: ReporterReportData[]
    initialPagination: {
      page: number
      limit: number
      totalCount: number
      hasMore: boolean
    }
  }
  const { user, stats, initialReports, initialPagination } = data

  const [statusFilter, setStatusFilter] = React.useState<StatusFilterType>('all')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [reportsList, setReportsList] = React.useState<ReporterReportData[]>(initialReports)
  const [page, setPage] = React.useState(initialPagination?.page || 1)
  const [hasMore, setHasMore] = React.useState(Boolean(initialPagination?.hasMore))
  const [isLoadingMore, setIsLoadingMore] = React.useState(false)
  const [selectedReport, setSelectedReport] =
    React.useState<ReporterReportData | null>(null)
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null)

  const handleCopyCode = async (code: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch {
      // Fallback
    }
  }

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return
    setIsLoadingMore(true)
    try {
      const nextPage = page + 1
      const res = await getReporterDashboardData({ data: { page: nextPage, limit: 6 } })
      setReportsList((prev) => [...prev, ...(res.reports as ReporterReportData[])])
      setPage(nextPage)
      setHasMore(res.pagination.hasMore)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const filteredReports = React.useMemo(() => {
    return reportsList.filter((item) => {
      // Status Filter
      if (statusFilter === 'pending') {
        if (item.status !== 'submitted' && item.status !== 'verified')
          return false
      } else if (statusFilter === 'in_progress') {
        if (
          item.status !== 'assigned' &&
          item.status !== 'in_progress' &&
          item.status !== 'review'
        )
          return false
      } else if (statusFilter === 'completed') {
        if (item.status !== 'completed') return false
      } else if (statusFilter === 'other') {
        if (item.status !== 'rejected' && item.status !== 'duplicate')
          return false
      }

      // Search Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase()
        const matchTitle = item.title.toLowerCase().includes(query)
        const matchCode = item.trackingCode.toLowerCase().includes(query)
        const matchBuilding =
          item.location?.building.toLowerCase().includes(query) ?? false
        const matchCategory =
          item.category?.name.toLowerCase().includes(query) ?? false
        if (!matchTitle && !matchCode && !matchBuilding && !matchCategory) {
          return false
        }
      }

      return true
    })
  }, [reportsList, statusFilter, searchQuery])

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

            <div className="w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
              <Link
                to="/dashboard/reporter/new"
                preload="intent"
                className="w-full sm:w-auto min-h-[44px] px-5 py-3 font-extrabold text-xs md:text-sm bg-[#D9F99D] text-[#09090B] border-2 border-[#09090B] shadow-[3px_3px_0_0_#09090B] md:hover:bg-[#BEF264] md:hover:translate-x-[1px] md:hover:translate-y-[1px] md:hover:shadow-[2px_2px_0_0_#09090B] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_0_#09090B] transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation select-none"
              >
                <PlusCircle className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
                <span>Buat Laporan Baru</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Interactive Stats Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Laporan */}
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={cn(
              'border-2 border-[#09090B] p-5 text-left transition-all cursor-pointer flex flex-col justify-between bg-white',
              statusFilter === 'all'
                ? 'shadow-[6px_6px_0_0_#09090B] translate-x-[-1px] translate-y-[-1px] ring-2 ring-[#09090B]'
                : 'shadow-[4px_4px_0_0_#09090B] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#09090B]',
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 border border-[#09090B] bg-[#C4B5FD] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#09090B]" strokeWidth={2.5} />
              </div>
              <span className="font-mono text-2xl font-black text-[#09090B]">
                {stats.total}
              </span>
            </div>
            <div>
              <div className="font-extrabold text-sm text-[#09090B]">
                Total Pengaduan
              </div>
              <p className="text-xs text-[#52525B] mt-1">
                Semua laporan yang pernah Anda kirimkan
              </p>
            </div>
          </button>

          {/* Menunggu Tindakan */}
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={cn(
              'border-2 border-[#09090B] p-5 text-left transition-all cursor-pointer flex flex-col justify-between bg-white',
              statusFilter === 'pending'
                ? 'shadow-[6px_6px_0_0_#09090B] translate-x-[-1px] translate-y-[-1px] ring-2 ring-[#09090B]'
                : 'shadow-[4px_4px_0_0_#09090B] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#09090B]',
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 border border-[#09090B] bg-[#FEF08A] flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#09090B]" strokeWidth={2.5} />
              </div>
              <span className="font-mono text-2xl font-black text-[#09090B]">
                {stats.pending}
              </span>
            </div>
            <div>
              <div className="font-extrabold text-sm text-[#09090B]">
                Menunggu Tindakan
              </div>
              <p className="text-xs text-[#52525B] mt-1">
                Dalam antrean verifikasi petugas admin
              </p>
            </div>
          </button>

          {/* Dalam Penanganan */}
          <button
            type="button"
            onClick={() => setStatusFilter('in_progress')}
            className={cn(
              'border-2 border-[#09090B] p-5 text-left transition-all cursor-pointer flex flex-col justify-between bg-white',
              statusFilter === 'in_progress'
                ? 'shadow-[6px_6px_0_0_#09090B] translate-x-[-1px] translate-y-[-1px] ring-2 ring-[#09090B]'
                : 'shadow-[4px_4px_0_0_#09090B] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#09090B]',
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 border border-[#09090B] bg-[#FED7AA] flex items-center justify-center">
                <Search className="w-5 h-5 text-[#09090B]" strokeWidth={2.5} />
              </div>
              <span className="font-mono text-2xl font-black text-[#09090B]">
                {stats.inProgress}
              </span>
            </div>
            <div>
              <div className="font-extrabold text-sm text-[#09090B]">
                Dalam Penanganan
              </div>
              <p className="text-xs text-[#52525B] mt-1">
                Sedang dikerjakan oleh teknisi lapangan
              </p>
            </div>
          </button>

          {/* Tuntas Diperbaiki */}
          <button
            type="button"
            onClick={() => setStatusFilter('completed')}
            className={cn(
              'border-2 border-[#09090B] p-5 text-left transition-all cursor-pointer flex flex-col justify-between bg-white',
              statusFilter === 'completed'
                ? 'shadow-[6px_6px_0_0_#09090B] translate-x-[-1px] translate-y-[-1px] ring-2 ring-[#09090B]'
                : 'shadow-[4px_4px_0_0_#09090B] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#09090B]',
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 border border-[#09090B] bg-[#D9F99D] flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-[#09090B]" strokeWidth={2.5} />
              </div>
              <span className="font-mono text-2xl font-black text-[#09090B]">
                {stats.completed}
              </span>
            </div>
            <div>
              <div className="font-extrabold text-sm text-[#09090B]">
                Tuntas Diperbaiki
              </div>
              <p className="text-xs text-[#52525B] mt-1">
                Pekerjaan perbaikan selesai diverifikasi
              </p>
            </div>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="border-2 border-[#09090B] bg-[#FAF8F5] p-4 shadow-[4px_4px_0_0_#09090B] mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#52525B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan judul, kode tiket (UNTAD-...), atau gedung..."
              className="w-full pl-9 pr-8 py-2 bg-white border-2 border-[#09090B] text-xs md:text-sm text-[#09090B] font-medium shadow-[2px_2px_0_0_#09090B] focus:outline-none focus:ring-2 focus:ring-[#09090B]"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#52525B] hover:text-[#09090B]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={cn(
                'px-3 py-1.5 text-xs font-bold border-2 border-[#09090B] shadow-[2px_2px_0_0_#09090B] transition-all whitespace-nowrap cursor-pointer',
                statusFilter === 'all'
                  ? 'bg-[#09090B] text-white'
                  : 'bg-white text-[#09090B] hover:bg-neutral-100',
              )}
            >
              Semua ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={cn(
                'px-3 py-1.5 text-xs font-bold border-2 border-[#09090B] shadow-[2px_2px_0_0_#09090B] transition-all whitespace-nowrap cursor-pointer',
                statusFilter === 'pending'
                  ? 'bg-[#FEF08A] text-[#09090B]'
                  : 'bg-white text-[#09090B] hover:bg-[#FEF08A]/40',
              )}
            >
              Menunggu ({stats.pending})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('in_progress')}
              className={cn(
                'px-3 py-1.5 text-xs font-bold border-2 border-[#09090B] shadow-[2px_2px_0_0_#09090B] transition-all whitespace-nowrap cursor-pointer',
                statusFilter === 'in_progress'
                  ? 'bg-[#FED7AA] text-[#09090B]'
                  : 'bg-white text-[#09090B] hover:bg-[#FED7AA]/40',
              )}
            >
              Proses ({stats.inProgress})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('completed')}
              className={cn(
                'px-3 py-1.5 text-xs font-bold border-2 border-[#09090B] shadow-[2px_2px_0_0_#09090B] transition-all whitespace-nowrap cursor-pointer',
                statusFilter === 'completed'
                  ? 'bg-[#D9F99D] text-[#09090B]'
                  : 'bg-white text-[#09090B] hover:bg-[#D9F99D]/40',
              )}
            >
              Selesai ({stats.completed})
            </button>
            {stats.other > 0 ? (
              <button
                type="button"
                onClick={() => setStatusFilter('other')}
                className={cn(
                  'px-3 py-1.5 text-xs font-bold border-2 border-[#09090B] shadow-[2px_2px_0_0_#09090B] transition-all whitespace-nowrap cursor-pointer',
                  statusFilter === 'other'
                    ? 'bg-[#FECDD3] text-[#09090B]'
                    : 'bg-white text-[#09090B] hover:bg-[#FECDD3]/40',
                )}
              >
                Ditolak ({stats.other})
              </button>
            ) : null}
          </div>
        </div>

        {/* Report Cards Grid */}
        {filteredReports.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {filteredReports.map((report) => {
                const initialPhoto = report.photos.find(
                  (p) => p.photoType === 'initial',
                )
                const totalPhotos = report.photos.length

                return (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className="group border-2 border-[#09090B] bg-white shadow-[4px_4px_0_0_#09090B] hover:shadow-[6px_6px_0_0_#09090B] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      {/* Card Thumbnail / Header Visual */}
                      {initialPhoto ? (
                        <div className="relative aspect-video w-full border-b-2 border-[#09090B] bg-neutral-100 overflow-hidden">
                          <img
                            src={initialPhoto.url}
                            alt={report.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute top-2 left-2 flex items-center gap-1.5">
                            <ReportStatusBadge status={report.status} />
                          </div>
                          {totalPhotos > 1 ? (
                            <div className="absolute bottom-2 right-2 bg-[#09090B] text-white text-[10px] font-mono px-2 py-0.5 border border-white flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" />
                              <span>{totalPhotos} Foto</span>
                            </div>
                          ) : null}
                          {report.isAnonymous ? (
                            <div className="absolute top-2 right-2 bg-[#FEF08A] text-[#09090B] text-[10px] font-extrabold uppercase px-1.5 py-0.5 border border-[#09090B] flex items-center gap-1 shadow-[1px_1px_0_0_#09090B]">
                              <Shield className="w-3 h-3" />
                              <span>Anonim</span>
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <div className="p-3 border-b-2 border-[#09090B] bg-[#FAF8F5] flex items-center justify-between">
                          <ReportStatusBadge status={report.status} />
                          {report.isAnonymous ? (
                            <span className="inline-flex items-center gap-1 bg-[#FEF08A] text-[#09090B] text-[10px] font-extrabold uppercase px-1.5 py-0.5 border border-[#09090B]">
                              <Shield className="w-3 h-3" />
                              <span>Anonim</span>
                            </span>
                          ) : null}
                        </div>
                      )}

                      {/* Card Content Body */}
                      <div className="p-4 space-y-3">
                        {/* Tracking Code and Urgency */}
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={(e) => handleCopyCode(report.trackingCode, e)}
                            className="font-mono text-xs font-black text-[#09090B] bg-[#FAF8F5] px-2 py-0.5 border border-[#09090B] hover:bg-neutral-200 flex items-center gap-1 cursor-pointer transition-colors"
                            title="Klik untuk menyalin kode tiket"
                          >
                            <span>{report.trackingCode}</span>
                            {copiedCode === report.trackingCode ? (
                              <Check className="w-3 h-3 text-green-700" strokeWidth={3} />
                            ) : (
                              <Copy className="w-3 h-3 text-[#52525B]" />
                            )}
                          </button>
                          <ReportUrgencyBadge urgency={report.urgency} />
                        </div>

                        {/* Title */}
                        <h3 className="font-extrabold text-sm md:text-base text-[#09090B] leading-snug line-clamp-2 group-hover:underline">
                          {report.title}
                        </h3>

                        {/* Meta Tags: Category & Location */}
                        <div className="space-y-1.5 text-xs text-[#52525B]">
                          {report.category ? (
                            <div className="flex items-center gap-1.5 truncate">
                              <Tag className="w-3.5 h-3.5 shrink-0 text-[#09090B]" />
                              <span className="font-bold text-[#09090B] truncate">
                                {report.category.name}
                              </span>
                            </div>
                          ) : null}

                          {report.location ? (
                            <div className="flex items-center gap-1.5 truncate">
                              <MapPin className="w-3.5 h-3.5 shrink-0 text-[#09090B]" />
                              <span className="truncate">
                                {report.location.building}
                                {report.location.roomOrArea
                                  ? ` • ${report.location.roomOrArea}`
                                  : ''}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="p-3 bg-[#FAF8F5] border-t-2 border-[#09090B] flex items-center justify-between text-xs font-mono">
                      <span className="text-[11px] text-[#52525B]">
                        {formatDate(report.createdAt)}
                      </span>
                      <span className="inline-flex items-center gap-1 font-bold text-[#09090B] group-hover:translate-x-0.5 transition-transform">
                        <span>Detail</span>
                        <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Incremental Load More Button */}
            {hasMore && (
              <div className="flex justify-center mb-8">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="px-6 py-3 border-2 border-[#09090B] bg-white hover:bg-[#FAF8F5] text-xs md:text-sm font-black uppercase tracking-wider text-[#09090B] shadow-[4px_4px_0_0_#09090B] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_0_#09090B] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoadingMore ? (
                    <span>Memuat...</span>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
                      <span>Muat 6 Laporan Berikutnya</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="border-2 border-[#09090B] bg-white p-8 md:p-12 text-center shadow-[6px_6px_0_0_#09090B] mb-8">
            <div className="w-14 h-14 border-2 border-[#09090B] bg-[#C4B5FD] flex items-center justify-center mx-auto mb-4 shadow-[3px_3px_0_0_#09090B]">
              <Inbox className="w-7 h-7 text-[#09090B]" strokeWidth={2.5} />
            </div>

            {reportsList.length === 0 ? (
              <>
                <h3 className="text-xl font-extrabold text-[#09090B] mb-2">
                  Belum Ada Laporan Pengaduan
                </h3>
                <p className="text-xs md:text-sm text-[#52525B] max-w-md mx-auto mb-6">
                  Anda belum pernah mengajukan laporan kerusakan fasilitas fisik kampus. Jika menemukan sarana yang rusak, silakan buat laporan sekarang.
                </p>
                <Link
                  to="/dashboard/reporter/new"
                  preload="intent"
                  className="inline-block touch-manipulation"
                >
                  <Button variant="lime" size="lg" className="touch-manipulation">
                    <PlusCircle className="w-4 h-4" strokeWidth={2.5} />
                    <span>Buat Laporan Pertama Anda</span>
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <h3 className="text-lg font-extrabold text-[#09090B] mb-1">
                  Tidak Ada Laporan yang Cocok
                </h3>
                <p className="text-xs text-[#52525B] mb-4">
                  Tidak ditemukan laporan dengan filter status atau kata kunci yang Anda masukkan.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setStatusFilter('all')
                    setSearchQuery('')
                  }}
                >
                  Reset Filter & Pencarian
                </Button>
              </>
            )}
          </div>
        )}

        {/* Quick Help / Public Track Link Card */}
        <div className="border-2 border-[#09090B] bg-white p-6 shadow-[4px_4px_0_0_#09090B]">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-[#09090B]" />
            <h3 className="font-extrabold text-sm text-[#09090B]">
              Punya Kode Lacak dari Laporan Sebelumnya?
            </h3>
          </div>
          <p className="text-xs text-[#52525B] mb-4 max-w-2xl">
            Jika Anda pernah membuat laporan sebelum memiliki akun atau tanpa login, Anda tetap dapat memeriksa status perbaikannya melalui halaman lacak tiket publik.
          </p>
          <Link
            to="/track"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#FAF8F5] text-[#09090B] border-2 border-[#09090B] shadow-[2px_2px_0_0_#09090B] hover:bg-neutral-100 transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Buka Pelacakan Tiket Publik</span>
          </Link>
        </div>
      </main>

      {/* Slide-over Detail Drawer */}
      <ReporterReportDetailDrawer
        report={selectedReport}
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
      />

      <footer className="border-t-2 border-[#09090B] bg-[#FAF8F5] py-4 text-center text-xs font-mono text-[#52525B]">
        Universitas Tadulako • Panel Pelapor Sivitas • WITA (UTC+8)
      </footer>
    </div>
  )
}
