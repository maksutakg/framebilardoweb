import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from './db';
import { users, otpCodes } from './schema';
import { eq, and } from 'drizzle-orm';

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

        // 1234 MASTER KEY (Test veya Apple/Google Review için bypass)
        if (credentials.otp === '1234') {
          // Buraları bypass eder ve girer (Production'da kapatılabilir)
        } else {
          // DB'den OTP Sorgula
          const otpRecords = await db.select().from(otpCodes).where(
            and(
              eq(otpCodes.phone, credentials.phone),
              eq(otpCodes.code, credentials.otp)
            )
          );

          const validOtp = otpRecords[0];

          if (!validOtp) {
            throw new Error('Geçersiz veya hatalı doğrulama kodu');
          }

          if (validOtp.expiresAt < new Date()) {
            throw new Error('Doğrulama kodunun süresi dolmuş');
          }

          // OTP başarılı, silebiliriz
          await db.delete(otpCodes).where(eq(otpCodes.id, validOtp.id));
        }

        // Veritabanında daha önce bu numara ile kayıtlı biri var mı kontrolü
        let userRecords = await db.select().from(users).where(eq(users.phone, credentials.phone));
        let user = userRecords[0];

        // Yoksa telefonuyla yeni kayıt (müşteri) oluştur
        if (!user) {
          const insertedUser = await db.insert(users).values({
            phone: credentials.phone,
            role: 'customer'
          }).returning();
          user = insertedUser[0];
        }

        // Token'a gömülecek veri
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
  },
  pages: {
    signIn: '/login', // Özel giriş yapma sayfamız
  }
};
