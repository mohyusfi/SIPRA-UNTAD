import * as React from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import {
  Wrench,
  Clock,
  Camera,
  CheckCircle,
  Search,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react'
import { getCurrentUserSession } from '~/lib/auth-server'
import { DashboardHeader } from '~/features/dashboard/components/dashboard-header'
import { Pagination } from '~/components/ui/pagination'
import {
  getTechnicianTasks,
  startTaskAction,
} from '~/features/technician/technician.fn'
import {
  TaskCard,
  type TechnicianTaskItem,
} from '~/features/technician/components/task-card'
import {
  CompletionModal,
} from '~/features/technician/components/completion-modal'
import { formatErrorMessage } from '~/lib/utils'
import { NeoToast, type ToastData } from '~/components/ui/neo-toast'

export const Route = createFileRoute('/dashboard/technician')({
  head: () => ({
    meta: [
      { title: 'Teknisi Dashboard | SIPANTAD' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
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
    const data = await getTechnicianTasks({
      data: { tab: 'all', search: '', page: 1, limit: 10 },
    })
    return {
      user: context.user,
      initialTasks: data.tasks,
      initialStats: data.stats,
      initialPagination: data.pagination,
    }
  },
  component: TechnicianDashboardPage,
})

function TechnicianDashboardPage() {
  const { user, initialTasks, initialStats, initialPagination } = Route.useLoaderData()

  const [selectedTab, setSelectedTab] = React.useState<
    'all' | 'assigned' | 'in_progress' | 'review' | 'completed'
  >('all')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [tasks, setTasks] = React.useState<TechnicianTaskItem[]>(initialTasks as any)
  const [stats, setStats] = React.useState(initialStats)
  const [currentPage, setCurrentPage] = React.useState(initialPagination?.page || 1)
  const [pageSize, setPageSize] = React.useState(initialPagination?.limit || 10)
  const [pagination, setPagination] = React.useState(
    initialPagination || {
      page: 1,
      limit: 10,
      totalCount: initialTasks.length,
      totalPages: Math.max(1, Math.ceil(initialTasks.length / 10)),
    },
  )
  const [isFetching, setIsFetching] = React.useState(false)

  const [startingTaskId, setStartingTaskId] = React.useState<string | null>(null)
  const [completionTask, setCompletionTask] = React.useState<TechnicianTaskItem | null>(null)
  const [toast, setToast] = React.useState<ToastData | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 4000)
  }

  const reloadData = async (
    tab = selectedTab,
    search = searchQuery,
    page = currentPage,
    limit = pageSize,
  ) => {
    setIsFetching(true)
    try {
      const res = await getTechnicianTasks({
        data: { tab, search, page, limit },
      })
      setTasks(res.tasks as any)
      setStats(res.stats)
      if (res.pagination) {
        setPagination(res.pagination)
      }
    } finally {
      setIsFetching(false)
    }
  }

  const handleTabChange = (
    tab: 'all' | 'assigned' | 'in_progress' | 'review' | 'completed',
  ) => {
    setSelectedTab(tab)
    setCurrentPage(1)
    reloadData(tab, searchQuery, 1, pageSize)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    reloadData(selectedTab, searchQuery, 1, pageSize)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    reloadData(selectedTab, searchQuery, newPage, pageSize)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(1)
    reloadData(selectedTab, searchQuery, 1, newSize)
  }

  const handleStartTask = async (taskId: string) => {
    setStartingTaskId(taskId)
    try {
      await startTaskAction({ data: { reportId: taskId } })
      showToast('Pengerjaan perbaikan telah dimulai. Status kini Dalam Pengerjaan.')
      await reloadData()
    } catch (err: unknown) {
      showToast(formatErrorMessage(err, 'Gagal memulai pengerjaan tugas.'), 'error')
    } finally {
      setStartingTaskId(null)
    }
  }

  const handleOpenCompleteModal = (task: TechnicianTaskItem) => {
    setCompletionTask(task)
  }

  const handleCompletionSuccess = async () => {
    showToast('Bukti perbaikan dan catatan teknis berhasil dikirim ke Admin Sarpras.')
    await reloadData()
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <DashboardHeader
        user={user}
        roleLabel="Teknisi Lapangan"
        roleColor="bg-[#FED7AA]"
      />

      {toast ? (
        <NeoToast toast={toast} onClose={() => setToast(null)} />
      ) : null}

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {/* Banner Section */}
        <div className="border-2 border-[#09090B] bg-white p-6 shadow-[6px_6px_0_0_#09090B] mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase border border-[#09090B] bg-[#FED7AA]">
                  Staf Operasional Sarpras
                </span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase border border-[#09090B] bg-[#BAE6FD]">
                  Unit Kerja Lapangan
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-[#09090B]">
                Halo, {user.name}
              </h1>
              <p className="text-xs md:text-sm text-[#52525B] mt-1 max-w-2xl">
                Kelola tiket perbaikan yang ditugaskan ke Anda. Mulai pengerjaan di lokasi, lalu unggah foto bukti fisik beserta catatan tindakan teknis saat selesai.
              </p>
            </div>

            <button
              type="button"
              onClick={() => reloadData()}
              disabled={isFetching}
              className="px-4 py-2.5 text-xs font-extrabold uppercase border-2 border-[#09090B] bg-white hover:bg-[#F4F4F5] shadow-[2px_2px_0_0_#09090B] flex items-center gap-2 transition-transform active:translate-x-[2px] active:translate-y-[2px]"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              <span>{isFetching ? 'Memuat...' : 'Segarkan Data'}</span>
            </button>
          </div>
        </div>

        {/* Metric Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          <button
            type="button"
            onClick={() => handleTabChange('assigned')}
            className={`text-left border-2 border-[#09090B] p-4 transition-all ${
              selectedTab === 'assigned'
                ? 'bg-[#BAE6FD] shadow-[4px_4px_0_0_#09090B] -translate-y-1'
                : 'bg-white shadow-[2px_2px_0_0_#09090B] hover:bg-[#F0F9FF]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase text-[#09090B]">
                Tugas Baru
              </span>
              <Wrench className="w-4 h-4 text-[#09090B]" />
            </div>
            <div className="text-2xl md:text-3xl font-black text-[#09090B]">
              {stats.assigned}
            </div>
            <div className="text-[11px] text-[#52525B] mt-1">Perlu dimulai</div>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('in_progress')}
            className={`text-left border-2 border-[#09090B] p-4 transition-all ${
              selectedTab === 'in_progress'
                ? 'bg-[#FED7AA] shadow-[4px_4px_0_0_#09090B] -translate-y-1'
                : 'bg-white shadow-[2px_2px_0_0_#09090B] hover:bg-[#FFF7ED]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase text-[#09090B]">
                Dikerjakan
              </span>
              <Clock className="w-4 h-4 text-[#09090B]" />
            </div>
            <div className="text-2xl md:text-3xl font-black text-[#09090B]">
              {stats.inProgress}
            </div>
            <div className="text-[11px] text-[#52525B] mt-1">Sedang aktif di lokasi</div>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('review')}
            className={`text-left border-2 border-[#09090B] p-4 transition-all ${
              selectedTab === 'review'
                ? 'bg-[#E9D5FF] shadow-[4px_4px_0_0_#09090B] -translate-y-1'
                : 'bg-white shadow-[2px_2px_0_0_#09090B] hover:bg-[#FAF5FF]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase text-[#09090B]">
                Menunggu Review
              </span>
              <Camera className="w-4 h-4 text-[#09090B]" />
            </div>
            <div className="text-2xl md:text-3xl font-black text-[#09090B]">
              {stats.review}
            </div>
            <div className="text-[11px] text-[#52525B] mt-1">Verifikasi Sarpras</div>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('completed')}
            className={`text-left border-2 border-[#09090B] p-4 transition-all ${
              selectedTab === 'completed'
                ? 'bg-[#D9F99D] shadow-[4px_4px_0_0_#09090B] -translate-y-1'
                : 'bg-white shadow-[2px_2px_0_0_#09090B] hover:bg-[#F7FEE7]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase text-[#09090B]">
                Tuntas Selesai
              </span>
              <CheckCircle className="w-4 h-4 text-[#09090B]" />
            </div>
            <div className="text-2xl md:text-3xl font-black text-[#09090B]">
              {stats.completed}
            </div>
            <div className="text-[11px] text-[#52525B] mt-1">Telah disetujui</div>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="border-2 border-[#09090B] bg-white p-4 shadow-[4px_4px_0_0_#09090B] mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleTabChange('all')}
                className={`px-3 py-1.5 text-xs font-extrabold uppercase border border-[#09090B] transition-all ${
                  selectedTab === 'all'
                    ? 'bg-[#09090B] text-white shadow-[2px_2px_0_0_#71717A]'
                    : 'bg-white text-[#09090B] hover:bg-[#F4F4F5]'
                }`}
              >
                Semua ({stats.total})
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('assigned')}
                className={`px-3 py-1.5 text-xs font-extrabold uppercase border border-[#09090B] transition-all ${
                  selectedTab === 'assigned'
                    ? 'bg-[#BAE6FD] text-[#09090B] shadow-[2px_2px_0_0_#09090B]'
                    : 'bg-white text-[#09090B] hover:bg-[#F4F4F5]'
                }`}
              >
                Tugas Baru ({stats.assigned})
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('in_progress')}
                className={`px-3 py-1.5 text-xs font-extrabold uppercase border border-[#09090B] transition-all ${
                  selectedTab === 'in_progress'
                    ? 'bg-[#FED7AA] text-[#09090B] shadow-[2px_2px_0_0_#09090B]'
                    : 'bg-white text-[#09090B] hover:bg-[#F4F4F5]'
                }`}
              >
                Sedang Dikerjakan ({stats.inProgress})
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('review')}
                className={`px-3 py-1.5 text-xs font-extrabold uppercase border border-[#09090B] transition-all ${
                  selectedTab === 'review'
                    ? 'bg-[#E9D5FF] text-[#09090B] shadow-[2px_2px_0_0_#09090B]'
                    : 'bg-white text-[#09090B] hover:bg-[#F4F4F5]'
                }`}
              >
                Review ({stats.review})
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('completed')}
                className={`px-3 py-1.5 text-xs font-extrabold uppercase border border-[#09090B] transition-all ${
                  selectedTab === 'completed'
                    ? 'bg-[#D9F99D] text-[#09090B] shadow-[2px_2px_0_0_#09090B]'
                    : 'bg-white text-[#09090B] hover:bg-[#F4F4F5]'
                }`}
              >
                Riwayat Selesai ({stats.completed})
              </button>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2 min-w-[280px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari tiket, judul, lokasi..."
                  className="w-full border-2 border-[#09090B] pl-9 pr-3 py-1.5 text-xs md:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#09090B]"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-extrabold uppercase border-2 border-[#09090B] bg-[#09090B] text-white hover:bg-[#27272A] transition-colors"
              >
                Cari
              </button>
            </form>
          </div>
        </div>

        {/* Task Cards Grid */}
        {tasks.length === 0 ? (
          <div className="border-2 border-[#09090B] bg-white p-12 text-center shadow-[4px_4px_0_0_#09090B]">
            <div className="w-12 h-12 mx-auto border-2 border-[#09090B] bg-[#FEF08A] flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-[#09090B]" />
            </div>
            <h3 className="text-base md:text-lg font-black text-[#09090B]">
              Tidak Ada Tugas Ditemukan
            </h3>
            <p className="text-xs md:text-sm text-[#52525B] mt-1 max-w-md mx-auto">
              {searchQuery || selectedTab !== 'all'
                ? 'Tidak ada tiket yang sesuai dengan filter atau kata kunci pencarian Anda.'
                : 'Saat ini belum ada tugas perbaikan fasilitas yang ditugaskan ke Anda oleh Admin Sarpras.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStart={handleStartTask}
                  onOpenCompleteModal={handleOpenCompleteModal}
                  isStarting={startingTaskId === task.id}
                />
              ))}
            </div>

            {pagination && (
              <div className="bg-white p-4 border-2 border-[#09090B] shadow-[4px_4px_0_0_#09090B]">
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
        )}
      </main>

      {/* Completion Modal */}
      <CompletionModal
        task={
          completionTask
            ? {
                id: completionTask.id,
                trackingCode: completionTask.trackingCode,
                title: completionTask.title,
                building: completionTask.building,
                floor: completionTask.floor,
                roomOrArea: completionTask.roomOrArea,
                locationDetail: completionTask.locationDetail,
              }
            : null
        }
        isOpen={Boolean(completionTask)}
        onClose={() => setCompletionTask(null)}
        onSuccess={handleCompletionSuccess}
      />

      <footer className="border-t-2 border-[#09090B] bg-white py-4 text-center text-xs font-mono text-[#52525B] mt-12">
        Universitas Tadulako • Panel Teknisi Lapangan • SIPANTAD
      </footer>
    </div>
  )
}
