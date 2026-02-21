# TESTING STRATEGY: Sistem Manajemen Masjid Terpadu
> **Versi:** 1.0 | **Berlaku untuk:** PROJECT_CONTEXT_MASJID v3.0+
> **Filosofi:** *"Data keuangan umat tidak boleh salah. Test bukan opsional."*

---

## 1. Prinsip Dasar

Testing pada sistem ini dibagi menjadi tiga lapisan utama mengikuti **Testing Pyramid**:

```
          /\
         /  \       E2E Tests (sedikit, mahal, lambat)
        /----\
       /      \     Feature/Integration Tests (sedang)
      /--------\
     /          \   Unit Tests (banyak, murah, cepat)
    /____________\
```

Prioritas tertinggi ada pada **Feature Tests** karena sistem ini adalah aplikasi web dengan banyak interaksi antar layer (Controller → Service → DB), bukan library murni.

---

## 2. Tools & Setup

| Layer | Tool | Keterangan |
| :--- | :--- | :--- |
| **Unit & Feature Test** | **PHPUnit** (bawaan Laravel) | Wajib. Untuk semua test backend. |
| **Frontend Component Test** | **Vitest** + **React Testing Library** | Untuk komponen React kritis (form input, kalkulasi). |
| **E2E Test** | **Playwright** | Opsional di MVP. Wajib di Phase 2. |
| **Code Coverage** | **Xdebug** / **PCOV** | Target minimum coverage: **80%** untuk modul keuangan. |
| **CI Runner** | **GitHub Actions** | Test otomatis berjalan di setiap `push` ke branch `main` dan `develop`. |

### Setup Lingkungan Test
```bash
# Buat database khusus testing di PostgreSQL
createdb masjid_test

# Buat file .env.testing
cp .env .env.testing
# Edit DB_DATABASE=masjid_test di .env.testing

# Jalankan semua test
php artisan test --env=testing

# Jalankan dengan coverage report
php artisan test --coverage --min=80
```

---

## 3. Unit Tests (Backend — PHP/Laravel)

Unit test menguji satu fungsi/method secara terisolasi tanpa menyentuh database atau HTTP.

### 3.1 Kalkulasi Zakat
File: `tests/Unit/ZakatCalculatorTest.php`

Yang wajib ditest:
- Kalkulasi Zakat Fitrah: nominal per jiwa × jumlah jiwa = total benar.
- Kalkulasi Zakat Maal: amount × 2.5% = nilai zakat benar.
- Edge case: amount = 0, amount negatif, amount desimal.
- Nishab check: apakah harta mencapai nishab sebelum diwajibkan zakat.

```php
/** @test */
public function it_calculates_zakat_maal_correctly(): void
{
    $amount = 10_000_000; // Rp 10 juta
    $expectedZakat = 250_000; // 2.5%

    $result = ZakatCalculator::maal($amount);

    $this->assertEquals($expectedZakat, $result);
}

/** @test */
public function it_returns_zero_for_negative_amount(): void
{
    $result = ZakatCalculator::maal(-5000);
    $this->assertEquals(0, $result);
}
```

### 3.2 Validasi Amount
File: `tests/Unit/TransactionAmountValidationTest.php`

Yang wajib ditest:
- Amount 0 → gagal validasi.
- Amount negatif → gagal validasi.
- Amount melebihi batas maksimum (Rp 1 miliar) → gagal validasi.
- Amount valid (Rp 1 s/d Rp 999.999.999) → lolos validasi.

---

## 4. Feature Tests (Backend — Laravel HTTP Tests)

Feature test mensimulasikan HTTP request lengkap dari route hingga response, termasuk database. **Ini lapisan paling penting.**

> **Aturan:** Selalu gunakan `RefreshDatabase` trait agar setiap test dimulai dari state DB yang bersih.

### 4.1 Autentikasi & Otorisasi
File: `tests/Feature/Auth/AuthorizationTest.php`

