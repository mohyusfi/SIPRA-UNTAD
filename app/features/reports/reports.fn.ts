import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq, desc } from 'drizzle-orm'
import { db } from '~/db'
import { categories, locations, reports, reportPhotos, reportTimeline } from '~/db/schema'
import { supabase, getBatchSignedUrls } from '~/lib/supabase'
import { generateTrackingCode } from '~/lib/utils'
import { getSessionFromServer } from '~/lib/auth-session.server'
import { resolveRateLimitKey, consumeRateLimit } from '~/lib/rate-limit.server'

export const getMasterData = createServerFn({ method: 'GET' }).handler(
  async () => {
    const activeCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
      })
      .from(categories)
      .where(eq(categories.isArchived, false))

    const activeLocations = await db
      .select({
        id: locations.id,
        campus: locations.campus,
        building: locations.building,
        floor: locations.floor,
        roomOrArea: locations.roomOrArea,
      })
      .from(locations)
      .where(eq(locations.isArchived, false))

    return {
      categories: activeCategories,
      locations: activeLocations,
    }
  },
)

const submitReportInputSchema = z.object({
  honeypot: z.string().optional(),
  title: z
    .string()
    .min(5, 'Judul laporan minimal 5 karakter')
    .max(120, 'Judul laporan maksimal 120 karakter'),
  descriptionJson: z.string(),
  descriptionText: z
    .string()
    .min(20, 'Deskripsi kerusakan minimal 20 karakter')
    .max(2000, 'Deskripsi kerusakan maksimal 2.000 karakter'),
  categoryId: z.string().min(1, 'Pilih kategori kerusakan'),
  locationId: z.string().min(1, 'Pilih lokasi kerusakan'),
  locationDetail: z.string().optional(),
  urgency: z.enum(['normal', 'high', 'emergency']),
  isAnonymous: z.boolean(),
  reporterName: z.string().optional(),
  reporterEmail: z
    .string()
    .email('Format email tidak valid')
    .optional()
    .or(z.literal('')),
  photos: z
    .array(
      z.object({
        name: z.string(),
        type: z.string(),
        size: z.number().max(5 * 1024 * 1024, 'Ukuran foto maksimal 5MB'),
        base64: z.string(),
      }),
    )
    .min(1, 'Wajib melampirkan minimal 1 foto bukti kerusakan')
    .max(5, 'Maksimal 5 foto bukti kerusakan'),
})

export const submitReport = createServerFn({ method: 'POST' })
  .validator((data: unknown) => submitReportInputSchema.parse(data))
  .handler(async ({ data }) => {
    if (data.honeypot && data.honeypot.trim() !== '') {
      return {
        success: false,
        error: 'Aktivitas tidak valid terdeteksi.',
      }
    }

    const session = await getSessionFromServer()
    const sessionUser = session?.user || null

    const rateLimitKey = await resolveRateLimitKey('submit_report', sessionUser)
    const rateLimitResult = await consumeRateLimit(rateLimitKey, 5, 15 * 60)
    if (!rateLimitResult.allowed) {
      const minutes = Math.max(1, Math.ceil(rateLimitResult.resetInSeconds / 60))
      return {
        success: false,
        error: `Terlalu banyak pengajuan laporan. Silakan coba kembali dalam ${minutes} menit.`,
      }
    }

    const trackingCode = generateTrackingCode()
    const reportId = crypto.randomUUID()

    let parsedJson: unknown
    try {
      parsedJson = JSON.parse(data.descriptionJson)
    } catch {
      return {
        success: false,
        error: 'Format deskripsi tidak valid.',
      }
    }

    const reporterId = sessionUser ? sessionUser.id : null
    let reporterName: string | null = null
    let reporterEmail: string | null = null

    if (!data.isAnonymous) {
      reporterName = sessionUser ? sessionUser.name : (data.reporterName || null)
      reporterEmail = sessionUser ? sessionUser.email : (data.reporterEmail || null)
    }

    await db.insert(reports).values({
      id: reportId,
      trackingCode,
      title: data.title,
      descriptionJson: parsedJson,
      descriptionText: data.descriptionText,
      categoryId: data.categoryId,
      locationId: data.locationId,
      locationDetail: data.locationDetail || null,
      urgency: data.urgency,
      status: 'submitted',
      isAnonymous: data.isAnonymous,
      reporterId,
      reporterName,
      reporterEmail,
    })

    await Promise.all(
      data.photos.map(
        async (
          photo: {
            name: string
            type: string
            size: number
            base64: string
          },
          i: number,
        ) => {
        const cleanBase64 = photo.base64.replace(/^data:image\/\w+;base64,/, '')
        const fileBuffer = Buffer.from(cleanBase64, 'base64')
        const sanitizedName = photo.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const fileKey = `reports/${reportId}/${Date.now()}-${i}-${sanitizedName}`

        const { error: uploadError } = await supabase.storage
          .from('report-attachments')
          .upload(fileKey, fileBuffer, {
            contentType: photo.type,
            upsert: false,
          })

        if (uploadError) {
          console.error('Upload foto gagal:', uploadError)
        } else {
          await db.insert(reportPhotos).values({
            id: crypto.randomUUID(),
            reportId,
            fileKey,
            photoType: 'initial',
          })
        }
      }),
    )

    await db.insert(reportTimeline).values({
      id: crypto.randomUUID(),
      reportId,
      action: 'Laporan Diajukan',
      fromStatus: null,
      toStatus: 'submitted',
      notes: 'Laporan fasilitas fisik baru berhasil didaftarkan ke dalam sistem.',
    })

    return {
      success: true,
      trackingCode,
    }
  })

