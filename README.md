# 🕌 E-Masjid

**E-Masjid** adalah sebuah sistem informasi manajemen masjid yang elegan dan mutakhir, dirancang secara komprehensif untuk membantu dewan kemakmuran masjid (DKM) dalam mengurus berbagai aspek rutinitas operasional dan administrasi jamaah.

Aplikasi ini dikembangkan modern menggunakan **Laravel 11**, **React + TypeScript**, **Inertia.js**, dan dipercantik dengan balutan **Tailwind CSS**.

## ✨ Fitur Utama

- **📊 Dashboard Interaktif**: Ikhtisar kondisi kas, grafik keluar/masuk keuangan, hingga sorotan agenda mendatang.
- **💰 Manajemen Kas (Tromol)**: Sistem pembukuan (keluar/masuk) kas masjid dengan rapi dan mendetail.
- **☪️ Modul ZakatTerintegrasi**: Administrasi penerimaan zakat (Fitrah & Maal) dari **Muzakki**, sekaligus catatan pendistribusian dana zakat kepada **Mustahiq** yang dapat difilter berdasarkan Ashnaf.
- **📅 Manajemen Agenda**: Pencatatan rencana kegiatan taklim, ibadah rutin, serta peringatan hari besar Islam.
- **🔐 Otentikasi dan Dasbor Eksekutif**: Gerbang keanggotaan tertutup (_Login/Register_) dengan rekayasa antarmuka _Guest_ bernuansa estetis.

## 🚀 Prasyarat Instalasi

1. **PHP:** `^8.2`
2. **Composer**
3. **Node.js:** `^18` (atau versi LTS terbaru) beserta **NPM**
4. Koneksi ke Database Pendukung bawaan sistem operasi Anda (MySQL/PostgreSQL/SQLite).

## 🛠️ Langkah Instalasi Lokal

```bash
# 1. Klon repositori ini
git clone https://github.com/syhrlf-e/E-masjid.git
cd manajemen_masjid

# 2. Instal pustaka PHP dan NPM
composer install
npm install

# 3. Konfigurasi Lingkungan
cp .env.example .env
php artisan key:generate

# 4. Melakukan migrasi dan tanam data (seeder) bawaan
php artisan migrate --seed

# 5. Jalankan lingkungan pengembang
# Tab Terminal 1
php artisan serve
# Tab Terminal 2
npm run dev
```

Kunjungi `http://127.0.0.1:8000` di peramban Anda. Anda dapat masuk dengan akun yang dibuat otomatis oleh seeder (misal: `super_admin@masjid.com` / Sandi: `password`).

---

_Proyek ini dikembangkan secara organik untuk memenuhi visi digitalisasi DKM modern._
