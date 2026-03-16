export async function sendWhatsAppOTP(phoneNumber: string, otpCode: string) {
  // TODO: Entegre edilecek gerçek WhatsApp API servisinin (Örn: Meta Cloud API, NetGSM WhatsApp vb.) bilgileri eklenecek.
  // Gelen numaranın (phoneNumber) başında +90 veya 90 olup olmadığını kontrol edip, API'nin beklediği formata çevirebilirsiniz.
  console.log(`[WhatsApp API Simulasyonu] Mesaj gönderiliyor...`);
  console.log(`Alıcı: ${phoneNumber}`);
  console.log(`Mesaj: Frame Bilardo rezervasyon onay kodunuz: ${otpCode}. Bizi seçtiğiniz için teşekkürler!`);
  
  // Örnek Fetch İsteği (Meta Graph API için):
  /*
  const response = await fetch(`https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer YOUR_ACCESS_TOKEN`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "template",
      template: {
        name: "otp_verification",
        language: { code: "tr" },
        components: [
          {
            type: "body",
            parameters: [ { type: "text", text: otpCode } ]
          }
        ]
      }
    })
  });
  return await response.json();
  */
  
  // Şimdilik başarılı dönüyoruz
  return { success: true };
}
