import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq, desc } from 'drizzle-orm'
import { db } from '~/db'
import { reports, reportPhotos, reportTimeline } from '~/db/schema'
import { getCurrentUserSession } from '~/lib/auth-server'
import { supabase } from '~/lib/supabase'

async function requireTechnicianSession() {
  const session = await getCurrentUserSession()
  if (!session?.user) {
    throw new Error('Sesi tidak ditemukan. Silakan login kembali.')
  }
  const role = (session.user as any).role
  if (role !== 'technician') {
    throw new Error('Akses ditolak: Anda tidak memiliki wewenang Teknisi Lapangan.')
  }
  return session.user
}

const getTechnicianTasksSchema = z.object({
  tab: z.enum(['all', 'assigned', 'in_progress', 'review', 'completed']).optional(),
  search: z.string().optional(),
})

export const getTechnicianTasks = createServerFn({ method: 'GET' })
  .validator((data: unknown) => getTechnicianTasksSchema.parse(data))
  .handler(async ({ data }) => {
    const techUser = await requireTechnicianSession()

    const allTechReports = await db.query.reports.findMany({
      where: eq(reports.assignedTechnicianId, techUser.id),
      with: {
        category: true,
        location: true,
        photos: true,
        timeline: {
          orderBy: [desc(reportTimeline.createdAt)],
        },
      },
      orderBy: [desc(reports.updatedAt)],
    })

    const stats = {
      total: allTechReports.length,
      assigned: allTechReports.filter((r) => r.status === 'assigned').length,
      inProgress: allTechReports.filter((r) => r.status === 'in_progress').length,
      review: allTechReports.filter((r) => r.status === 'review').length,
      completed: allTechReports.filter((r) => r.status === 'completed').length,
    }

    let filtered = allTechReports

    if (data.tab && data.tab !== 'all') {
      filtered = filtered.filter((r) => r.status === data.tab)
    }

    if (data.search && data.search.trim()) {
      const q = data.search.trim().toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.trackingCode.toLowerCase().includes(q) ||
          (r.locationDetail && r.locationDetail.toLowerCase().includes(q)) ||
          (r.location?.building && r.location.building.toLowerCase().includes(q)),
      )
    }

    const tasksWithUrls = await Promise.all(
      filtered.map(async (r) => {
        const photosWithUrls = await Promise.all(
          r.photos.map(async (p) => {
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
          id: r.id,
          trackingCode: r.trackingCode,
          title: r.title,
          descriptionText: r.descriptionText,
          urgency: r.urgency,
          status: r.status,
          locationDetail: r.locationDetail,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          categoryName: r.category?.name || 'Tanpa Kategori',
          building: r.location?.building || 'Area Kampus',
          floor: r.location?.floor || '',
          roomOrArea: r.location?.roomOrArea || '',
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
      }),
    )

    return {
      stats,
      tasks: tasksWithUrls,
    }
  })

const startTaskSchema = z.object({
  reportId: z.string().min(1),
})

export const startTaskAction = createServerFn({ method: 'POST' })
  .validator((data: unknown) => startTaskSchema.parse(data))
  .handler(async ({ data }) => {
    const techUser = await requireTechnicianSession()

    const [target] = await db
      .select({
        id: reports.id,
        status: reports.status,
        assignedTechnicianId: reports.assignedTechnicianId,
      })
      .from(reports)
      .where(eq(reports.id, data.reportId))

    if (!target) {
      throw new Error('Laporan penugasan tidak ditemukan.')
    }

    if (target.assignedTechnicianId !== techUser.id) {
      throw new Error('Akses ditolak: Tugas ini tidak ditugaskan kepada Anda.')
    }

    if (target.status !== 'assigned') {
      throw new Error('Hanya tugas berstatus "Ditugaskan" yang dapat dimulai pengerjaannya.')
    }

    await db
      .update(reports)
      .set({ status: 'in_progress' })
      .where(eq(reports.id, data.reportId))

    await db.insert(reportTimeline).values({
      id: crypto.randomUUID(),
      reportId: data.reportId,
      actorId: techUser.id,
      action: 'Pengerjaan Dimulai oleh Teknisi',
      fromStatus: 'assigned',
      toStatus: 'in_progress',
      notes: 'Teknisi telah tiba di lokasi dan mulai melakukan pengerjaan fisik.',
    })

    return { success: true }
  })

const completeTaskSchema = z.object({
  reportId: z.string().min(1),
  notes: z.string().min(5, 'Catatan perbaikan teknis minimal 5 karakter'),
  photos: z
    .array(
      z.object({
        name: z.string(),
        type: z.string(),
        size: z.number().max(5 * 1024 * 1024, 'Ukuran foto maksimal 5MB'),
        base64: z.string(),
      }),
    )
    .min(1, 'Wajib melampirkan minimal 1 foto bukti fisik hasil perbaikan')
    .max(5, 'Maksimal 5 foto bukti fisik hasil perbaikan'),
})

export const completeTaskAction = createServerFn({ method: 'POST' })
  .validator((data: unknown) => completeTaskSchema.parse(data))
  .handler(async ({ data }) => {
    const techUser = await requireTechnicianSession()

    const [target] = await db
      .select({
        id: reports.id,
        status: reports.status,
        assignedTechnicianId: reports.assignedTechnicianId,
      })
      .from(reports)
      .where(eq(reports.id, data.reportId))

    if (!target) {
      throw new Error('Laporan penugasan tidak ditemukan.')
    }

    if (target.assignedTechnicianId !== techUser.id) {
      throw new Error('Akses ditolak: Tugas ini tidak ditugaskan kepada Anda.')
    }

    if (target.status !== 'in_progress') {
      throw new Error('Hanya tugas berstatus "Dalam Pengerjaan" yang dapat diajukan penyelesaiannya.')
    }

    for (let i = 0; i < data.photos.length; i++) {
      const photo = data.photos[i]
      const cleanBase64 = photo.base64.replace(/^data:image\/\w+;base64,/, '')
      const fileBuffer = Buffer.from(cleanBase64, 'base64')
      const sanitizedName = photo.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const fileKey = `reports/${data.reportId}/proof-${Date.now()}-${i}-${sanitizedName}`

      const { error: uploadError } = await supabase.storage
        .from('report-attachments')
        .upload(fileKey, fileBuffer, {
          contentType: photo.type,
          upsert: false,
        })

      if (uploadError) {
        console.error('Upload foto bukti gagal:', uploadError)
        throw new Error(`Gagal mengunggah foto bukti: ${uploadError.message}`)
      }

      await db.insert(reportPhotos).values({
        id: crypto.randomUUID(),
        reportId: data.reportId,
        fileKey,
        photoType: 'proof',
        uploadedBy: techUser.id,
      })
    }

    await db
      .update(reports)
      .set({ status: 'review' })
      .where(eq(reports.id, data.reportId))

    await db.insert(reportTimeline).values({
      id: crypto.randomUUID(),
      reportId: data.reportId,
      actorId: techUser.id,
      action: 'Perbaikan Selesai (Diajukan untuk Review)',
      fromStatus: 'in_progress',
      toStatus: 'review',
      notes: data.notes.trim(),
    })

    return { success: true }
  })
