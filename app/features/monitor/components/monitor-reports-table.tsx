import * as React from 'react'
import {
  Search,
  Download,
  Eye,
  Filter,
  Layers,
  MapPin,
  Calendar,
} from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Pagination } from '~/components/ui/pagination'
import { formatDate } from '~/lib/utils'
import {
  ReportStatusBadge,
  ReportUrgencyBadge,
} from '~/features/admin/components/report-status-badge'
import type { MonitorReportItem } from '../monitor.fn'

interface MonitorReportsTableProps {
  reports: MonitorReportItem[]
  onSelectReport: (report: MonitorReportItem) => void
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'submitted', label: 'Diajukan' },
  { value: 'verified', label: 'Diverifikasi' },
  { value: 'assigned', label: 'Ditugaskan' },
  { value: 'in_progress', label: 'Dalam Pengerjaan' },
  { value: 'review', label: 'Review' },
  { value: 'completed', label: 'Selesai' },
  { value: 'rejected', label: 'Ditolak' },
  { value: 'duplicate', label: 'Duplikat' },
]

const URGENCY_OPTIONS = [
  { value: 'all', label: 'Semua Urgensi' },
  { value: 'emergency', label: 'Darurat' },
  { value: 'high', label: 'Tinggi' },
  { value: 'normal', label: 'Normal' },
]

