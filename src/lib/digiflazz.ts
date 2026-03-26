import crypto from 'crypto';
import { prisma } from './prisma';

const USERNAME = process.env.DIGIFLAZZ_USERNAME;
const API_KEY = process.env.DIGIFLAZZ_DEV_KEY;
const ENDPOINT = process.env.DIGIFLAZZ_ENDPOINT || 'https://api.digiflazz.com/v1';
const TESTING = process.env.DIGIFLAZZ_TESTING === 'true';

export async function fetchDigiflazzPriceList() {
  if (!USERNAME || !API_KEY) {
    throw new Error("Digiflazz credentials not found in environment variables.");
  }

  const sign = crypto.createHash('md5').update(`${USERNAME}${API_KEY}pricelist`).digest('hex');

  try {
    const response = await fetch(`${ENDPOINT}/price-list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cmd: 'prepaid',
        username: USERNAME,
        sign: sign
      }),
    });

    const resJson = await response.json();

    if (!resJson.data || !Array.isArray(resJson.data)) {
      const errorMsg = resJson.data?.message || JSON.stringify(resJson);
      throw new Error(`Digiflazz Error: ${errorMsg}`);
    }

    return resJson.data;
  } catch (error: any) {
    console.error("fetchDigiflazzPriceList Error:", error.message);
    throw error;
  }
}

function generateDigiflazzSign(refId: string): string {
  const dataToSign = `${USERNAME}${API_KEY}${refId}`;
  return crypto.createHash('md5').update(dataToSign).digest('hex');
}

interface PurchaseParams {
  skuCode: string;
  customerNo: string;
  refId: string;
  zoneId?: string;
}

interface DigiflazzPurchaseResponse {
  rc: string;
  rd: string;
  data?: {
    ref_id: string;
    wa_number: string;
    sku_code: string;
    customer_id: string;
    customer_no: string;
    zone_id?: string;
    amount: string;
    status: 'Pending' | 'Sukses' | 'Gagal';
    series?: number;
    sn?: string;
    message?: string;
  };
}

export async function purchaseProduct(params: PurchaseParams): Promise<DigiflazzPurchaseResponse> {
  const { skuCode, customerNo, refId, zoneId } = params;

  if (!USERNAME || !API_KEY) {
    throw new Error("Digiflazz credentials not found in environment variables.");
  }

  const sign = generateDigiflazzSign(refId);

  const requestBody: Record<string, string | boolean> = {
    username: USERNAME,
    buyer_sku_code: skuCode,
    customer_no: customerNo,
    ref_id: refId,
    sign,
    testing: TESTING,
  };

  if (zoneId) {
    requestBody.zone_id = zoneId;
  }

  console.log('[Digiflazz] Sending purchase request:', JSON.stringify(requestBody, null, 2));

  const response = await fetch(`${ENDPOINT}/transaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();

  console.log('[Digiflazz] Purchase response:', JSON.stringify(data, null, 2));

  return data;
}

export async function processTopUpAfterPayment(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { product: true },
  });

  if (!order) {
    throw new Error(`Order dengan ID ${orderId} tidak ditemukan`);
  }

  if (order.paymentStatus !== 'LUNAS') {
    throw new Error(`Order belum lunas. Status: ${order.paymentStatus}`);
  }

  if (order.digiflazzStatus !== 'PENDING') {
    console.log(`[Digiflazz] Order ${orderId} sudah diproses. Status: ${order.digiflazzStatus}`);
    return;
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { digiflazzStatus: 'PROCESSING' },
  });

  try {
    const result = await purchaseProduct({
      skuCode: order.product.skuCode,
      customerNo: order.userGameId,
      refId: order.referenceId,
      zoneId: order.zoneId || undefined,
    });

    if (result.rc === '1' && result.data?.status === 'Sukses') {
      await prisma.order.update({
        where: { id: orderId },
        data: { digiflazzStatus: 'SUCCESS' },
      });

      console.log(`[Digiflazz] Top-up BERHASIL untuk order ${orderId}`);
    } else if (result.data?.status === 'Pending') {
      await prisma.order.update({
        where: { id: orderId },
        data: { digiflazzStatus: 'PROCESSING' },
      });

      console.log(`[Digiflazz] Top-up PROCESSING untuk order ${orderId}`);
    } else {
      await prisma.order.update({
        where: { id: orderId },
        data: { digiflazzStatus: 'FAILED' },
      });

      console.log(`[Digiflazz] Top-up GAGAL untuk order ${orderId}: ${result.rd}`);
    }

  } catch (error) {
    console.error(`[Digiflazz] Error processing top-up for order ${orderId}:`, error);

    await prisma.order.update({
      where: { id: orderId },
      data: { digiflazzStatus: 'FAILED' },
    });

    throw error;
  }
}
