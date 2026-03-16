import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tables, gameSessions } from '@/lib/schema';
import { eq, sql, and } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { tableId } = await req.json();
    if (!tableId) {
      return NextResponse.json({ error: 'Masa ID gerekli' }, { status: 400 });
    }

    // 1. Masanın o anki Session'ını (başlangıç zamanını) bul ve bitir
    const activeSessions = await db.select()
      .from(gameSessions)
      .where(
        and(
          eq(gameSessions.tableId, tableId),
          eq(gameSessions.status, 'active')
        )
      );

    if (activeSessions.length === 0) {
      return NextResponse.json({ error: 'Açık oturum bulunamadı' }, { status: 404 });
    }

    const session = activeSessions[0];
    const endedAt = new Date();
    
    // Dakika ve Saat hesabıyla Toplam Tutarı Çıkarma
    // 400 TL Sabit Ücret, Formül: (Geçen Saat) * 400 TL
    const startedAt = new Date(session.startedAt);
    const durationMs = endedAt.getTime() - startedAt.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    const hourlyRate = 400; // TL

    // Fiyat tabanı 0 olmak üzere virgülden sonra 2 basamak formatlı.
    // Eğer 15dk'dan az oynadıysa genelde min. ücret konur ama biz şimdilik net hesap verelim (veyahut minimum 100tl diyelim)
    let totalPrice = durationHours * hourlyRate;
    // Küçük bir yuvarlama hatası olmasın
    totalPrice = Math.round(totalPrice * 100) / 100;

    // 2. Tabloyu Güncelle (Bitiş ve Tutarla)
    await db.update(gameSessions)
      .set({
        endedAt,
        totalPrice,
        status: 'finished'
      })
      .where(eq(gameSessions.id, session.id));

    // 3. Masanın kendi Durumunu ("Müsait") olarak değiştir
    await db.update(tables)
      .set({ status: 'available' })
      .where(eq(tables.id, tableId));

    // 4. PostgreSQL LISTEN/NOTIFY için kanala anında yayın yap (İkinci Admin varsa ekranı yeşile dønsün)
    await db.execute(sql`NOTIFY table_updates, ${sql.raw(`'{"tableId":"${tableId}","status":"available"}'`)}`);

    return NextResponse.json({ 
      success: true, 
      receipt: {
        startedAt,
        endedAt,
        durationMinutes: Math.floor(durationMs / (1000 * 60)),
        totalPrice
      }
    });
  } catch (err: any) {
    console.error('Table stop error:', err);
    return NextResponse.json({ error: 'Hesap kesilirken hata oluştu' }, { status: 500 });
  }
}
