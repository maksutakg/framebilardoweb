import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tables, gameSessions } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { tableId } = await req.json();
    if (!tableId) {
      return NextResponse.json({ error: 'Masa ID gerekli' }, { status: 400 });
    }

    // 1. Masanın durumunu in-use yap
    await db.update(tables)
      .set({ status: 'in-use' })
      .where(eq(tables.id, tableId));

    // 2. Yeni oyun oturumu (kronometre başlangıcı) oluştur
    const newSession = await db.insert(gameSessions)
      .values({
        tableId,
        status: 'active'
      })
      .returning();

    // 3. PostgreSQL LISTEN/NOTIFY için kanala anında yayın yap (Gerçek Zamanlı Grid)
    await db.execute(sql`NOTIFY table_updates, ${sql.raw(`'{"tableId":"${tableId}","status":"in-use"}'`)}`);

    return NextResponse.json({ success: true, session: newSession[0] });
  } catch (err: any) {
    console.error('Table start error:', err);
    return NextResponse.json({ error: 'Masa başlatılırken hata oluştu' }, { status: 500 });
  }
}
