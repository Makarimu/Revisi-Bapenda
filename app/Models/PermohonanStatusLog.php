<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PermohonanStatusLog extends Model
{
    protected $table = 'permohonan_status_logs';

    protected $fillable = [
        'permohonan_id',
        'status_lama',
        'status_baru',
        'keterangan',
        'diubah_oleh'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function permohonan(): BelongsTo
    {
        return $this->belongsTo(Permohonan::class, 'permohonan_id', 'id');
    }

    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status_baru', $status);
    }
}
