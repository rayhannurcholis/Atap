# Laporan Setup Server Kampus — Backend Atap (KostSolo)

## 1. Tujuan

Melakukan setup server kampus berbasis **Proxmox VE** untuk men-*deploy* aplikasi
**Backend Atap (KostSolo)**, serta mengaktifkan **Tailscale** agar server dapat
diakses secara *remote* dari mana saja (tanpa harus berada di jaringan WiFi kampus).

---

## 2. Informasi Server

| Komponen | Nilai |
|----------|-------|
| Proxmox Web UI | `https://10.109.0.177:8006` |
| WiFi akses kampus | SSID: `D3TIGuest` / Pass: `guestd3ti` |
| Login Proxmox | User: `pbl10` / Pass: `pbl10@2026` (Realm: Proxmox VE authentication server) |
| Nama VM | `109 (pbl10)` |
| OS VM | Ubuntu 22.04.5 LTS |
| Login Linux VM | User: `root` / Pass: `root` |
| IP lokal VM (eth0) | `10.109.0.137` |
| IP Proxmox host | `10.109.0.177` |
| IP Tailscale VM | `100.118.86.91` |
| Port Backend | `8080` |

---

## 3. Arsitektur

```
[ Laptop + Tailscale ]
          |
          | (100.118.86.91)  -> remote dari mana saja
          v
[ VM Linux "pbl10" @ Proxmox ]
   |- Tailscale (remote access)
   |- PostgreSQL (database lokal)
   |- Bun + Hono (Backend Atap, port 8080)

Akses di kampus (WiFi D3TIGuest): http://10.109.0.137:8080
Akses remote (Tailscale)        : http://100.118.86.91:8080
```

---

## 4. Langkah-Langkah

### Langkah 1 — Koneksi ke Jaringan Kampus

1. Hubungkan laptop ke WiFi **D3TIGuest** (password: `guestd3ti`).
2. Pastikan dapat menjangkau Proxmox:
   ```bash
   ping 10.109.0.177
   ```

### Langkah 2 — Login ke Proxmox

1. Buka browser ke `https://10.109.0.177:8006` (abaikan peringatan SSL self-signed).
2. Login:
   - Username: `pbl10`
   - Password: `pbl10@2026`
   - Realm: `Proxmox VE authentication server`

### Langkah 3 — Menyalakan & Mengakses VM Linux

1. Pada panel kiri, pilih VM **`109 (pbl10)`**.
2. Klik **Start** bila status masih *stopped*, tunggu hingga *running*.
3. Buka **Console** (noVNC) lalu login sebagai `root` / `root`.

### Langkah 4 — Update Sistem

```bash
apt update && apt upgrade -y
apt install -y curl git unzip openssh-server
systemctl enable --now ssh
```

> Catatan: jika muncul dialog **needrestart** ("Daemons using outdated libraries"),
> pilih `<Ok>` dengan daftar default.

### Langkah 5 — Install Tailscale (Remote Access)

```bash
curl -fsSL https://tailscale.com/install.sh | sh
tailscale up
```

1. Buka link autentikasi yang muncul di browser laptop.
2. Login ke akun Tailscale, lalu *authorize* perangkat.
3. Cek IP Tailscale:
   ```bash
   tailscale ip -4      # contoh hasil: 100.118.86.91
   tailscale status
   ```
