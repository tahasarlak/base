// schema/file_uploads.ts
import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
  index,
  jsonb
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

// ==================== ENUMS ====================
export const fileTypeEnum = pgEnum('file_type', [
  'image',
  'video',
  'document',
  'audio',
  'archive',
  'pdf',
  'other',
]);

export const fileAccessEnum = pgEnum('file_access', [
  'public',
  'private',
  'authenticated',
  'enrolled',
  'instructor_only',
]);

// ==================== FILE UPLOADS ====================
export const fileUploads = pgTable('file_upload', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),

  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),

  fileName: text('file_name').notNull(),
  originalName: text('original_name').notNull(),        // ← اضافه شد
  fileUrl: text('file_url').notNull(),
  fileKey: text('file_key').notNull(),
  mimeType: text('mime_type').notNull(),
  fileSize: integer('file_size').notNull(),

  fileType: fileTypeEnum('file_type').notNull(),
  access: fileAccessEnum('access').default('private').notNull(),

  entityType: text('entity_type'),
  entityId: text('entity_id'),

  metadata: jsonb('metadata').default({}),

  isDeleted: boolean('is_deleted').default(false),     // Soft Delete

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('file_user_idx').on(table.userId),
  index('file_entity_idx').on(table.entityType, table.entityId),
  index('file_type_idx').on(table.fileType),
  index('file_access_idx').on(table.access),
  index('file_created_idx').on(table.createdAt.desc()),
]);

// ==================== RELATIONS ====================
export const fileUploadsRelations = relations(fileUploads, ({ one }) => ({
  uploadedBy: one(users),
}));