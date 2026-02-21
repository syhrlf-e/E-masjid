<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TromolBox extends Model
{
    /** @use HasFactory<\Database\Factories\TromolBoxFactory> */
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'qr_code',
        'location',
        'status',
    ];

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