function escapeCsv(val: string | null | undefined): string {
  if (val == null) return '""'
  const str = String(val).replace(/"/g, '""')
  return `"${str}"`
}

export function MonitorReportsTable({
  reports,
  onSelectReport,
}: MonitorReportsTableProps) {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedStatus, setSelectedStatus] = React.useState('all')
  const [selectedUrgency, setSelectedUrgency] = React.useState('all')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedStatus, selectedUrgency])

  const filteredReports = React.useMemo(() => {
    return reports.filter((item) => {
      // Filter status
      if (selectedStatus !== 'all' && item.status !== selectedStatus) {
        return false
      }
      // Filter urgensi
      if (selectedUrgency !== 'all' && item.urgency !== selectedUrgency) {
        return false
      }
      // Filter search
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim()
        const matchTracking = item.trackingCode.toLowerCase().includes(query)
        const matchTitle = item.title.toLowerCase().includes(query)
        const matchCategory = item.category?.name?.toLowerCase().includes(query) || false
        const matchBuilding = item.location?.building?.toLowerCase().includes(query) || false
        const matchTechnician = item.assignedTechnicianName?.toLowerCase().includes(query) || false
        const matchReporter = (item.reporterName || '').toLowerCase().includes(query)
        if (!matchTracking && !matchTitle && !matchCategory && !matchBuilding && !matchTechnician && !matchReporter) {
          return false
        }
      }
      return true
    })
  }, [reports, selectedStatus, selectedUrgency, searchQuery])

  const totalCount = filteredReports.length
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const paginatedReports = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredReports.slice(start, start + pageSize)
  }, [filteredReports, currentPage, pageSize])

  const handleExportCsv = () => {
    if (filteredReports.length === 0) return

    const headers = [
      'Kode Tracking',
      'Judul Pengaduan',
      'Kategori',
      'Kampus',
      'Gedung',
      'Lantai / Ruang',
      'Tingkat Urgensi',
      'Status',
      'Anonim',
      'Nama Pelapor',
      'Email Pelapor',
      'Teknisi Penanggung Jawab',
      'Waktu Pengaduan',
      'Waktu Pembaruan Terakhir',
    ]

    const rows = filteredReports.map((r) => [
      escapeCsv(r.trackingCode),
      escapeCsv(r.title),
      escapeCsv(r.category?.name || 'Tanpa Kategori'),
      escapeCsv(r.location?.campus || 'Kampus Utama'),
      escapeCsv(r.location?.building || 'Area Terbuka'),
      escapeCsv(
        [r.location?.floor, r.location?.roomOrArea].filter(Boolean).join(' - ') ||
          '-',
      ),
      escapeCsv(r.urgency),
      escapeCsv(r.status),
      escapeCsv(r.isAnonymous ? 'Ya' : 'Tidak'),
      escapeCsv(r.isAnonymous ? 'Anonim' : r.reporterName || '-'),
      escapeCsv(r.isAnonymous ? '-' : r.reporterEmail || '-'),
      escapeCsv(r.assignedTechnicianName || 'Belum Ditugaskan'),
      escapeCsv(formatDate(r.createdAt)),
      escapeCsv(formatDate(r.updatedAt)),
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\r\n')

    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const timestamp = new Date().toISOString().slice(0, 10)
    link.setAttribute('href', url)
    link.setAttribute('download', `sipantad-audit-laporan-${timestamp}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="border-2 border-[#09090B] bg-white p-4 md:p-6 shadow-[4px_4px_0_0_#09090B] space-y-5">
      {/* Header & Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b-2 border-[#09090B]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 border-2 border-[#09090B] bg-[#BAE6FD] flex items-center justify-center shadow-[2px_2px_0_0_#09090B]">
              <Layers className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
            </div>
            <h2 className="text-base md:text-lg font-extrabold text-[#09090B]">
              Buku Audit Laporan Kampus
            </h2>
          </div>
          <p className="text-xs text-[#52525B] mt-1">
            Data lengkap pengaduan sarana prasarana dengan akses audit langsung dan ekspor CSV
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="lime"
            size="sm"
            onClick={handleExportCsv}
            disabled={filteredReports.length === 0}
            className="shrink-0"
            title="Unduh data dalam format CSV untuk Excel / Spreadsheet"
          >
            <Download className="w-4 h-4" strokeWidth={2.5} />
            <span>Ekspor CSV ({filteredReports.length})</span>
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row gap-2.5">
          {/* Input Pencarian */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525B]" />
            <input
              type="text"
              placeholder="Cari kode tracking, judul masalah, gedung, teknisi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs md:text-sm border-2 border-[#09090B] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-0 shadow-[2px_2px_0_0_#09090B] placeholder:text-[#52525B]"
            />
          </div>

          {/* Urgensi Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <label className="text-xs font-bold text-[#09090B] hidden sm:inline">
              Urgensi:
            </label>
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="px-3 py-2 text-xs font-bold border-2 border-[#09090B] bg-[#FAF8F5] shadow-[2px_2px_0_0_#09090B] focus:outline-none cursor-pointer"
            >
              {URGENCY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#52525B] mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          {STATUS_OPTIONS.map((opt) => {
            const isActive = selectedStatus === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedStatus(opt.value)}
                className={`px-2.5 py-1 text-[11px] font-extrabold border border-[#09090B] shrink-0 cursor-pointer transition-all ${
                  isActive
                    ? 'bg-[#BAE6FD] shadow-[2px_2px_0_0_#09090B] translate-x-[-1px] translate-y-[-1px]'
                    : 'bg-white hover:bg-neutral-100 text-[#52525B]'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Laporan Counter Info */}
      <div className="flex items-center justify-between text-xs text-[#52525B] font-mono border-t border-neutral-200 pt-2">
        <span>
          Menampilkan <strong>{filteredReports.length}</strong> dari total{' '}
          <strong>{reports.length}</strong> pengaduan
        </span>
        {(searchQuery || selectedStatus !== 'all' || selectedUrgency !== 'all') && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('')
              setSelectedStatus('all')
              setSelectedUrgency('all')
            }}
            className="text-xs font-bold text-[#09090B] underline hover:text-neutral-600 cursor-pointer"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto border-2 border-[#09090B]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#FAF8F5] border-b-2 border-[#09090B] font-extrabold uppercase text-[10px] text-[#09090B] tracking-wider">
              <th className="p-3 border-r border-[#09090B]">Kode Tiket</th>
              <th className="p-3 border-r border-[#09090B]">Laporan &amp; Kategori</th>
              <th className="p-3 border-r border-[#09090B]">Lokasi Gedung</th>
              <th className="p-3 border-r border-[#09090B]">Urgensi</th>
              <th className="p-3 border-r border-[#09090B]">Status</th>
              <th className="p-3 border-r border-[#09090B]">Tanggal Masuk</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y border-[#09090B]">
            {filteredReports.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-8 text-center bg-white text-xs font-bold text-[#52525B]"
                >
                  Tidak ada laporan yang sesuai dengan kriteria pencarian &amp; filter.
                </td>
              </tr>
            ) : (
              paginatedReports.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-[#FAF8F5] transition-colors group"
                >
                  {/* Kode Tiket */}
                  <td className="p-3 border-r border-[#09090B] font-mono font-bold whitespace-nowrap">
                    <span className="px-1.5 py-0.5 border border-[#09090B] bg-[#FAF8F5]">
                      {item.trackingCode}
                    </span>
                  </td>

                  {/* Laporan & Kategori */}
                  <td className="p-3 border-r border-[#09090B] max-w-xs">
                    <div className="font-extrabold text-[#09090B] group-hover:text-black line-clamp-1">
                      {item.title}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-[#52525B]">
                      <span>{item.category?.name || 'Tanpa Kategori'}</span>
                      {item.isAnonymous ? (
                        <span className="text-[10px] px-1 border border-neutral-300 bg-neutral-100">
                          Anonim
                        </span>
                      ) : null}
                    </div>
                  </td>

                  {/* Lokasi Gedung */}
                  <td className="p-3 border-r border-[#09090B] whitespace-nowrap">
                    <div className="font-bold text-[#09090B] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#52525B] shrink-0" />
                      <span className="truncate max-w-[150px]">
                        {item.location?.building || 'Area Kampus'}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#52525B] ml-4 font-mono">
                      {item.location?.floor ? `${item.location.floor} • ` : ''}
                      {item.location?.roomOrArea || '-'}
                    </div>
                  </td>

                  {/* Urgensi */}
                  <td className="p-3 border-r border-[#09090B] whitespace-nowrap">
                    <ReportUrgencyBadge urgency={item.urgency} />
                  </td>

                  {/* Status */}
                  <td className="p-3 border-r border-[#09090B] whitespace-nowrap">
                    <ReportStatusBadge status={item.status} />
                  </td>

                  {/* Tanggal */}
                  <td className="p-3 border-r border-[#09090B] font-mono text-[11px] text-[#52525B] whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                  </td>

                  {/* Aksi */}
                  <td className="p-3 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onSelectReport(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-extrabold border-2 border-[#09090B] bg-[#BAE6FD] hover:bg-[#7DD3FC] shadow-[2px_2px_0_0_#09090B] active:shadow-none cursor-pointer transition-all"
                      title="Lihat Detail & Foto Audit"
                    >
                      <Eye className="w-3.5 h-3.5" strokeWidth={2.5} />
                      <span>Detail</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalCount > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize)
            setCurrentPage(1)
          }}
        />
      )}
    </div>
  )
}
