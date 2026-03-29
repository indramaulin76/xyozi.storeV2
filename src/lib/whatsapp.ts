interface SendWhatsAppParams {
  phoneNumber: string;
  customerName: string;
  invoiceNumber: string;
  productName: string;
  serialNumber?: string | null;
}

interface SendWhatsAppResult {
  success: boolean;
  error?: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000];

function formatPhone(phone: string): string {
  return phone.replace(/^0/, "62").replace(/\D/g, "");
}

async function sendViaFonnte(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
  const fonnteToken = process.env.FONNTE_TOKEN;

  if (!fonnteToken) {
    console.error("[Fonnte] Token not configured");
    return { success: false, error: "Fonnte token not configured" };
  }

  const formattedPhone = phone.startsWith("62") ? phone : `62${phone}`;

  console.log(`[Fonnte] Sending to ${formattedPhone}...`);

  try {
    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        "Authorization": fonnteToken,
      },
      body: new URLSearchParams({
        target: formattedPhone,
        message: message,
        countryCode: "62",
      }),
    });

    const data = await response.json();
    console.log(`[Fonnte] Response:`, data);

    if (data.status === true) {
      console.log(`[Fonnte] Message sent successfully to ${formattedPhone}`);
      return { success: true };
    }

    console.error(`[Fonnte] Failed:`, data.reason);
    return { success: false, error: data.reason || "Unknown error" };
  } catch (error) {
    console.error(`[Fonnte] Error:`, error);
    return { success: false, error: "Network error" };
  }
}

export async function sendWhatsAppNotification(params: SendWhatsAppParams): Promise<SendWhatsAppResult> {
  const { phoneNumber, customerName, invoiceNumber, productName, serialNumber } = params;

  const fonnteToken = process.env.FONNTE_TOKEN;
  if (!fonnteToken) {
    console.error("[WhatsApp] FONNTE_TOKEN not configured");
    return { success: false, error: "Fonnte token not configured" };
  }

  const formattedPhone = formatPhone(phoneNumber);

  let message = `Halo ${customerName}, Pembayaran pesanan ${invoiceNumber} BERHASIL! Diamond ${productName} sudah masuk ke akun Anda.`;
  if (serialNumber) message += ` SN: ${serialNumber}.`;
  message += " Terima kasih sudah order di Xyozi Store!";

  console.log(`[WhatsApp] Sending to ${formattedPhone}: ${message.substring(0, 50)}...`);

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const result = await sendViaFonnte(formattedPhone, message);

    if (result.success) {
      console.log(`[WhatsApp] Notification sent successfully to ${formattedPhone} (attempt ${attempt + 1})`);
      return { success: true };
    }

    console.warn(`[WhatsApp] Attempt ${attempt + 1} failed:`, result.error);

    if (attempt < MAX_RETRIES - 1) {
      console.log(`[WhatsApp] Retrying in ${RETRY_DELAYS[attempt]}ms...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS[attempt]));
    }
  }

  console.error(`[WhatsApp] All ${MAX_RETRIES} attempts failed for ${formattedPhone}`);

  await sendAdminNotification({
    type: "FAILED",
    invoiceNumber,
    customerPhone: formattedPhone,
    error: "Gagal kirim WA setelah 3x retry",
  });

  return { success: false, error: "Failed after 3 retries" };
}

interface AdminNotificationParams {
  type: "FAILED" | "ERROR";
  invoiceNumber: string;
  customerPhone: string;
  error: string;
}

export async function sendAdminNotification(params: AdminNotificationParams): Promise<void> {
  const fonnteToken = process.env.FONNTE_TOKEN;
  const adminPhone = process.env.ADMIN_WA_PHONE;

  if (!fonnteToken || !adminPhone) {
    console.warn("[WhatsApp Admin] Fonnte not configured or ADMIN_WA_PHONE not set, skipping admin notification");
    return;
  }

  const formattedAdminPhone = formatPhone(adminPhone);

  let message = `⚠️ *NOTIFIKASI ADMIN XYOZI STORE*\n\n`;
  message += `*Tipe:* ${params.type}\n`;
  message += `*Invoice:* ${params.invoiceNumber}\n`;
  message += `*No. Pelanggan:* ${params.customerPhone}\n`;
  message += `*Error:* ${params.error}\n`;
  message += `\n_Cek logs segera!_`;

  console.log(`[WhatsApp Admin] Sending to ${formattedAdminPhone}: ${message.substring(0, 50)}...`);

  const result = await sendViaFonnte(formattedAdminPhone, message);

  if (result.success) {
    console.log(`[WhatsApp Admin] Notification sent to admin ${formattedAdminPhone}`);
  } else {
    console.warn(`[WhatsApp Admin] Failed to send to admin:`, result.error);
  }
}
