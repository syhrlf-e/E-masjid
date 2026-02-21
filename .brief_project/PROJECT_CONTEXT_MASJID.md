# PROJECT CONTEXT: Sistem Manajemen Masjid Terpadu (Mosque Management System)
> **Versi:** 3.0 | **Last Updated:** 2025 | **Status:** Ready for Development

---

## 1. Project Overview

**Nama Project:** [Nama Aplikasi Masjid]

**Deskripsi:**
Sistem informasi manajemen masjid berbasis web yang mengintegrasikan pencatatan keuangan (kas masjid), pengelolaan Zakat (Infaq/Sedekah), dan manajemen inventaris. Sistem ini bertujuan menggantikan pencatatan manual/Excel dengan solusi digital yang transparan, aman, dan efisien.

**Target Pengguna:**
1. **Admin/Bendahara (Desktop):** Mengelola data master, melihat dashboard analitik, dan mencetak laporan.
2. **Petugas Lapangan (Mobile):** Melakukan input cepat untuk transaksi Zakat dan Kotak Amal (Tromol) menggunakan pemindaian QR Code.

---

## 2. Tech Stack & Architecture

**Core Stack:**
- **Framework:** Laravel 11 (PHP)
- **Frontend:** React (TypeScript `.tsx`) via **Inertia.js**
- **Styling:** Tailwind CSS + Lucide React Icons
- **Database:** PostgreSQL
- **Authentication:** Laravel Breeze / Jetstream (Session-based)
- **Validation Frontend:** Zod + React Hook Form
- **Queue:** Laravel Queue + Redis (untuk job notifikasi)

**Infrastructure (VPS):**
- **Server Spec:** 1 vCPU, 4GB RAM, 50GB NVMe (Ubuntu/Debian)
- **Web Server:** Nginx
- **Process Manager:** Supervisor (untuk Queue Worker)
- **Deployment:** Docker / Coolify (Recommended)
- **Cache/Queue Driver:** Redis
- **Backup Storage:** Backblaze B2 / S3-compatible

---

## 3. User Roles & Permissions (Security First)

Sistem ini menangani **DATA KEUANGAN UMAT**, keamanan adalah prioritas mutlak. Terapkan *Role-Based Access Control* (RBAC) + **Laravel Policy** untuk authorization granular di level object.

| Role | Akses & Wewenang |
| :--- | :--- |
| **Super Admin** | Full Access (CRUD User, Master Data, Audit Logs, Backup). |
| **Bendahara** | Read/Write Keuangan, Laporan, Validasi Transaksi. **TIDAK BISA** menghapus log audit atau mengelola user. |
| **Petugas Zakat** | **Create Only** (Input Transaksi Zakat/Tromol). **View Own Data** (Hanya data yang ia input hari ini). |
| **Viewer/Jamaah** | **Read Only** (Dashboard Publik/Laporan Transparansi — data yang ditampilkan harus difilter, tanpa nama donatur). |

### Authorization Rules
- Setiap Controller **wajib** menggunakan **Laravel Policy**, bukan hanya middleware role.
- Policy mencegah **Broken Object Level Authorization (BOLA)**: Petugas A tidak bisa mengakses/edit data input Petugas B hanya dengan mengganti ID di URL.
- Contoh: `$this->authorize('update', $transaction)` — Laravel Policy mengecek apakah user yang login adalah pemilik/verifikator yang valid.

---

## 4. Security Rules (Comprehensive)

### 4.1 Input & Output Security
1. **Input Validation:** Validasi **ketat** di Backend (`Laravel FormRequest`) & Frontend (`Zod`). Backend adalah source of truth.
2. **Amount Validation:** Setiap input nominal wajib memiliki **batas maksimum** yang logis di level backend (contoh: maks Rp 1.000.000.000 per transaksi tunggal) untuk mencegah input anomali/typo yang kritis.
3. **CSRF Protection:** Wajib aktif pada semua form `POST/PUT/DELETE`.
4. **XSS Prevention:** Escaping output otomatis via Blade/React. Jangan gunakan `dangerouslySetInnerHTML`.

