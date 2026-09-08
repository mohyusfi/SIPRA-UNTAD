import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq, ne, desc, and, or, ilike, count } from 'drizzle-orm'
import { db } from '~/db'
import { reports, reportTimeline, user, categories, locations, account } from '~/db/schema'
import { getCurrentUserSession } from '~/lib/auth-server'
import { getBatchSignedUrls } from '~/lib/supabase'
import { auth } from '~/lib/auth'
import { hashPassword } from 'better-auth/crypto'

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
  page: z.number().default(1).optional(),
  limit: z.number().default(10).optional(),
})

export const getAdminReports = createServerFn({ method: 'GET' })
  .validator((data: unknown) => getReportsInputSchema.parse(data || {}))
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

    const [{ totalCount: totalMatchingCount }] = await db
      .select({ totalCount: count() })
      .from(reports)
      .where(whereClause)

    const totalMatching = Number(totalMatchingCount)
    const page = Math.max(1, data.page || 1)
    const limit = Math.max(1, data.limit || 10)
    const totalPages = Math.max(1, Math.ceil(totalMatching / limit))
    const offset = (page - 1) * limit

    const reportList = await db.query.reports.findMany({
      where: whereClause,
      limit,
      offset,
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
      pagination: {
        page,
        limit,
        totalCount: totalMatching,
        totalPages,
      },
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

// ==========================================
// 1. MASTER DATA: KATEGORI SARANA
// ==========================================

export const getAdminCategories = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireAdminSession()
    return db.query.categories.findMany({
      orderBy: [desc(categories.createdAt)],
    })
  })

const createCategorySchema = z.object({
  name: z.string().min(2, 'Nama kategori minimal 2 karakter').max(100),
})

export const createCategoryAction = createServerFn({ method: 'POST' })
  .validator((data: unknown) => createCategorySchema.parse(data))
  .handler(async ({ data }) => {
    await requireAdminSession()
    const trimmedName = data.name.trim()

    // 1. Pengecekan duplikasi case-insensitive
    const [existing] = await db
      .select({
        id: categories.id,
        name: categories.name,
        isArchived: categories.isArchived,
      })
      .from(categories)
      .where(ilike(categories.name, trimmedName))

    if (existing) {
      if (existing.isArchived) {
        throw new Error(
          `Kategori "${existing.name}" sudah terdaftar dalam status Diarsipkan. Silakan aktifkan kembali dari daftar kategori.`,
        )
      }
      throw new Error(
        `Kategori dengan nama "${existing.name}" sudah ada dan sedang aktif.`,
      )
    }

    const cleanSlug = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    const id = `cat-${cleanSlug || 'item'}-${Math.random().toString(36).substring(2, 7)}`

    try {
      const [newCat] = await db
        .insert(categories)
        .values({
          id,
          name: trimmedName,
          isArchived: false,
        })
        .returning()

      return newCat
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('unique') || (err as any)?.code === '23505') {
        throw new Error(
          `Kategori dengan nama "${trimmedName}" sudah terdaftar dalam sistem.`,
        )
      }
      throw err
    }
  })

const updateCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Nama kategori minimal 2 karakter').max(100),
})

export const updateCategoryAction = createServerFn({ method: 'POST' })
  .validator((data: unknown) => updateCategorySchema.parse(data))
  .handler(async ({ data }) => {
    await requireAdminSession()
    const trimmedName = data.name.trim()

    // Pengecekan duplikasi nama pada kategori lain
    const [existing] = await db
      .select({
        id: categories.id,
        name: categories.name,
      })
      .from(categories)
      .where(
        and(ilike(categories.name, trimmedName), ne(categories.id, data.id)),
      )

    if (existing) {
      throw new Error(
        `Nama kategori "${existing.name}" sudah digunakan oleh kategori lain.`,
      )
    }

    try {
      const [updated] = await db
        .update(categories)
        .set({ name: trimmedName })
        .where(eq(categories.id, data.id))
        .returning()

      if (!updated) {
        throw new Error('Kategori tidak ditemukan.')
      }
      return updated
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('unique') || (err as any)?.code === '23505') {
        throw new Error(
          `Nama kategori "${trimmedName}" sudah digunakan oleh kategori lain.`,
        )
      }
      throw err
    }
  })

