<?php

namespace App\Imports;

use App\Models\Mustahiq;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\Importable;

class MustahiqImport implements ToModel, WithHeadingRow, WithValidation, SkipsOnFailure
{
    use Importable, SkipsFailures;

    private int $imported = 0;

    public function model(array $row)
    {
        $this->imported++;

        return new Mustahiq([
            'name'        => $row['nama'],
            'ashnaf'      => $row['ashnaf'] ?? $row['golongan'] ?? 'fakir',
            'address'     => $row['alamat'] ?? $row['address'] ?? null,
            'description' => $row['keterangan'] ?? $row['deskripsi'] ?? null,
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
