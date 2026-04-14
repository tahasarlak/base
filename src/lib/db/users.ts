// schema/users.ts
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  pgEnum,
  index,
  uniqueIndex,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { auditLogs } from './audit';

// ==================== ENUMS ====================
export const userRoleEnum = pgEnum('user_role', [
  'super_admin', 'admin', 'instructor', 'seller', 'blogger', 'support', 'student', 'customer', 'user',
]);

// ==================== USERS TABLE ====================
export const users = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').unique().notNull(),
  emailVerified: boolean('email_verified').default(false),
  image: text('image'),
  avatarUrl: text('avatar_url'),
  role: userRoleEnum('role').default('user').notNull(),
  banned: boolean('banned').default(false),
  banReason: text('ban_reason'),
  banExpires: timestamp('ban_expires'),
  bio: text('bio'),
  phone: text('phone'),
  location: text('location'),
  website: text('website'),
  metadata: jsonb('metadata').default({}),
  lastActiveAt: timestamp('last_active_at'),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('user_email_idx').on(table.email),
  index('user_role_idx').on(table.role),
]);

// ==================== ACCOUNTS TABLE - نسخه نهایی و سازگار ====================
export const accounts = pgTable('account', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  // فیلدهای ضروری Better Auth (نام فیلدها دقیقاً باید این باشد)
  providerId: text('provider_id').notNull(),        // ← credential
  accountId: text('account_id').notNull(),          // ← همان userId برای credential
  provider: text('provider').notNull(),             // ← مهم: "credential"
  providerAccountId: text('provider_account_id').notNull(),

  // برای email + password
  password: text('password'),

  refreshToken: text('refresh_token'),
  accessToken: text('access_token'),
  expiresAt: integer('expires_at'),
  tokenType: text('token_type'),
  scope: text('scope'),
  idToken: text('id_token'),
  sessionState: text('session_state'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('account_provider_unique').on(table.providerId, table.providerAccountId),
  index('account_user_idx').on(table.userId),
]);

// ==================== SESSIONS ====================
export const sessions = pgTable('session', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
}, (table) => [
  index('session_user_idx').on(table.userId),
]);

// ==================== VERIFICATION TOKENS ====================
export const verificationTokens = pgTable('verification_token', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('verification_token_idx').on(table.identifier, table.token),
]);

// ==================== ORGANIZATIONS & MEMBERS (بدون تغییر) ====================
export const organizations = pgTable('organization', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  ownerId: text('owner_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  logo: text('logo'),
  plan: text('plan').default('free'),
  maxUsers: integer('max_users').default(10),
  isActive: boolean('is_active').default(true),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('org_slug_idx').on(table.slug),
  index('org_owner_idx').on(table.ownerId),
]);

export const organizationMembers = pgTable('organization_member', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  role: text('role').default('member').notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
}, (table) => [
  index('org_member_org_idx').on(table.organizationId),
  index('org_member_user_idx').on(table.userId),
  uniqueIndex('unique_org_member').on(table.organizationId, table.userId),
]);

// ==================== RELATIONS ====================
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  organizationsOwned: many(organizations),
  organizationMemberships: many(organizationMembers),
  auditLogs: many(auditLogs),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const organizationsRelations = relations(organizations, ({ one, many }) => ({
  owner: one(users, { fields: [organizations.ownerId], references: [users.id] }),
  members: many(organizationMembers),
}));

export const organizationMembersRelations = relations(organizationMembers, ({ one }) => ({
  organization: one(organizations),
  user: one(users),
}));