const toggleArchiveCategorySchema = z.object({
  id: z.string(),
  isArchived: z.boolean(),
})

export const toggleArchiveCategoryAction = createServerFn({ method: 'POST' })
  .validator((data: unknown) => toggleArchiveCategorySchema.parse(data))
  .handler(async ({ data }) => {
    await requireAdminSession()
    const [updated] = await db
      .update(categories)
      .set({ isArchived: data.isArchived })
      .where(eq(categories.id, data.id))
      .returning()

    if (!updated) {
      throw new Error('Kategori tidak ditemukan.')
    }
    return updated
  })

// ==========================================
// 2. MASTER DATA: LOKASI & GEDUNG KAMPUS
// ==========================================

export const getAdminLocations = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireAdminSession()
    return db.query.locations.findMany({
      orderBy: [desc(locations.createdAt)],
    })
  })

const createLocationSchema = z.object({
  campus: z.string().default('Bumi Tadulako Tondo'),
  building: z.string().min(2, 'Nama gedung minimal 2 karakter').max(100),
  floor: z.string().optional().nullable(),
  roomOrArea: z.string().optional().nullable(),
})

export const createLocationAction = createServerFn({ method: 'POST' })
  .validator((data: unknown) => createLocationSchema.parse(data))
  .handler(async ({ data }) => {
    await requireAdminSession()
    const buildingTrimmed = data.building.trim()
    const floorTrimmed = data.floor?.trim() || null
    const roomTrimmed = data.roomOrArea?.trim() || null
    const campusTrimmed = data.campus?.trim() || 'Bumi Tadulako Tondo'

    // Pengecekan duplikasi lokasi
    const existingLocations = await db
      .select({
        id: locations.id,
        building: locations.building,
        floor: locations.floor,
        roomOrArea: locations.roomOrArea,
        isArchived: locations.isArchived,
      })
      .from(locations)
      .where(ilike(locations.building, buildingTrimmed))

    const exactMatch = existingLocations.find(
      (l) =>
        (l.floor || '').toLowerCase() === (floorTrimmed || '').toLowerCase() &&
        (l.roomOrArea || '').toLowerCase() === (roomTrimmed || '').toLowerCase(),
    )

    if (exactMatch) {
      if (exactMatch.isArchived) {
        throw new Error(
          `Lokasi "${buildingTrimmed}" sudah terdaftar namun berstatus Diarsipkan. Silakan aktifkan kembali dari daftar lokasi.`,
        )
      }
      throw new Error(
        `Lokasi "${buildingTrimmed}" dengan lantai/ruangan tersebut sudah terdaftar dan sedang aktif.`,
      )
    }

    const cleanSlug = buildingTrimmed
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    const id = `loc-${cleanSlug || 'area'}-${Math.random().toString(36).substring(2, 7)}`

    const [newLoc] = await db
      .insert(locations)
      .values({
        id,
        campus: campusTrimmed,
        building: buildingTrimmed,
        floor: floorTrimmed,
        roomOrArea: roomTrimmed,
        isArchived: false,
      })
      .returning()

    return newLoc
  })

const updateLocationSchema = z.object({
  id: z.string(),
  campus: z.string().default('Bumi Tadulako Tondo'),
  building: z.string().min(2, 'Nama gedung minimal 2 karakter').max(100),
  floor: z.string().optional().nullable(),
  roomOrArea: z.string().optional().nullable(),
})

export const updateLocationAction = createServerFn({ method: 'POST' })
  .validator((data: unknown) => updateLocationSchema.parse(data))
  .handler(async ({ data }) => {
    await requireAdminSession()
    const [updated] = await db
      .update(locations)
      .set({
        campus: data.campus?.trim() || 'Bumi Tadulako Tondo',
        building: data.building.trim(),
        floor: data.floor?.trim() || null,
        roomOrArea: data.roomOrArea?.trim() || null,
      })
      .where(eq(locations.id, data.id))
      .returning()

    if (!updated) {
      throw new Error('Lokasi tidak ditemukan.')
    }
    return updated
  })