### 4.2 Authentication & Session
5. **Session Timeout:** Sesi otomatis berakhir setelah **30 menit** tidak aktif untuk role Bendahara ke atas. Dapat dikonfigurasi di `.env`.
6. **Session Security Cookie:** Wajib set cookie dengan flag: `secure=true`, `httpOnly=true`, `SameSite=Strict`. Konfigurasi di `config/session.php`.
7. **Session Fixation Prevention:** Laravel menangani ini secara default melalui `session()->regenerate()` setelah login — **jangan diubah/di-bypass**.
8. **HTTPS Only:** Wajib enforce HTTPS di level Nginx. Redirect semua HTTP ke HTTPS.

### 4.3 QR Code & URL Security
9. **Signed URL:** URL yang di-generate dari QR Code Tromol **wajib** menggunakan **Laravel Signed URL** (`URL::signedRoute('tromol.input', ['tromol' => $id])`). URL yang tidak memiliki signature valid akan di-reject otomatis oleh middleware `ValidateSignature`.
10. **QR Validation:** Sebelum menampilkan form input, backend wajib memvalidasi bahwa `tromol_box` dengan ID tersebut berstatus **aktif** (`status = 'active'`).
11. **Akses Terbatas:** URL Scan hanya bisa diakses oleh *logged-in user* dengan role `Petugas Zakat` atau lebih tinggi.

### 4.4 Audit & Monitoring
12. **Audit Trail:** Setiap perubahan data keuangan wajib dicatat di tabel `activity_logs`. Gunakan package `spatie/laravel-activitylog` atau implementasi manual.
13. **Rate Limiting:** Terapkan pada endpoint login (`throttle:5,1`) dan input transaksi beruntun (`throttle:30,1`) via Laravel middleware.
14. **Tidak Ada Hard-coded Credentials:** Semua secrets (DB password, API keys, App Key) wajib disimpan di `.env`. **Jangan pernah commit `.env` ke repository.**

### 4.5 HTTP Security Headers (Nginx)
Tambahkan header berikut di konfigurasi Nginx untuk semua response:

