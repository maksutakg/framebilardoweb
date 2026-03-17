import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reservations } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }

    const { reservationId } = await req.json();
    if (!reservationId) {
      return NextResponse.json({ error: 'Rezervasyon ID gerekli' }, { status: 400 });
    }

    // Rezervasyonu bul
    const existing = await db.select()
      .from(reservations)
      .where(eq(reservations.id, reservationId));

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Rezervasyon bulunamadı' }, { status: 404 });
    }

    const reservation = existing[0];

    // Müşteri sadece kendi rezervasyonunu iptal edebilir (admin herkesinkini yapabilir)
    if (session.user.role === 'customer' && reservation.userId !== session.user.id) {
      return NextResponse.json({ error: 'Bu rezervasyonu iptal etme yetkiniz yok' }, { status: 403 });
    }

    // Geçmiş rezervasyon iptal edilemez
    if (new Date(reservation.startTime) < new Date()) {
      return NextResponse.json({ error: 'Geçmiş bir rezervasyon iptal edilemez' }, { status: 400 });
    }

    // İptal et
    await db.update(reservations)
      .set({ status: 'cancelled' })
      .where(eq(reservations.id, reservationId));

    return NextResponse.json({ success: true, message: 'Rezervasyon iptal edildi' });
  } catch (error: any) {
    console.error('Cancel Error:', error);
    return NextResponse.json({ error: 'Rezervasyon iptal edilirken hata oluştu' }, { status: 500 });
  }
}
