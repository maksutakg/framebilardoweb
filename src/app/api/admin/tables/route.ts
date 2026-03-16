import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tables, gameSessions } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    // 1. Tüm masaları getir
    const allTables = await db.select().from(tables).orderBy(tables.name);

    if (allTables.length === 0) {
      return NextResponse.json({ tables: [] });
    }

    // 2. Açık olan (active) oturumları getir
    const activeSessions = await db.select()
      .from(gameSessions)
      .where(eq(gameSessions.status, 'active'));

    // Masalar ile aktif oturumları eşleştirip önyüze (hesaplama ve süre için) gönder
    const tablesWithSessions = allTables.map((table) => {
      const activeSession = activeSessions.find(s => s.tableId === table.id);
      return {
        ...table,
        currentSession: activeSession || null
      };
    });

    return NextResponse.json({ tables: tablesWithSessions });
  } catch (err: any) {
    console.error('Tables fetch error:', err);
    return NextResponse.json({ error: 'Masalar yüklenirken hata oluştu' }, { status: 500 });
  }
}
