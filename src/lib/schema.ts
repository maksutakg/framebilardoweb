import { pgTable, text, timestamp, boolean, doublePrecision, uuid, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name'),
  phone: text('phone').unique().notNull(),
  role: text('role').default('customer').notNull(), // 'customer', 'staff', 'admin'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const tables = pgTable('tables', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'snooker', 'pool', '3-cushion'
  status: text('status').default('available').notNull(), // 'available', 'in-use', 'reserved', 'maintenance'
  hourlyRate: doublePrecision('hourly_rate').default(400).notNull(),
  isActive: boolean('is_active').default(true).notNull(), // Soft delete için
});

export const reservations = pgTable('reservations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  tableId: uuid('table_id').references(() => tables.id).notNull(),
  customerName: text('customer_name'), // Anonim müşteri için
  customerPhone: text('customer_phone').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  status: text('status').default('pending').notNull(), // 'pending', 'confirmed', 'cancelled', 'completed'
  notes: text('notes'), // Müşteri notları
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const gameSessions = pgTable('game_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  tableId: uuid('table_id').references(() => tables.id).notNull(),
  staffId: uuid('staff_id').references(() => users.id), // Hangi personel açtı
  startedAt: timestamp('started_at').notNull().defaultNow(),
  endedAt: timestamp('ended_at'),
  hourlyRateAtTime: doublePrecision('hourly_rate_at_time'), // O anki saatlik ücret (fiyat değişse bile doğru hesap)
  totalPrice: doublePrecision('total_price'),
  status: text('status').default('active').notNull(), // 'active', 'finished'
});

export const otpCodes = pgTable('otp_codes', {
  id: uuid('id').defaultRandom().primaryKey(),
  phone: text('phone').notNull(),
  code: text('code').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