```php
/** @test */
public function petugas_cannot_access_kas_masjid_page(): void
{
    $petugas = User::factory()->create(['role' => 'petugas_zakat']);

    $this->actingAs($petugas)
         ->get('/kas')
         ->assertForbidden(); // 403
}

/** @test */
public function bendahara_can_access_kas_masjid_page(): void
{
    $bendahara = User::factory()->create(['role' => 'bendahara']);

    $this->actingAs($bendahara)
         ->get('/kas')
         ->assertOk(); // 200
}

/** @test */
public function guest_is_redirected_to_login(): void
{
    $this->get('/dashboard')->assertRedirect('/login');
}
```

### 4.2 Transaksi Keuangan (KRITIS)
File: `tests/Feature/Transaction/TransactionTest.php`

```php
/** @test */
public function bendahara_can_create_valid_transaction(): void
{
    $bendahara = User::factory()->create(['role' => 'bendahara']);

    $response = $this->actingAs($bendahara)
         ->post('/kas', [
             'type'           => 'in',
             'category'       => 'infaq',
             'amount'         => 500_000,
             'payment_method' => 'tunai',
             'notes'          => 'Infaq Jumat 14 Juni',
         ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('transactions', [
        'amount'     => 500_000,
        'created_by' => $bendahara->id,
    ]);
}

/** @test */
public function transaction_with_zero_amount_is_rejected(): void
{
    $bendahara = User::factory()->create(['role' => 'bendahara']);

    $this->actingAs($bendahara)
         ->post('/kas', ['amount' => 0, 'type' => 'in', 'category' => 'infaq'])
         ->assertSessionHasErrors(['amount']);

    $this->assertDatabaseCount('transactions', 0);
}

/** @test */
public function petugas_cannot_create_kas_transaction(): void
{
    $petugas = User::factory()->create(['role' => 'petugas_zakat']);

    $this->actingAs($petugas)
         ->post('/kas', ['amount' => 100_000])
         ->assertForbidden();
}

/** @test */
public function transaction_creation_is_recorded_in_activity_log(): void
{
    $bendahara = User::factory()->create(['role' => 'bendahara']);

    $this->actingAs($bendahara)->post('/kas', [
        'type' => 'in', 'category' => 'infaq',
        'amount' => 200_000, 'payment_method' => 'tunai',
    ]);

    $this->assertDatabaseHas('activity_logs', [
        'user_id'    => $bendahara->id,
        'action'     => 'created',
        'table_name' => 'transactions',
    ]);
}
```

### 4.3 QR Code Tromol
File: `tests/Feature/Tromol/TromolQrTest.php`

```php
/** @test */
public function valid_signed_url_shows_input_form(): void
{
    $tromol = TromolBox::factory()->create(['status' => 'active']);
    $petugas = User::factory()->create(['role' => 'petugas_zakat']);
    $signedUrl = URL::signedRoute('tromol.input', ['tromol' => $tromol->id]);

    $this->actingAs($petugas)
         ->get($signedUrl)
         ->assertOk();
}

/** @test */
public function unsigned_url_is_rejected(): void
{
    $tromol = TromolBox::factory()->create(['status' => 'active']);
    $petugas = User::factory()->create(['role' => 'petugas_zakat']);

    $this->actingAs($petugas)
         ->get("/tromol/input/{$tromol->id}") // tanpa signature
         ->assertForbidden();
}

/** @test */
public function inactive_tromol_box_cannot_accept_input(): void
{
    $tromol = TromolBox::factory()->create(['status' => 'inactive']);
    $petugas = User::factory()->create(['role' => 'petugas_zakat']);
    $signedUrl = URL::signedRoute('tromol.input', ['tromol' => $tromol->id]);

    $this->actingAs($petugas)
         ->post($signedUrl, ['amount' => 50_000])
         ->assertForbidden();
}
```

### 4.4 Soft Delete
File: `tests/Feature/Transaction/SoftDeleteTest.php`

```php
/** @test */
public function deleted_transaction_is_not_permanently_removed(): void
{
    $bendahara = User::factory()->create(['role' => 'bendahara']);
    $transaction = Transaction::factory()->create();

    $this->actingAs($bendahara)
         ->delete("/kas/{$transaction->id}")
         ->assertRedirect();

    // Masih ada di database (soft delete)
    $this->assertSoftDeleted('transactions', ['id' => $transaction->id]);
}
```

