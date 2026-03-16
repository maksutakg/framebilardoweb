import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/frame_db';

export const queryClient = postgres(connectionString);
export const db = drizzle(queryClient, { schema });
