<?php

namespace App\Exports;

use App\Models\Transaction;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Illuminate\Support\Carbon;

class LaporanBulananExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $month;
    protected $year;

    public function __construct($month, $year)
    {
        $this->month = $month;
        $this->year  = $year;
    }

    public function collection()
    {
        return Transaction::whereMonth('created_at', $this->month)
            ->whereYear('created_at', $this->year)
            ->orderBy('created_at', 'asc')
            ->get();
    }

    public function headings(): array
    {
        return [
            'No.',
            'Tanggal Transaksi',
            'Kategori',
            'Tipe',
            'Keterangan (Catatan)',
            'Nominal (Rp)',
        ];
    }

    public function map($transaction): array
    {
        static $no = 1;
        $tipe = $transaction->type === 'in' ? 'Pemasukan' : 'Pengeluaran';
        $kategori = strtoupper(str_replace('_', ' ', $transaction->category));
        
        return [
            $no++,
            Carbon::parse($transaction->created_at)->format('d F Y H:i:s'),
            $kategori,
            $tipe,
            $transaction->notes ?? '-',
            $transaction->amount,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
