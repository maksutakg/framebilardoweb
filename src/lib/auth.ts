import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from './db';
import { users, otpCodes } from './schema';
import { eq, and } from 'drizzle-orm';

// OTP doğrulama deneme sayısını bellekte tut (production'da Redis/DB kullanılmalı)
const otpAttempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_OTP_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 dakika

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'SMS Doğrulama',
      credentials: {
        phone: { label: 'Telefon Numarası', type: 'text', placeholder: '+90 555...' },
        otp: { label: 'Doğrulama Kodu (SMS)', type: 'text', placeholder: '0000' }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) return null;

        const phone = credentials.phone.trim();
        const otp = credentials.otp.trim();

        // ─── Brute-force koruması ───
        const attemptKey = `otp:${phone}`;
        const attempt = otpAttempts.get(attemptKey);
        
        if (attempt && attempt.lockedUntil > Date.now()) {
          const remainingMinutes = Math.ceil((attempt.lockedUntil - Date.now()) / (1000 * 60));
          throw new Error(`Çok fazla yanlış deneme. ${remainingMinutes} dakika sonra tekrar deneyin.`);
        }

        // ─── DEV BYPASS (Sadece development ortamında + ENV flag açıksa) ───
        const isDevBypass = 
          process.env.NODE_ENV === 'development' && 
          process.env.OTP_BYPASS_ENABLED === 'true' &&
          otp === '1234';

        if (!isDevBypass) {
          // ─── Gerçek OTP doğrulama ───
          const otpRecords = await db.select().from(otpCodes).where(
            and(
              eq(otpCodes.phone, phone),
              eq(otpCodes.code, otp)
            )
          );

          const validOtp = otpRecords[0];

          if (!validOtp) {
            // Yanlış deneme sayını artır
            const current = otpAttempts.get(attemptKey) || { count: 0, lockedUntil: 0 };
            current.count += 1;
            
            if (current.count >= MAX_OTP_ATTEMPTS) {
              current.lockedUntil = Date.now() + LOCK_DURATION_MS;
              current.count = 0; // Kilitle ve sıfırla
              otpAttempts.set(attemptKey, current);
              throw new Error('Çok fazla yanlış deneme. 15 dakika beklemeniz gerekiyor.');
            }
            
            otpAttempts.set(attemptKey, current);
            throw new Error(`Geçersiz doğrulama kodu (${MAX_OTP_ATTEMPTS - current.count} deneme hakkı kaldı)`);
          }

          if (validOtp.expiresAt < new Date()) {
            throw new Error('Doğrulama kodunun süresi dolmuş. Yeni kod isteyin.');
          }

          // OTP başarılı — kodu sil ve deneme sayısını sıfırla
          await db.delete(otpCodes).where(eq(otpCodes.id, validOtp.id));
          otpAttempts.delete(attemptKey);
        }

        // ─── Kullanıcı sorgusu ───
        let userRecords = await db.select().from(users).where(eq(users.phone, phone));
        let user = userRecords[0];

        // Yoksa yeni müşteri oluştur
        if (!user) {
          const insertedUser = await db.insert(users).values({
            phone: phone,
            role: 'customer'
          }).returning();
          user = insertedUser[0];
        }

        return {
          id: user.id,
          phone: user.phone,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: any, user: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }: { session: any, token: any }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.phone = token.phone;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 12 * 60 * 60, // 12 saat — personel mesai süresi
  },
  pages: {
    signIn: '/login',
  }
};
