import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tables, gameSessions } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';
import { requireStaffOrAdmin } from '@/lib/auth-guard';

export async function POST(req: Request) {
  try {
    const { error, session } = await requireStaffOrAdmin();
    if (error) return error;

    const { tableId } = await req.json();
    if (!tableId) {
      return NextResponse.json({ error: 'Masa ID gerekli' }, { status: 400 });
    }

    // Masanın mevcut durumunu ve saatlik ücretini al
    const tableRecords = await db.select().from(tables).where(eq(tables.id, tableId));
    const table = tableRecords[0];
    if (!table) {
      return NextResponse.json({ error: 'Masa bulunamadı' }, { status: 404 });
    }

    if (table.status !== 'available') {
      return NextResponse.json({ error: 'Masa şu anda müsait değil' }, { status: 409 });
    }

    // 1. Masanın durumunu in-use yap
    await db.update(tables)
      .set({ status: 'in-use' })
      .where(eq(tables.id, tableId));

    // 2. Yeni oyun oturumu oluştur — masanın o anki hourlyRate'ini snapshot olarak kaydet
    const newSession = await db.insert(gameSessions)
      .values({
        tableId,
        staffId: session!.user.id,
        hourlyRateAtTime: table.hourlyRate,
        status: 'active'
      })
      .returning();

    // 3. PostgreSQL NOTIFY — Güvenli parametrize
    const payload = JSON.stringify({ tableId, status: 'in-use' });
    try {
      await db.execute(sql`NOTIFY table_updates, ${payload}`);
    } catch {}

    return NextResponse.json({ success: true, session: newSession[0] });
  } catch (err: any) {
    console.error('Table start error:', err);
    return NextResponse.json({ error: 'Masa başlatılırken hata oluştu' }, { status: 500 });
  }
}
