# UI FLOW SPECIFICATION — Sistem Manajemen Masjid Terpadu
> **Versi:** 1.0 | **Berlaku untuk:** PROJECT_CONTEXT_MASJID v3.0
> **Pola Layout Global:** Sidebar fixed di kiri — Konten utama di kanan.
> **Pola Form Input:** Slide-over panel dari kanan (tidak mengganti halaman).
> **Pola Konfirmasi:** Semua aksi submit transaksi keuangan wajib menampilkan dialog konfirmasi sebelum data dikirim ke backend.

---

## Konvensi Global

### Layout Desktop
```
┌─────────────────────────────────────────────────────┐
│  SIDEBAR (fixed, 260px)  │  KONTEN UTAMA (flex-1)   │
│                          │                           │
│  🕌 Nama Masjid          │  [Page Title]             │
│  ─────────────────       │                           │
│  🏠 Dashboard            │  [Konten halaman aktif]   │
│  💰 Zakat          ›     │                           │
│  🗳️  Tromol         ›     │                           │
│  💸 Kas Masjid           │                           │
│  📦 Inventaris           │                           │
│  📅 Agenda               │                           │
│  📄 Laporan              │                           │
│  ─────────────────       │                           │
│  ⚙️  Pengaturan           │                           │
│  👤 [Nama User]          │                           │
│     [Role Badge]         │                           │
└─────────────────────────────────────────────────────┘
```

### Layout Mobile
```
┌──────────────────────────┐
│  [Konten Halaman Aktif]  │
│                          │
│                          │
│                          │
├──────────────────────────┤
│  🏠    📄    🗳️    👤     │
│ Home  Kas  Scan  Profil  │
└──────────────────────────┘
```

### Slide-Over Panel (Form Input)
```
┌──────────────────────┬───────────────────────┐
│  KONTEN UTAMA        │  SLIDE-OVER PANEL     │
│  (dimmed overlay)    │  (400px, dari kanan)  │
│                      │                       │
│                      │  [Judul Form]    [✕]  │
│                      │  ─────────────────    │
│                      │  [Field 1]            │
│                      │  [Field 2]            │
│                      │  [Field 3]            │
│                      │                       │
│                      │  [Batal] [Simpan →]   │
└──────────────────────┴───────────────────────┘
```

### Dialog Konfirmasi (sebelum semua submit transaksi)
```
┌─────────────────────────────────┐
│  Konfirmasi Transaksi           │
│  ─────────────────────────────  │
│  Jenis   : Pemasukan (Infaq)    │
│  Nominal : Rp 500.000           │
│  Metode  : Tunai                │
│  Ket.    : Infaq Jumat          │
│                                 │
│  [Batal]        [✓ Konfirmasi]  │
└─────────────────────────────────┘
```

---

## 1. Dashboard

### 1.1 Tampilan Awal
Saat user membuka `/dashboard`, halaman menampilkan:

**Baris 1 — Summary Cards (4 kartu sejajar)**
- 💰 **Total Saldo Kas** — nominal saldo akhir saat ini. Warna hijau jika positif.
- 📥 **Pemasukan Bulan Ini** — total transaksi `type: in` bulan berjalan.
- 📤 **Pengeluaran Bulan Ini** — total transaksi `type: out` bulan berjalan.
- 🕌 **Total Zakat Terkumpul** — total zakat bulan berjalan.

**Baris 2 — Grafik Pemasukan vs Pengeluaran**
- Bar chart 6 bulan terakhir.
- Dua warna: hijau (pemasukan), merah (pengeluaran).
- Hover tooltip menampilkan nominal tepat.

**Baris 3 — Dua kolom**
- Kiri: **Transaksi Terbaru** — 5 transaksi terakhir (Tanggal, Kategori, Nominal, Badge status).
- Kanan: **Notifikasi** — daftar alert aktif (stok inventaris menipis, transaksi pending verifikasi).

**Skeleton Loading:** Semua kartu dan grafik menampilkan skeleton saat data masih di-fetch.

### 1.2 Interaksi
- Klik kartu **Total Saldo Kas** → navigasi ke `/kas`.
- Klik kartu **Total Zakat** → navigasi ke `/zakat/transaksi`.
- Klik item di **Transaksi Terbaru** → buka slide-over detail transaksi (read-only).
- Klik notifikasi pending verifikasi → navigasi langsung ke transaksi yang dimaksud.

---

## 2. Modul Zakat

### 2.1 Halaman Muzakki (`/zakat/muzakki`)

**Tampilan:**
- Header: Judul "Data Muzakki" + tombol **"+ Tambah Muzakki"** di kanan atas.
- Tabel kolom: No, Nama, No HP, Alamat, Total Donasi, Aksi.
- Kolom Aksi: tombol **Detail**, **Edit**, **Hapus** (Hapus hanya untuk `bendahara` ke atas).
- Search bar di atas tabel untuk filter berdasarkan nama atau nomor HP.
- Pagination 15 data per halaman.

