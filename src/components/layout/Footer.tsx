import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-800 bg-slate-950 pt-12 pb-8">
      <div className="container mx-auto px-6 md:px-10 lg:px-12 text-center sm:text-left">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="text-2xl font-bold tracking-tighter text-white">
              XYOZI<span className="text-yellow-500 text-sm">STORE</span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Top Up Game Termurah, Tercepat, dan Terpercaya di Indonesia. 
              Proses otomatis 24 jam nonstop untuk kenyamanan gaming Anda.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Layanan</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/produk" className="hover:text-yellow-500">Semua Game</Link></li>
              <li><Link href="/produk?cat=voucher" className="hover:text-yellow-500">Voucher Game</Link></li>
              <li><Link href="/produk?cat=pulsa" className="hover:text-yellow-500">Pulsa & Data</Link></li>
              <li><Link href="/daftar-harga" className="hover:text-yellow-500">Daftar Harga</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Bantuan</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/hubungi-kami" className="hover:text-yellow-500">Hubungi Kami</Link></li>
              <li><Link href="/faq" className="hover:text-yellow-500">Tanya Jawab (FAQ)</Link></li>
              <li><Link href="/transaksi" className="hover:text-yellow-500">Cek Pesanan</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Legalitas</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/tos" className="hover:text-yellow-500">Syarat & Ketentuan</Link></li>
              <li><Link href="/privacy" className="hover:text-yellow-500">Kebijakan Privasi</Link></li>
            </ul>
          </div>
        </div>

        {/* Payment Methods Placeholder */}
        <div className="mt-16 border-t border-slate-800 pt-8">
          <p className="mb-6 text-center text-sm font-medium text-slate-500 uppercase tracking-widest">Metode Pembayaran</p>
          <div className="flex flex-wrap justify-center gap-6 grayscale opacity-60">
            {['QRIS', 'DANA', 'GOPAY', 'SHOPEEPAY', 'LINKAJA', 'OVO', 'BCA', 'BNI', 'MANDIRI'].map((item) => (
              <span key={item} className="text-xs font-bold text-white border border-slate-700 px-2 py-1 rounded">
                {item}
              </span>
            ))}
          </div>
          <p className="mt-12 text-center text-xs text-slate-600">
            © {currentYear} Xyozi Store. All rights reserved. Built with Next.js 15.
          </p>
        </div>
      </div>
    </footer>
  );
}
