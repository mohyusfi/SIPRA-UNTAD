import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq, desc, and, or, ilike } from 'drizzle-orm'
import { db } from '~/db'
import { reports, reportTimeline, user } from '~/db/schema'
import { getCurrentUserSession } from '~/lib/auth-server'
import { getBatchSignedUrls } from '~/lib/supabase'

async function requireAdminSession() {
  const session = await getCurrentUserSession()
  if (!session?.user) {
    throw new Error('Sesi tidak ditemukan. Silakan login kembali.')
  }
  const role = (session.user as any).role
  if (role !== 'admin') {
    throw new Error('Akses ditolak: Anda tidak memiliki wewenang Admin Sarpras.')
  }
  return session.user
}

const getReportsInputSchema = z.object({
  status: z.string().optional(),
  search: z.string().optional(),
})

export const getAdminReports = createServerFn({ method: 'GET' })
  .validator((data: unknown) => getReportsInputSchema.parse(data))
  .handler(async ({ data }) => {
    await requireAdminSession()

    const conditions = []

    if (data.status && data.status !== 'all') {
      conditions.push(eq(reports.status, data.status))
    }

    if (data.search && data.search.trim()) {
      const q = `%${data.search.trim()}%`
      conditions.push(
        or(
          ilike(reports.title, q),
          ilike(reports.trackingCode, q),
          ilike(reports.locationDetail, q),
        ),
      )
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const reportList = await db.query.reports.findMany({
      where: whereClause,
      with: {
        category: true,
        location: true,
        reporter: true,
        assignedTechnician: true,
        photos: true,
      },
      orderBy: [desc(reports.createdAt)],
    })

    const allReportsForStats = await db
      .select({
        status: reports.status,
      })
      .from(reports)

    const stats = {
      total: allReportsForStats.length,
      submitted: allReportsForStats.filter((r) => r.status === 'submitted').length,
      verified: allReportsForStats.filter((r) => r.status === 'verified').length,
      assigned: allReportsForStats.filter((r) => r.status === 'assigned').length,
      inProgress: allReportsForStats.filter((r) => r.status === 'in_progress').length,
      review: allReportsForStats.filter((r) => r.status === 'review').length,
      completed: allReportsForStats.filter((r) => r.status === 'completed').length,
      rejected: allReportsForStats.filter((r) => r.status === 'rejected').length,
      duplicate: allReportsForStats.filter((r) => r.status === 'duplicate').length,
    }

    return {
      reports: reportList.map((r) => ({
        id: r.id,
        trackingCode: r.trackingCode,
        title: r.title,
        descriptionText: r.descriptionText,
        urgency: r.urgency,
        status: r.status,
        isAnonymous: r.isAnonymous,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        locationDetail: r.locationDetail,
        categoryName: r.category?.name || 'Tanpa Kategori',
        building: r.location?.building || 'Area Kampus',
        floor: r.location?.floor || '',
        roomOrArea: r.location?.roomOrArea || '',
        reporterName: r.isAnonymous
          ? 'Anonim'
          : r.reporter?.name || r.reporterName || 'Sivitas',
        reporterEmail: r.isAnonymous ? null : r.reporter?.email || r.reporterEmail,
        assignedTechnicianName: r.assignedTechnician?.name || null,
        photoCount: r.photos.length,
      })),
      stats,
    }
  })

const reportIdSchema = z.object({
  id: z.string().min(1),
})

export const getAdminReportDetail = createServerFn({ method: 'GET' })
  .validator((data: unknown) => reportIdSchema.parse(data))
  .handler(async ({ data }) => {
    await requireAdminSession()

    const report = await db.query.reports.findFirst({
      where: eq(reports.id, data.id),
      with: {
        category: true,
        location: true,
        reporter: true,
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

    if (!report) {
      throw new Error('Laporan tidak ditemukan.')
    }

    const signedUrlsMap = await getBatchSignedUrls(
      report.photos.map((p) => p.fileKey),
    )

    const photosWithSignedUrls = report.photos.map((p) => ({
      id: p.id,
      fileKey: p.fileKey,
      photoType: p.photoType,
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
      duplicateOfId: report.duplicateOfId,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      locationDetail: report.locationDetail,
      category: report.category,
      location: report.location,
      reporterName: report.isAnonymous
        ? 'Anonim'
        : report.reporter?.name || report.reporterName || 'Sivitas',
      reporterEmail: report.isAnonymous ? null : report.reporter?.email || report.reporterEmail,
      assignedTechnician: report.assignedTechnician
        ? {
            id: report.assignedTechnician.id,
            name: report.assignedTechnician.name,
            email: report.assignedTechnician.email,
          }
        : null,
      photos: photosWithSignedUrls,
      timeline: report.timeline.map((t) => ({
        id: t.id,
        action: t.action,
        fromStatus: t.fromStatus,
        toStatus: t.toStatus,
        notes: t.notes,
        actorName: t.actor?.name || 'Sistem SIPRA',
        createdAt: t.createdAt,
      })),
    }
  })

export const getAvailableTechnicians = createServerFn({ method: 'GET' }).handler(
  async () => {
    await requireAdminSession()

    const techs = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
      })
      .from(user)
      .where(eq(user.role, 'technician'))

    return techs
  },
)

const verifyReportSchema = z.object({
  reportId: z.string().min(1),
  urgency: z.enum(['normal', 'high', 'emergency']).optional(),
})

export const verifyReportAction = createServerFn({ method: 'POST' })
  .validator((data: unknown) => verifyReportSchema.parse(data))
  .handler(async ({ data }) => {
    const adminUser = await requireAdminSession()

    const [target] = await db
      .select({ id: reports.id, status: reports.status })
      .from(reports)
      .where(eq(reports.id, data.reportId))

    if (!target) {
      throw new Error('Laporan tidak ditemukan.')
    }

    if (target.status !== 'submitted') {
      throw new Error('Hanya laporan berstatus "Diajukan" yang dapat diverifikasi.')
    }

    const updatePayload: Record<string, any> = {
      status: 'verified',
    }
    if (data.urgency) {
      updatePayload.urgency = data.urgency
    }

    await db.update(reports).set(updatePayload).where(eq(reports.id, data.reportId))

    await db.insert(reportTimeline).values({
      id: crypto.randomUUID(),
      reportId: data.reportId,
      actorId: adminUser.id,
      action: 'Laporan Diverifikasi',
      fromStatus: 'submitted',
      toStatus: 'verified',
      notes: 'Laporan telah diverifikasi kelayakannya oleh Admin Sarpras dan siap ditugaskan.',
    })

    return { success: true }
  })

const rejectReportSchema = z.object({
  reportId: z.string().min(1),
  reason: z.string().min(5, 'Alasan penolakan minimal 5 karakter'),
})

export const rejectReportAction = createServerFn({ method: 'POST' })
  .validator((data: unknown) => rejectReportSchema.parse(data))
  .handler(async ({ data }) => {
    const adminUser = await requireAdminSession()

    const [target] = await db
      .select({ id: reports.id, status: reports.status })
      .from(reports)
      .where(eq(reports.id, data.reportId))

    if (!target) {
      throw new Error('Laporan tidak ditemukan.')
    }

    if (['completed', 'rejected', 'duplicate'].includes(target.status)) {
      throw new Error('Laporan ini sudah ditutup dan tidak dapat diubah statusnya.')
    }

    await db
      .update(reports)
      .set({ status: 'rejected' })
      .where(eq(reports.id, data.reportId))

    await db.insert(reportTimeline).values({
      id: crypto.randomUUID(),
      reportId: data.reportId,
      actorId: adminUser.id,
      action: 'Laporan Ditolak',
      fromStatus: target.status,
      toStatus: 'rejected',
      notes: data.reason.trim(),
    })

    return { success: true }
  })

const markDuplicateSchema = z.object({
  reportId: z.string().min(1),
  duplicateOfId: z.string().min(1, 'Laporan rujukan wajib dipilih'),
  reason: z.string().min(5, 'Catatan duplikat minimal 5 karakter'),
})

export const markDuplicateReportAction = createServerFn({ method: 'POST' })
  .validator((data: unknown) => markDuplicateSchema.parse(data))
  .handler(async ({ data }) => {
    const adminUser = await requireAdminSession()

    const [target] = await db
      .select({ id: reports.id, status: reports.status })
      .from(reports)
      .where(eq(reports.id, data.reportId))

    if (!target) {
      throw new Error('Laporan tidak ditemukan.')
    }

    if (['completed', 'rejected', 'duplicate'].includes(target.status)) {
      throw new Error('Laporan ini sudah ditutup dan tidak dapat diubah statusnya.')
    }

    await db
      .update(reports)
      .set({
        status: 'duplicate',
        duplicateOfId: data.duplicateOfId,
      })
      .where(eq(reports.id, data.reportId))

    await db.insert(reportTimeline).values({
      id: crypto.randomUUID(),
      reportId: data.reportId,
      actorId: adminUser.id,
      action: 'Ditandai Sebagai Duplikat',
      fromStatus: target.status,
      toStatus: 'duplicate',
      notes: data.reason.trim(),
    })

    return { success: true }
  })

const assignTechnicianSchema = z.object({
  reportId: z.string().min(1),
  technicianId: z.string().min(1, 'Teknisi penanggung jawab wajib dipilih'),
  notes: z.string().optional(),
})

export const assignTechnicianAction = createServerFn({ method: 'POST' })
  .validator((data: unknown) => assignTechnicianSchema.parse(data))
  .handler(async ({ data }) => {
    const adminUser = await requireAdminSession()

    const [target] = await db
      .select({ id: reports.id, status: reports.status })
      .from(reports)
      .where(eq(reports.id, data.reportId))

    if (!target) {
      throw new Error('Laporan tidak ditemukan.')
    }

    const [tech] = await db
      .select({ id: user.id, name: user.name })
      .from(user)
      .where(and(eq(user.id, data.technicianId), eq(user.role, 'technician')))

    if (!tech) {
      throw new Error('Teknisi terpilih tidak valid atau bukan staf teknisi.')
    }

    await db
      .update(reports)
      .set({
        status: 'assigned',
        assignedTechnicianId: tech.id,
      })
      .where(eq(reports.id, data.reportId))

    await db.insert(reportTimeline).values({
      id: crypto.randomUUID(),
      reportId: data.reportId,
      actorId: adminUser.id,
      action: 'Teknisi Ditugaskan',
      fromStatus: target.status,
      toStatus: 'assigned',
      notes: data.notes?.trim() || `Ditugaskan kepada teknisi: ${tech.name}`,
    })

    return { success: true }
  })

const reviewCompletionSchema = z.object({
  reportId: z.string().min(1),
  decision: z.enum(['approve', 'return']),
  feedback: z.string().optional(),
})

export const reviewCompletionAction = createServerFn({ method: 'POST' })
  .validator((data: unknown) => reviewCompletionSchema.parse(data))
  .handler(async ({ data }) => {
    const adminUser = await requireAdminSession()

    const [target] = await db
      .select({ id: reports.id, status: reports.status })
      .from(reports)
      .where(eq(reports.id, data.reportId))

    if (!target) {
      throw new Error('Laporan tidak ditemukan.')
    }

    if (target.status !== 'review') {
      throw new Error('Hanya laporan berstatus "Menunggu Konfirmasi Admin" yang dapat ditinjau.')
    }

    if (data.decision === 'approve') {
      await db
        .update(reports)
        .set({ status: 'completed' })
        .where(eq(reports.id, data.reportId))

      await db.insert(reportTimeline).values({
        id: crypto.randomUUID(),
        reportId: data.reportId,
        actorId: adminUser.id,
        action: 'Perbaikan Disetujui (Selesai)',
        fromStatus: 'review',
        toStatus: 'completed',
        notes: data.feedback?.trim() || 'Hasil bukti perbaikan telah diperiksa dan disetujui tuntas oleh Admin Sarpras.',
      })
    } else {
      if (!data.feedback || data.feedback.trim().length < 5) {
        throw new Error('Alasan pengembalian wajib diisi minimal 5 karakter.')
      }

      await db
        .update(reports)
        .set({ status: 'in_progress' })
        .where(eq(reports.id, data.reportId))

      await db.insert(reportTimeline).values({
        id: crypto.randomUUID(),
        reportId: data.reportId,
        actorId: adminUser.id,
        action: 'Perbaikan Dikembalikan ke Teknisi',
        fromStatus: 'review',
        toStatus: 'in_progress',
        notes: data.feedback.trim(),
      })
    }

    return { success: true }
  })
