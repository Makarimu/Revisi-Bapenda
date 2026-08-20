<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class KontakTelepon extends Model
{
    protected $table = 'kontak_telepon';

    protected $fillable = [
        'nomor_telepon',
        'nama_pic',
        'keterangan',
        'status',
    ];

    // Accessors & Mutators
    protected function nomorTelepon(): Attribute
    {
        return Attribute::make(
            set: fn (string $value) => preg_replace('/[^0-9]/', '', $value),
        );
    }

    // Scopes
    public function scopeAktif($query)
    {
        return $query->where('status', 'Aktif');
    }

    public function scopeNonaktif($query)
    {
        return $query->where('status', 'Nonaktif');
    }
}
