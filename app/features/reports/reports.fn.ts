import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq, desc } from 'drizzle-orm'
import { db } from '~/db'
import { categories, locations, reports, reportPhotos, reportTimeline } from '~/db/schema'
import { supabase } from '~/lib/supabase'
import { generateTrackingCode } from '~/lib/utils'

const rateLimitMap = new Map<string, number[]>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000
  const maxRequests = 5

  const timestamps = rateLimitMap.get(ip) || []
  const recentTimestamps = timestamps.filter((time) => now - time < windowMs)

  if (recentTimestamps.length >= maxRequests) {
    return false
  }

  recentTimestamps.push(now)
  rateLimitMap.set(ip, recentTimestamps)
  return true
}

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

    const clientKey = 'client-session'
    if (!checkRateLimit(clientKey)) {
      return {
        success: false,
        error: 'Terlalu banyak pengajuan laporan. Silakan coba kembali dalam 15 menit.',
      }
    }

    let parsedJson: unknown
    try {
      parsedJson = JSON.parse(data.descriptionJson)
    } catch {
      return {
        success: false,
        error: 'Format deskripsi tidak valid.',
      }
    }

    const trackingCode = generateTrackingCode()
    const reportId = crypto.randomUUID()

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
      reporterName: data.isAnonymous ? null : data.reporterName || null,
      reporterEmail: data.isAnonymous ? null : data.reporterEmail || null,
    })

    for (let i = 0; i < data.photos.length; i++) {
      const photo = data.photos[i]
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
    }

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

    const photosWithUrls = await Promise.all(
      report.photos.map(async (p) => {
        const { data: signed } = await supabase.storage
          .from('report-attachments')
          .createSignedUrl(p.fileKey, 3600)

        return {
          id: p.id,
          photoType: p.photoType,
          fileKey: p.fileKey,
          url: signed?.signedUrl || '',
          createdAt: p.createdAt,
        }
      }),
    )

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
