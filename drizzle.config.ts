import type { Config } from 'drizzle-kit';

export default {
  dialect: 'postgresql',
  schema: './src/lib/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/frame_db',
  },
} satisfies Config;
