import Link from "next/link";
import { ArrowLeft, Scale, FileText, Shield, CreditCard, RefreshCw, Ban, AlertTriangle, Phone } from "lucide-react";

const content = [
  {
    number: "1",
    title: "Pengantar",
    icon: FileText,
    text: "Selamat datang di Xyozi.store. Syarat dan Ketentuan ini mengatur penggunaan Anda terhadap website dan layanan yang disediakan oleh Xyozi.store (\"Kami\", \"Perusahaan\"). Dengan mengakses atau menggunakan layanan kami, Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak menyetujui salah satu bagian dari ketentuan ini, Anda tidak diperkenankan untuk menggunakan layanan kami. Harap baca dengan seksama sebelum melakukan transaksi."
  },
  {
    number: "2",
    title: "Definisi",
    icon: FileText,
    text: null,
    list: [
      "Platform: Website, aplikasi mobile, dan semua layanan yang disediakan oleh Xyozi.store.",
      "Pengguna: Setiap individu yang mengakses atau menggunakan Platform.",
      "Layanan: Semua jasa yang disediakan melalui Platform, termasuk top up game, pembelian voucher, dan produk digital lainnya.",
      "Transaksi: Setiap pembelian produk atau layanan yang dilakukan melalui Platform.",
      "Konten: Semua informasi, teks, grafis, gambar, dan materi lain yang tersedia di Platform."
    ]
  },
  {
    number: "3",
    title: "Layanan",
    icon: Shield,
    text: "Xyozi.store menyediakan layanan top up game dan produk digital dengan ketentuan sebagai berikut:",
    list: [
      "Layanan tersedia 24/7, namun dapat terganggu untuk pemeliharaan atau keadaan di luar kendali kami.",
      "Harga produk dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya.",
      "Proses pengiriman item/diamond dilakukan secara otomatis dan biasanya selesai dalam 1-5 menit.",
      "Dalam kondisi tertentu, proses dapat memakan waktu hingga 24 jam.",
      "Kami berhak menolak atau membatalkan transaksi yang dicurigai sebagai penipuan."
    ]
  },
  {
    number: "4",
    title: "Akun Pengguna",
    icon: Shield,
    text: "Ketentuan terkait akun pengguna:",
    list: [
      "Pengguna dapat melakukan transaksi tanpa membuat akun.",
      "Jika membuat akun, pengguna bertanggung jawab menjaga kerahasiaan password.",
      "Satu orang hanya boleh memiliki satu akun.",
      "Kami berhak menonaktifkan akun yang melanggar ketentuan.",
      "Pengguna wajib memberikan informasi yang akurat dan terkini."
    ]
  },
  {
    number: "5",
    title: "Pembayaran",
    icon: CreditCard,
    text: "Ketentuan pembayaran yang berlaku:",
    list: [
      "Semua harga dalam mata uang Rupiah (IDR).",
      "Pembayaran harus diselesaikan dalam batas waktu yang ditentukan.",
      "Metode pembayaran yang tersedia termasuk transfer bank, e-wallet, minimarket, dan QRIS.",
      "Transaksi yang tidak dibayar dalam batas waktu akan otomatis dibatalkan.",
      "Biaya admin (jika ada) akan ditampilkan sebelum konfirmasi pembayaran.",
      "Kami tidak bertanggung jawab atas keterlambatan yang disebabkan oleh pihak payment gateway."
    ]
  },
  {
    number: "6",
    title: "Pengembalian Dana",
    icon: RefreshCw,
    text: "Kebijakan pengembalian dana:",
    list: [
      "Pengembalian dana dapat diajukan jika item tidak masuk dalam 24 jam setelah pembayaran berhasil.",
      "Pengembalian dana TIDAK berlaku untuk kesalahan input User ID oleh pengguna.",
      "Proses pengembalian dana memakan waktu 1-14 hari kerja tergantung metode pembayaran.",
      "Pengajuan pengembalian harus disertai bukti pembayaran dan nomor invoice.",
      "Keputusan mengenai pengembalian dana sepenuhnya menjadi hak Xyozi.store."
    ]
  },
  {
    number: "7",
    title: "Larangan",
    icon: Ban,
    text: "Pengguna dilarang untuk:",
    list: [
      "Menggunakan layanan untuk aktivitas ilegal atau penipuan.",
      "Melakukan transaksi menggunakan dana dari sumber ilegal.",
      "Mencoba mengakses sistem atau data tanpa izin.",
      "Menyebarkan virus, malware, atau kode berbahaya.",
      "Melakukan chargeback tanpa alasan yang sah.",
      "Membuat banyak akun untuk menyalahgunakan promo."
    ]
  },
  {
    number: "8",
    title: "Batasan Tanggung Jawab",
    icon: AlertTriangle,
    text: "Xyozi.store tidak bertanggung jawab atas:",
    list: [
      "Kerugian akibat kesalahan input data oleh pengguna.",
      "Gangguan layanan akibat force majeure atau keadaan di luar kendali.",
      "Tindakan pihak ketiga termasuk publisher game atau payment gateway.",
      "Perubahan kebijakan dari pihak publisher game.",
      "Kerugian tidak langsung, insidental, atau konsekuensial."
    ]
  },
  {
    number: "9",
    title: "Perubahan Ketentuan",
    icon: FileText,
    text: "Kami berhak mengubah Syarat dan Ketentuan ini kapan saja. Perubahan akan berlaku segera setelah dipublikasikan di website. Penggunaan berkelanjutan terhadap layanan kami setelah perubahan dianggap sebagai persetujuan terhadap ketentuan yang diperbarui."
  },
  {
    number: "10",
    title: "Kontak",
    icon: Phone,
    text: "Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini, silakan hubungi kami melalui halaman bantuan atau hubungi customer service kami."
  }
];

export default function TOSPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/5 border-b border-slate-800">
        <div className="container mx-auto px-6 py-5 md:px-10 lg:px-12">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-slate-400 hover:text-yellow-500 transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-xs font-medium">Kembali</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Scale size={24} className="text-yellow-500" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                Syarat & Ketentuan
              </h1>
              <p className="text-xs text-slate-400">Terakhir diperbarui: 27 Maret 2026</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-12 md:px-10 lg:px-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {content.map((section, index) => {
            const IconComponent = section.icon;
            return (
              <div 
                key={index} 
                className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden"
              >
                <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                    <IconComponent size={20} className="text-yellow-500" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider">
                      Section {section.number}
                    </span>
                    <h2 className="text-lg font-bold text-white">
                      {section.title}
                    </h2>
                  </div>
                </div>
                <div className="p-6">
                  {section.text && (
                    <p className="text-slate-300 leading-relaxed mb-4">
                      {section.text}
                    </p>
                  )}
                  {section.list && (
                    <ul className="space-y-3">
                      {section.list.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}

          {/* Footer CTA */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/5 border border-yellow-500/30 rounded-2xl p-6 text-center">
            <p className="text-slate-300 mb-4">
              Dengan menggunakan layanan kami, Anda dianggap telah membaca dan menyetujui semua Syarat & Ketentuan di atas.
            </p>
            <Link 
              href="/bantuan"
              className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-colors"
            >
              <Phone size={16} />
              Hubungi Kami
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