**Flow Tambah Muzakki:**
1. Klik tombol **"+ Tambah Muzakki"**.
2. Slide-over panel terbuka dari kanan dengan form: Nama (wajib), No HP (opsional), Alamat (opsional).
3. Klik **Simpan** → dialog konfirmasi muncul menampilkan ringkasan data.
4. Klik **Konfirmasi** → data tersimpan, slide-over tertutup, tabel refresh, toast sukses muncul.

**Flow Edit Muzakki:**
1. Klik tombol **Edit** di baris tabel.
2. Slide-over panel terbuka dengan form yang sudah terisi data existing.
3. User mengubah data → klik **Simpan** → dialog konfirmasi → tersimpan.

**Flow Hapus Muzakki:**
1. Klik tombol **Hapus**.
2. Dialog konfirmasi muncul: *"Yakin ingin menghapus [Nama]? Data transaksi terkait tidak akan terhapus."*
3. Klik **Hapus** → soft delete, data hilang dari tabel, toast sukses muncul.

**Flow Detail Muzakki:**
1. Klik tombol **Detail**.
2. Slide-over panel terbuka menampilkan: data pribadi muzakki + riwayat semua transaksi donatur tersebut (tabel kecil di dalam panel).

### 2.2 Halaman Transaksi Zakat (`/zakat/transaksi`)

**Tampilan:**
- Header: Judul "Transaksi Zakat" + tombol **"+ Catat Zakat"**.
- Filter bar: dropdown Jenis Zakat (Semua / Fitrah / Maal / Infaq) + date range picker.
- Tabel kolom: Tanggal, Muzakki, Jenis, Nominal, Metode, Status, Aksi.
- Badge Status: `Pending` (kuning) / `Terverifikasi` (hijau).
- Tombol **Verifikasi** di kolom Aksi — hanya muncul untuk `bendahara` dan `super_admin` jika status masih Pending.

**Flow Catat Zakat:**
1. Klik **"+ Catat Zakat"**.
2. Slide-over terbuka dengan form:
   - Muzakki: searchable dropdown (ketik nama → muncul suggestions dari data `donaturs`). Ada opsi **"+ Muzakki Baru"** jika belum terdaftar.
   - Jenis Zakat: dropdown (Zakat Fitrah / Zakat Maal / Infaq).
   - **Jika Zakat Fitrah:** muncul field tambahan: Jumlah Jiwa + Nominal per Jiwa → sistem otomatis hitung total dan tampilkan preview di bawah field.
   - **Jika Zakat Maal:** muncul kalkulator kecil — input Jumlah Harta → sistem tampilkan preview "Zakat yang harus dibayar: Rp X (2.5%)".
   - Nominal Dibayar (pre-filled dari kalkulasi, bisa di-override manual).
   - Metode Pembayaran: Tunai / Transfer / QRIS.
   - Keterangan (opsional).
3. Klik **Simpan** → dialog konfirmasi → tersimpan.

**Flow Verifikasi:**
1. Klik tombol **Verifikasi** di baris transaksi.
2. Dialog konfirmasi: *"Verifikasi transaksi zakat Rp X atas nama [Muzakki]?"*
3. Klik **Konfirmasi** → `verified_at` dan `verified_by` terisi, badge berubah hijau.

### 2.3 Halaman Mustahiq (`/zakat/mustahiq`)

**Tampilan:**
- Tabel daftar penerima zakat (Mustahiq) dengan kolom: Nama, Kategori Ashnaf, Alamat, Aksi.
- Dropdown filter berdasarkan 8 kategori Ashnaf.
- Tombol **"+ Tambah Mustahiq"**.

**Flow sama dengan Muzakki** — Tambah, Edit, Hapus via slide-over panel.

---

## 3. Modul Tromol (QR Scan & Input)

### 3.1 Halaman Daftar Kotak (`/tromol/list`)

**Tampilan:**
- Grid kartu kotak tromol (bukan tabel) — lebih visual.
- Setiap kartu menampilkan: Nama Kotak, Lokasi, Status badge (Aktif/Nonaktif), Total Pemasukan Bulan Ini, tombol **QR Code** dan **Riwayat**.
- Tombol **"+ Tambah Kotak"** di kanan atas (hanya `bendahara` ke atas).

**Flow Tambah Kotak:**
1. Klik **"+ Tambah Kotak"**.
2. Slide-over terbuka: Nama Kotak (wajib), Lokasi (opsional).
3. Simpan → backend generate `qr_code` UUID unik otomatis → kotak tersimpan.

