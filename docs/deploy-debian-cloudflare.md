# Deploy Xyozi Store di Debian 13 + MySQL (VM sama) + Cloudflare Tunnel

Panduan ini untuk pertama kali deploy **Next.js** di server rumah (Proxmox → VM Debian 13), database MySQL di VM yang sama, dan **Cloudflare Tunnel** agar situs + webhook HTTPS bisa diakses dari internet tanpa membuka port 80/443 di router.

> **Catatan:** Proyek ini memakai **Next.js 16**, **Prisma + MySQL**, integrasi **Digiflazz** dan **Sukurupiah**. Callback pembayaran memakai route:  
> `POST /api/webhook/sukurupiah`  
> Pastikan URL publik (lewat tunnel) mengarah ke aplikasi yang sama.

---

## 0. Ringkasan arsitektur

```
Internet → Cloudflare Edge → cloudflared (di VM) → http://127.0.0.1:3000 → Next.js (next start)
                                              ↘ MySQL (localhost:3306)
```

- **Tidak perlu** NAT port 80/443 ke rumah untuk uji webhook (tunnel yang menangani HTTPS).
- **Outbound** dari VM ke `api.digiflazz.com` dan API Sukurupiah tetap dari **IP publik ISP** rumah (bukan IP tunnel). Kalau Digiflazz/Sukurupiah punya **whitelist IP**, isi dengan IP publik ISP kamu.

---

## 1. Prasyarat di VM Debian 13

- User dengan `sudo`
- Akses SSH ke VM
- Domain sudah di **Cloudflare** (DNS aktif)
- Git terpasang: `sudo apt update && sudo apt install -y git curl`

### Node.js (disarankan LTS)

Next.js 16 umumnya butuh Node versi baru (disarankan **Node 20 LTS**).