```nginx
# Cegah clickjacking
add_header X-Frame-Options "SAMEORIGIN" always;

# Cegah MIME sniffing
add_header X-Content-Type-Options "nosniff" always;

# Content Security Policy — cegah XSS & injection script eksternal
add_header Content-Security-Policy "
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data:;
  connect-src 'self';
  frame-ancestors 'none';
" always;

# Force HTTPS
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# Referrer Policy
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

> **Catatan:** `unsafe-inline` pada `script-src` dapat dihapus dan diganti dengan `nonce` jika ingin CSP yang lebih ketat di fase lanjutan.

### 4.6 Data Privacy
17. **Laporan Publik (Viewer/Jamaah):** Data keuangan yang ditampilkan hanya menampilkan **nominal agregat dan kategori**, tanpa nama donatur atau data pribadi. Lindungi privasi muzakki.
18. **Data Donatur:** Field `phone` dan `address` di tabel `donaturs` harus diakses hanya oleh Bendahara ke atas.

---

## 5. Key Features & Functional Requirements

### A. Dashboard (Desktop View)
- **Statistik Real-time:** Total Saldo Kas, Total Zakat, Grafik Pemasukan.
- **Notification Center:** Stok inventaris menipis, jadwal kajian, transaksi menunggu verifikasi.

### B. Modul Zakat (Muzakki & Mustahiq)
- **CRUD Muzakki:** Simpan data donatur (Nama, No HP, Alamat).
- **Transaksi Zakat:** Zakat Maal, Fitrah, Infaq. Kalkulator otomatis.
- **Penyaluran:** Distribusi ke 8 Ashnaf.

### C. Smart Tromol (Kotak Amal QR) — Mobile Priority
- **Konsep:** Stiker QR Code unik (Signed URL) di setiap kotak fisik.
- **Alur Kerja:** Scan QR → Redirect ke Signed URL `/tromol/input/{id}?signature=...` → Validasi Signature + Login Petugas → Input Nominal → Submit.
- **Security:** Signed URL + Login Required + Validasi status kotak aktif.

### D. Manajemen Kas Masjid (General Ledger)
- Pencatatan Pemasukan (Jumat, Transfer, QRIS) & Pengeluaran (Listrik, Air, Gaji).
- Setiap transaksi memiliki `notes` (keterangan) dan `payment_method`.
- Rekapitulasi Saldo Akhir.
- Transaksi pengeluaran besar wajib diverifikasi oleh Bendahara sebelum dianggap final.

### E. Laporan (Reporting)
- Export PDF/Excel Laporan Bulanan & Tahunan.
- Laporan publik (tanpa data pribadi donatur) tersedia untuk Viewer/Jamaah.

### F. Notifications (WhatsApp Strategy)
- **Phase 1 (MVP):** Gunakan metode "Click to Chat" (`window.open` ke `wa.me`).
  - *Format:* "Assalamu'alaikum [Nama], Terima kasih telah menunaikan [Jenis] sebesar [Nominal]..."
- **Phase 2 (Automation):** Integrasi Self-Hosted WA Gateway (WAHA/Baileys) via Docker di VPS.
  - Notifikasi dikirim via **Laravel Queue Job**.
  - Jika job gagal, sistem akan **retry maksimal 3 kali** dengan jeda exponential backoff.
  - Job yang gagal setelah 3x retry akan masuk ke tabel `failed_jobs` dan memicu notifikasi ke Super Admin.

---

## 6. UI/UX Structure & Navigation

**General Rule:**
- **Desktop:** Gunakan **Sidebar** (Collapsible).
- **Mobile:** Gunakan **Bottom Navigation Bar** (Home, Scan, History, Profile). Sidebar disembunyikan.

**Struktur Menu (Sidebar):**
1. 🏠 **Dashboard** (`/dashboard`)
2. 💰 **Zakat** (Collapsible)
   - Muzakki (`/zakat/muzakki`)
   - Mustahiq (`/zakat/mustahiq`)
   - Transaksi Zakat (`/zakat/transaksi`)
3. 🗳️ **Tromol** (Collapsible)
   - Daftar Kotak (`/tromol/list`)
   - Riwayat Input (`/tromol/history`)
4. 💸 **Kas Masjid** (`/kas`)
5. 📦 **Inventaris** (`/inventaris`)
6. 📅 **Agenda** (`/agenda`)
7. 📄 **Laporan** (`/laporan`)
8. ⚙️ **Pengaturan** (`/settings`)

---

## 7. PWA & Mobile Strategy (Online-First)

Aplikasi ini didesain sebagai **Installable Web App**, bukan Offline-First App.

1. **Manifest Strategy:**
   - Wajib ada `manifest.json`.
   - `display: "standalone"` (Menghilangkan address bar browser).
   - `theme_color`: Sesuaikan dengan warna brand masjid (e.g., Emerald Green `#059669`).

2. **Offline Policy:**
   - **STRICTLY ONLINE.** Aplikasi tidak boleh mengizinkan input transaksi keuangan saat offline untuk mencegah konflik saldo (*Race Condition*).
   - Tampilkan UI toast/banner "Koneksi Terputus, Transaksi dinonaktifkan" jika internet mati.

3. **Service Worker:**
   - Hanya untuk *caching* aset statis (Logo, Font, JS, CSS).
   - **DILARANG** melakukan caching pada API Response data keuangan.

4. **Mobile UX:**
   - Gunakan *Skeleton Loading* saat fetching data agar terasa cepat seperti native app.
   - **Catatan Aksesibilitas:** Hindari `user-scalable=no` di meta viewport — melanggar WCAG 2.1. Pastikan desain form sudah responsive dan font minimum 16px pada input agar keyboard mobile tidak trigger auto-zoom.

