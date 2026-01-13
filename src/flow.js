export const getNextScreen = async (decryptedBody) => {
  const { screen, data, action, flow_token } = decryptedBody;

  // 1. Sağlık Kontrolü (Ping)
  if (action === "ping") {
    return { data: { status: "active" } };
  }

  // 2. n8n Bağlantısı
  const N8N_URL = "https://n8n.berkai.shop/webhook/flows";

  try {
    const response = await fetch(N8N_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(decryptedBody),
    });

    const result = await response.json();
    return result;

  } catch (error) {
    console.error("n8n Baglanti Hatasi:", error);
    // Hata durumunda akışı güvenli kapat
    return {
      screen: "SUCCESS",
      data: { extension_message_response: { params: { flow_token, status: "error" } } }
    };
  }
};