const toggleArchiveLocationSchema = z.object({
  id: z.string(),
  isArchived: z.boolean(),
})

export const toggleArchiveLocationAction = createServerFn({ method: 'POST' })
  .validator((data: unknown) => toggleArchiveLocationSchema.parse(data))
  .handler(async ({ data }) => {
    await requireAdminSession()
    const [updated] = await db
      .update(locations)
      .set({ isArchived: data.isArchived })
      .where(eq(locations.id, data.id))
      .returning()

    if (!updated) {
      throw new Error('Lokasi tidak ditemukan.')
    }
    return updated
  })

// ==========================================
// 3. MANAJEMEN AKUN STAF
// ==========================================

export const getAdminStaffUsers = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireAdminSession()
    const staffList = await db.query.user.findMany({
      where: or(
        eq(user.role, 'admin'),
        eq(user.role, 'technician'),
        eq(user.role, 'monitor'),
      ),
      orderBy: [desc(user.createdAt)],
    })

    return staffList.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      image: u.image,
    }))
  })

const createStaffUserSchema = z.object({
  name: z.string().min(2, 'Nama staf minimal 2 karakter').max(100),
  email: z.string().email('Format email tidak valid'),
  role: z.enum(['technician', 'monitor', 'admin']),
  password: z.string().min(8, 'Password minimal 8 karakter'),
})

export const createStaffUserAction = createServerFn({ method: 'POST' })
  .validator((data: unknown) => createStaffUserSchema.parse(data))
  .handler(async ({ data }) => {
    await requireAdminSession()

    const normalizedEmail = data.email.toLowerCase().trim()
    const [existing] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, normalizedEmail))

    if (existing) {
      throw new Error(`Email ${normalizedEmail} sudah terdaftar di sistem.`)
    }

    const authRes = await auth.api.signUpEmail({
      body: {
        name: data.name.trim(),
        email: normalizedEmail,
        password: data.password,
      },
    })

    if (!authRes?.user) {
      throw new Error('Gagal mendaftarkan akun di auth service.')
    }

    await db
      .update(user)
      .set({ role: data.role })
      .where(eq(user.id, authRes.user.id))

    return {
      id: authRes.user.id,
      name: data.name.trim(),
      email: normalizedEmail,
      role: data.role,
    }
  })

const updateStaffRoleSchema = z.object({
  userId: z.string(),
  newRole: z.enum(['technician', 'monitor', 'admin', 'reporter']),
})

export const updateStaffRoleAction = createServerFn({ method: 'POST' })
  .validator((data: unknown) => updateStaffRoleSchema.parse(data))
  .handler(async ({ data }) => {
    const adminUser = await requireAdminSession()
    if (data.userId === adminUser.id && data.newRole !== 'admin') {
      throw new Error('Anda tidak dapat mencabut wewenang Admin dari akun Anda sendiri.')
    }

    const [updated] = await db
      .update(user)
      .set({ role: data.newRole })
      .where(eq(user.id, data.userId))
      .returning()

    if (!updated) {
      throw new Error('Pengguna tidak ditemukan.')
    }

    return {
      id: updated.id,
      name: updated.name,
      role: updated.role,
    }
  })

const resetStaffPasswordSchema = z.object({
  userId: z.string(),
  newPassword: z.string().min(8, 'Password baru minimal 8 karakter'),
})

export const resetStaffPasswordAction = createServerFn({ method: 'POST' })
  .validator((data: unknown) => resetStaffPasswordSchema.parse(data))
  .handler(async ({ data }) => {
    await requireAdminSession()

    const hashedPassword = await hashPassword(data.newPassword)
    const updated = await db
      .update(account)
      .set({ password: hashedPassword })
      .where(
        and(
          eq(account.userId, data.userId),
          eq(account.providerId, 'credential'),
        ),
      )
      .returning()

    if (!updated.length) {
      throw new Error('Akun kredensial (email & password) tidak ditemukan untuk staf ini.')
    }

    return { success: true }
  })