---

## 8. Database Schema Design (PostgreSQL)

**Konvensi:** Gunakan `snake_case`. Gunakan **UUID** sebagai Primary Key. Semua tabel memiliki `created_at` & `updated_at`. Tabel kritis menggunakan **Soft Delete** (`deleted_at`) — data tidak pernah dihapus permanen.

---

### Table: `users`
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | uuid (PK) | |
| `name` | varchar(255) | |
| `email` | varchar(255) | unique |
| `password` | varchar(255) | hashed (bcrypt) |
| `role` | enum | `'super_admin', 'bendahara', 'petugas_zakat', 'viewer'` |
| `is_active` | boolean | default `true`. User dinonaktifkan, bukan dihapus. |
| `last_login_at` | timestamp | nullable |

---

### Table: `donaturs`
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | uuid (PK) | |
| `name` | varchar(255) | |
| `phone` | varchar(20) | nullable |
| `address` | text | nullable |
| `deleted_at` | timestamp | nullable. **Soft Delete** — donatur dihapus secara logis, datanya tetap ada untuk keperluan audit transaksi historis. |

---

### Table: `tromol_boxes`
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | uuid (PK) | |
| `name` | varchar(255) | e.g., "Kotak Utama Masjid" |
| `qr_code` | varchar(255) | **unique**. Menyimpan identifier unik untuk di-embed ke Signed URL. |
| `location` | varchar(255) | nullable. e.g., "Pintu Masuk Utara" |
| `status` | enum | `'active', 'inactive'`. Hanya `active` yang bisa menerima input. |

---

### Table: `transactions`
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | uuid (PK) | |
| `type` | enum | `'in', 'out'` |
| `category` | enum | `'zakat_fitrah', 'zakat_maal', 'infaq', 'infaq_tromol', 'operasional', 'gaji', 'lainnya'` |
| `amount` | **bigint** | Simpan dalam satuan **sen/rupiah penuh (integer)**. Hindari float untuk uang. |
| `payment_method` | enum | `'tunai', 'transfer', 'qris'`. nullable. |
| `notes` | text | nullable. Keterangan tambahan dari petugas/bendahara. |
| `donatur_id` | uuid (FK) | nullable → `donaturs.id` |
| `tromol_box_id` | uuid (FK) | nullable → `tromol_boxes.id` |
| `created_by` | uuid (FK) | **NOT NULL** → `users.id`. Siapa yang menginput. |
| `verified_at` | timestamp | nullable. Kapan transaksi diverifikasi. |
| `verified_by` | uuid (FK) | nullable → `users.id`. **Siapa Bendahara yang memverifikasi.** |
| `deleted_at` | timestamp | nullable. **Soft Delete** — transaksi yang dibatalkan tidak dihapus, hanya ditandai. Wajib dicatat alasannya di `activity_logs`. |

---

### Table: `activity_logs`
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | uuid (PK) | |
| `user_id` | uuid (FK) | → `users.id`. Siapa yang melakukan aksi. |
| `action` | varchar(50) | e.g., `'created', 'updated', 'deleted', 'verified'` |
| `table_name` | varchar(100) | Nama tabel yang diubah. |
| `record_id` | uuid | ID record yang diubah. |
| `old_values` | jsonb | nullable. State sebelum perubahan. |
| `new_values` | jsonb | nullable. State setelah perubahan. |
| `ip_address` | varchar(45) | IP address user saat melakukan aksi. |
| `created_at` | timestamp | **Tabel ini READ ONLY setelah insert. Tidak ada UPDATE/DELETE.** |

---

## 9. Backup & Recovery Strategy

Data keuangan masjid adalah amanah — kehilangan data **tidak bisa ditoleransi**.

1. **Automated Daily Backup:**
   - Jalankan `pg_dump` setiap hari pukul 02.00 (waktu server) via Cron/Laravel Scheduler.
   - Backup dikompresi (`.sql.gz`) dan diupload otomatis ke **Backblaze B2 / S3-compatible storage**.

