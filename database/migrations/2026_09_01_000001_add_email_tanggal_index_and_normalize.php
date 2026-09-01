<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * 1. Normalize semua email ke lowercase.
     * 2. Tambahkan index komposit untuk mempercepat query duplikat cek.
     *    (Tidak bisa unique karena email+tanggal yang sama bisa ada jika status Ditolak/Dibatalkan)
     */
    public function up(): void
    {
        // 1. Normalize email ke lowercase
        DB::table('app_permohonan')->update([
            'email' => DB::raw('LOWER(TRIM(email))')
        ]);

        // 2. Tambahkan composite index untuk performa query duplikat
        Schema::table('app_permohonan', function (Blueprint $table) {
            $table->index(['email', 'tanggal_kunjungan', 'status'], 'idx_email_tanggal_status');
        });
    }

    public function down(): void
    {
        Schema::table('app_permohonan', function (Blueprint $table) {
            $table->dropIndex('idx_email_tanggal_status');
        });
    }
};