const getReportInputSchema = z.object({
  trackingCode: z.string().min(5),
})

export const getReportByTrackingCode = createServerFn({ method: 'GET' })
  .validator((data: unknown) => getReportInputSchema.parse(data))
  .handler(async ({ data }) => {
    const rateLimitKey = await resolveRateLimitKey('track_report')
    const rateLimitResult = await consumeRateLimit(rateLimitKey, 15, 60)
    if (!rateLimitResult.allowed) {
      throw new Error(
        `Terlalu banyak permintaan pelacakan. Silakan coba kembali dalam ${rateLimitResult.resetInSeconds} detik.`,
      )
    }

    const report = await db.query.reports.findFirst({
      where: eq(reports.trackingCode, data.trackingCode.trim().toUpperCase()),
      with: {
        category: true,
        location: true,
        photos: true,
        timeline: {
          orderBy: [desc(reportTimeline.createdAt)],
        },
      },
    })

    if (!report) {
      return null
    }

    const signedUrlsMap = await getBatchSignedUrls(
      report.photos.map((p) => p.fileKey),
    )

    const photosWithUrls = report.photos.map((p) => ({
      id: p.id,
      photoType: p.photoType,
      fileKey: p.fileKey,
      url: signedUrlsMap.get(p.fileKey) || '',
      createdAt: p.createdAt,
    }))

    return {
      id: report.id,
      trackingCode: report.trackingCode,
      title: report.title,
      descriptionText: report.descriptionText,
      descriptionJson: report.descriptionJson,
      urgency: report.urgency,
      status: report.status,
      isAnonymous: report.isAnonymous,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      locationDetail: report.locationDetail,
      category: report.category ? { id: report.category.id, name: report.category.name } : null,
      location: report.location
        ? {
            id: report.location.id,
            building: report.location.building,
            floor: report.location.floor,
            roomOrArea: report.location.roomOrArea,
          }
        : null,
      photos: photosWithUrls,
      timeline: report.timeline.map((t) => ({
        id: t.id,
        action: t.action,
        fromStatus: t.fromStatus,
        toStatus: t.toStatus,
        notes: t.notes,
        createdAt: t.createdAt,
      })),
    }
  })

const getReporterDashboardSchema = z
  .object({
    page: z.number().default(1).optional(),
    limit: z.number().default(6).optional(),
  })
  .optional()

export const getReporterDashboardData = createServerFn({ method: 'GET' })
  .validator((data: unknown) => getReporterDashboardSchema.parse(data || {}))
  .handler(async ({ data }) => {
    const session = await getSessionFromServer()
    if (!session?.user) {
      throw new Error('Sesi tidak valid. Silakan login terlebih dahulu.')
    }
    const sessionUser = session.user as any

    const userReports = await db.query.reports.findMany({
      where: eq(reports.reporterId, sessionUser.id),
      orderBy: [desc(reports.createdAt)],
      with: {
        category: true,
        location: true,
        photos: true,
        timeline: {
          orderBy: [desc(reportTimeline.createdAt)],
        },
      },
    })

    let pendingCount = 0
    let inProgressCount = 0
    let completedCount = 0
    let otherCount = 0

    for (const r of userReports) {
      if (r.status === 'submitted' || r.status === 'verified') {
        pendingCount++
      } else if (
        r.status === 'assigned' ||
        r.status === 'in_progress' ||
        r.status === 'review'
      ) {
        inProgressCount++
      } else if (r.status === 'completed') {
        completedCount++
      } else {
        otherCount++
      }
    }

    const page = Math.max(1, data?.page || 1)
    const limit = Math.max(1, data?.limit || 6)
    const totalCount = userReports.length
    const offset = (page - 1) * limit
    const paginatedSlice = userReports.slice(offset, offset + limit)
    const hasMore = offset + limit < totalCount

    // Sign URLs only for the current batch
    const allFileKeys = paginatedSlice.flatMap((r) => r.photos.map((p) => p.fileKey))
    const signedUrlsMap = await getBatchSignedUrls(allFileKeys)

    const formattedReports = paginatedSlice.map((r) => {
      const photosWithUrls = r.photos.map((p) => ({
        id: p.id,
        photoType: p.photoType,
        fileKey: p.fileKey,
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
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        locationDetail: r.locationDetail,
        category: r.category
          ? { id: r.category.id, name: r.category.name }
          : null,
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
          createdAt: t.createdAt,
        })),
      }
    })

    return {
      stats: {
        total: userReports.length,
        pending: pendingCount,
        inProgress: inProgressCount,
        completed: completedCount,
        other: otherCount,
      },
      reports: formattedReports,
      pagination: {
        page,
        limit,
        totalCount,
        hasMore,
      },
    }
  })
