<?php

namespace App\Services;

class ZakatService
{
    /**
     * Hitung Zakat Maal (2.5%).
     *
     * @param  int  $amount
     * @return int
     */
    public function hitungZakatMaal(int $amount): int
    {
        if ($amount <= 0) {
            return 0;
        }

        // Menggunakan integer arithmetic untuk presisi
        // 2.5% = 2.5/100 = 25/1000 = 1/40
        return (int) ($amount * 25 / 1000);
    }

    /**
     * Hitung Zakat Fitrah (Jiwa * Nominal).
     *
     * @param  int  $jumlahJiwa
     * @param  int  $nominalPerJiwa
     * @return int
     */
    public function hitungZakatFitrah(int $jumlahJiwa, int $nominalPerJiwa): int
    {
        if ($jumlahJiwa < 0 || $nominalPerJiwa < 0) {
            return 0;
        }

        return $jumlahJiwa * $nominalPerJiwa;
    }

    /**
     * Cek apakah amount mencapai nishab.
     *
     * @param  int  $amount
     * @param  int  $nishabSaatIni
     * @return bool
     */
    public function cekNishab(int $amount, int $nishabSaatIni): bool
    {
        return $amount >= $nishabSaatIni;
    }
}
