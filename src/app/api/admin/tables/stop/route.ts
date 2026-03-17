import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tables, gameSessions } from '@/lib/schema';
import { eq, sql, and } from 'drizzle-orm';
import { requireStaffOrAdmin } from '@/lib/auth-guard';

// Minimum ücret politikası: 1 saatlik minimum
const MINIMUM_HOURS = 1;

export async function POST(req: Request) {
  try {
    const { error } = await requireStaffOrAdmin();
    if (error) return error;

    const { tableId } = await req.json();
    if (!tableId) {
      return NextResponse.json({ error: 'Masa ID gerekli' }, { status: 400 });
    }

    // 1. Aktif oturumu bul
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

    const gameSession = activeSessions[0];
    const endedAt = new Date();
    const startedAt = new Date(gameSession.startedAt);
    
    // Masanın o anki saatlik ücretini kullan (snapshot)
    const hourlyRate = gameSession.hourlyRateAtTime || 400;
    
    // Süre hesapla
    const durationMs = endedAt.getTime() - startedAt.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    const durationMinutes = Math.floor(durationMs / (1000 * 60));
    
    // Minimum ücret politikası: en az 1 saat
    const billableHours = Math.max(durationHours, MINIMUM_HOURS);
    let totalPrice = billableHours * hourlyRate;
    totalPrice = Math.round(totalPrice * 100) / 100;

    // 2. Oturumu güncelle
    await db.update(gameSessions)
      .set({
        endedAt,
        totalPrice,
        status: 'finished'
      })
      .where(eq(gameSessions.id, gameSession.id));

    // 3. Masayı müsait yap
    await db.update(tables)
      .set({ status: 'available' })
      .where(eq(tables.id, tableId));

    // 4. Gerçek zamanlı güncelleme — Güvenli parametrize
    const payload = JSON.stringify({ tableId, status: 'available' });
    try {
      await db.execute(sql`NOTIFY table_updates, ${payload}`);
    } catch {}

    return NextResponse.json({ 
      success: true, 
      receipt: {
        sessionId: gameSession.id,
        startedAt,
        endedAt,
        durationMinutes,
        hourlyRate,
        totalPrice,
        minimumApplied: durationHours < MINIMUM_HOURS,
      }
    });
  } catch (err: any) {
    console.error('Table stop error:', err);
    return NextResponse.json({ error: 'Hesap kesilirken hata oluştu' }, { status: 500 });
  }
}
