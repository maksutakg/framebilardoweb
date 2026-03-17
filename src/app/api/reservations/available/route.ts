import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tables, reservations } from '@/lib/schema';
import { eq, and, or, gte, lte, lt, gt, not } from 'drizzle-orm';

/**
 * Müşteri tarafından kullanılan API — auth gerekmez
 * Belirli bir zaman aralığı ve masa tipi için müsait masaları döner
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'snooker', 'pool', '3-cushion'
    const date = searchParams.get('date'); // '2026-03-17'
    const time = searchParams.get('time'); // '19:00'

    // Tüm aktif masaları getir
    let allTables = await db.select().from(tables)
      .where(eq(tables.isActive, true));

    // Tip filtresi
    if (type) {
      allTables = allTables.filter(t => t.type.toLowerCase() === type.toLowerCase());
    }

    // Eğer tarih ve saat belirtilmişse çakışma kontrolü yap
    if (date && time) {
      const [hours, minutes] = time.split(':').map(Number);
      const startTime = new Date(date);
      startTime.setHours(hours, minutes || 0, 0, 0);
      
      // 1 saat varsayılan süre
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1);

      // Bu zaman aralığında onaylanmış veya bekleyen rezervasyonları bul
      const conflicting = await db.select()
        .from(reservations)
        .where(
          and(
            or(
              eq(reservations.status, 'confirmed'),
              eq(reservations.status, 'pending')
            ),
            // Çakışma: mevcut rezervasyonun başlangıcı < istenen bitiş VE mevcut rezervasyonun bitişi > istenen başlangıç
            lt(reservations.startTime, endTime),
            gt(reservations.endTime, startTime)
          )
        );

      const conflictingTableIds = new Set(conflicting.map(r => r.tableId));

      // Çakışan masaları filtrele ve durumu ekle
      const tablesWithAvailability = allTables.map(t => ({
        ...t,
        isAvailable: !conflictingTableIds.has(t.id) && t.status !== 'maintenance',
      }));

      return NextResponse.json({ tables: tablesWithAvailability });
    }

    // Tarih/saat belirtilmemişse mevcut duruma göre göster
    const tablesWithAvailability = allTables.map(t => ({
      ...t,
      isAvailable: t.status === 'available',
    }));

    return NextResponse.json({ tables: tablesWithAvailability });
  } catch (err: any) {
    console.error('Available tables error:', err);
    return NextResponse.json({ error: 'Masalar yüklenirken hata oluştu' }, { status: 500 });
  }
}
