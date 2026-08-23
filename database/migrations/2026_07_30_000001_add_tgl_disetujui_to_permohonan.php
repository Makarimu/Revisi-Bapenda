<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('permohonan', 'tgl_disetujui')) {
            Schema::table('permohonan', function (Blueprint $table) {
                $table->dateTime('tgl_disetujui')->nullable();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('permohonan', 'tgl_disetujui')) {
            Schema::table('permohonan', function (Blueprint $table) {
                $table->dropColumn('tgl_disetujui');
            });
        }
    }
};
