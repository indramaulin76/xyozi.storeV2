export interface PaymentMethod {
  code: string;
  name: string;
  category: 'QRIS' | 'EWALLET' | 'VIRTUAL_ACCOUNT' | 'MINIMARKET';
  feeType: 'PERCENT' | 'NOMINAL';
  feePercent?: number;
  feeNominal?: number;
  feeFixed: number;
  minAmount: number;
  maxAmount: number;
  logo: string;
  type: 'DIRECT' | 'REDIRECT';
  guide?: string;
}

export interface FeeCalculation {
  originalAmount: number;
  feeAmount: number;
  fixedFee: number;
  totalFee: number;
  totalPayment: number;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    code: 'QRIS',
    name: 'QRIS',
    category: 'QRIS',
    feeType: 'PERCENT',
    feePercent: 0.7,
    feeNominal: 350,
    feeFixed: 500,
    minAmount: 500,
    maxAmount: 2000000,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg',
    type: 'DIRECT',
    guide: '1. Buka aplikasi pembayaran (GoPay, OVO, DANA, ShopeePay, dll)\n2. Pilih menu Scan QR\n3. Scan kode QR yang ditampilkan\n4. Masukkan nominal sesuai total pembayaran\n5. Konfirmasi dan masukkan PIN\n6. Pembayaran berhasil'
  },
  {
    code: 'QRISMU',
    name: 'QRISMU',
    category: 'QRIS',
    feeType: 'PERCENT',
    feePercent: 0.8,
    feeNominal: 250,
    feeFixed: 500,
    minAmount: 500,
    maxAmount: 5000000,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg',
    type: 'DIRECT',
    guide: '1. Buka aplikasi pembayaran\n2. Pilih menu Scan QR\n3. Scan kode QR yang ditampilkan\n4. Masukkan nominal sesuai total\n5. Konfirmasi pembayaran'
  },
  {
    code: 'QRIS2',
    name: 'QRIS2',
    category: 'QRIS',
    feeType: 'PERCENT',
    feePercent: 0.9,
    feeNominal: 0,
    feeFixed: 500,
    minAmount: 100,
    maxAmount: 10000000,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg',
    type: 'DIRECT',
    guide: '1. Buka aplikasi pembayaran\n2. Scan kode QR\n3. Bayar sesuai nominal'
  },
  {
    code: 'QRISC',
    name: 'QRISC',
    category: 'QRIS',
    feeType: 'PERCENT',
    feePercent: 0.7,
    feeNominal: 100,
    feeFixed: 500,
    minAmount: 200,
    maxAmount: 20000000,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg',
    type: 'DIRECT',
    guide: '1. Buka aplikasi pembayaran\n2. Scan QR\n3. Bayar sesuai nominal'
  },
  {
    code: 'DANA',
    name: 'DANA',
    category: 'EWALLET',
    feeType: 'PERCENT',
    feePercent: 3,
    feeNominal: 0,
    feeFixed: 500,
    minAmount: 1000,
    maxAmount: 2000000,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg',
    type: 'REDIRECT',
    guide: '1. Buka aplikasi DANA\n2. Buka notifikasi pembayaran\n3. Pastikan nominal sesuai\n4. Masukkan PIN DANA\n5. Konfirmasi pembayaran'
  },
  {
    code: 'GOPAY',
    name: 'GOPAY',
    category: 'EWALLET',
    feeType: 'PERCENT',
    feePercent: 3,
    feeNominal: 0,
    feeFixed: 500,
    minAmount: 500,
    maxAmount: 5000000,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg',
    type: 'REDIRECT',
    guide: '1. Buka aplikasi Gojek/GoPay\n2. Buka notifikasi pembayaran\n3. Pastikan nominal sesuai\n4. Masukkan PIN\n5. Konfirmasi pembayaran'
  },
  {
    code: 'ShopeePay',
    name: 'ShopeePay',
    category: 'EWALLET',
    feeType: 'PERCENT',
    feePercent: 3,
    feeNominal: 0,
    feeFixed: 500,
    minAmount: 1000,
    maxAmount: 2000000,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/09/Shopee_logo.svg',
    type: 'REDIRECT',
    guide: '1. Buka aplikasi Shopee\n2. Pilih menu Shopeepay\n3. Ikuti instruksi pembayaran\n4. Konfirmasi dengan PIN'
  },
  {
    code: 'OVO',
    name: 'OVO',
    category: 'EWALLET',
    feeType: 'PERCENT',
    feePercent: 3,
    feeNominal: 0,
    feeFixed: 500,
    minAmount: 1000,
    maxAmount: 2000000,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Logo_ovo_purple.svg',
    type: 'REDIRECT',
    guide: '1. Buka aplikasi OVO\n2. Masuk ke menu pembayaran\n3. Ikuti instruksi'
  },
  {
    code: 'LinkAja',
    name: 'LinkAja',
    category: 'EWALLET',
    feeType: 'PERCENT',
    feePercent: 3,
    feeNominal: 0,
    feeFixed: 500,
    minAmount: 1000,
    maxAmount: 2000000,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/LinkAja_logo.svg',
    type: 'REDIRECT',
    guide: '1. Buka aplikasi LinkAja\n2. Pilih menu Bayar\n3. Ikuti instruksi'
  },
  {
    code: 'BCAVA',
    name: 'BCA Virtual Account',
    category: 'VIRTUAL_ACCOUNT',
    feeType: 'NOMINAL',
    feeNominal: 4900,
    feeFixed: 500,
    minAmount: 10000,
    maxAmount: 15000000,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg',
    type: 'DIRECT',
    guide: 'ATM:\n1. Masukkan kartu ATM & PIN\n2. Pilih Transfer > Ke Rek BCA VA\n3. Masukkan nomor Virtual Account\n4. Masukkan nominal\n5. Ikuti instruksi\n\nMobile Banking:\n1. Login ke myBCA\n2. Pilih Transfer > BCA VA\n3. Masukkan nomor VA\n4. Ikuti instruksi'
  },
  {
    code: 'BRIVA',
    name: 'BRI Virtual Account',
    category: 'VIRTUAL_ACCOUNT',
    feeType: 'NOMINAL',
    feeNominal: 3500,
    feeFixed: 500,
    minAmount: 10000,
    maxAmount: 10000000,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/6/68/BANK_BRI_logo.svg',
    type: 'DIRECT',
    guide: 'ATM BRI:\n1. Pilih Transfer > Ke Rek BRI\n2. Masukkan nomor VA\n3. Masukkan nominal\n4. Konfirmasi\n\nMobile Banking:\n1. Login BRImo\n2. Pilih Transfer > BRI VA\n3. Masukkan nomor VA'
  },
  {
    code: 'BNIVA',
    name: 'BNI Virtual Account',
    category: 'VIRTUAL_ACCOUNT',
    feeType: 'NOMINAL',
    feeNominal: 3500,
    feeFixed: 500,
    minAmount: 10000,
    maxAmount: 20000000,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Bank_Negara_Indonesia_1946_Logo.svg',
    type: 'DIRECT',
    guide: 'ATM BNI:\n1. Pilih Transfer > Ke Rek BNI\n2. Masukkan nomor VA\n3. Ikuti instruksi\n\nMobile Banking:\n1. Login BNIVA Mobile\n2. Pilih Transfer > VA'
  },
  {
    code: 'MANDIRIVA',
    name: 'Mandiri Virtual Account',
    category: 'VIRTUAL_ACCOUNT',
    feeType: 'NOMINAL',
    feeNominal: 3500,
    feeFixed: 500,
    minAmount: 10000,
    maxAmount: 10000000,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg',
    type: 'DIRECT',
    guide: 'ATM Mandiri:\n1. Pilih Transfer > Ke Rek Mandiri\n2. Masukkan nomor VA\n3. Ikuti instruksi\n\nLivin:\n1. Login Livin\n2. Pilih Transfer > VA'
  },
  {
    code: 'PERMATAVA',
    name: 'Permata Virtual Account',
    category: 'VIRTUAL_ACCOUNT',
    feeType: 'NOMINAL',
    feeNominal: 3500,
    feeFixed: 500,
    minAmount: 10000,
    maxAmount: 20000000,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Bank_Permata_logo.svg',
    type: 'DIRECT',
    guide: 'ATM Permata:\n1. Pilih Transfer > Virtual Account\n2. Masukkan nomor VA\n3. Ikuti instruksi'
  },
  {
    code: 'OCBC',
    name: 'OCBC Virtual Account',
    category: 'VIRTUAL_ACCOUNT',
    feeType: 'NOMINAL',
    feeNominal: 3500,
    feeFixed: 500,
    minAmount: 10000,
    maxAmount: 10000000,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/OCBC_logo.svg',
    type: 'DIRECT',
    guide: 'ATM OCBC:\n1. Pilih Transfer\n2. Masukkan nomor VA\n3. Ikuti instruksi'
  },
  {
    code: 'BSIVA',
    name: 'BSI Virtual Account',
    category: 'VIRTUAL_ACCOUNT',
    feeType: 'NOMINAL',
    feeNominal: 3500,
    feeFixed: 500,
    minAmount: 10000,
    maxAmount: 20000000,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/BSI_logo.svg',
    type: 'DIRECT',
    guide: 'ATM BSI:\n1. Pilih Transfer\n2. Masukkan nomor VA\n3. Ikuti instruksi'
  },
  {
    code: 'MUAMALAT',
    name: 'Muamalat Virtual Account',
    category: 'VIRTUAL_ACCOUNT',
    feeType: 'NOMINAL',
    feeNominal: 3500,
    feeFixed: 500,
    minAmount: 10000,
    maxAmount: 15000000,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c0/Bank_Muamalat_Logo.svg',
    type: 'DIRECT',
    guide: 'ATM Muamalat:\n1. Pilih Transfer\n2. Masukkan nomor VA\n3. Ikuti instruksi'
  },
  {
    code: 'CIMBVA',
    name: 'CIMB NIAGA Virtual Account',
    category: 'VIRTUAL_ACCOUNT',
    feeType: 'NOMINAL',
    feeNominal: 3500,
    feeFixed: 500,
    minAmount: 10000,
    maxAmount: 10000000,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/CIMB_Niaga_logo.svg',
    type: 'DIRECT',
    guide: 'ATM CIMB:\n1. Pilih Transfer\n2. Masukkan nomor VA\n3. Ikuti instruksi'
  },
  {
    code: 'BAGVA',
    name: 'BAG Virtual Account',
    category: 'VIRTUAL_ACCOUNT',
    feeType: 'NOMINAL',
    feeNominal: 4200,
    feeFixed: 500,
    minAmount: 10000,
    maxAmount: 15000000,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Bank_Artos_logo.svg',
    type: 'DIRECT',
    guide: '1. Transfer ke nomor VA yang tertera\n2. Ikuti instruksi'
  },
  {
    code: 'ALFAMART',
    name: 'Alfamart',
    category: 'MINIMARKET',
    feeType: 'NOMINAL',
    feeNominal: 3000,
    feeFixed: 500,
    minAmount: 10000,
    maxAmount: 5000000,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Alfamart_Logo.svg',
    type: 'DIRECT',
    guide: '1. Kunjungi Alfamart terdekat\n2. Beritahu kasir ingin bayar VA\n3. Berikan nomor Virtual Account\n4. Bayar sesuai nominal\n5. Simpan struk sebagai bukti'
  },
  {
    code: 'INDOMARET',
    name: 'Indomaret',
    category: 'MINIMARKET',
    feeType: 'NOMINAL',
    feeNominal: 3000,
    feeFixed: 500,
    minAmount: 10000,
    maxAmount: 2500000,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Indomaret_logo.svg',
    type: 'DIRECT',
    guide: '1. Kunjungi Indomaret terdekat\n2. Beritahu kasir ingin bayar VA\n3. Berikan nomor Virtual Account\n4. Bayar sesuai nominal\n5. Simpan struk sebagai bukti'
  }
];