### 4.5 Laporan Publik (Privacy Test)
File: `tests/Feature/Laporan/PublicReportPrivacyTest.php`

```php
/** @test */
public function public_report_does_not_expose_donatur_name(): void
{
    $donatur = Donatur::factory()->create(['name' => 'Bapak Rahasia']);
    Transaction::factory()->create(['donatur_id' => $donatur->id]);

    $viewer = User::factory()->create(['role' => 'viewer']);

    $response = $this->actingAs($viewer)->get('/laporan/publik');

    $response->assertOk();
    $response->assertDontSee('Bapak Rahasia');
}
```

---

## 5. Frontend Unit Tests (React + Vitest)

File: `resources/js/__tests__/`

### 5.1 Form Validasi Transaksi
```typescript
// TransactionForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { TransactionForm } from '@/components/TransactionForm'

test('menampilkan error jika amount kosong saat submit', async () => {
  render(<TransactionForm />)
  fireEvent.click(screen.getByRole('button', { name: /simpan/i }))
  expect(await screen.findByText(/nominal wajib diisi/i)).toBeInTheDocument()
})

test('tidak bisa submit jika amount melebihi batas maksimum', async () => {
  render(<TransactionForm />)
  fireEvent.change(screen.getByLabelText(/nominal/i), {
    target: { value: '9999999999' },
  })
  fireEvent.click(screen.getByRole('button', { name: /simpan/i }))
  expect(await screen.findByText(/nominal terlalu besar/i)).toBeInTheDocument()
})
```

### 5.2 Kalkulasi Zakat (Client-side Preview)
```typescript
// ZakatCalculator.test.ts
import { hitungZakatMaal } from '@/utils/zakatCalculator'

test('menghitung zakat maal 2.5% dengan benar', () => {
  expect(hitungZakatMaal(10_000_000)).toBe(250_000)
})

test('mengembalikan 0 untuk amount negatif', () => {
  expect(hitungZakatMaal(-1000)).toBe(0)
})
```

---

## 6. CI/CD Pipeline (GitHub Actions)

File: `.github/workflows/test.yml`

```yaml
name: Run Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  laravel-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: masjid_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: secret
        ports: ['5432:5432']

    steps:
      - uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.3'
          extensions: pdo_pgsql, redis
          coverage: pcov

      - name: Install Dependencies
        run: composer install --no-interaction --prefer-dist

      - name: Copy .env
        run: cp .env.testing.example .env.testing

      - name: Run Linter (Pint)
        run: ./vendor/bin/pint --test

      - name: Run Tests with Coverage
        run: php artisan test --env=testing --coverage --min=80

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
```

> **Aturan CI:** Pull Request ke `main` **tidak bisa di-merge** jika ada test yang gagal atau coverage turun di bawah 80% pada modul keuangan.

---

## 7. Checklist Sebelum Deploy ke Production

Gunakan checklist ini setiap kali akan deploy ke environment production:

- [ ] Semua test (`php artisan test`) lulus tanpa error.
- [ ] Code coverage modul keuangan ≥ 80%.
- [ ] `APP_DEBUG=false` di `.env` production.
- [ ] Tidak ada credential yang ter-hardcode di codebase (cek dengan `grep -r "password" --include="*.php" app/`).
- [ ] Migration terbaru sudah di-review dan tidak ada operasi destruktif (`dropColumn`, `dropTable`) tanpa backup terlebih dahulu.
- [ ] Backup database terbaru sudah berhasil diverifikasi.
- [ ] CSP header aktif dan tidak ada warning di browser console.
- [ ] Signed URL untuk QR Code sudah ditest secara manual di device mobile.

---

## 8. Konvensi Penamaan Test

Gunakan format deskriptif agar mudah dibaca saat ada test yang gagal di CI:

```
✅ it_calculates_zakat_maal_correctly
✅ petugas_cannot_access_kas_masjid_page
✅ unsigned_url_is_rejected
✅ deleted_transaction_is_not_permanently_removed

❌ test1
❌ testTransaction
❌ checkIfItWorks
```

> Format: `[subject]_[cannot/can]_[action]` atau `it_[does_something]_[condition]`
