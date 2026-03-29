# Xyozi Store

Toko top-up game online dengan Next.js 16, Tailwind CSS, dan Shadcn UI.

## Teknologi

- **Framework:** Next.js 16.2.1 (App Router)
- **Database:** MySQL + Prisma ORM
- **Styling:** Tailwind CSS v4 + Shadcn UI
- **Auth:** NextAuth.js v5
- **Payment:** Sukurupiah Payment Gateway
- **Products:** Digiflazz API
- **Notifications:** Fonnte WhatsApp API

## Fitur

- [x] Halaman produk dengan filter kategori
- [x] Checkout dan pembayaran via QRIS, VA, E-Wallet
- [x] Auto top-up via Digiflazz
- [x] Notifikasi WhatsApp via Fonnte
- [x] Dashboard admin untuk manajemen produk
- [x] Sinkronisasi produk otomatis dari Digiflazz
- [x] Voucher/diskon system
- [x] Flash sale
- [x] SEO meta tags

## Deployment dengan Docker

### Development (Docker Compose)

```bash
# 1. Copy environment file
cp .env.docker .env

# 2. Start containers
docker-compose up -d

# 3. Setup database
docker-compose exec app npx prisma generate
docker-compose exec app npx prisma db push

# 4. View logs
docker-compose logs -f app
```

### Production (Docker Compose)

```bash
# 1. Setup environment
cp .env.docker .env
nano .env  # Edit credentials

# 2. Update production settings di .env:
#    - NEXTAUTH_URL=https://appp.indra-casa.my.id
#    - SUKURUPIAH_CALLBACK_URL=https://appp.indra-casa.my.id/api/webhook/sukurupiah

# 3. Start production stack
docker-compose -f docker-compose.prod.yml up -d --build

# 4. Setup database
docker-compose -f docker-compose.prod.yml exec app npx prisma generate
docker-compose -f docker-compose.prod.yml exec app npx prisma db push

# 5. View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Docker Commands Useful

```bash
# Stop containers
docker-compose down

# Rebuild & restart
docker-compose up -d --build

# View app logs
docker-compose logs -f app

# Access app shell
docker-compose exec app sh

# Restart app only
docker-compose restart app
```

---

## Persiapan Deployment

### 1. Environment Variables

Salin `.env` dan konfigurasi untuk production:

```bash
cp .env .env.local
```

Edit `.env` dengan credentials asli:

```env
# Database
DATABASE_URL="mysql://user:password@host:3306/database"

# NextAuth
NEXTAUTH_URL="https://domain.com"
NEXTAUTH_SECRET="generate-dengan-openssl-rand-base64-32"

# Digiflazz (Production)
DIGIFLAZZ_ENDPOINT="https://api.digiflazz.com/v1"
DIGIFLAZZ_TESTING="false"

# Sukurupiah (Production)
SUKURUPIAH_API_ID="ISI_API_ID"
SUKURUPIAH_API_KEY="ISI_API_KEY"
SUKURUPIAH_ENDPOINT="https://sakurupiah.id/api/"
SUKURUPIAH_CALLBACK_URL="https://domain.com/api/webhook/sukurupiah"

# Fonnte WhatsApp
FONNTE_TOKEN="ISI_FONNTE_TOKEN"

# Admin WhatsApp
ADMIN_WA_PHONE="628123456789"
```

### 2. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Push schema ke database
npx prisma db push

# (Optional) Seed data awal
npm run prisma:seed
```

### 3. Build & Start

```bash
# Install dependencies
npm install

# Build production
npm run build

# Start server
npm start
```

### 4. Process Manager (PM2)

```bash
# Install PM2
npm install -g pm2

# Buat ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'xyozistore',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 3000',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# Start
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5. Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads/ {
        alias /path/to/project/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/xyozistore /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## API Providers

### Digiflazz
- Docs: https://digiflazz.com/docs/api
- Untuk testing, set `DIGIFLAZZ_TESTING="true"` atau gunakan API key dengan prefix `dev-`

### Sukurupiah
- Docs: https://sakurupiah.id
- Sandbox: `https://sakurupiah.id/api-sanbox/`
- Production: `https://sakurupiah.id/api/`

### Fonnte
- Docs: https://docs.fonnte.com
- Token: https://docs.fonnte.com/token-api-key/

## Struktur Project

```
src/
├── app/
│   ├── (user)/              # Halaman customer
│   │   ├── produk/
│   │   └── transaksi/
│   ├── admin/               # Dashboard admin
│   │   ├── pesanan/
│   │   ├── produk/
│   │   └── pengaturan/
│   └── api/
│       ├── webhook/         # Webhook handlers
│       └── order/
├── components/
│   ├── product/
│   └── ui/
└── lib/
    ├── actions/             # Server actions
    ├── digiflazz.ts         # Digiflazz API wrapper
    ├── sukurupiah.ts        # Sukurupiah API wrapper
    └── whatsapp.ts          # Fonnte WhatsApp wrapper
```

## Troubleshooting

### Upload tidak berfungsi
1. Pastikan folder `public/uploads/` ada dan writable
2. Cek permission: `chmod 755 public/uploads/`
3. Cek Nginx alias untuk `/uploads/`

### WhatsApp tidak terkirim
1. Cek `FONNTE_TOKEN` valid
2. Cek `ADMIN_WA_PHONE` format (628xxx)
3. Cek logs untuk error message

### Payment gagal
1. Pastikan credentials Sukurupiah production (bukan sandbox)
2. Cek `SUKURUPIAH_CALLBACK_URL` accessible dari internet
3. Cek logs di dashboard Sukurupiah

## License

MIT
