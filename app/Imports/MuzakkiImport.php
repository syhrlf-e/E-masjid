<?php

namespace App\Imports;

use App\Models\Donatur;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\Importable;

class MuzakkiImport implements ToModel, WithHeadingRow, WithValidation, SkipsOnFailure
{
    use Importable, SkipsFailures;

    private int $imported = 0;

    public function model(array $row)
    {
        $this->imported++;

        return new Donatur([
            'name'    => $row['nama'],
            'phone'   => $row['no_hp'] ?? $row['telepon'] ?? $row['phone'] ?? null,
            'address' => $row['alamat'] ?? $row['address'] ?? null,
        ]);
    }

    public function rules(): array
    {
        return [
            'nama' => 'required|string|max:255',
        ];
    }

    public function getImportedCount(): int
    {
        return $this->imported;
    }
}
