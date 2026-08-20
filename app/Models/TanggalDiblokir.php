<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class TanggalDiblokir extends Model
{
    protected $table = 'tanggal_diblokir';

    protected $fillable = [
        'tanggal',
        'keterangan',
        'diblokir_oleh',
        'tgl_diblokir',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'tgl_diblokir' => 'datetime',
    ];

    // Accessors
    protected function tanggalFormat(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->tanggal ? $this->tanggal->format('d/m/Y') : null,
        );
    }

    // Scopes
    public function scopeUpcoming($query)
    {
        return $query->where('tanggal', '>=', now()->toDateString());
    }
}
