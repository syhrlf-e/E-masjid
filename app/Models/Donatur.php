<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Donatur extends Model
{
    /** @use HasFactory<\Database\Factories\DonaturFactory> */
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'name',
        'phone',
        'address',
    ];

    protected $hidden = [
        'phone',
        'address',
    ];

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