2. **Retention Policy:**
   - Simpan backup **7 hari terakhir** (daily).
   - Simpan backup **4 minggu terakhir** (weekly snapshot).
   - Simpan backup **12 bulan terakhir** (monthly snapshot — penting untuk laporan tahunan).

3. **Enkripsi Backup:**
   - File backup **wajib dienkripsi** sebelum diupload ke cloud storage menggunakan GPG atau AES-256.
   - Kunci enkripsi disimpan terpisah dari file backup (jangan disimpan di VPS yang sama).
   ```bash
   # Contoh enkripsi dengan GPG
   pg_dump -U $DB_USER $DB_NAME | gzip | gpg --symmetric --cipher-algo AES256 -o backup_$(date +%Y%m%d).sql.gz.gpg
   ```

4. **Recovery Test:**
   - Lakukan uji restore backup setiap 1 bulan sekali ke environment staging untuk memastikan backup valid dan dapat dipulihkan.

5. **Command Backup (referensi lengkap):**
   ```bash
   # Backup terenkripsi (production)
   pg_dump -U $DB_USER $DB_NAME | gzip | gpg --symmetric --cipher-algo AES256 -o backup_$(date +%Y%m%d).sql.gz.gpg
   # Backup tanpa enkripsi (staging/dev)
   pg_dump -U $DB_USER $DB_NAME | gzip > backup_$(date +%Y%m%d).sql.gz
   ```

---

## 10. Standar API Response Format

Semua response dari backend (Inertia props / JSON API) harus mengikuti struktur yang konsisten agar frontend dapat handle error secara seragam.

### Success Response
```json
{
  "success": true,
  "message": "Transaksi berhasil disimpan.",
  "data": { }
}
```

### Error Response (Validasi)
```json
{
  "success": false,
  "message": "Data tidak valid.",
  "errors": {
    "amount": ["Nominal harus lebih dari 0."],
    "category": ["Kategori wajib dipilih."]
  }
}
```

### Error Response (Server / Auth)
```json
{
  "success": false,
  "message": "Anda tidak memiliki izin untuk melakukan aksi ini.",
  "errors": null
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [ ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 73
  }
}
```

> **Aturan:** Frontend wajib selalu mengecek field `success` sebelum memproses `data`. Jangan pernah assume response selalu sukses.

---

## 11. Development Rules for AI Agent

- **Strict Typing:** Selalu gunakan **TypeScript interface** untuk semua props, API response, dan state. Hindari `any`.
- **Clean Code:** Ikuti standar **PSR-12** (PHP) dan **Prettier** (JS/TS). Jalankan formatter sebelum commit.
- **Security First:** Jangan pernah hardcode credentials. Semua config sensitif via `.env`.
- **Validation:**
  - Buat `FormRequest` terpisah di Laravel untuk setiap aksi POST/PUT.
  - Validasi amount selalu menggunakan `numeric|min:1|max:1000000000`.
- **Authorization:**
  - Setiap resource action di controller wajib memanggil `$this->authorize()` menggunakan Laravel Policy yang sesuai.
- **Database:**
  - Gunakan `bigint` untuk kolom `amount` (bukan `decimal` atau `float`).
  - Semua foreign key wajib memiliki index.
  - Gunakan database **transactions** (`DB::transaction()`) untuk operasi multi-tabel yang harus atomic.
- **Error Handling:**
  - Jangan expose stack trace atau error detail ke user di production. Set `APP_DEBUG=false` di production.
  - Log error ke `storage/logs/laravel.log` atau layanan eksternal (Sentry, Bugsnag).
- **Queue Jobs:**
  - Semua job notifikasi (WA) wajib mengimplementasikan `ShouldQueue`.
  - Set `$tries = 3` dan `$backoff = [60, 120, 300]` (detik) pada setiap Job class.
