import crypto from 'crypto';
import { prisma } from './prisma';

async function getDigiflazzSettings() {
  const settings = await prisma.settings.findMany({
    where: {
      key: {
        in: ['digiflazz_username', 'digiflazz_api_key', 'digiflazz_endpoint', 'digiflazz_testing']
      }
    }
  });

  const settingsMap = settings.reduce((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {} as Record<string, string>);

  // Prioritas: database > env var
  const apiKey = settingsMap['digiflazz_api_key'] || process.env.DIGIFLAZZ_API_KEY || process.env.DIGIFLAZZ_DEV_KEY;

  // Tentukan testing mode:
  // 1. Jika ada di database, gunakan nilai database
  // 2. Jika tidak, fallback ke env var
  // 3. SAFETY: Jika API key bukan dev key, PAKSA testing = false
  let testing: boolean;
  if (settingsMap['digiflazz_testing'] !== undefined) {
    testing = settingsMap['digiflazz_testing'] === 'true';
  } else {
    testing = process.env.DIGIFLAZZ_TESTING === 'true';
  }

  // Auto-detect: Production key (tanpa prefix 'dev-') HARUS testing = false
  const isProductionKey = apiKey && !apiKey.startsWith('dev-');
  if (isProductionKey && testing) {
    console.warn('[Digiflazz] ⚠️ Production key detected but testing=true! Forcing testing=false.');
    testing = false;
  }

  console.log('[Digiflazz] Settings loaded - username:', settingsMap['digiflazz_username'] || process.env.DIGIFLAZZ_USERNAME, ', key prefix:', apiKey?.substring(0, 8) + '...', ', testing:', testing);

  return {
    username: settingsMap['digiflazz_username'] || process.env.DIGIFLAZZ_USERNAME,
    apiKey,
    endpoint: settingsMap['digiflazz_endpoint'] || process.env.DIGIFLAZZ_ENDPOINT || 'https://api.digiflazz.com/v1',
    testing
  };
}

interface DigiflazzProduct {
  buyer_sku_code: string;
  product_name: string;
  price: number;
  brand: string;
  category: string;
  type: string;
  seller_product_status: string;
  buyer_product_status: string;
}

let cachedProducts: DigiflazzProduct[] | null = null;
let cacheTime: number = 0;
let isFetching: Promise<DigiflazzProduct[]> | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function clearDigiflazzCache() {
  cachedProducts = null;
  cacheTime = 0;
  console.log('[Digiflazz] Cache cleared');
}

async function fetchPriceList(): Promise<DigiflazzProduct[]> {
  const now = Date.now();
  
  // Return cache if still valid
  if (cachedProducts && (now - cacheTime) < CACHE_DURATION) {
    console.log('[Digiflazz] Returning cached products:', cachedProducts.length);
    return cachedProducts;
  }

  // If already fetching, wait for it
  if (isFetching) {
    console.log('[Digiflazz] Already fetching, waiting...');
    return isFetching;
  }

  const settings = await getDigiflazzSettings();

  if (!settings.username || !settings.apiKey) {
    throw new Error("Digiflazz credentials not found in settings or environment variables.");
  }

  const fetchAndCache = async (): Promise<DigiflazzProduct[]> => {
    const sign = crypto.createHash('md5').update(`${settings.username}${settings.apiKey}pricelist`).digest('hex');

    console.log('[Digiflazz] Fetching price list, username:', settings.username);

    const response = await fetch(`${settings.endpoint}/price-list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cmd: 'prepaid',
        username: settings.username,
        sign: sign
      }),
    });

    const resJson = await response.json();

    console.log('[Digiflazz] Response status:', response.status);
    console.log('[Digiflazz] Response:', JSON.stringify(resJson).substring(0, 500));

    // Check for Digiflazz error response
    if (resJson.success === false || resJson.data === undefined) {
      throw new Error(resJson.message || resJson.data?.message || "Gagal mengambil data dari Digiflazz");
    }

    if (!resJson.data || !Array.isArray(resJson.data)) {
      throw new Error(resJson.data?.message || JSON.stringify(resJson));
    }

    console.log('[Digiflazz] Products fetched:', resJson.data.length);

    // Update cache
    cachedProducts = resJson.data;
    cacheTime = Date.now();
    
    return resJson.data;
  };

  isFetching = fetchAndCache();
  
  try {
    return await isFetching;
  } finally {
    isFetching = null;
  }
}

export async function fetchDigiflazzPriceList() {
  try {
    return await fetchPriceList();
  } catch (error: any) {
    console.error("fetchDigiflazzPriceList Error:", error.message);
    throw error;
  }
}

export async function checkDigiflazzProduct(skuCode: string): Promise<{ exists: boolean; product?: DigiflazzProduct; error?: string }> {
  try {
    const products = await fetchPriceList();
    const skuLower = skuCode.toLowerCase();
    
    console.log('[Digiflazz] Checking SKU:', skuCode, '-> lowercase:', skuLower);
    console.log('[Digiflazz] Total products:', products.length);
    
    const product = products.find(p => p.buyer_sku_code.toLowerCase() === skuLower);
    
    if (product) {
      console.log('[Digiflazz] Found product:', product.product_name, 'SKU:', product.buyer_sku_code);
      return { exists: true, product };
    } else {
      // Log some sample SKUs for debugging
      const sampleSkus = products.slice(0, 10).map(p => p.buyer_sku_code);
      console.log('[Digiflazz] Product not found. Sample SKUs:', sampleSkus);
      return { exists: false };
    }
  } catch (error: any) {
    console.error('[Digiflazz] Check SKU Error:', error.message);
    return { exists: false, error: error.message };
  }
}

async function generateDigiflazzSign(refId: string): Promise<string> {
  const settings = await getDigiflazzSettings();
  const dataToSign = `${settings.username}${settings.apiKey}${refId}`;
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

  const settings = await getDigiflazzSettings();

  if (!settings.username || !settings.apiKey) {
    throw new Error("Digiflazz credentials not found in settings or environment variables.");
  }

  const sign = await generateDigiflazzSign(refId);

  const requestBody: Record<string, string | boolean> = {
    username: settings.username,
    buyer_sku_code: skuCode.toLowerCase(),
    customer_no: customerNo,
    ref_id: refId,
    sign,
  };

  // Hanya kirim testing=true jika memang mode dev. Jangan kirim testing sama sekali jika false.
  if (settings.testing) {
    requestBody.testing = true;
  }

  if (zoneId) {
    requestBody.zone_id = zoneId;
  }

  console.log('[Digiflazz] Sending purchase request:', JSON.stringify(requestBody, null, 2));

  const response = await fetch(`${settings.endpoint}/transaction`, {
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

    const status = result.data?.status;
    const sn = result.data?.sn || null;
    const message = result.data?.message || result.rd || null;

    console.log(`[Digiflazz] Purchase result - status: ${status}, rc: ${result.rc}, sn: ${sn}, message: ${message}`);

    if (status === 'Sukses') {
      await prisma.order.update({
        where: { id: orderId },
        data: { 
          digiflazzStatus: 'SUCCESS',
          serialNumber: sn,
          digiflazzMessage: message,
        },
      });
      console.log(`[Digiflazz] Top-up BERHASIL untuk order ${orderId}, SN: ${sn}`);

    } else if (status === 'Pending') {
      // Kebanyakan transaksi produksi akan Pending dulu
      // Status final akan datang via webhook Digiflazz
      await prisma.order.update({
        where: { id: orderId },
        data: { 
          digiflazzStatus: 'PROCESSING',
          digiflazzMessage: message,
        },
      });
      console.log(`[Digiflazz] Top-up PROCESSING untuk order ${orderId} - menunggu webhook callback`);

    } else {
      // Gagal
      await prisma.order.update({
        where: { id: orderId },
        data: { 
          digiflazzStatus: 'FAILED',
          digiflazzMessage: message,
        },
      });
      console.log(`[Digiflazz] Top-up GAGAL untuk order ${orderId}: ${message}`);
    }

  } catch (error) {
    console.error(`[Digiflazz] Error processing top-up for order ${orderId}:`, error);

    await prisma.order.update({
      where: { id: orderId },
      data: { 
        digiflazzStatus: 'FAILED',
        digiflazzMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw error;
  }
}
