# 🎱 Frame Bilardo & Snooker Academy — Yönetim Sistemi

> **Sürüm:** 1.0  
> **Son Güncelleme:** 17 Mart 2026  
> **Canlı Adres:** [maksutakgun.me](https://maksutakgun.me)

Frame Bilardo & Snooker Academy için geliştirilen **masa yönetim ve rezervasyon sistemi**. Bu doküman, sistemin nasıl kullanılacağını mekan sahibi ve personel için açıklamaktadır.

---

## 📖 İçindekiler

1. [Sisteme Giriş](#-sisteme-giriş)
2. [Masa Yönetimi (Günlük Kullanım)](#-masa-yönetimi-günlük-kullanım)
3. [Rezervasyon Sistemi](#-rezervasyon-sistemi)
4. [Ciro Raporları](#-ciro-raporları)
5. [Müşteri Web Sitesi](#-müşteri-web-sitesi)
6. [Fiyat ve Masa Düzenleme](#-fiyat-ve-masa-düzenleme)
7. [Güvenlik Bilgileri](#-güvenlik-bilgileri)
8. [Teknik Kurulum](#-teknik-kurulum-geliştirici-için)
9. [Sık Sorulan Sorular](#-sık-sorulan-sorular)

---

## 🔐 Sisteme Giriş

### Personel / Yönetici Girişi

1. Tarayıcıdan **maksutakgun.me/login** adresine gidin
2. Yetkili telefon numaranızı girin (başında +90 olmadan, örn: `5539402590`)
3. Telefonunuza gelen **6 haneli doğrulama kodunu** girin
4. Otomatik olarak **Dashboard** ekranına yönlendirilirsiniz

> ⚠️ **Önemli:** Sadece `admin` veya `staff` rolüne sahip numaralar Dashboard'a girebilir. Müşteri numarasıyla giriş yapılamaz.

### Çıkış Yapma

Sağ üst köşedeki **çıkış ikonu** (🚪) ile güvenli şekilde oturumu kapatabilirsiniz.

---

## 🎯 Masa Yönetimi (Günlük Kullanım)

Dashboard'a girdikten sonra karşınıza **tüm masalar** kart görünümünde gelir. Bu ekran, günlük işleyişin kalbidir.

### Masa Durumları

| Renk | Durum | Anlamı |
|------|-------|--------|
| 🟢 Yeşil | **Müsait** | Masa boş, müşteri kabul edebilirsiniz |
| 🔴 Kırmızı | **Dolu** | Müşteri oynuyor, kronometre çalışıyor |
| 🟡 Sarı | **Rezerve** | İleriye dönük rezervasyon yapılmış |
| ⚫ Gri | **Bakımda** | Masa kullanım dışı |

### Masa Başlatma (Müşteri Geldi)

1. Müsait (yeşil) masayı bulun
2. **"Masayı Başlat"** butonuna tıklayın
3. Kronometre otomatik olarak başlar ⏱️
4. Kart üzerinde **canlı süre** ve **anlık tutar** görünür

### Hesap Kapatma (Müşteri Ayrılıyor)

1. Dolu (kırmızı) masada **"Hesabı Kapat"** butonuna tıklayın
2. Ekranda **Fiş Modalı** açılır ve şunları gösterir:
   - Başlangıç ve bitiş saati
   - Toplam oynama süresi
   - Saatlik ücret
   - **Toplam tutar**
   - Minimum ücret uygulandıysa uyarı
3. **"Tamam"** butonuna basarak kapatın

> 💡 **Minimum Ücret:** 1 saatten kısa oynayan müşterilerden minimum **1 saatlik ücret** alınır. Örneğin, 20 dakika oynayan kişi de 1 saatlik fiyat öder.

### Filtreleme

Üst kısımdaki butonlarla masaları filtreleyebilirsiniz:

- **Tümü** — Tüm masaları göster
- **Boş** — Sadece müsait masalar
- **Dolu** — Sadece aktif (kronometre çalışan) masalar
- **Rezerve** — Sadece rezerve edilmiş masalar

Her butonun yanında o kategorideki masa sayısı görünür.

### Günlük Özet Kartları

Dashboard'un üst kısmında 4 istatistik kartı yer alır:

| Kart | Gösterdiği |
|------|-----------|
| 💰 **Bugünkü Ciro** | Bugün kapatılan masalardan elde edilen toplam gelir |
| 🔴 **Açık Masalar** | Şu an aktif olan masa sayısı ve tahmini ciro |
| 📊 **Toplam Oturum** | Bugün kaç kez masa açılıp kapatıldı |
| ⏱️ **Ort. Oturum Süresi** | Müşterilerin ortalama oynama süresi |

---

## 📅 Rezervasyon Sistemi

### Müşteri Nasıl Rezervasyon Yapar?

Müşteriler web siteniz üzerinden (**maksutakgun.me → Rezervasyon Yap**) şu adımları izler:

1. **Tarih seçimi** — Bugünden itibaren 7 gün içinde bir gün seçer
2. **Saat seçimi** — Çalışma saatleri arasından (12:00–02:00) bir saat seçer
3. **Masa tipi seçimi** — Snooker, Amerikan (Pool) veya Karambol (3-Top)
   - Sistem **gerçek zamanlı müsaitliği** kontrol eder
   - Kaç masa müsait olduğu gösterilir
4. **Telefon doğrulama** — Numarasına gelen 6 haneli kodu girer
5. **Onay ekranı** — Rezervasyon detayları gösterilir

> 🛡️ **Çakışma Kontrolü:** Aynı masaya aynı saatte iki kişi rezervasyon yapamaz. Sistem otomatik olarak engeller.

### Admin Olarak Rezervasyonları Yönetme

Dashboard'dan üst menüdeki **"Rezervasyonlar"** sekmesine tıklayın:

- Tüm rezervasyonları tarih ve saatiyle görürsünüz
- **Filtreler:** Tümü / Onaylı / Bekleyen / İptal
- Gelecek tarihli bir rezervasyonu **"İptal Et"** butonuyla iptal edebilirsiniz
- Müşteri bilgileri (ad, telefon, not) görüntülenebilir

### Müşterinin Gelmemesi (No-Show)

Müşteri gelmediyse, rezervasyonu admin panelinden iptal edebilirsiniz. Bu, masayı tekrar müsait hale getirir.

---

## 📈 Ciro Raporları

Dashboard'dan üst menüdeki **"Raporlar"** sekmesine tıklayın.

### Periyot Seçimi

Üç farklı zaman aralığında rapor görüntüleyebilirsiniz:

| Periyot | Gösterdiği |
|---------|-----------|
| **Bugün** | Günlük ciro ve detaylar |
| **Bu Hafta** | Son 7 günün toplamı |
| **Bu Ay** | Ayın başından bugüne |

### Rapor İçeriği

1. **Toplam Ciro** — Seçilen dönemde kazanılan toplam tutar
2. **Oturum Sayısı** — Kaç masa açılıp kapatıldı
3. **Ortalama Süre** — Müşterilerin ortalama oynama süresi
4. **Ortalama Tutar** — Masa başına ortalama gelir
5. **Masa Tipine Göre Dağılım** — Hangi masa tipi ne kadar gelir getirdi (çubuk grafik)
6. **Saatlere Göre Yoğunluk** — Hangi saatlerde daha çok müşteri var (24 saat grafiği)
7. **Son Oturumlar Tablosu** — Her bir oturumun detaylı dökümü

> 💡 **İpucu:** Yoğun saatleri belirleyerek personel planlaması yapabilirsiniz. Örneğin, 20:00–23:00 arası en yoğunsa, o saatlerde ekstra personel ayarlayın.

---

## 🌐 Müşteri Web Sitesi

Müşterilerinizin gördüğü sayfalar:

| Sayfa | Adres | İçerik |
|-------|-------|--------|
| **Ana Sayfa** | maksutakgun.me | Video arka planlı tanıtım, "Rezervasyon Yap" butonu |
| **Hakkımızda** | /hakkimizda | Akademi tanıtımı, tarihçe, masalar |
| **Galeri** | /galeri | Salon fotoğrafları |
| **Bize Ulaşın** | /iletisim | Telefon, adres, Google Harita, çalışma saatleri |
| **Rezervasyon** | /reservation | Online masa rezervasyonu |

Her sayfada **WhatsApp butonu** (sağ alt köşe) bulunur — müşteriler hızlıca iletişime geçebilir.

---

## ⚙️ Fiyat ve Masa Düzenleme

### Masa Fiyatını Güncelleme

Sistem, her masanın **kendi saatlik ücretini** tutar. Fiyat güncellemesi yapıldığında:

- Daha önce açılmış masaların fiyatı **değişmez** (eski fiyattan hesaplanır)
- Yeni açılan masalar **güncel fiyattan** başlar

> Masa ekleme, fiyat güncelleme ve masa silme işlemleri için şu an veritabanı üzerinden yapılmaktadır. İlerleyen sürümlerde admin paneline "Masa Yönetimi" ekranı eklenecektir.

### Mevcut Masa Tipleri ve Fiyatları

| Tip | Örnek İsim | Varsayılan Ücret |
|-----|-----------|-----------------|
| SNOOKER | Snooker 1, 2, 3 | ₺400/saat |
| SNOOKER VIP | Snooker VIP | ₺600/saat |
| POOL | Amerikan 1, 2 | ₺350/saat |
| KARAMBOL | 3-Top 1, 2 | ₺300/saat |

---

## 🔒 Güvenlik Bilgileri

### Çalışanlarınıza İletin

- **Şifrelerinizi kimseyle paylaşmayın** — Giriş kodu telefonunuza gelir
- **Her mesai sonunda çıkış yapın** — Oturum 12 saat sonra otomatik kapanır
- **Dashboard'u açık bırakmayın** — Müşterilerin görebileceği ekranlarda kapatın

### Teknik Güvenlik (Geliştirici İçin)

| Önlem | Durum |
|-------|-------|
| Admin API yetkilendirme | ✅ `requireStaffOrAdmin()` guard |
| OTP brute-force koruması | ✅ 5 deneme → 15 dk kilitleme |
| SMS rate-limit | ✅ 60 saniye bekleme |
| OTP kodu uzunluğu | ✅ 6 haneli |
| Session süresi | ✅ 12 saat |
| SQL injection koruması | ✅ Parametrize sorgular |
| NEXTAUTH_SECRET | ✅ 48 byte kriptografik |
| Hata mesajlarında bilgi sızıntısı | ✅ Detaylar gizli |

---

## 🛠️ Teknik Kurulum (Geliştirici İçin)

### Gereksinimler

- **Node.js** 18+
- **PostgreSQL** veritabanı
- **npm** paket yöneticisi

### Kurulum

```bash
# 1. Repoyu klonla
git clone <repo-url>
cd frame-web

# 2. Bağımlılıkları yükle
npm install

# 3. Ortam değişkenlerini ayarla
cp .env.example .env
# .env dosyasını düzenleyip gerçek değerleri girin

# 4. Veritabanı şemasını oluştur
npx drizzle-kit push

# 5. Geliştirme sunucusunu başlat
npm run dev
```

### Production Build

```bash
npm run build
npm run start
```

### Ortam Değişkenleri

| Değişken | Açıklama | Örnek |
|----------|----------|-------|
| `DATABASE_URL` | PostgreSQL bağlantı adresi | `postgres://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | Oturum şifreleme anahtarı (güçlü olmalı) | `node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"` |
| `NEXTAUTH_URL` | Sitenin canlı adresi | `https://maksutakgun.me` |
| `OTP_BYPASS_ENABLED` | Test modu (production'da **false**) | `false` |

### Teknoloji Yığını

| Teknoloji | Kullanım |
|-----------|----------|
| **Next.js 16** | React framework (frontend + backend) |
| **Drizzle ORM** | Veritabanı sorgulama |
| **PostgreSQL** | Veritabanı |
| **NextAuth.js** | Kimlik doğrulama |
| **Tailwind CSS 4** | Stil/Tasarım |
| **SSE (Server-Sent Events)** | Gerçek zamanlı masa güncellemeleri |

### Proje Yapısı

```
frame-web/
├── src/
│   ├── app/
│   │   ├── (admin)/           # Admin Dashboard sayfaları
│   │   │   └── dashboard/
│   │   │       ├── page.tsx           # Ana masa yönetimi
│   │   │       ├── reports/page.tsx   # Ciro raporları
│   │   │       └── reservations/      # Rezervasyon yönetimi
│   │   ├── (customer)/        # Müşteri sayfaları
│   │   │   ├── reservation/   # Online rezervasyon
│   │   │   ├── galeri/        # Fotoğraf galerisi
│   │   │   ├── hakkimizda/    # Hakkımızda
│   │   │   └── iletisim/      # İletişim
│   │   ├── api/               # Backend API'leri
│   │   │   ├── admin/         # Yönetim API'leri (korumalı)
│   │   │   ├── auth/          # Kimlik doğrulama
│   │   │   ├── reservations/  # Rezervasyon işlemleri
│   │   │   └── tables/        # Gerçek zamanlı masa stream
│   │   ├── login/             # Personel giriş sayfası
│   │   └── page.tsx           # Ana sayfa (landing)
│   ├── components/            # Paylaşılan UI bileşenleri
│   ├── features/              # Özellik bazlı bileşenler
│   │   └── tables/            # Masa kartı, grid, kronometre
│   └── lib/                   # Yardımcı dosyalar
│       ├── auth.ts            # Kimlik doğrulama ayarları
│       ├── auth-guard.ts      # API yetki kontrolü
│       ├── db.ts              # Veritabanı bağlantısı
│       ├── schema.ts          # Veritabanı tabloları
│       └── whatsapp.ts        # WhatsApp API entegrasyonu
└── .env.example               # Ortam değişkenleri şablonu
```

---

## ❓ Sık Sorulan Sorular

### "Dashboard'a giremiyorum"
- Numaranızın veritabanında `admin` veya `staff` rolüyle kayıtlı olduğundan emin olun
- Doğrulama kodunun süresinin dolmamış olduğunu kontrol edin (5 dakika geçerli)
- 5 yanlış denemeden sonra 15 dakika bekleyin

### "Masada kronometre görünmüyor"
- Sayfayı yenileyin (sağ üstteki 🔄 butonu)
- Masa durumunun "Dolu" (kırmızı) olduğundan emin olun
- İnternet bağlantınızı kontrol edin

### "Müşteri 'masa müsait yok' diyor ama masalar boş"
- Müşterinin seçtiği tarih/saat o masada zaten bir rezervasyon olabilir
- Dashboard'dan "Rezervasyonlar" sekmesine bakarak kontrol edin
- Gerekirse çakışan rezervasyonu iptal edin

### "Fiyat güncelleme nasıl yapılır?"
- Şu an veritabanı üzerinden güncellenir
- Açık olan masaların fiyatı otomatik olarak korunur (başladığı anki fiyattan hesaplanır)

### "WhatsApp doğrulama kodu gelmiyor"
- WhatsApp API entegrasyonu henüz simülasyon modundadır
- Geliştirici konsolu (server logları) üzerinden kodu görebilirsiniz (`development` modda)
- Gerçek API entegrasyonu için Meta Cloud API veya NetGSM kurulması gerekir

---

## 📞 Teknik Destek

Teknik sorunlar veya özellik talepleri için:

- **Geliştirici:** Maksut
- **Proje:** Frame Bilardo & Snooker Yönetim Sistemi
- **Framework:** Next.js 16 (Turbopack)

---

*Bu doküman Frame Bilardo & Snooker Academy yönetim ekibi için hazırlanmıştır.*
