import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { otpCodes } from '@/lib/schema';
import { sendWhatsAppOTP } from '@/lib/whatsapp';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json({ error: 'Telefon numarası gerekli' }, { status: 400 });
    }

    // Basit RND 4 Haneli Kod
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 dakika

    // Önceki kodları silelim
    try {
      await db.delete(otpCodes).where(eq(otpCodes.phone, phone));
    } catch (dbErr: any) {
      console.error('[OTP] DB DELETE Hatası:', dbErr.message);
      return NextResponse.json({ error: `Veritabanı hatası (silme): ${dbErr.message}` }, { status: 500 });
    }

    // Yeni Kodu Ekle
    try {
      await db.insert(otpCodes).values({
        phone,
        code,
        expiresAt,
      });
    } catch (dbErr: any) {
      console.error('[OTP] DB INSERT Hatası:', dbErr.message);
      return NextResponse.json({ error: `Veritabanı hatası (ekleme): ${dbErr.message}` }, { status: 500 });
    }

    // WhatsApp API çağrısı (şimdilik simülasyon)
    try {
      await sendWhatsAppOTP(phone, code);
    } catch (waErr: any) {
      console.error('[OTP] WhatsApp API Hatası:', waErr.message);
      // WhatsApp başarısız olsa bile devam et, kod DB'de mevcut
    }

    // Konsola yazdıralım ki test edilebilsin
    console.log(`[OTP] Giden Kod -> ${phone}: ${code}`);

    return NextResponse.json({ success: true, message: 'OTP gönderildi' });
  } catch (err: any) {
    console.error('[OTP] Genel Hata:', err.message, err.stack);
    return NextResponse.json({ error: `Genel sunucu hatası: ${err.message}` }, { status: 500 });
  }
}
