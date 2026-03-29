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

export async function sendWhatsAppNotification(params: SendWhatsAppParams): Promise<SendWhatsAppResult> {
  const { phoneNumber, customerName, invoiceNumber, productName, serialNumber } = params;

  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!n8nWebhookUrl) {
    console.error("[WhatsApp] N8N_WEBHOOK_URL not configured");
    return { success: false, error: "WhatsApp service not configured" };
  }

  const formattedPhone = formatPhone(phoneNumber);

  let message = `Halo ${customerName}, Pembayaran pesanan ${invoiceNumber} BERHASIL! Diamond ${productName} sudah masuk ke akun Anda.`;
  if (serialNumber) message += ` SN: ${serialNumber}.`;
  message += " Terima kasih sudah order di Xyozi Store!";

  const payload = { phone: formattedPhone, message };

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log(`[WhatsApp] Notification sent successfully to ${formattedPhone} (attempt ${attempt + 1})`);
        return { success: true };
      }

      console.warn(`[WhatsApp] Attempt ${attempt + 1} failed with status:`, response.status);
    } catch (error) {
      console.error(`[WhatsApp] Attempt ${attempt + 1} error:`, error);
    }

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
  const adminWaUrl = process.env.N8N_WEBHOOK_URL;
  const adminPhone = process.env.ADMIN_WA_PHONE;

  if (!adminWaUrl || !adminPhone) {
    console.warn("[WhatsApp Admin] N8N_WEBHOOK_URL or ADMIN_WA_PHONE not configured, skipping admin notification");
    return;
  }

  const formattedAdminPhone = formatPhone(adminPhone);

  let message = `⚠️ *NOTIFIKASI ADMIN XYOZI STORE*\n\n`;
  message += `*Tipe:* ${params.type}\n`;
  message += `*Invoice:* ${params.invoiceNumber}\n`;
  message += `*No. Pelanggan:* ${params.customerPhone}\n`;
  message += `*Error:* ${params.error}\n`;
  message += `\n_Cek logs segera!_`;

  const payload = { phone: formattedAdminPhone, message };

  try {
    const response = await fetch(adminWaUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log(`[WhatsApp Admin] Notification sent to admin ${formattedAdminPhone}`);
    } else {
      console.warn(`[WhatsApp Admin] Failed to send to admin:`, response.status);
    }
  } catch (error) {
    console.error("[WhatsApp Admin] Error sending to admin:", error);
  }
}
