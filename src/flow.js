/**
 * WhatsApp Flows - n8n Bridge Gateway
 */

import fetch from "node-fetch";

// n8n Webhook URL'in (Production URL kullandığından emin ol)
const N8N_URL = "https://n8n.berkai.shop/webhook/flows";

export const getNextScreen = async (decryptedBody) => {
  const { screen, data, action, flow_token } = decryptedBody;

  // 1. SAĞLIK KONTROLÜ (Meta'nın Ping isteği)
  // Bu kısmı n8n'e göndermeden buradan yanıtlıyoruz ki hız kazanalım.
  if (action === "ping") {
    return {
      data: {
        status: "active",
      },
    };
  }

  // 2. HATA BİLDİRİMİ (Flow içinde bir hata olursa)
  if (data?.error) {
    console.warn("Kullanıcı ekranında hata oluştu:", data);
    return {
      data: {
        acknowledged: true,
      },
    };
  }

  // 3. n8n BAĞLANTISI
  // INIT (açılış), data_exchange (buton tıkı) vb. tüm durumları n8n'e soruyoruz.
  try {
    const response = await fetch(N8N_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(decryptedBody), // WhatsApp'tan gelen tüm veriyi n8n'e pasla
    });

    if (!response.ok) {
        throw new Error(`n8n hatasi: ${response.statusText}`);
    }

    const n8nResult = await response.json();
    
    // n8n'den gelen cevabı doğrudan Meta'ya gönderiyoruz
    return n8nResult;

  } catch (error) {
    console.error("Endpoint Köprüsü Hatası:", error);

    // Bir şeyler ters giderse akışı güvenli bir şekilde kapatacak bir hata mesajı dönüyoruz
    return {
      screen: "SUCCESS",
      data: {
        extension_message_response: {
          params: {
            flow_token,
            status: "Teknik bir aksaklık oluştu, lütfen daha sonra tekrar deneyin.",
          },
        },
      },
    };
  }
};
