<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Menambah kolom tanggal_selesai_kunjungan ke tabel permohonan.
     * Migration ini sebelumnya menggunakan PRAGMA SQLite (recreate table).
     * Diubah ke Schema Builder Laravel yang kompatibel dengan MySQL.
     * Kolom status sudah berupa VARCHAR di MySQL, tidak perlu recreate table.
     */
    public function up(): void
    {
        Schema::table('app_permohonan', function (Blueprint $table) {
            if (!Schema::hasColumn('app_permohonan', 'tanggal_selesai_kunjungan')) {
                $table->dateTime('tanggal_selesai_kunjungan')->nullable()->after('updated_at');
            }
            $table->string('status', 30)->default('Pending')->change();
        });
    }

    public function down(): void
    {
        Schema::table('app_permohonan', function (Blueprint $table) {
            if (Schema::hasColumn('app_permohonan', 'tanggal_selesai_kunjungan')) {
                $table->dropColumn('tanggal_selesai_kunjungan');
            }
        });
    }
};
