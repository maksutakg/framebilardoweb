/**
 * Frame Bilardo — Admin Kullanıcı Oluşturma Scripti
 * 
 * Kullanım:
 *   node scripts/make-admin.mjs 5539402590 "Maksut"
 * 
 * Parametreler:
 *   1. Telefon numarası (zorunlu)
 *   2. İsim (opsiyonel)
 */

import postgres from 'postgres';
import 'dotenv/config';

const phone = process.argv[2];
const name = process.argv[3] || null;

if (!phone) {
  console.log('\n❌ Telefon numarası girilmedi!\n');
  console.log('Kullanım:');
  console.log('  node scripts/make-admin.mjs 5539402590 "Maksut"\n');
  process.exit(1);
}

const cleanPhone = phone.replace(/\D/g, '');

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.log('\n❌ DATABASE_URL bulunamadı! .env dosyasını kontrol edin.\n');
  process.exit(1);
}

const sql = postgres(dbUrl);

async function makeAdmin() {
  try {
    console.log(`\n🔍 ${cleanPhone} numarası kontrol ediliyor...\n`);

    // Kullanıcı var mı bak
    const existing = await sql`SELECT id, phone, role, name FROM users WHERE phone = ${cleanPhone}`;

    if (existing.length > 0) {
      const user = existing[0];
      console.log(`📋 Mevcut kullanıcı bulundu:`);
      console.log(`   İsim: ${user.name || '(yok)'}`);
      console.log(`   Telefon: ${user.phone}`);
      console.log(`   Mevcut Rol: ${user.role}`);

      // Rolü admin yap
      await sql`UPDATE users SET role = 'admin', name = COALESCE(${name}, name) WHERE phone = ${cleanPhone}`;
      console.log(`\n✅ Rol 'admin' olarak güncellendi!`);
    } else {
      // Yeni kullanıcı oluştur
      await sql`INSERT INTO users (phone, role, name) VALUES (${cleanPhone}, 'admin', ${name})`;
      console.log(`✅ Yeni admin kullanıcı oluşturuldu!`);
    }

    // Sonucu göster
    const result = await sql`SELECT id, phone, role, name, created_at FROM users WHERE phone = ${cleanPhone}`;
    console.log(`\n📌 Güncel Bilgiler:`);
    console.log(`   ID: ${result[0].id}`);
    console.log(`   Telefon: ${result[0].phone}`);
    console.log(`   Rol: ${result[0].role} ✅`);
    console.log(`   İsim: ${result[0].name || '(yok)'}`);
    console.log(`\n🎉 Artık bu numara ile giriş yaparak Dashboard'a erişebilirsiniz.\n`);

    // Tüm admin/staff kullanıcılarını listele
    const allStaff = await sql`SELECT phone, role, name FROM users WHERE role IN ('admin', 'staff') ORDER BY role, phone`;
    if (allStaff.length > 0) {
      console.log('👥 Tüm Yetkili Kullanıcılar:');
      console.log('─'.repeat(50));
      allStaff.forEach(u => {
        const badge = u.role === 'admin' ? '👑' : '🛡️';
        console.log(`   ${badge} ${u.phone} — ${u.role} — ${u.name || '(isimsiz)'}`);
      });
      console.log('─'.repeat(50));
    }

  } catch (err) {
    console.error('\n❌ Hata:', err.message);
  } finally {
    await sql.end();
  }
}

makeAdmin();
