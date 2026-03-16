import { pgTable, text, timestamp, boolean, doublePrecision, uuid, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name'),
  phone: text('phone').unique().notNull(), // Asıl giriş bilgimiz SMS için
  role: text('role').default('customer').notNull(), // 'customer', 'staff', 'admin'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const tables = pgTable('tables', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(), // "Snooker 1", "3-Top 1" vb.
  type: text('type').notNull(), // 'snooker', 'pool', '3-cushion' vb.
  status: text('status').default('available').notNull(), // 'available', 'in-use', 'reserved', 'maintenance'
  hourlyRate: doublePrecision('hourly_rate').default(400).notNull(), // Sabit 400 TL ama güncellenebilir
});

export const reservations = pgTable('reservations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  tableId: uuid('table_id').references(() => tables.id).notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  status: text('status').default('pending').notNull(), // 'pending', 'confirmed', 'cancelled', 'completed'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const gameSessions = pgTable('game_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  tableId: uuid('table_id').references(() => tables.id).notNull(),
  startedAt: timestamp('started_at').notNull().defaultNow(),
  endedAt: timestamp('ended_at'),
  totalPrice: doublePrecision('total_price'), // Masa kapatıldığında 400 TL/saat formülüyle hesaplanır
  status: text('status').default('active').notNull(), // 'active', 'finished'
});

export const otpCodes = pgTable('otp_codes', {
  id: uuid('id').defaultRandom().primaryKey(),
  phone: text('phone').notNull(),
  code: text('code').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