export function getPaymentMethod(code: string): PaymentMethod | undefined {
  return PAYMENT_METHODS.find(m => m.code === code);
}

export function getPaymentMethodsByCategory(): Record<string, PaymentMethod[]> {
  return {
    QRIS: PAYMENT_METHODS.filter(m => m.category === 'QRIS'),
    EWALLET: PAYMENT_METHODS.filter(m => m.category === 'EWALLET'),
    VIRTUAL_ACCOUNT: PAYMENT_METHODS.filter(m => m.category === 'VIRTUAL_ACCOUNT'),
    MINIMARKET: PAYMENT_METHODS.filter(m => m.category === 'MINIMARKET'),
  };
}

export function calculateFee(paymentCode: string, amount: number): FeeCalculation {
  const method = getPaymentMethod(paymentCode);

  if (!method) {
    throw new Error(`Metode pembayaran '${paymentCode}' tidak ditemukan`);
  }

  if (amount < method.minAmount) {
    throw new Error(`Minimal nominal adalah Rp ${method.minAmount.toLocaleString('id-ID')}`);
  }

  if (amount > method.maxAmount) {
    throw new Error(`Maksimal nominal adalah Rp ${method.maxAmount.toLocaleString('id-ID')}`);
  }

  let feeAmount = 0;
  if (method.feeType === 'PERCENT' && method.feePercent) {
    feeAmount = Math.ceil(amount * (method.feePercent / 100));
  } else if (method.feeType === 'NOMINAL' && method.feeNominal) {
    feeAmount = method.feeNominal;
  }

  const fixedFee = method.feeFixed;
  const totalFee = feeAmount + fixedFee;
  const totalPayment = amount + totalFee;

  return {
    originalAmount: amount,
    feeAmount,
    fixedFee,
    totalFee,
    totalPayment
  };
}

export function formatPaymentGuide(code: string): string {
  const method = getPaymentMethod(code);
  return method?.guide || 'Ikuti instruksi pembayaran yang tertera.';
}
