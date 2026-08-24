<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('app_permohonan', function (Blueprint $table) {
            if (!Schema::hasColumn('app_permohonan', 'tgl_disetujui')) {
                $table->dateTime('tgl_disetujui')->nullable()->after('tgl_revisi');
            }
        });
    }

    public function down(): void
    {
        Schema::table('app_permohonan', function (Blueprint $table) {
            if (Schema::hasColumn('app_permohonan', 'tgl_disetujui')) {
                $table->dropColumn('tgl_disetujui');
            }
        });
    }
};