**Flow Cetak QR Code:**
1. Klik tombol **QR Code** di kartu.
2. Modal terbuka menampilkan QR Code besar (Signed URL ter-encode) + nama kotak.
3. Tombol **"Unduh QR"** → download sebagai PNG siap cetak.
4. Tombol **"Cetak"** → print dialog browser.

**Flow Nonaktifkan Kotak:**
1. Klik toggle status di kartu.
2. Dialog konfirmasi: *"Nonaktifkan kotak [Nama]? Kotak ini tidak akan bisa menerima input baru."*
3. Konfirmasi → status berubah, kartu tampil dengan opacity lebih rendah.

### 3.2 Halaman Input Tromol — Mobile (`/tromol/input/{id}`)

**Ini halaman khusus mobile yang diakses via scan QR Code.**

**Tampilan (full screen mobile):**
```
┌──────────────────────────┐
│  🕌 Nama Masjid          │
│  ─────────────────────   │
│  📦 Kotak Amal Utara     │
│  📍 Pintu Masuk Utara    │
│                          │
│  Nominal Infaq           │
│  ┌────────────────────┐  │
│  │  Rp               │  │
│  └────────────────────┘  │
│  [keyboard angka muncul] │
│                          │
│  Keterangan (opsional)   │
│  ┌────────────────────┐  │
│  │                    │  │
│  └────────────────────┘  │
│                          │
│  ┌────────────────────┐  │
│  │   ✓ CATAT INFAQ    │  │
│  └────────────────────┘  │
└──────────────────────────┘
```

**Flow:**
1. Petugas scan QR Code fisik di kotak tromol.
2. Browser redirect ke Signed URL → validasi signature + status kotak aktif.
3. Jika belum login → redirect ke halaman login → setelah login redirect kembali ke URL tromol.
4. Halaman input tampil dengan nama dan lokasi kotak.
5. Petugas input nominal → keyboard numpad otomatis muncul.
6. Klik **Catat Infaq** → dialog konfirmasi: *"Catat infaq Rp X untuk Kotak [Nama]?"*
7. Konfirmasi → tersimpan → tampil halaman sukses dengan animasi ✅ + nominal yang dicatat.
8. Halaman sukses menampilkan dua tombol: **"Scan Kotak Lain"** dan **"Lihat Riwayat Hari Ini"**.

### 3.3 Halaman Riwayat Input (`/tromol/history`)

**Tampilan:**
- Filter: date picker + dropdown pilih kotak.
- Tabel: Waktu, Kotak, Petugas, Nominal, Aksi.
- `Petugas Zakat` hanya melihat data yang ia input sendiri.
- `Bendahara` ke atas melihat semua data.
- Total nominal hari ini ditampilkan di atas tabel sebagai summary card.

---

## 4. Kas Masjid (`/kas`)

### 4.1 Tampilan Utama

**Header:**
- Judul "Kas Masjid" + informasi **Saldo Saat Ini** (besar, di tengah, warna hijau/merah).
- Tombol **"+ Catat Transaksi"** di kanan atas.

**Filter Bar:**
- Dropdown: Semua / Pemasukan / Pengeluaran.
- Dropdown: Semua Kategori / per kategori.
- Date range picker (default: bulan berjalan).

**Tabel Transaksi:**
- Kolom: Tanggal, Kategori, Keterangan, Nominal, Metode, Status, Aksi.
- Nominal pemasukan tampil hijau dengan prefix `+`, pengeluaran merah dengan prefix `-`.
- Badge Status: `Pending` (kuning) / `Terverifikasi` (hijau).
- Kolom Aksi: **Detail**, **Verifikasi** (jika pending + role cukup), **Hapus** (hanya `super_admin`).
- Baris total di bawah tabel: Total Pemasukan, Total Pengeluaran, Selisih.

### 4.2 Flow Catat Transaksi
1. Klik **"+ Catat Transaksi"**.
2. Slide-over terbuka dengan form:
   - Jenis: toggle button **Pemasukan** / **Pengeluaran** (bukan dropdown).
   - Kategori: dropdown berubah isinya sesuai Jenis yang dipilih.
     - Pemasukan: Infaq Jumat, Transfer, QRIS, Zakat, Lainnya.
     - Pengeluaran: Listrik, Air, Gaji, Pemeliharaan, Lainnya.
   - Nominal: input angka dengan format Rupiah otomatis.
   - Metode: Tunai / Transfer / QRIS (hanya muncul untuk Pemasukan).
   - Tanggal Transaksi: date picker (default: hari ini).
   - Keterangan: textarea opsional.
3. Klik **Simpan** → dialog konfirmasi dengan ringkasan lengkap.
4. Konfirmasi → tersimpan, slide-over tutup, tabel refresh, saldo diperbarui.

