import { createHmac } from 'crypto';

const API_ID = process.env.SUKURUPIAH_API_ID!;
const API_KEY = process.env.SUKURUPIAH_API_KEY!;
const ENDPOINT = process.env.SUKURUPIAH_ENDPOINT!;

interface CreateInvoiceParams {
  method: string;
  name: string;
  email?: string;
  phone: string;
  amount: number;
  merchantRef: string;
  expired?: number;
  products?: Array<{
    name: string;
    qty: number;
    price: number;
  }>;
  callbackUrl: string;
  returnUrl: string;
}

interface SukurupiahInvoiceData {
  via: string;
  payment_kode: string;
  trx_id: string;
  merchant_ref: string;
  nama: string;
  email: string;
  phone: string;
  total: number;
  merchant_fee: string;
  fee: number;
  amount_merchant: number;
  date: string;
  time: string;
  expired: string;
  payment_status: string;
  qr?: string;
  payment_no?: string;
  checkout_url?: string;
}

interface CreateInvoiceResponse {
  status: string;
  message: string;
  data: SukurupiahInvoiceData[];
  produk?: Array<{
    nama_produk: string;
    qty: string;
    harga: number;
    size?: string;
    note?: string;
  }>;
}

interface CheckStatusResponse {
  status: string;
  message: string;
  data: Array<{
    status: 'pending' | 'berhasil' | 'expired';
  }>;
}

interface CheckBalanceResponse {
  status: string;
  message: string;
  data: {
    nama_merchant: string;
    balance: string;
    saldo_tersedia: string;
  };
}

export function generateSignature(apiId: string, method: string, merchantRef: string, amount: string): string {
  const dataToSign = `${apiId}${method}${merchantRef}${amount}`;
  return createHmac('sha256', API_KEY).update(dataToSign).digest('hex');
}

export async function createPaymentInvoice(params: CreateInvoiceParams): Promise<CreateInvoiceResponse> {
  const { method, name, email, phone, amount, merchantRef, expired = 24, products, callbackUrl, returnUrl } = params;

  const signature = generateSignature(API_ID, method, merchantRef, amount.toString());

  const formData = new URLSearchParams({
    api_id: API_ID,
    method,
    name,
    email: email || '',
    phone,
    amount: amount.toString(),
    merchant_ref: merchantRef,
    expired: expired.toString(),
    callback_url: callbackUrl,
    return_url: returnUrl,
    merchant_fee: '2',
    signature,
  });

  if (products && products.length > 0) {
    products.forEach((p, i) => {
      formData.append(`produk[${i}]`, p.name);
      formData.append(`qty[${i}]`, p.qty.toString());
      formData.append(`harga[${i}]`, p.price.toString());
    });
  }

  console.log('[Sukurupiah] Creating invoice:', {
    method,
    merchantRef,
    amount,
    signature,
  });

  const response = await fetch(`${ENDPOINT}create.php`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  const data = await response.json();

  console.log('[Sukurupiah] Invoice response:', JSON.stringify(data, null, 2));

  if (data.status !== '200') {
    throw new Error(`Sukurupiah API Error: ${data.message}`);
  }

  return data;
}

export async function checkPaymentStatus(trxId: string): Promise<CheckStatusResponse> {
  const formData = new URLSearchParams({
    api_id: API_ID,
    method: 'status',
    trx_id: trxId,
  });

  const response = await fetch(`${ENDPOINT}status-transaction.php`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  return response.json();
}

export async function checkBalance(): Promise<CheckBalanceResponse> {
  const formData = new URLSearchParams({
    api_id: API_ID,
    method: 'balance',
  });

  const response = await fetch(`${ENDPOINT}check_balance.php`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  return response.json();
}

export { API_ID, API_KEY, ENDPOINT };
