<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExportAuditLog extends Model
{
    protected $table = 'export_audit_logs';

    protected $fillable = [
        'admin_id',
        'admin_name',
        'waktu_export',
        'jumlah_data',
        'filter_used',
    ];

    protected $casts = [
        'waktu_export' => 'datetime',
        'jumlah_data'  => 'integer',
    ];
}
