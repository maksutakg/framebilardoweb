import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4 font-sans text-foreground antialiased selection:bg-primary/30 selection:text-primary">
      {/* Background ambient light - inherited from globals.css starfield & vignette */}
      <div className="fixed inset-0 pointer-events-none z-0 mix-blend-multiply bg-black/40" />
      
      {/* Absolute Header - Logo & Back */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-5">
        <Link href="/">
          <img src="https://api.frameclubbilardo.com/assets/logo.svg" alt="Frame" className="h-8 md:h-12 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
        </Link>
        <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium">
          <ArrowLeft className="size-4" />
          Anasayfaya Dön
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-4xl my-24 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header Cover Image */}
        <div className="w-full h-48 md:h-64 bg-[url('https://api.frameclubbilardo.com/assets/headerBg.jpg')] bg-cover bg-center bg-no-repeat relative flex items-end">
          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="relative z-10 p-6 md:p-8 w-full">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white border-l-4 border-white pl-4">
              Hakkımızda
            </h1>
          </div>
        </div>

        {/* Content Body */}
        <div className="px-6 md:px-12 py-8 space-y-6 text-zinc-300 leading-relaxed text-sm md:text-base font-medium">
          <p className="text-center text-lg md:text-xl text-white">
            <strong className="font-bold">"Frame Bilardo & Snooker Academy"</strong> olarak İstanbul’da bilardo sporunun kalbi olmaktan gurur duyuyoruz. 2021 Haziran ayında açılışını gerçekleştirdiğimiz akademimiz, modern altyapısı, profesyonel ekipmanları ve alanında uzman ekibiyle hem yeni başlayanlar hem de profesyonel oyuncular için kapsamlı bir eğitim ve deneyim merkezi sunuyor.
          </p>

          <p className="text-center">
            Misyonumuz, bilardo sporunu Türkiye’de daha geniş bir kitleye tanıtmak ve sevdirmek, bu alanda yetenekli sporcuları yetiştirerek ulusal ve uluslararası arenada başarıya taşımaktır. Türkiye’de en iyi bilardo akademilerinden biri olarak bilinen Frame Bilardo, her yaştan sporcunun hedeflerine ulaşmasını destekliyor.
          </p>

          <p className="text-center">
            Vizyonumuz, bilardo ve snooker sporunun gelişimine katkı sağlarken, Türkiye’nin en saygın bilardo akademilerinden biri olmaya devam etmektir.
          </p>

          <p className="text-center">
            Akademimizde pool bilardo, snooker dersleri ve turnuvalar gibi geniş kapsamlı etkinlikler yer alıyor. Ayrıca, bilardo aksesuarları ve ekipman mağazamız, spor severlerin tüm ihtiyaçlarını karşılayacak zengin bir seçki sunmaktadır. Sıcak ve samimi atmosferimizle restoran alanımızda ise misafirlerimize kaliteli bir deneyim sunuyoruz.
          </p>

          <p className="text-center">
            Akademimizde bulunan 4 adet dünyanın en iyi snooker masası (Star Xing Pai) ve 8 adet Zeki Bilardo, 1 adet Knight Shot turnuva pool masası (Toplam 9 Adet Amerikan), sporcularımızın en iyi şartlarda antrenman yapabilmesi ve turnuvalara katılabilmesi için özel olarak seçilmiştir.
          </p>

          <p className="text-center">
            Akademimizin açılışında Türkiye'nin en büyük pool bilardo turnuvasını düzenleyerek hem sporseverleri bir araya getirdik hem de bilardo dünyasında heyecan uyandırdık. Bu büyük organizasyonla, Frame Bilardo & Snooker Academy’nin bilardoya olan tutkusunu ve Türkiye’deki spor camiasına katkıda bulunma misyonumuzu bir kez daha ortaya koyduk.
          </p>

          <p className="text-center">
            Ayrıca, akademimiz üç yıl boyunca Türkiye Bilardo Federasyonu'nun düzenlediği Snooker Türkiye Şampiyonası’na ev sahipliği yapmıştır. Bu önemli turnuvalara kapılarımızı açarak, ülkemizde snooker sporunun gelişimine destek veriyor ve en üst düzey sporcuları ağırlıyoruz.
          </p>
        </div>
        
        {/* Footer info inside the block */}
        <div className="bg-black/30 border-t border-white/5 py-4 px-8 flex justify-center text-xs text-zinc-500 font-medium">
          © {new Date().getFullYear()} All Rights Reserved - FRAME AKADEMİ TURİZM LTD. ŞTİ.
        </div>
      </div>
    </div>
  );
}
