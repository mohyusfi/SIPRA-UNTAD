import * as React from 'react'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import {
  ClipboardList,
  CheckSquare,
  Search,
  AlertCircle,
  Eye,
  CheckCircle,
  MapPin,
  User,
  Wrench,
  Camera,
  RotateCcw,
  Layers,
  Users,
} from 'lucide-react'
import { getCurrentUserSession } from '~/lib/auth-server'
import { DashboardHeader } from '~/features/dashboard/components/dashboard-header'
import { Button } from '~/components/ui/button'
import { Pagination } from '~/components/ui/pagination'
import { formatDate } from '~/lib/utils'
import {
  getAdminReports,
  getAdminReportDetail,
  getAvailableTechnicians,
  verifyReportAction,
  rejectReportAction,
  markDuplicateReportAction,
  assignTechnicianAction,
  reviewCompletionAction,
  getAdminCategories,
  getAdminLocations,
  getAdminStaffUsers,
} from '~/features/admin/admin.fn'
import {
  ReportStatusBadge,
  ReportUrgencyBadge,
} from '~/features/admin/components/report-status-badge'
import {
  VerifyDialog,
  AssignTechnicianDialog,
  RejectReportDialog,
  MarkDuplicateDialog,
  ReviewCompletionDialog,
} from '~/features/admin/components/action-dialogs'
import {
  ReportDetailDrawer,
  type ReportDetailData,
} from '~/features/admin/components/report-detail-drawer'
import {
  MasterDataManagement,
} from '~/features/admin/components/master-data-management'
import {
  StaffManagement,
} from '~/features/admin/components/staff-management'

export const Route = createFileRoute('/dashboard/admin')({
  beforeLoad: async () => {
    const session = await getCurrentUserSession()
    if (!session?.user) {
      throw redirect({
        to: '/login',
        search: { redirect: '/dashboard/admin' },
      })
    }
    const role = (session.user as any).role
    if (role !== 'admin') {
      throw redirect({ to: '/dashboard' })
    }
    return { user: session.user }
  },
  loader: async ({ context }: { context: { user: any } }) => {
    const [reportsData, technicians, categories, locations, staff] =
      await Promise.all([
        getAdminReports({ data: { status: 'all', search: '', page: 1, limit: 10 } }),
        getAvailableTechnicians(),
        getAdminCategories(),
        getAdminLocations(),
        getAdminStaffUsers(),
      ])

    return {
      user: context.user,
      initialReports: reportsData.reports,
      initialStats: reportsData.stats,
      initialPagination: reportsData.pagination,
      technicians,
      initialCategories: categories,
      initialLocations: locations,
      initialStaff: staff,
    }
  },
  component: AdminDashboardPage,
})

