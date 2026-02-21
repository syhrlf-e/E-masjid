<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Carbon;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        // Viewers (Jamaah umum) dan admin/bendahara diizinkan
        abort_if(!in_array(auth()->user()->role, ['super_admin', 'bendahara', 'petugas_zakat', 'viewer']), 403, 'Akses ditolak.');
        
        $month = $request->get('month', date('m'));
        $year = $request->get('year', date('Y'));

        // Query Rekap Bulanan
        $query = Transaction::whereMonth('created_at', $month)
                            ->whereYear('created_at', $year);

        // Agregasi Bulanan
        $pemasukan = (clone $query)->where('type', 'in')->sum('amount');
        $pengeluaran = (clone $query)->where('type', 'out')->sum('amount');
        $saldo_akhir_bulan = $pemasukan - $pengeluaran;

        // Breakdown per Kategori (Pemasukan)
        $pemasukan_by_category = (clone $query)->where('type', 'in')
            ->selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->get();

        // Breakdown per Kategori (Pengeluaran)
        $pengeluaran_by_category = (clone $query)->where('type', 'out')
            ->selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->get();

        // Saldo Kas Keseluruhan (Sepanjang Waktu)
        $total_pemasukan_all = Transaction::where('type', 'in')->sum('amount');
        $total_pengeluaran_all = Transaction::where('type', 'out')->sum('amount');
        $saldo_total = $total_pemasukan_all - $total_pengeluaran_all;

        return Inertia::render('Laporan/Index', [
            'month' => $month,
            'year' => $year,
            'summary' => [
                'pemasukan_bulan_ini' => $pemasukan,
                'pengeluaran_bulan_ini' => $pengeluaran,
                'saldo_akhir_bulan' => $saldo_akhir_bulan,
                'saldo_total_kas' => $saldo_total,
            ],
            'breakdown' => [
                'pemasukan' => $pemasukan_by_category,
                'pengeluaran' => $pengeluaran_by_category,
            ]
        ]);
    }
}
