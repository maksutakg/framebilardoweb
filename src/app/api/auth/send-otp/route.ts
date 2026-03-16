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
    await db.delete(otpCodes).where(eq(otpCodes.phone, phone));

    // Yeni Kodu Ekle
    await db.insert(otpCodes).values({
      phone,
      code,
      expiresAt,
    });

    // WhatsApp API çağrısı
    await sendWhatsAppOTP(phone, code);

    // TODO: DEV ORTAMINDA KONSOLA YAZALIM (Test Edebilmeniz İçin)
    console.log(`[TEST] Giden WhatsApp OTP Kodu -> ${phone}: ${code}`);

    return NextResponse.json({ success: true, message: 'OTP gönderildi' });
  } catch (err: any) {
    console.error('OTP Error:', err);
    return NextResponse.json({ error: 'SMS gönderilirken hata oluştu' }, { status: 500 });
  }
}
