import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { desc, gte } from 'drizzle-orm'
import { db } from '~/db'
import { reports, reportTimeline } from '~/db/schema'
import { getCurrentUserSession } from '~/lib/auth-server'
import { getBatchSignedUrls } from '~/lib/supabase'

export type TimeRangeOption = '7d' | '30d' | 'semester' | 'all'

export interface MonitorKPIStats {
  total: number
  completed: number
  completionRate: number
  inProgress: number
  pending: number
  emergency: number
  avgTurnaroundHours: number
  avgTurnaroundDisplay: string
}

export interface CategoryDistribution {
  id: string
  name: string
  count: number
  percentage: number
}

export interface BuildingHotspot {
  building: string
  count: number
  percentage: number
}

export interface MonitorReportItem {
  id: string
  trackingCode: string
  title: string
  descriptionText: string
  descriptionJson: unknown
  urgency: string
  status: string
  isAnonymous: boolean
  reporterName?: string | null
  reporterEmail?: string | null
  assignedTechnicianName?: string | null
  createdAt: Date | string
  updatedAt: Date | string
  locationDetail?: string | null
  category?: { id: string; name: string } | null
  location?: {
    id: string
    campus: string
    building: string
    floor?: string | null
    roomOrArea?: string | null
  } | null
  photos: Array<{
    id: string
    fileKey: string
    photoType: string
    url: string
    createdAt: Date | string
  }>
  timeline: Array<{
    id: string
    action: string
    fromStatus?: string | null
    toStatus: string
    notes?: string | null
    actorName?: string | null
    actorRole?: string | null
    createdAt: Date | string
  }>
}

export interface MonitorDashboardData {
  timeRange: TimeRangeOption
  stats: MonitorKPIStats
  categories: CategoryDistribution[]
  locations: BuildingHotspot[]
  reports: MonitorReportItem[]
}

const monitorQuerySchema = z.object({
  timeRange: z.enum(['7d', '30d', 'semester', 'all']).default('30d'),
})

export const getMonitorDashboardData = createServerFn({ method: 'GET' })
  .validator((data: unknown) => monitorQuerySchema.parse(data || {}))
  .handler(async ({ data }) => {
    const session = await getCurrentUserSession()
    if (!session?.user) {
      throw new Error('Sesi tidak ditemukan. Silakan login terlebih dahulu.')
    }

    const role = (session.user as any).role
    if (role !== 'monitor' && role !== 'admin') {
      throw new Error(
        'Akses ditolak: Hanya akun Pemantau atau Admin yang berhak melihat dashboard ini.',
      )
    }

    const now = new Date()
    let startDate: Date | null = null

    if (data.timeRange === '7d') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (data.timeRange === '30d') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    } else if (data.timeRange === 'semester') {
      startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
    }

    const whereClause = startDate ? gte(reports.createdAt, startDate) : undefined

    const allReports = await db.query.reports.findMany({
      where: whereClause,
      orderBy: [desc(reports.createdAt)],
      with: {
        category: true,
        location: true,
        assignedTechnician: true,
        photos: true,
        timeline: {
          with: {
            actor: true,
          },
          orderBy: [desc(reportTimeline.createdAt)],
        },
      },
    })

    let completedCount = 0
    let inProgressCount = 0
    let pendingCount = 0
    let emergencyCount = 0
    let totalResolutionHours = 0
    let completedWithDurationCount = 0

    const categoryCounts: Record<string, { id: string; name: string; count: number }> = {}
    const buildingCounts: Record<string, number> = {}

    for (const r of allReports) {
      if (r.status === 'completed') {
        completedCount++
        const completedTimeline = r.timeline.find((t) => t.toStatus === 'completed')
        const endTime = completedTimeline ? new Date(completedTimeline.createdAt) : new Date(r.updatedAt)
        const startTime = new Date(r.createdAt)
        const diffHours = Math.max(0, (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60))
        totalResolutionHours += diffHours
        completedWithDurationCount++
      } else if (
        r.status === 'assigned' ||
        r.status === 'in_progress' ||
        r.status === 'review'
      ) {
        inProgressCount++
      } else if (r.status === 'submitted' || r.status === 'verified') {
        pendingCount++
      }

      if (r.urgency === 'emergency') {
        emergencyCount++
      }

      if (r.category) {
        if (!categoryCounts[r.category.id]) {
          categoryCounts[r.category.id] = {
            id: r.category.id,
            name: r.category.name,
            count: 0,
          }
        }
        categoryCounts[r.category.id].count++
      }

      const building = r.location?.building || 'Area Terbuka / Umum'
      buildingCounts[building] = (buildingCounts[building] || 0) + 1
    }

    const total = allReports.length
    const completionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0
    const avgTurnaroundHours =
      completedWithDurationCount > 0
        ? Math.round((totalResolutionHours / completedWithDurationCount) * 10) / 10
        : 0

    let avgTurnaroundDisplay = '-'
    if (avgTurnaroundHours > 0) {
      if (avgTurnaroundHours < 24) {
        avgTurnaroundDisplay = `${avgTurnaroundHours} Jam`
      } else {
        const days = Math.round((avgTurnaroundHours / 24) * 10) / 10
        avgTurnaroundDisplay = `${days} Hari`
      }
    }

    const categories: CategoryDistribution[] = Object.values(categoryCounts)
      .map((c) => ({
        id: c.id,
        name: c.name,
        count: c.count,
        percentage: total > 0 ? Math.round((c.count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)

    const locations: BuildingHotspot[] = Object.entries(buildingCounts)
      .map(([building, count]) => ({
        building,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const allFileKeys = allReports.flatMap((r) => r.photos.map((p) => p.fileKey))
    const signedUrlsMap = await getBatchSignedUrls(allFileKeys)

    const formattedReports: MonitorReportItem[] = allReports.map((r) => {
      const photosWithUrls = r.photos.map((p) => ({
        id: p.id,
        fileKey: p.fileKey,
        photoType: p.photoType,
        url: signedUrlsMap.get(p.fileKey) || '',
        createdAt: p.createdAt,
      }))

      return {
        id: r.id,
        trackingCode: r.trackingCode,
        title: r.title,
        descriptionText: r.descriptionText,
        descriptionJson: r.descriptionJson,
        urgency: r.urgency,
        status: r.status,
        isAnonymous: r.isAnonymous,
        reporterName: r.reporterName,
        reporterEmail: r.reporterEmail,
        assignedTechnicianName: r.assignedTechnician?.name || null,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        locationDetail: r.locationDetail,
        category: r.category ? { id: r.category.id, name: r.category.name } : null,
        location: r.location
          ? {
              id: r.location.id,
              campus: r.location.campus,
              building: r.location.building,
              floor: r.location.floor,
              roomOrArea: r.location.roomOrArea,
            }
          : null,
        photos: photosWithUrls,
        timeline: r.timeline.map((t) => ({
          id: t.id,
          action: t.action,
          fromStatus: t.fromStatus,
          toStatus: t.toStatus,
          notes: t.notes,
          actorName: t.actor?.name || null,
          actorRole: t.actor?.role || null,
          createdAt: t.createdAt,
        })),
      }
    })

    return {
      timeRange: data.timeRange,
      stats: {
        total,
        completed: completedCount,
        completionRate,
        inProgress: inProgressCount,
        pending: pendingCount,
        emergency: emergencyCount,
        avgTurnaroundHours,
        avgTurnaroundDisplay,
      },
      categories,
      locations,
      reports: formattedReports,
    }
  })