function AdminDashboardPage() {
  const {
    user,
    initialReports,
    initialStats,
    initialPagination,
    technicians,
    initialCategories,
    initialLocations,
    initialStaff,
  } = Route.useLoaderData()
  const router = useRouter()

  const [activeMainTab, setActiveMainTab] = React.useState<
    'reports' | 'master' | 'staff'
  >('reports')

  const [selectedStatus, setSelectedStatus] = React.useState<string>('all')
  const [searchQuery, setSearchQuery] = React.useState<string>('')
  const [reportsList, setReportsList] = React.useState(initialReports)
  const [stats, setStats] = React.useState(initialStats)
  const [currentPage, setCurrentPage] = React.useState(initialPagination?.page || 1)
  const [pageSize, setPageSize] = React.useState(initialPagination?.limit || 10)
  const [pagination, setPagination] = React.useState(
    initialPagination || {
      page: 1,
      limit: 10,
      totalCount: initialReports.length,
      totalPages: Math.max(1, Math.ceil(initialReports.length / 10)),
    },
  )
  const [isFetching, setIsFetching] = React.useState(false)

  // Drawer detail state
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [selectedReportDetail, setSelectedReportDetail] =
    React.useState<ReportDetailData | null>(null)
  const [_isDrawerLoading, setIsDrawerLoading] = React.useState(false)

  // Action dialog states
  const [activeDialog, setActiveDialog] = React.useState<
    'verify' | 'assign' | 'reject' | 'duplicate' | 'review' | null
  >(null)
  const [activeReport, setActiveReport] = React.useState<any | null>(null)
  const [isActionLoading, setIsActionLoading] = React.useState(false)
  const [successToast, setSuccessToast] = React.useState<string | null>(null)

  const showToast = (message: string) => {
    setSuccessToast(message)
    setTimeout(() => {
      setSuccessToast(null)
    }, 4000)
  }

  const reloadData = async (
    statusFilter = selectedStatus,
    query = searchQuery,
    page = currentPage,
    limit = pageSize,
  ) => {
    setIsFetching(true)
    try {
      const res = await getAdminReports({
        data: { status: statusFilter, search: query, page, limit },
      })
      setReportsList(res.reports)
      setStats(res.stats)
      if (res.pagination) {
        setPagination(res.pagination)
      }
    } finally {
      setIsFetching(false)
    }
  }

  const handleStatusFilterChange = (status: string) => {
    setSelectedStatus(status)
    setCurrentPage(1)
    reloadData(status, searchQuery, 1, pageSize)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    reloadData(selectedStatus, searchQuery, 1, pageSize)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    reloadData(selectedStatus, searchQuery, newPage, pageSize)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(1)
    reloadData(selectedStatus, searchQuery, 1, newSize)
  }

  const openDetailDrawer = async (reportId: string) => {
    setIsDrawerLoading(true)
    setDrawerOpen(true)
    try {
      const detail = await getAdminReportDetail({ data: { id: reportId } })
      setSelectedReportDetail(detail as any)
    } catch {
      setDrawerOpen(false)
    } finally {
      setIsDrawerLoading(false)
    }
  }

  const handleOpenVerify = (report: any) => {
    setActiveReport(report)
    setActiveDialog('verify')
  }

  const handleOpenAssign = (report: any) => {
    setActiveReport(report)
    setActiveDialog('assign')
  }

  const handleOpenReject = (report: any) => {
    setActiveReport(report)
    setActiveDialog('reject')
  }

  const handleOpenDuplicate = (report: any) => {
    setActiveReport(report)
    setActiveDialog('duplicate')
  }

  const handleOpenReview = async (report: any) => {
    // If not full detail, load detail first
    if (!selectedReportDetail || selectedReportDetail.id !== report.id) {
      try {
        const detail = await getAdminReportDetail({ data: { id: report.id } })
        setSelectedReportDetail(detail as any)
      } catch (e) {
        void e
      }
    }
    setActiveReport(report)
    setActiveDialog('review')
  }

  // Action handlers
  const handleConfirmVerify = async (
    urgency: 'normal' | 'high' | 'emergency',
  ) => {
    if (!activeReport) return
    setIsActionLoading(true)
    try {
      await verifyReportAction({
        data: { reportId: activeReport.id, urgency },
      })
      showToast(
        `Laporan [${activeReport.trackingCode}] berhasil diverifikasi kelayakannya.`,
      )
      setActiveDialog(null)
      setDrawerOpen(false)
      await reloadData()
      await router.invalidate()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal memverifikasi laporan.')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleConfirmAssign = async (technicianId: string, notes?: string) => {
    if (!activeReport) return
    setIsActionLoading(true)
    try {
      await assignTechnicianAction({
        data: { reportId: activeReport.id, technicianId, notes },
      })
      showToast(
        `Laporan [${activeReport.trackingCode}] berhasil ditugaskan ke teknisi.`,
      )
      setActiveDialog(null)
      setDrawerOpen(false)
      await reloadData()
      await router.invalidate()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menugaskan teknisi.')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleConfirmReject = async (reason: string) => {
    if (!activeReport) return
    setIsActionLoading(true)
    try {
      await rejectReportAction({
        data: { reportId: activeReport.id, reason },
      })
      showToast(
        `Laporan [${activeReport.trackingCode}] telah ditolak dengan catatan audit.`,
      )
      setActiveDialog(null)
      setDrawerOpen(false)
      await reloadData()
      await router.invalidate()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menolak laporan.')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleConfirmDuplicate = async (
    duplicateOfId: string,
    reason: string,
  ) => {
    if (!activeReport) return
    setIsActionLoading(true)
    try {
      await markDuplicateReportAction({
        data: { reportId: activeReport.id, duplicateOfId, reason },
      })
      showToast(
        `Laporan [${activeReport.trackingCode}] telah ditandai sebagai duplikat.`,
      )
      setActiveDialog(null)
      setDrawerOpen(false)
      await reloadData()
      await router.invalidate()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menandai duplikat.')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleConfirmReview = async (
    decision: 'approve' | 'return',
    feedback?: string,
  ) => {
    if (!activeReport) return
    setIsActionLoading(true)
    try {
      await reviewCompletionAction({
        data: { reportId: activeReport.id, decision, feedback },
      })
      showToast(
        decision === 'approve'
          ? `Laporan [${activeReport.trackingCode}] telah disetujui dan ditutup Selesai!`
          : `Laporan [${activeReport.trackingCode}] dikembalikan ke teknisi untuk dituntaskan.`,
      )
      setActiveDialog(null)
      setDrawerOpen(false)
      await reloadData()
      await router.invalidate()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal meninjau penyelesaian.')
    } finally {
      setIsActionLoading(false)
    }
  }

  const filterTabs = [
    { key: 'all', label: 'Semua', count: stats.total },
    { key: 'submitted', label: 'Diajukan', count: stats.submitted },
    { key: 'verified', label: 'Diverifikasi', count: stats.verified },
    { key: 'assigned', label: 'Ditugaskan', count: stats.assigned },
    { key: 'in_progress', label: 'Dalam Pengerjaan', count: stats.inProgress },
    { key: 'review', label: 'Menunggu Review', count: stats.review },
    { key: 'completed', label: 'Selesai', count: stats.completed },
    { key: 'rejected', label: 'Ditolak', count: stats.rejected },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#DDD6FE]">
      <DashboardHeader
        user={user}
        roleLabel="Admin Sarpras"
        roleColor="bg-[#FECDD3]"
      />

      {/* Success Toast */}
      {successToast ? (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-[#D9F99D] border-2 border-[#09090B] shadow-[4px_4px_0_0_#09090B] flex items-center gap-3 animate-in slide-in-from-bottom-2">
          <CheckCircle className="w-5 h-5 text-[#09090B] shrink-0" strokeWidth={2.5} />
          <div className="font-bold text-xs md:text-sm text-[#09090B]">
            {successToast}
          </div>
        </div>
      ) : null}

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Navigation Tabs Utama Admin */}
        <div className="flex flex-wrap items-center gap-2.5 pb-2 border-b-2 border-[#09090B]">
          <button
            type="button"
            onClick={() => setActiveMainTab('reports')}
            className={`flex items-center gap-2 px-4 py-2.5 border-2 border-[#09090B] text-xs md:text-sm font-extrabold cursor-pointer transition-all ${
              activeMainTab === 'reports'
                ? 'bg-[#BAE6FD] shadow-[4px_4px_0_0_#09090B] translate-x-[-2px] translate-y-[-2px]'
                : 'bg-white hover:bg-[#FAF8F5] text-[#09090B]'
            }`}
          >
            <ClipboardList className="w-4 h-4" strokeWidth={2.5} />
            <span>Operasional Pengaduan</span>
            <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 bg-[#FAF8F5] border border-[#09090B]">
              {stats.total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('master')}
            className={`flex items-center gap-2 px-4 py-2.5 border-2 border-[#09090B] text-xs md:text-sm font-extrabold cursor-pointer transition-all ${
              activeMainTab === 'master'
                ? 'bg-[#FEF08A] shadow-[4px_4px_0_0_#09090B] translate-x-[-2px] translate-y-[-2px]'
                : 'bg-white hover:bg-[#FAF8F5] text-[#09090B]'
            }`}
          >
            <Layers className="w-4 h-4" strokeWidth={2.5} />
            <span>Master Kategori &amp; Gedung</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('staff')}
            className={`flex items-center gap-2 px-4 py-2.5 border-2 border-[#09090B] text-xs md:text-sm font-extrabold cursor-pointer transition-all ${
              activeMainTab === 'staff'
                ? 'bg-[#C4B5FD] shadow-[4px_4px_0_0_#09090B] translate-x-[-2px] translate-y-[-2px]'
                : 'bg-white hover:bg-[#FAF8F5] text-[#09090B]'
            }`}
          >
            <Users className="w-4 h-4" strokeWidth={2.5} />
            <span>Manajemen Akun Staf</span>
          </button>
        </div>

        {activeMainTab === 'reports' ? (
          <>
            {/* Metric Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="p-4 bg-white border-2 border-[#09090B] shadow-[4px_4px_0_0_#09090B]">
            <div className="flex items-center justify-between text-[#52525B] text-xs font-bold uppercase">
              <span>Total Laporan</span>
              <ClipboardList className="w-4 h-4 text-[#09090B]" />
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-[#09090B] mt-1 font-mono">
              {stats.total}
            </div>
            <div className="text-[11px] text-[#52525B] mt-0.5">
              Seluruh rekaman sistem
            </div>
          </div>

          <div className="p-4 bg-[#FEF08A] border-2 border-[#09090B] shadow-[4px_4px_0_0_#09090B]">
            <div className="flex items-center justify-between text-[#09090B] text-xs font-bold uppercase">
              <span>Perlu Verifikasi</span>
              <AlertCircle className="w-4 h-4 text-[#09090B]" />
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-[#09090B] mt-1 font-mono">
              {stats.submitted}
            </div>
            <div className="text-[11px] text-[#09090B] mt-0.5 font-bold">
              Menunggu validasi awal
            </div>
          </div>

          <div className="p-4 bg-[#BAE6FD] border-2 border-[#09090B] shadow-[4px_4px_0_0_#09090B]">
            <div className="flex items-center justify-between text-[#09090B] text-xs font-bold uppercase">
              <span>Sedang Ditangani</span>
              <Wrench className="w-4 h-4 text-[#09090B]" />
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-[#09090B] mt-1 font-mono">
              {stats.assigned + stats.inProgress}
            </div>
            <div className="text-[11px] text-[#09090B] mt-0.5">
              Teknisi aktif di lapangan
            </div>
          </div>

          <div className="p-4 bg-[#E9D5FF] border-2 border-[#09090B] shadow-[4px_4px_0_0_#09090B]">
            <div className="flex items-center justify-between text-[#09090B] text-xs font-bold uppercase">
              <span>Menunggu Review</span>
              <CheckSquare className="w-4 h-4 text-[#09090B]" />
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-[#09090B] mt-1 font-mono">
              {stats.review}
            </div>
            <div className="text-[11px] text-[#09090B] mt-0.5 font-bold">
              Butuh konfirmasi selesai
            </div>
          </div>
        </div>

        {/* Filter Toolbar & Search */}
        <div className="p-4 bg-white border-2 border-[#09090B] shadow-[4px_4px_0_0_#09090B] space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#52525B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari kode tiket (UNTAD-2026-...), judul, atau lokasi..."
                  className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border-2 border-[#09090B] text-xs md:text-sm font-medium focus:bg-white focus:outline-none"
                />
              </div>
              <Button type="submit" variant="primary" size="sm" className="cursor-pointer">
                <span>Cari</span>
              </Button>
            </form>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery('')
                setSelectedStatus('all')
                setCurrentPage(1)
                reloadData('all', '', 1, pageSize)
              }}
              disabled={isFetching}
              className="cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </Button>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {filterTabs.map((tab) => {
              const isActive = selectedStatus === tab.key
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleStatusFilterChange(tab.key)}
                  className={`px-3 py-1.5 font-bold border-2 border-[#09090B] flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
                    isActive
                      ? 'bg-[#09090B] text-white shadow-[2px_2px_0_0_#09090B]'
                      : 'bg-[#FAF8F5] text-[#09090B] hover:bg-white'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 text-[10px] font-mono border ${
                      isActive
                        ? 'bg-white text-[#09090B] border-white'
                        : 'bg-white text-[#52525B] border-[#09090B]'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Reports Table / Grid */}
        <div className="border-2 border-[#09090B] bg-white shadow-[6px_6px_0_0_#09090B] overflow-hidden">
          <div className="p-4 bg-[#FAF8F5] border-b-2 border-[#09090B] flex items-center justify-between">
            <div className="font-extrabold text-sm text-[#09090B]">
              Daftar Laporan Penanganan Sarana
            </div>
            <div className="text-xs font-mono text-[#52525B]">
              Total: {pagination.totalCount} laporan
            </div>
          </div>

          {reportsList.length === 0 ? (
            <div className="p-12 text-center text-[#52525B]">
              <div className="w-12 h-12 border-2 border-[#09090B] bg-[#FAF8F5] flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-[#52525B]" />
              </div>
              <div className="font-bold text-sm text-[#09090B]">
                Tidak ada laporan yang cocok dengan filter
              </div>
              <p className="text-xs mt-1">
                Silakan ubah tab status atau kata kunci pencarian Anda.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] border-b-2 border-[#09090B] text-[11px] font-extrabold uppercase tracking-wider text-[#09090B]">
                  <tr>
                    <th className="p-3.5">Kode &amp; Judul</th>
                    <th className="p-3.5">Lokasi &amp; Kategori</th>
                    <th className="p-3.5">Status &amp; Urgensi</th>
                    <th className="p-3.5">Pelapor &amp; Teknisi</th>
                    <th className="p-3.5">Tanggal</th>
                    <th className="p-3.5 text-right">Tindakan Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-[#09090B]">
                  {reportsList.map((r: any) => (
                    <tr
                      key={r.id}
                      className="hover:bg-[#FAF8F5] transition-colors"
                    >
                      {/* Kode & Judul */}
                      <td className="p-3.5 align-top min-w-[200px]">
                        <div className="font-mono font-extrabold text-xs px-1.5 py-0.5 border border-[#09090B] bg-[#FAF8F5] inline-block mb-1">
                          {r.trackingCode}
                        </div>
                        <div className="font-bold text-xs md:text-sm text-[#09090B] line-clamp-2">
                          {r.title}
                        </div>
                      </td>

                      {/* Lokasi & Kategori */}
                      <td className="p-3.5 align-top min-w-[180px]">
                        <div className="flex items-center gap-1 font-bold text-xs text-[#09090B]">
                          <MapPin className="w-3 h-3 text-[#52525B] shrink-0" />
                          <span className="truncate">{r.building}</span>
                        </div>
                        <div className="text-[11px] text-[#52525B] mt-0.5">
                          {r.floor ? `${r.floor} • ` : ''}
                          {r.roomOrArea}
                        </div>
                        <div className="inline-block mt-1 px-1.5 py-0.2 text-[10px] font-medium border border-neutral-300 bg-white">
                          {r.categoryName}
                        </div>
                      </td>

                      {/* Status & Urgensi */}
                      <td className="p-3.5 align-top min-w-[140px] space-y-1.5">
                        <div>
                          <ReportStatusBadge status={r.status} />
                        </div>
                        <div>
                          <ReportUrgencyBadge urgency={r.urgency} />
                        </div>
                      </td>

                      {/* Pelapor & Teknisi */}
                      <td className="p-3.5 align-top min-w-[160px]">
                        <div className="flex items-center gap-1 text-[11px] text-[#09090B]">
                          <User className="w-3 h-3 text-[#52525B] shrink-0" />
                          <span className="font-bold truncate">{r.reporterName}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-[#52525B] mt-1">
                          <Wrench className="w-3 h-3 shrink-0" />
                          <span className="truncate">
                            {r.assignedTechnicianName || 'Belum ditugaskan'}
                          </span>
                        </div>
                      </td>

                      {/* Tanggal & Foto */}
                      <td className="p-3.5 align-top min-w-[120px] font-mono text-[11px] text-[#52525B]">
                        <div>{formatDate(r.createdAt)}</div>
                        <div className="flex items-center gap-1 mt-1 text-[10px]">
                          <Camera className="w-3 h-3" />
                          <span>{r.photoCount} foto</span>
                        </div>
                      </td>

                      {/* Tindakan Admin */}
                      <td className="p-3.5 align-top text-right min-w-[200px]">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Quick Action by Status */}
                          {r.status === 'submitted' ? (
                            <>
                              <Button
                                variant="lime"
                                size="sm"
                                onClick={() => handleOpenVerify(r)}
                                className="cursor-pointer text-[11px] py-1 px-2"
                              >
                                <span>Verifikasi</span>
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleOpenReject(r)}
                                className="cursor-pointer text-[11px] py-1 px-2"
                              >
                                <span>Tolak</span>
                              </Button>
                            </>
                          ) : null}

                          {r.status === 'verified' ? (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleOpenAssign(r)}
                              className="cursor-pointer text-[11px] py-1 px-2"
                            >
                              <span>Tugaskan</span>
                            </Button>
                          ) : null}

                          {r.status === 'review' ? (
                            <Button
                              variant="lime"
                              size="sm"
                              onClick={() => handleOpenReview(r)}
                              className="cursor-pointer text-[11px] py-1 px-2"
                            >
                              <span>Review Bukti</span>
                            </Button>
                          ) : null}

                          {/* Always Available Detail View */}
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openDetailDrawer(r.id)}
                            className="cursor-pointer text-[11px] py-1 px-2"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Detail</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Container */}
          {reportsList.length > 0 && pagination && (
            <div className="p-4 bg-[#FAF8F5]">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                totalCount={pagination.totalCount}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          )}
        </div>
      </>
    ) : null}

    {activeMainTab === 'master' ? (
      <MasterDataManagement
        initialCategories={initialCategories}
        initialLocations={initialLocations}
        onNotify={showToast}
      />
    ) : null}

    {activeMainTab === 'staff' ? (
      <StaffManagement
        initialStaff={initialStaff}
        currentAdminId={user.id}
        onNotify={showToast}
      />
    ) : null}
  </main>

      {/* Drawer Detail Laporan */}
      <ReportDetailDrawer
        report={selectedReportDetail}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onVerifyClick={() => handleOpenVerify(selectedReportDetail)}
        onAssignClick={() => handleOpenAssign(selectedReportDetail)}
        onRejectClick={() => handleOpenReject(selectedReportDetail)}
        onDuplicateClick={() => handleOpenDuplicate(selectedReportDetail)}
        onReviewClick={() => handleOpenReview(selectedReportDetail)}
      />

      {/* Dialog Verifikasi */}
      {activeReport ? (
        <VerifyDialog
          isOpen={activeDialog === 'verify'}
          onClose={() => setActiveDialog(null)}
          isLoading={isActionLoading}
          reportTitle={activeReport.title}
          currentUrgency={activeReport.urgency}
          onConfirm={handleConfirmVerify}
        />
      ) : null}

      {/* Dialog Tugaskan Teknisi */}
      {activeReport ? (
        <AssignTechnicianDialog
          isOpen={activeDialog === 'assign'}
          onClose={() => setActiveDialog(null)}
          isLoading={isActionLoading}
          reportTitle={activeReport.title}
          technicians={technicians}
          onConfirm={handleConfirmAssign}
        />
      ) : null}

      {/* Dialog Tolak Laporan */}
      {activeReport ? (
        <RejectReportDialog
          isOpen={activeDialog === 'reject'}
          onClose={() => setActiveDialog(null)}
          isLoading={isActionLoading}
          reportTitle={activeReport.title}
          onConfirm={handleConfirmReject}
        />
      ) : null}

      {/* Dialog Tandai Duplikat */}
      {activeReport ? (
        <MarkDuplicateDialog
          isOpen={activeDialog === 'duplicate'}
          onClose={() => setActiveDialog(null)}
          isLoading={isActionLoading}
          reportTitle={activeReport.title}
          otherReports={reportsList.filter((r: any) => r.id !== activeReport.id)}
          onConfirm={handleConfirmDuplicate}
        />
      ) : null}

      {/* Dialog Review Hasil Kerja */}
      {activeReport && selectedReportDetail ? (
        <ReviewCompletionDialog
          isOpen={activeDialog === 'review'}
          onClose={() => setActiveDialog(null)}
          isLoading={isActionLoading}
          reportTitle={activeReport.title}
          initialPhotos={selectedReportDetail.photos.filter(
            (p) => p.photoType === 'initial',
          )}
          proofPhotos={selectedReportDetail.photos.filter(
            (p) => p.photoType === 'proof',
          )}
          onConfirm={handleConfirmReview}
        />
      ) : null}

      <footer className="border-t-2 border-[#09090B] bg-[#FAF8F5] py-4 text-center text-xs font-mono text-[#52525B]">
        Universitas Tadulako • Panel Administrator Sarpras • WITA (UTC+8)
      </footer>
    </div>
  )
}