4. Install Tailscale di laptop ([tailscale.com/download](https://tailscale.com/download))
   dan login dengan akun yang sama.

### Langkah 6 — Install PostgreSQL & Buat Database

```bash
apt install -y postgresql postgresql-contrib
cd /tmp
sudo -u postgres psql -c "CREATE DATABASE kostsolo;"
sudo -u postgres psql -c "CREATE USER kostsolo WITH PASSWORD 'atap';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE kostsolo TO kostsolo;"
sudo -u postgres psql -c "ALTER DATABASE kostsolo OWNER TO kostsolo;"
```

Verifikasi koneksi:

```bash
PGPASSWORD='atap' psql -h 127.0.0.1 -U kostsolo -d kostsolo -c "SELECT 1;"
```

### Langkah 7 — Install Bun (Runtime)

```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
bun --version
```

### Langkah 8 — Clone & Konfigurasi Project

```bash
cd /root
git clone https://github.com/rayhannurcholis/Atap.git
cd Atap
```

Buat file `.env`:

```bash
nano /root/Atap/.env
```

Isi minimal:

```env
DATABASE_URL=postgresql://kostsolo:atap@127.0.0.1:5432/kostsolo
JWT_SECRET=ganti-string-random-panjang-minimal-32-karakter
API_PUBLIC_URL=http://10.109.0.137:8080
PORT=8080
```

Amankan file env:

```bash
chmod 600 /root/Atap/.env
```

### Langkah 9 — Install Dependency & Sinkronisasi Database

```bash
cd /root/Atap
bun install
export DATABASE_URL="postgresql://kostsolo:atap@127.0.0.1:5432/kostsolo"
bunx prisma db push
```

> Digunakan `prisma db push` (bukan `migrate deploy`) karena database server baru/kosong
> dan langsung disesuaikan dengan `schema.prisma`.

### Langkah 10 — Menjalankan Backend

```bash
cd /root/Atap
bun run start
```

Uji dari server:

```bash
curl http://localhost:8080
# Output: {"ok":true,"message":"KostSolo backend running"}
```

### Langkah 11 — Auto-Start dengan systemd

Agar backend hidup otomatis setiap VM dinyalakan/di-reboot.

```bash
nano /etc/systemd/system/kostsolo.service
```

Isi:

```ini
[Unit]
Description=KostSolo Backend API
After=network.target postgresql.service tailscaled.service
Wants=postgresql.service tailscaled.service

[Service]
Type=simple
User=root
WorkingDirectory=/root/Atap
ExecStart=/root/.bun/bin/bun run start
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Aktifkan:

```bash
pkill -f "bun src/index.js" 2>/dev/null
systemctl daemon-reload
systemctl start kostsolo
systemctl enable kostsolo
systemctl status kostsolo      # harus: active (running)
```

### Langkah 12 — Membuat Akun Admin (opsional)

```bash
cd /root/Atap
export DATABASE_URL="postgresql://kostsolo:atap@127.0.0.1:5432/kostsolo"
bun src/seed-admin.js
```

- Email: `admin@kostsolo.id`
- Password: `Admin12345` (ganti setelah login pertama)

---

## 5. Pengujian (Verifikasi)

### Dari server

```bash
curl http://localhost:8080
ss -tlnp | grep 8080
systemctl status kostsolo
```

### Dari laptop (CMD/PowerShell)

```powershell
tailscale status
ssh root@100.118.86.91
curl http://100.118.86.91:8080
```

### Dari browser (Chrome)

| Endpoint | URL |
|----------|-----|
| Health check | `http://100.118.86.91:8080` |
| Swagger UI | `http://100.118.86.91:8080/docs` |
| Swagger JSON | `http://100.118.86.91:8080/swagger.json` |

### Berbagi akses ke laptop lain

1. Tailscale Admin → mesin `pbl10` → **Share machine**.
2. Share via email / copy link ke akun Tailscale laptop tujuan.
3. Di laptop tujuan: login Tailscale dengan **akun yang sama dengan yang menerima share**,
   lalu pastikan `pbl10` muncul:
   ```powershell
   tailscale status
   curl http://100.118.86.91:8080
   ```

> Catatan penting: login Tailscale di **aplikasi (CMD)** harus akun yang sama dengan
> penerima share — bukan sekadar login di browser.

---

## 6. Hasil Akhir

| Item | Status |
|------|--------|
| Akses Proxmox `10.109.0.177:8006` | Berhasil |
| VM Linux `pbl10` running | Berhasil |
| Tailscale aktif (`100.118.86.91`) | Berhasil |
| PostgreSQL lokal (`kostsolo`) | Berhasil |
| Backend Atap berjalan di port `8080` | Berhasil |
| Auto-start (systemd) | Aktif |
| Akses remote dari laptop lain | Berhasil |

---

## 7. Catatan & Troubleshooting

| Masalah | Penyebab | Solusi |
|---------|----------|--------|
| `unzip is required to install bun` | Paket `unzip` belum ada | `apt install -y unzip` |
| `package.json not found` | Salah folder | `cd /root/Atap` |
| `P1000 Authentication failed` | Password DB di `.env` salah | Samakan dengan `ALTER USER ... PASSWORD` |
| `EADDRINUSE` port 8080 | Server jalan ganda | `pkill -f "bun src/index.js"` lalu start ulang |
| `Connection refused` | Backend mati | `systemctl start kostsolo` |
| `Connection timed out` (laptop lain) | Akun Tailscale app ≠ akun penerima share | Logout app Tailscale, login akun yang benar |

### Keamanan (disarankan setelah setup)

- Ganti password `root` VM dari default.
- Ganti `JWT_SECRET` dengan string acak yang kuat.
- Rotasi kredensial yang sempat ter-*expose* (SMTP, R2, WhatsApp/Fonnte).
- Pastikan `.env` ber-permission `600` dan tidak ter-*commit* ke Git.

---

## 8. Ringkasan Stack

| Lapisan | Teknologi |
|---------|-----------|
| Virtualisasi | Proxmox VE 9.1.1 |
| OS | Ubuntu 22.04.5 LTS |
| Remote Access | Tailscale |
| Runtime | Bun |
| Framework | Hono |
| Database | PostgreSQL |
| ORM | Prisma |
