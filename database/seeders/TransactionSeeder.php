<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::first();
        if (!$user) {
            $user = User::factory()->create();
        }

        $pemasukanCategories = ['infaq', 'infaq_tromol', 'lainnya'];
        $pengeluaranCategories = ['operasional', 'gaji', 'lainnya'];
        $paymentMethods = ['tunai', 'transfer', 'qris'];

        // Generate data for the last 6 months
        for ($i = 0; $i <= 6; $i++) {
            $date = Carbon::now()->subMonths($i);
            $daysInMonth = $date->daysInMonth;

            // Create 5-10 pemasukan per month
            $numPemasukan = rand(5, 10);
            for ($j = 0; $j < $numPemasukan; $j++) {
                $transactionDate = $date->copy()->day(rand(1, $daysInMonth))->setHour(rand(8, 20))->setMinute(rand(0, 59));
                Transaction::create([
                    'type' => 'in',
                    'category' => $pemasukanCategories[array_rand($pemasukanCategories)],
                    'amount' => rand(5, 50) * 100000, // 500k to 5M
                    'payment_method' => $paymentMethods[array_rand($paymentMethods)],
                    'notes' => 'Pemasukan dummy ' . $transactionDate->format('F Y'),
                    'created_by' => $user->id,
                    'verified_at' => $transactionDate,
                    'verified_by' => $user->id,
                    'created_at' => $transactionDate,
                    'updated_at' => $transactionDate,
                ]);
            }

            // Create 3-8 pengeluaran per month
            $numPengeluaran = rand(3, 8);
            for ($k = 0; $k < $numPengeluaran; $k++) {
                $transactionDate = $date->copy()->day(rand(1, $daysInMonth))->setHour(rand(8, 20))->setMinute(rand(0, 59));
                Transaction::create([
                    'type' => 'out',
                    'category' => $pengeluaranCategories[array_rand($pengeluaranCategories)],
                    'amount' => rand(1, 25) * 100000, // 100k to 2.5M
                    'payment_method' => $paymentMethods[array_rand($paymentMethods)],
                    'notes' => 'Pengeluaran dummy ' . $transactionDate->format('F Y'),
                    'created_by' => $user->id,
                    'verified_at' => $transactionDate,
                    'verified_by' => $user->id,
                    'created_at' => $transactionDate,
                    'updated_at' => $transactionDate,
                ]);
            }
        }
    }
}
