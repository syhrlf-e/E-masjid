<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Transaction;
use App\Models\Agenda;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        $kasCategories = ['infaq', 'infaq_tromol', 'operasional', 'gaji', 'lainnya'];
        $zakatCategories = ['zakat_fitrah', 'zakat_maal'];

        // 1. Total Saldo Kas (Overall)
        $totalPemasukanKas = Transaction::whereIn('category', $kasCategories)->where('type', 'in')->sum('amount');
        $totalPengeluaranKas = Transaction::whereIn('category', $kasCategories)->where('type', 'out')->sum('amount');
        $saldoTotalKas = $totalPemasukanKas - $totalPengeluaranKas;

        // 2. Metrics Bulan Ini
        $pemasukanBulanIni = Transaction::whereIn('category', $kasCategories)
            ->where('type', 'in')
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->sum('amount');

        $pengeluaranBulanIni = Transaction::whereIn('category', $kasCategories)
            ->where('type', 'out')
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->sum('amount');

        $totalZakat = Transaction::whereIn('category', $zakatCategories)
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->sum('amount');
        
        $totalTransaksiBulanIni = Transaction::whereIn('category', $kasCategories)
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->count();

        $totalKasTransactions = Transaction::whereIn('category', $kasCategories)->count();

        // 3. Five Latest Kas Transactions for Widget
        $recentTransactions = Transaction::with('creator:id,name')
            ->whereIn('category', $kasCategories)
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'category' => $item->category,
                    'type' => $item->type === 'in' ? 'pemasukan' : 'pengeluaran',
                    'amount' => $item->amount,
                    'transaction_date' => $item->created_at->format('Y-m-d'),
                    'description' => $item->notes ?? '',
                ];
            });

        // 4. Five Upcoming Agendas
        $upcomingAgendas = Agenda::where('start_time', '>=', $now)
            ->orderBy('start_time', 'asc')
            ->take(5)
            ->get()
            ->map(function ($agenda) {
                return [
                    'id' => $agenda->id,
                    'title' => $agenda->title,
                    'type' => $agenda->type,
                    'start_time' => $agenda->start_time->format('Y-m-d H:i'),
                    'location' => $agenda->location,
                ];
            });

        // 5. Chart Data (Last 6 Months Income vs Expense)
        $chartData = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthStart = $now->copy()->subMonths($i)->startOfMonth();
            $monthEnd = $now->copy()->subMonths($i)->endOfMonth();

            $income = Transaction::whereIn('category', $kasCategories)
                ->where('type', 'in')
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->sum('amount');

            $expense = Transaction::whereIn('category', $kasCategories)
                ->where('type', 'out')
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->sum('amount');

            $chartData[] = [
                'name' => $monthStart->translatedFormat('M y'), // e.g 'Jan 24'
                'pemasukan' => (float) $income,
                'pengeluaran' => (float) $expense,
            ];
        }

        return Inertia::render('Dashboard', [
            'totalSaldo' => $saldoTotalKas,
            'totalZakat' => $totalZakat,
            'totalTransaksiBulanIni' => $totalTransaksiBulanIni,
            'pemasukanBulanIni' => $pemasukanBulanIni,
            'pengeluaranBulanIni' => $pengeluaranBulanIni,
            'recentTransactions' => $recentTransactions,
            'upcomingAgendas' => $upcomingAgendas,
            'chartData' => $chartData,
            'totalKasTransactions' => $totalKasTransactions,
        ]);
    }
}
