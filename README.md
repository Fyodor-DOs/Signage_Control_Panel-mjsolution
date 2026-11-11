# Signage Control Panel

Aplikasi web full-stack untuk mengelola layar digital signage. Admin dapat mengelola perangkat (device) dan konten melalui dashboard web, sementara device client menampilkan konten yang ditetapkan dalam mode layar penuh. Status online/offline device diperbarui secara real-time melalui WebSocket tanpa perlu refresh halaman.

---

## Fitur

- Manajemen device (CRUD)
- Manajemen konten (CRUD dengan upload file ke Supabase Storage)
- Status device real-time (WebSocket, tanpa refresh)
- Attach konten ke device (konten di device langsung berubah)
- Halaman device client (tampilan konten layar penuh)
- Autentikasi JWT untuk dashboard admin
- Playlist per device tambah, hapus, urutkan, dan atur durasi konten dari dashboard

---

## Tech Stack

### Backend: Node.js + Express + ws

### Database: Supabase (PostgreSQL)

### Frontend: Next.js 15 + TypeScript + Tailwind CSS

---

## Tools Ver.

- Node.js 18 atau lebih baru
- npm atau yarn
- Akun Supabase tier gratis 

---

## Cara Instalasi

### 1. Clone repositori

```bash
git clone <url-repositori>
cd signage-control-panel
```

### 2. Konfigurasi Supabase

1. Buat project baru di [https://supabase.com](https://supabase.com).
2. Di **SQL Editor**, jalankan isi file `supabase/schema.sql` untuk membuat tabel yang dibutuhkan.
3. Buka menu **Storage**, buat bucket baru bernama `contents`, dan atur visibilitasnya menjadi **Public**.

### 3. Konfigurasi variabel lingkungan (environment variables)

**Backend (`server/`):**

Salin `.env.example` menjadi `.env` di dalam folder `server/`:

```bash
# Linux / macOS
cp server/.env.example server/.env

# Windows (PowerShell)
Copy-Item server\.env.example server\.env
```

Isi nilainya:

| Variabel | Keterangan |
|----------|------------|
| `SUPABASE_URL` | Tersedia di Project Settings > API |
| `SUPABASE_SERVICE_KEY` | Gunakan kunci `service_role` (bukan `anon`) |
| `PORT` | `4000` |
| `JWT_SECRET` | String acak yang panjang — generate dengan perintah di bawah |
| `ADMIN_USERNAME` | Username admin yang kamu inginkan |
| `ADMIN_PASSWORD` | Password admin yang kamu inginkan |

Untuk generate `JWT_SECRET` yang aman:

```bash
# Linux / macOS
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Windows (PowerShell)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Salin output-nya lalu tempel sebagai nilai `JWT_SECRET` di file `.env`.

**Frontend (`web/`):**

Salin `.env.local.example` menjadi `.env.local` di dalam folder `web/`:

```bash
# Linux / macOS
cp web/.env.local.example web/.env.local

# Windows (PowerShell)
Copy-Item web\.env.local.example web\.env.local
```

Isi nilainya:

| Variabel | Keterangan |
|----------|------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` |
| `NEXT_PUBLIC_WS_URL` | `ws://localhost:4000` |

### 4. Jalankan backend

```bash
cd server
npm install
npm run dev
```

### 5. Jalankan frontend

Buka terminal baru:

```bash
cd web
npm install
npm run dev
```

### 6. Buka aplikasi

| URL | Keterangan |
|-----|------------|
| `http://localhost:3000/login` | Halaman login admin — diarahkan ke `/dashboard/devices` setelah berhasil masuk |
| `http://localhost:3000/device` | Halaman simulasi device client |

### 7. Cara menguji fitur real-time

1. Login ke dashboard admin di satu tab browser.
2. Buka `http://localhost:3000/device?id=UUID_DEVICE` di tab kedua (UUID device bisa dilihat dari dashboard).
3. Tab device terhubung ke server WebSocket; dashboard menampilkan status device sebagai **Online**.
4. Tutup tab device; dalam beberapa detik setelah heartbeat mendeteksi pemutusan, dashboard memperbarui status menjadi **Offline**.

---

## Referensi REST API

### Autentikasi

| Method | Path | Keterangan |
|--------|------|------------|
| `POST` | `/api/auth/login` | Login dan mendapatkan token JWT |

### Devices

Semua endpoint device memerlukan header `Authorization: Bearer <token>`.

| Method | Path | Keterangan |
|--------|------|------------|
| `GET` | `/api/devices` | Ambil semua device |
| `POST` | `/api/devices` | Tambah device baru |
| `GET` | `/api/devices/:id` | Ambil satu device |
| `PUT` | `/api/devices/:id` | Perbarui device |
| `DELETE` | `/api/devices/:id` | Hapus device |
| `PUT` | `/api/devices/:id/content` | Pasang atau lepas konten dari device (body: `{ contentId: string \| null }`) |

### Contents

Semua endpoint konten memerlukan header `Authorization: Bearer <token>`.

| Method | Path | Keterangan |
|--------|------|------------|
| `GET` | `/api/contents` | Ambil semua konten |
| `POST` | `/api/contents` | Tambah konten bertipe teks |
| `GET` | `/api/contents/:id` | Ambil satu konten |
| `PUT` | `/api/contents/:id` | Perbarui konten |
| `DELETE` | `/api/contents/:id` | Hapus konten |
| `POST` | `/api/contents/upload` | Upload file gambar atau video; mengembalikan `{ url }` |

---

## Referensi WebSocket

Semua pesan berbentuk objek JSON dengan format `{ type: string, payload?: any }`.

### URL Koneksi

| Peran | URL |
|-------|-----|
| Device client | `ws://host:4000/ws?role=device&deviceId=UUID` |
| Dashboard admin | `ws://host:4000/ws?role=admin&token=JWT` |

### Tipe Pesan

| Tipe | Arah | Keterangan |
|------|------|------------|
| `device:status` | Server → Admin | Device baru online atau offline. Payload: `{ deviceId, status, last_seen }` |
| `content:update` | Server → Device | Konten baru dipasang ke device ini. Payload: `{ contentId, content }` |
| `ping` | Server → Client | Heartbeat ping. Client wajib membalas dengan `pong`. |
| `pong` | Client → Server | Balasan heartbeat. |

---

## Struktur Folder

```
signage-control-panel/
├── supabase/
│   └── schema.sql              # Skema database dan data awal (seed)
├── server/
│   └── src/
│       ├── config/             # Inisialisasi Supabase client
│       ├── controllers/        # Logika handler route
│       ├── middleware/         # JWT auth, upload file
│       ├── routes/             # Express router
│       ├── websocket/          # Server WebSocket dan tipe pesan
│       ├── types/              # Tipe TypeScript bersama
│       ├── app.ts              # Setup Express app
│       └── server.ts           # Entry point
├── web/
│   ├── app/
│   │   ├── login/              # Halaman login
│   │   ├── dashboard/          # Dashboard admin (devices, contents)
│   │   └── device/             # Halaman device client
│   ├── components/             # Komponen UI yang dapat digunakan ulang
│   ├── hooks/                  # Custom React hooks (WebSocket, auth)
│   └── lib/                    # API client, tipe bersama
└── README.md
```