Contoh pakai NodeSource (cek dokumentasi terbaru di [NodeSource](https://github.com/nodesource/distributions)):

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

---

## 2. MySQL di VM yang sama

```bash
sudo apt install -y mariadb-server
sudo mysql_secure_installation
```

Buat database dan user (sesuaikan nama/password):

```sql
CREATE DATABASE xyozi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'xyozi'@'localhost' IDENTIFIED BY 'GANTI_PASSWORD_KUAT';
GRANT ALL PRIVILEGES ON xyozi.* TO 'xyozi'@'localhost';
FLUSH PRIVILEGES;
```

**String koneksi Prisma** (contoh):

```env
DATABASE_URL="mysql://xyozi:GANTI_PASSWORD_KUAT@localhost:3306/xyozi"
```

---

## 3. Clone repo dan install dependensi

```bash
sudo mkdir -p /opt/xyozistore
sudo chown $USER:$USER /opt/xyozistore
cd /opt/xyozistore
git clone https://github.com/indramaulin76/xyozi.storeV2.git .
npm ci
```

---

## 4. Environment (`.env` di server)

Buat file `/opt/xyozistore/.env` (jangan di-commit). Variabel yang dipakai kode (ringkasan):

| Variabel | Keterangan |
|----------|------------|
| `DATABASE_URL` | Koneksi MySQL Prisma |
| `NEXTAUTH_URL` | **Wajib di production:** URL publik situs, mis. `https://app.domain.com` — dipakai untuk `callbackUrl` & `returnUrl` Sukurupiah di `src/lib/actions/order.ts` |
| `DIGIFLAZZ_USERNAME` | Username Digiflazz |
| `DIGIFLAZZ_DEV_KEY` | Development key Digiflazz |
| `DIGIFLAZZ_ENDPOINT` | Opsional, default `https://api.digiflazz.com/v1` (`src/lib/digiflazz.ts`) |
| `DIGIFLAZZ_TESTING` | `true` / `false` (mode testing Digiflazz) |
| `DIGIFLAZZ_SIGN` | Dipakai health check dashboard ke `ping` (`src/lib/actions/dashboard.ts`) — harus sesuai aturan sign Digiflazz |
| `SUKURUPIAH_API_ID` | API ID Sukurupiah |
| `SUKURUPIAH_API_KEY` | API Key Sukurupiah |
| `SUKURUPIAH_ENDPOINT` | Base URL API (dipakai `src/lib/sukurupiah.ts` untuk create invoice), contoh sandbox dari provider |
| `SUKURUPIAH_URL` | Base URL yang **sama** dengan endpoint untuk cek `/balance` di dashboard (`src/lib/actions/dashboard.ts`) — jika beda nama env, isi keduanya konsisten ke base URL API |
| `NODE_ENV` | `production` saat `next start` |

**NextAuth v5** biasanya membutuhkan secret untuk session (mis. `AUTH_SECRET`). Jika login admin error di production, generate secret dan set di environment (cek dokumentasi NextAuth versi yang dipakai).

Contoh minimal (sesuaikan):

```env
NODE_ENV=production
NEXTAUTH_URL=https://app.domain-kamu.com

DATABASE_URL="mysql://xyozi:PASSWORD@localhost:3306/xyozi"

DIGIFLAZZ_USERNAME=...
DIGIFLAZZ_DEV_KEY=...
DIGIFLAZZ_TESTING=true

SUKURUPIAH_API_ID=...
SUKURUPIAH_API_KEY=...
SUKURUPIAH_ENDPOINT=https://sakurupiah.id/api-sanbox
SUKURUPIAH_URL=https://sakurupiah.id/api-sanbox
```

Webhook Sukurupiah akan memanggil:

`https://app.domain-kamu.com/api/webhook/sukurupiah`

Pastikan di panel Sukurupiah **callback URL** bisa diarahkan ke URL itu (atau sesuai konfigurasi mereka).

---

## 5. Prisma: schema ke database

```bash
cd /opt/xyozistore
npx prisma generate
npx prisma db push
# atau: npx prisma migrate deploy   (jika nanti pakai migrate)
```

Seed (jika ada): `npm run` lihat `package.json` — ada `prisma.seed` ke `tsx prisma/seed.ts` jika file seed ada.

---

## 6. Build aplikasi production

```bash
cd /opt/xyozistore
npm run build
```

Jika gagal, baca error TypeScript/build; perbaiki di dev lalu push lagi.

---

## 7. Jalankan Next.js dengan systemd

Buat service `next-xyozi.service` (sesuaikan path user):

```bash
sudo nano /etc/systemd/system/next-xyozi.service
```

Isi contoh:

```ini
[Unit]
Description=Xyozi Store Next.js
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/xyozistore
Environment=NODE_ENV=production
EnvironmentFile=/opt/xyozistore/.env
ExecStart=/usr/bin/npm run start -- -p 3000
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Pastikan user `www-data` bisa baca project dan menulis folder upload jika perlu:

```bash
sudo chown -R www-data:www-data /opt/xyozistore/public/uploads
```

Aktifkan:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now next-xyozi.service
sudo systemctl status next-xyozi.service
journalctl -u next-xyozi.service -f
```

Cek lokal: `curl -sI http://127.0.0.1:3000`

---

## 8. Cloudflare Tunnel (cloudflared)

### Install

Ikuti dokumentasi Cloudflare untuk Debian, atau unduh binary resmi `cloudflared`.

### Login & buat tunnel

Di **Cloudflare Zero Trust** → **Networks** → **Tunnels** → **Create tunnel**, ikuti wizard, dapatkan **token** atau file config.

### Contoh: quick tunnel dengan token

Cloudflare memberi perintah mirip:

```bash
sudo cloudflared service install <TOKEN>
```

### Public hostname

Di dashboard tunnel, set:

- **Subdomain:** `app` (atau `@`)
- **Domain:** domain kamu
- **Service type:** HTTP
- **URL:** `http://localhost:3000` (atau `http://127.0.0.1:3000`)

Pastikan **DNS** record tunnel aktif (biasanya otomatis).

### Setelah tunnel hidup

1. Buka `https://app.domain.com` — harus load Next.js.
2. Update **`NEXTAUTH_URL`** di `.env` ke URL HTTPS itu, lalu:

   ```bash
   sudo systemctl restart next-xyozi.service
   ```

3. Tes checkout kecil: pastikan `callbackUrl` di invoice Sukurupiah mengarah ke domain tunnel.

---

## 9. Upload gambar (`public/uploads`)

Aplikasi menyimpan upload ke `public/uploads/`. Pastikan:

- Folder ada dan bisa ditulis user service (`www-data`).
- Backup berkala jika production.

---

## 10. Firewall (opsional tapi disarankan)

- MySQL: hanya `127.0.0.1` (default MariaDB sering sudah benar).
- Next.js: tidak perlu expose port 3000 ke internet jika hanya lewat tunnel di mesin yang sama; kalau tunnel di host lain, sesuaikan (bind atau proxy).

---

## 11. Checklist debugging

| Masalah | Cek |
|--------|-----|
| 502 dari Cloudflare | `next-xyozi` jalan? `curl localhost:3000` |
| Webhook tidak masuk | URL HTTPS benar? `NEXTAUTH_URL` benar? Log `journalctl -u next-xyozi` |
| Sukurupiah signature error | `SUKURUPIAH_API_KEY` sama dengan panel |
| Digiflazz gagal | `DIGIFLAZZ_*`, IP whitelist, saldo |
| Prisma error | `DATABASE_URL`, MySQL jalan, `prisma db push` |

---

## 12. Pembaruan kode ke depan

```bash
cd /opt/xyozistore
git pull
npm ci
npm run build
sudo systemctl restart next-xyozi.service
```

---

## 13. File di repo yang belum di-commit (snapshot)

Jalankan di mesin dev: `git status`. Contoh isi yang sering muncul (untracked / modified):

- Perubahan/penghapusan di folder `contoh ui web/` (screenshot referensi UI)
- File lokal: `S&T.txt`, `Strukturmetodepayment.txt`
- Script sekali pakai: `fix_other_tabs.py`, `write_settings2.js`, `write_tabs.js`
- File aneh Windows: `nul`
- `public/uploads/` — aset upload; biasanya **jangan** commit isi upload production ke git (cukup `.gitkeep` jika perlu)

`api.txt` sudah di-ignore di `.gitignore` agar credential tetap lokal.

---

*Dokumen ini disusun untuk branch `main` proyek Xyozi Store. Sesuaikan path domain, user service, dan URL API Sukurupiah/Digiflazz dengan akun kamu.*