### 4.3 Flow Verifikasi Transaksi
1. Klik **Verifikasi** di baris transaksi pending.
2. Slide-over detail terbuka (read-only) menampilkan semua data transaksi.
3. Tombol **"✓ Verifikasi Transaksi"** di bawah panel.
4. Klik → dialog konfirmasi → `verified_at` dan `verified_by` terisi → badge berubah hijau.

### 4.4 Flow Hapus Transaksi (Super Admin Only)
1. Klik **Hapus** di baris transaksi.
2. Dialog konfirmasi dengan input alasan wajib diisi: *"Tuliskan alasan penghapusan..."*
3. Konfirmasi → soft delete + alasan tercatat di `activity_logs`.

---

## 5. Laporan (`/laporan`)

### 5.1 Tampilan Utama

**Filter Section:**
- Pilih Periode: dropdown Bulanan / Tahunan + year/month picker.
- Pilih Jenis Laporan: Kas Masjid / Zakat / Tromol / Semua.
- Tombol **"Tampilkan Preview"** + **"Export PDF"** + **"Export Excel"**.

### 5.2 Flow Export Laporan
1. User pilih periode dan jenis laporan.
2. Klik **"Tampilkan Preview"** → tabel ringkasan muncul di bawah filter (tanpa reload halaman).
3. Preview menampilkan: ringkasan per kategori, total pemasukan, total pengeluaran, saldo akhir.
4. Klik **"Export PDF"** → loading spinner → file PDF otomatis ter-download.
5. Klik **"Export Excel"** → loading spinner → file XLSX otomatis ter-download.

### 5.3 Laporan Publik (`/laporan/publik`)
- Dapat diakses oleh role `viewer` dan `jamaah`.
- Menampilkan ringkasan bulanan: total pemasukan per kategori, total pengeluaran per kategori, saldo akhir.
- **Tidak menampilkan** nama donatur, nama petugas, atau detail transaksi individual.
- Tersedia tombol export PDF untuk laporan transparansi.

---

## 6. Pengaturan & Manajemen User (`/settings`)

### 6.1 Halaman Pengaturan (Tabs)

Tab navigasi di dalam halaman: **Profil Saya** | **Manajemen User** | **Data Masjid** | **Keamanan**

### 6.2 Tab Profil Saya
- Form: Nama, Email (read-only setelah set), Password baru (opsional).
- Tombol **Simpan Perubahan** → dialog konfirmasi → tersimpan.

### 6.3 Tab Manajemen User (Super Admin Only)
**Tampilan:**
- Tabel: Nama, Email, Role, Status (Aktif/Nonaktif), Terakhir Login, Aksi.
- Tombol **"+ Tambah User"** di kanan atas.
- Toggle Aktif/Nonaktif langsung di tabel.

**Flow Tambah User:**
1. Klik **"+ Tambah User"**.
2. Slide-over terbuka: Nama, Email, Role (dropdown), Password sementara.
3. Simpan → dialog konfirmasi → user tersimpan.

**Flow Nonaktifkan User:**
1. Klik toggle status di baris user.
2. Dialog konfirmasi: *"Nonaktifkan akun [Nama]? User tidak bisa login sampai diaktifkan kembali."*
3. Konfirmasi → `is_active = false` → user ter-logout otomatis jika sedang aktif.

### 6.4 Tab Data Masjid (Super Admin Only)
- Form: Nama Masjid, Alamat, Logo (upload gambar), Nomor Rekening, Warna Tema.
- Data ini digunakan di header aplikasi, laporan PDF, dan notifikasi WA.

### 6.5 Tab Keamanan (Super Admin Only)
- Tampilkan **Activity Log** terbaru: tabel dengan kolom Waktu, User, Aksi, Data, IP Address.
- Filter berdasarkan user dan rentang tanggal.
- Tombol **Export Log** → download CSV.
- Informasi sesi aktif: daftar device/IP yang sedang login.

---

## 7. Komponen Global

### Toast Notification
- Muncul di pojok kanan bawah.
- Warna: hijau (sukses), merah (error), kuning (warning).
- Auto-dismiss setelah 4 detik.
- Bisa di-dismiss manual dengan klik ✕.

### Empty State
Setiap tabel yang kosong menampilkan ilustrasi + pesan kontekstual:
- Tabel transaksi kosong: *"Belum ada transaksi. Klik '+ Catat Transaksi' untuk mulai."*
- Tabel muzakki kosong: *"Belum ada data muzakki terdaftar."*

### Error State
Jika fetch data gagal (misal: server error):
- Tampilkan pesan error + tombol **"Coba Lagi"** yang me-retry request.
- Jangan tampilkan halaman kosong tanpa penjelasan.

### Konfirmasi Hapus
Semua aksi hapus (termasuk soft delete) wajib menggunakan dialog konfirmasi dengan teks yang spesifik menyebut nama/data yang akan dihapus — bukan teks generik "Yakin ingin menghapus?"
