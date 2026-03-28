interface SendWhatsAppParams {
  phoneNumber: string;
  customerName: string;
  invoiceNumber: string;
  productName: string;
  serialNumber?: string | null;
}

export async function sendWhatsAppNotification(params: SendWhatsAppParams) {
  const { phoneNumber, customerName, invoiceNumber, productName, serialNumber } = params;

  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!n8nWebhookUrl) {
    console.error("[WhatsApp] N8N_WEBHOOK_URL not configured");
    return { success: false, error: "WhatsApp service not configured" };
  }

  const formattedPhone = phoneNumber.replace(/^0/, "62");

  let message = `Halo ${customerName}, Pembayaran pesanan ${invoiceNumber} BERHASIL! Diamond ${productName} sudah masuk ke akun Anda.`;

  if (serialNumber) {
    message += ` SN: ${serialNumber}.`;
  }

  message += " Terima kasih sudah order di Xyozi Store!";

  try {
    const response = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: formattedPhone,
        message: message,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`[WhatsApp] Notification sent successfully to ${formattedPhone}`);
      return { success: true, data: result };
    } else {
      console.error("[WhatsApp] Failed to send:", result);
      return { success: false, error: result.message || "Failed to send WhatsApp" };
    }
  } catch (error) {
    console.error("[WhatsApp] Error sending notification:", error);
    return { success: false, error: "Network error" };
  }
}
