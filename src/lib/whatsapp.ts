interface SendWhatsAppParams {
  phoneNumber: string;
  customerName: string;
  invoiceNumber: string;
  productName: string;
  serialNumber?: string | null;
}

export async function sendWhatsAppNotification(params: SendWhatsAppParams) {
  const { phoneNumber, customerName, invoiceNumber, productName, serialNumber } = params;

  const apiKey = process.env.FONNTE_API_KEY;
  const device = process.env.FONNTE_DEVICE;

  if (!apiKey || !device) {
    console.error("[WhatsApp] FONNTE_API_KEY or FONNTE_DEVICE not configured");
    return { success: false, error: "WhatsApp service not configured" };
  }

  const formattedPhone = phoneNumber.replace(/^0/, "62");

  let message = `Halo ${customerName}, Pembayaran pesanan ${invoiceNumber} BERHASIL! Diamond ${productName} sudah masuk ke akun Anda.`;

  if (serialNumber) {
    message += ` SN: ${serialNumber}.`;
  }

  message += " Terima kasih sudah order di Xyozi Store!";

  try {
    const response = await fetch("https://api.fonnte.com/send-message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      body: JSON.stringify({
        target: formattedPhone,
        message: message,
        device: device,
      }),
    });

    const result = await response.json();

    if (result.success) {
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
