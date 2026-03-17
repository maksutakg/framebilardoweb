import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reservations, tables } from '@/lib/schema';
import { eq, and, or, lt, gt, sql } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }

    const body = await req.json();
    const { tableId, startTime, endTime, customerName, notes } = body;

    if (!tableId || !startTime || !endTime) {
      return NextResponse.json({ error: 'Masa, başlangıç ve bitiş zamanları gerekli' }, { status: 400 });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    // Geçmiş kontrolü
    if (start < new Date()) {
      return NextResponse.json({ error: 'Geçmiş bir zamana rezervasyon yapılamaz' }, { status: 400 });
    }

    // Süre kontrolü (en az 1 saat)
    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (diffHours < 1) {
      return NextResponse.json({ error: 'Minimum 1 saat rezervasyon yapılabilir' }, { status: 400 });
    }

    // Masanın varlığını kontrol et
    const tableRecords = await db.select().from(tables).where(eq(tables.id, tableId));
    if (tableRecords.length === 0) {
      return NextResponse.json({ error: 'Masa bulunamadı' }, { status: 404 });
    }

    // *** ÇAKIŞMA KONTROLÜ ***
    // Aynı masada aynı zaman diliminde onaylanmış/bekleyen rezervasyon var mı?
    const conflicting = await db.select()
      .from(reservations)
      .where(
        and(
          eq(reservations.tableId, tableId),
          or(
            eq(reservations.status, 'confirmed'),
            eq(reservations.status, 'pending')
          ),
          // Çakışma: mevcut.başlangıç < yeni.bitiş VE mevcut.bitiş > yeni.başlangıç
          lt(reservations.startTime, end),
          gt(reservations.endTime, start)
        )
      );

    if (conflicting.length > 0) {
      return NextResponse.json({ 
        error: 'Bu masa seçilen zaman diliminde zaten rezerve edilmiş. Lütfen farklı bir saat veya masa seçin.' 
      }, { status: 409 });
    }

    // Gerçek DB insert
    const newReservation = await db.insert(reservations).values({
      userId: session.user.id,
      tableId: tableId,
      customerName: customerName || session.user.name || null,
      customerPhone: session.user.phone,
      startTime: start,
      endTime: end,
      status: 'confirmed', // OTP onayından sonra geldiği için direkt confirmed
      notes: notes || null,
    }).returning();

    // SSE ile bildirim
    const payload = JSON.stringify({ tableId, status: 'reserved' });
    try {
      await db.execute(sql`NOTIFY table_updates, ${payload}`);
    } catch {}

    return NextResponse.json({ 
      success: true, 
      reservation: newReservation[0] 
    });
  } catch (error: any) {
    console.error('Reservation Error:', error);
    return NextResponse.json({ error: 'Rezervasyon oluşturulurken hata oluştu' }, { status: 500 });
  }
}

// Rezervasyonları listele (admin için)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // 'pending', 'confirmed', 'cancelled'
    const date = searchParams.get('date'); // '2026-03-17'

    let query = db.select({
      id: reservations.id,
      tableId: reservations.tableId,
      tableName: tables.name,
      tableType: tables.type,
      customerName: reservations.customerName,
      customerPhone: reservations.customerPhone,
      startTime: reservations.startTime,
      endTime: reservations.endTime,
      status: reservations.status,
      notes: reservations.notes,
      createdAt: reservations.createdAt,
    })
    .from(reservations)
    .leftJoin(tables, eq(reservations.tableId, tables.id));

    const results = await query;

    // Filtrele
    let filtered = results;
    if (status) {
      filtered = filtered.filter(r => r.status === status);
    }
    if (date) {
      const targetDate = new Date(date);
      filtered = filtered.filter(r => {
        const rDate = new Date(r.startTime);
        return rDate.toDateString() === targetDate.toDateString();
      });
    }

    return NextResponse.json({ reservations: filtered });
  } catch (error: any) {
    console.error('Reservation List Error:', error);
    return NextResponse.json({ error: 'Rezervasyonlar listelenirken hata oluştu' }, { status: 500 });
  }
}
