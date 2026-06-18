# Deploy KostSolo Backend ke DigitalOcean Droplet

Panduan ini memakai **Docker Compose + Caddy** (auto HTTPS). Database & storage tetap
eksternal (Neon PostgreSQL + Cloudflare R2), jadi Droplet hanya menjalankan API.

```
[Internet] --443/80--> [Caddy] --8080--> [API (Bun/Hono)]
                                              |
                          [Neon PostgreSQL] + [Cloudflare R2] + [Fonnte/SMTP]
```

---

## 1. Buat Droplet

1. Buat Droplet baru di DigitalOcean:
   - Image: **Ubuntu 24.04 LTS**
   - Plan: **Basic / Regular $6/bln** (1 vCPU, 1 GB RAM) sudah cukup untuk awal
   - Tambahkan **SSH key** kamu (lebih aman daripada password)
2. Catat **IP publik** Droplet.

---

## 2. Arahkan domain (opsional tapi disarankan)

Di DNS provider domain kamu, buat **A record**:

```
api.kostsolo.com  ->  <IP_DROPLET>
```

Tunggu propagasi (bisa beberapa menit). Tanpa domain, kamu masih bisa akses lewat IP
(lihat opsi `:80` di `Caddyfile`).

---

## 3. Login & pasang Docker

SSH ke Droplet:

```bash
ssh root@<IP_DROPLET>
```

Pasang Docker + Compose plugin:

```bash
apt update && apt upgrade -y
curl -fsSL https://get.docker.com | sh
docker version
docker compose version
```

---

## 4. Setup firewall (UFW)

```bash
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw enable
```

---

## 5. Ambil kode proyek

```bash
# via git (disarankan)
git clone <URL_REPO_KAMU> kostsolo-backend
cd kostsolo-backend
```

> Jika repo privat, setup deploy key / personal access token dulu.

---

## 6. Siapkan environment variables

Buat file `.env.digitalocean` (sudah masuk `.gitignore`, jadi tidak ke-commit):

```bash
cp .env.example .env.digitalocean
nano .env.digitalocean
```

Isi yang wajib:

- `DATABASE_URL` -> connection string Neon (`...sslmode=require`)
- `JWT_SECRET` -> string acak panjang (mis. `openssl rand -hex 32`)
- `API_PUBLIC_URL` -> `https://api.kostsolo.com` (domain production-mu)
- Kredensial R2, SMTP, dan Fonnte sesuai punyamu

---

## 7. Sesuaikan domain di Caddyfile

Edit `Caddyfile`, ganti `api.kostsolo.com` dengan domainmu.
Kalau belum punya domain, pakai blok `:80` (akses HTTP via IP).

---

## 8. Build & jalankan

```bash
docker compose up -d --build
```

Cek status & log:

```bash
docker compose ps
docker compose logs -f api
```

Saat start, container API otomatis menjalankan `prisma migrate deploy` sebelum server
naik (lihat `docker-entrypoint.sh`).

---

## 9. Uji

```bash
# dari Droplet
curl http://localhost:8080/

# dari laptop (jika pakai domain + HTTPS)
curl https://api.kostsolo.com/
```

Harus muncul: `{"ok":true,"message":"KostSolo backend running"}`.

Dokumentasi API: `https://api.kostsolo.com/docs`

---

## 10. Daftarkan webhook Fonnte

Arahkan webhook Fonnte ke:

```
https://api.kostsolo.com/fonnte/webhook
```

---

## Operasional sehari-hari

| Aksi | Perintah |
|---|---|
| Update kode terbaru | `git pull && docker compose up -d --build` |
| Lihat log | `docker compose logs -f api` |
| Restart | `docker compose restart api` |
| Stop semua | `docker compose down` |
| Migrasi DB manual | `docker compose exec api bunx prisma migrate deploy` |
| Masuk shell container | `docker compose exec api sh` |

---

## Troubleshooting

- **API restart terus** -> cek `docker compose logs api`. Biasanya env kurang
  (`Missing env: DATABASE_URL` / `JWT_SECRET`) atau DB tidak bisa diakses.
- **HTTPS gagal terbit** -> pastikan A record domain sudah mengarah ke IP Droplet dan
  port 80/443 terbuka di UFW. Caddy butuh port 80 untuk verifikasi Let's Encrypt.
- **Prisma error saat start** -> pastikan `DATABASE_URL` valid dan IP Droplet diizinkan
  di setting Neon (Neon umumnya allow all, jadi cek string koneksinya).

---

## Catatan keamanan (lanjutan, opsional)

- Buat user non-root untuk SSH dan matikan login root.
- Pasang fail2ban.
- Jangan pernah commit `.env.digitalocean`.
