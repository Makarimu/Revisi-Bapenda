<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('app_tanggal_diblokir', function (Blueprint $table) {
            $table->dropUnique('app_tanggal_diblokir_tanggal_unique');
            $table->unique(['tanggal', 'dinas_id'], 'app_tanggal_diblokir_tanggal_dinas_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_tanggal_diblokir', function (Blueprint $table) {
            $table->dropUnique('app_tanggal_diblokir_tanggal_dinas_unique');
            $table->unique('tanggal', 'app_tanggal_diblokir_tanggal_unique');
        });
    }
};
