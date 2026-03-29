# Xyozi Store 🏪

Toko top-up game online (Voucher & Diamond) dengan Next.js 16, Tailwind CSS, dan Shadcn UI.

## Teknologi

- **Framework:** Next.js 16.2.1 (App Router + Turbopack)
- **Database:** MySQL + Prisma ORM
- **Styling:** Tailwind CSS v4 + Shadcn UI
- **Auth:** NextAuth.js v5
- **Payment:** Sukurupiah Payment Gateway
- **Products:** Digiflazz API (Auto top-up)
- **Notifications:** Fonnte WhatsApp API
- **Deployment:** Docker + Docker Compose

## Fitur

### Pelanggan
- [x] Halaman produk dengan filter kategori
- [x] Checkout dan pembayaran via QRIS, VA, E-Wallet
- [x] Auto top-up via Digiflazz
- [x] Notifikasi WhatsApp via Fonnte
- [x] Cek transaksi dengan Invoice ID
- [x] Voucher/diskon system
- [x] Hero banner yang bisa dikelola dari admin
- [x] SEO meta tags

### Admin
- [x] Dashboard admin dengan statistik
- [x] Manajemen produk (CRUD)
- [x] Sinkronisasi produk otomatis dari Digiflazz
- [x] Manajemen pesanan
- [x] Pengaturan website (hero banner, logo, dll)
- [x] Voucher management

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- MySQL (atau gunakan Docker MySQL)

### Development

```bash
# Install dependencies
npm install

# Setup environment
cp .env.docker .env

# Generate Prisma Client
npx prisma generate

# Push schema ke database
npx prisma db push

# Run development server
npm run dev
```

### Production dengan Docker

```bash
# 1. Setup environment
cp .env.docker .env
nano .env  # Edit sesuai production

# 2. Start containers
docker compose up -d --build

# 3. Setup database
docker compose exec app npx prisma generate
docker compose exec app npx prisma db push

# 4. View logs
docker compose logs -f app
```

### Environment Variables yang Diperlukan

```env
# Database
DATABASE_URL="mysql://user:password@host:3306/database"

# NextAuth
NEXTAUTH_URL="https://domain.com"
NEXTAUTH_SECRET="generate-dengan-openssl-rand-base64-32"

# Digiflazz
DIGIFLAZZ_ENDPOINT="https://api.digiflazz.com/v1"
DIGIFLAZZ_TESTING="false"
DIGIFLAZZ_WEBHOOK_SECRET="your-webhook-secret"

# Sukurupiah Payment
SUKURUPIAH_API_ID="ISI_API_ID"
SUKURUPIAH_API_KEY="ISI_API_KEY"
SUKURUPIAH_ENDPOINT="https://sakurupiah.id/api/"
SUKURUPIAH_CALLBACK_URL="https://domain.com/api/webhook/sukurupiah"

# Fonnte WhatsApp
FONNTE_TOKEN="ISI_FONNTE_TOKEN"
ADMIN_WA_PHONE="628123456789"
```

## Struktur Project

```
src/
├── app/
│   ├── (user)/              # Halaman customer
│   │   ├── page.tsx        # Homepage (Hero + GameGrid)
│   │   ├── produk/         # Catalog page
│   │   └── transaksi/      # Cek transaksi
│   ├── admin/               # Dashboard admin
│   │   ├── pesanan/        # Manajemen pesanan
│   │   ├── produk/         # Manajemen produk
│   │   └── pengaturan/      # Pengaturan website
│   └── api/
│       ├── webhook/        # Webhook handlers (Digiflazz, Sukurupiah)
│       └── order/          # Order API
├── components/
│   ├── home/               # Hero, GameGrid
│   ├── product/            # Product cards
│   ├── layout/             # Navbar, Footer
│   └── ui/                 # Shadcn UI components
└── lib/
    ├── actions/            # Server actions
    ├── digiflazz.ts        # Digiflazz API wrapper
    ├── sukurupiah.ts       # Sukurupiah API wrapper
    ├── whatsapp.ts         # Fonnte WhatsApp wrapper
    └── prisma.ts           # Prisma client
```

## API Providers

| Provider | Dokumentasi |
|----------|-------------|
| Digiflazz | https://digiflazz.com/docs/api |
| Sukurupiah | https://sakurupiah.id |
| Fonnte | https://docs.fonnte.com |

## Docker Commands

```bash
# Stop containers
docker compose down

# Rebuild & restart
docker compose up -d --build

# View app logs
docker compose logs -f app

# Access app shell
docker compose exec app sh

# Restart app only
docker compose restart app
```

## Troubleshooting

### Upload tidak berfungsi
1. Pastikan folder `public/uploads/` ada dan writable
2. Cek permission: `chmod 755 public/uploads/`

### WhatsApp tidak terkirim
1. Cek `FONNTE_TOKEN` valid
2. Cek `ADMIN_WA_PHONE` format (628xxx tanpa +)
3. Cek logs untuk error message

### Payment gagal
1. Pastikan credentials Sukurupiah production
2. Cek `SUKURUPIAH_CALLBACK_URL` accessible dari internet
3. Cek logs di dashboard Sukurupiah

### Webhook tidak works
1. Cek `DIGIFLAZZ_WEBHOOK_SECRET` di .env
2. Cek signature validation di logs
3. Pastikan endpoint public (bukan localhost)

## License

MIT
