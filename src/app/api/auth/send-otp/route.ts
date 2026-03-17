import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { otpCodes } from '@/lib/schema';
import { sendWhatsAppOTP } from '@/lib/whatsapp';
import { eq } from 'drizzle-orm';

// ─── Rate Limiting: Aynı numaraya SMS spam'ını engelle ───
const otpRateLimit = new Map<string, number>();
const OTP_COOLDOWN_MS = 60 * 1000; // 60 saniye — iki SMS arası minimum bekleme

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json({ error: 'Telefon numarası gerekli' }, { status: 400 });
    }

    // ─── Telefon numarası validasyonu ───
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 13) {
      return NextResponse.json({ error: 'Geçersiz telefon numarası formatı' }, { status: 400 });
    }

    // ─── Rate Limit Kontrolü ───
    const lastSent = otpRateLimit.get(cleanPhone);
    if (lastSent && Date.now() - lastSent < OTP_COOLDOWN_MS) {
      const remainingSeconds = Math.ceil((OTP_COOLDOWN_MS - (Date.now() - lastSent)) / 1000);
      return NextResponse.json({ 
        error: `Lütfen ${remainingSeconds} saniye bekleyin ve tekrar deneyin.` 
      }, { status: 429 });
    }

    // Güvenli 6 haneli kod oluştur (4 haneli → daha güçlü 6 haneli)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 dakika

    // Önceki kodları sil
    try {
      await db.delete(otpCodes).where(eq(otpCodes.phone, cleanPhone));
    } catch (dbErr: any) {
      console.error('[OTP] DB DELETE Hatası:', dbErr.message);
      return NextResponse.json({ error: 'Veritabanı hatası oluştu' }, { status: 500 });
    }

    // Yeni kodu ekle
    try {
      await db.insert(otpCodes).values({
        phone: cleanPhone,
        code,
        expiresAt,
      });
    } catch (dbErr: any) {
      console.error('[OTP] DB INSERT Hatası:', dbErr.message);
      return NextResponse.json({ error: 'Veritabanı hatası oluştu' }, { status: 500 });
    }

    // WhatsApp API (şimdilik simülasyon)
    try {
      await sendWhatsAppOTP(cleanPhone, code);
    } catch (waErr: any) {
      console.error('[OTP] WhatsApp API Hatası:', waErr.message);
    }

    // Rate limit güncelle
    otpRateLimit.set(cleanPhone, Date.now());

    // Development'ta konsola yaz (PRODUCTION'DA KALDIRILMALI)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[OTP-DEV] Giden Kod -> ${cleanPhone}: ${code}`);
    }

    return NextResponse.json({ success: true, message: 'Doğrulama kodu gönderildi' });
  } catch (err: any) {
    console.error('[OTP] Genel Hata:', err.message);
    // Hata detaylarını kullanıcıya gösterme (güvenlik)
    return NextResponse.json({ error: 'İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.' }, { status: 500 });
  }
}
