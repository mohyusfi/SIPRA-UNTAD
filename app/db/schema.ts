import { relations } from 'drizzle-orm'
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  jsonb,
} from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  role: text('role').default('reporter').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [index('session_userId_idx').on(table.userId)],
)

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', {
      withTimezone: true,
    }),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('account_userId_idx').on(table.userId)],
)

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)],
)

export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  isArchived: boolean('is_archived').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export const locations = pgTable('locations', {
  id: text('id').primaryKey(),
  campus: text('campus').default('Bumi Tadulako Tondo').notNull(),
  building: text('building').notNull(),
  floor: text('floor'),
  roomOrArea: text('room_or_area'),
  isArchived: boolean('is_archived').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export const reports = pgTable(
  'reports',
  {
    id: text('id').primaryKey(),
    trackingCode: text('tracking_code').notNull().unique(),
    title: text('title').notNull(),
    descriptionJson: jsonb('description_json').notNull(),
    descriptionText: text('description_text').notNull(),
    categoryId: text('category_id')
      .notNull()
      .references(() => categories.id),
    locationId: text('location_id')
      .notNull()
      .references(() => locations.id),
    locationDetail: text('location_detail'),
    urgency: text('urgency').default('normal').notNull(),
    status: text('status').default('submitted').notNull(),
    isAnonymous: boolean('is_anonymous').default(false).notNull(),
    reporterId: text('reporter_id').references(() => user.id, {
      onDelete: 'set null',
    }),
    reporterName: text('reporter_name'),
    reporterEmail: text('reporter_email'),
    assignedTechnicianId: text('assigned_technician_id').references(
      () => user.id,
      { onDelete: 'set null' },
    ),
    duplicateOfId: text('duplicate_of_id'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('reports_status_idx').on(table.status),
    index('reports_trackingCode_idx').on(table.trackingCode),
  ],
)

export const reportPhotos = pgTable('report_photos', {
  id: text('id').primaryKey(),
  reportId: text('report_id')
    .notNull()
    .references(() => reports.id, { onDelete: 'cascade' }),
  fileKey: text('file_key').notNull(),
  photoType: text('photo_type').notNull(),
  uploadedBy: text('uploaded_by').references(() => user.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export const reportTimeline = pgTable('report_timeline', {
  id: text('id').primaryKey(),
  reportId: text('report_id')
    .notNull()
    .references(() => reports.id, { onDelete: 'cascade' }),
  actorId: text('actor_id').references(() => user.id, {
    onDelete: 'set null',
  }),
  action: text('action').notNull(),
  fromStatus: text('from_status'),
  toStatus: text('to_status').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  reports: many(reports, { relationName: 'userReports' }),
  assignedReports: many(reports, { relationName: 'technicianReports' }),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const categoriesRelations = relations(categories, ({ many }) => ({
  reports: many(reports),
}))

export const locationsRelations = relations(locations, ({ many }) => ({
  reports: many(reports),
}))

export const reportsRelations = relations(reports, ({ one, many }) => ({
  category: one(categories, {
    fields: [reports.categoryId],
    references: [categories.id],
  }),
  location: one(locations, {
    fields: [reports.locationId],
    references: [locations.id],
  }),
  reporter: one(user, {
    fields: [reports.reporterId],
    references: [user.id],
    relationName: 'userReports',
  }),
  assignedTechnician: one(user, {
    fields: [reports.assignedTechnicianId],
    references: [user.id],
    relationName: 'technicianReports',
  }),
  photos: many(reportPhotos),
  timeline: many(reportTimeline),
}))

export const reportPhotosRelations = relations(reportPhotos, ({ one }) => ({
  report: one(reports, {
    fields: [reportPhotos.reportId],
    references: [reports.id],
  }),
}))

export const reportTimelineRelations = relations(reportTimeline, ({ one }) => ({
  report: one(reports, {
    fields: [reportTimeline.reportId],
    references: [reports.id],
  }),
}))
