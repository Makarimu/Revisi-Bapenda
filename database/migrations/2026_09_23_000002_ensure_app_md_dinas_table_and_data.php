<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Database\Seeders\DinasSeeder;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Pastikan tabel app_md_dinas tersedia
        if (!Schema::hasTable('app_md_dinas')) {
            Schema::create('app_md_dinas', function (Blueprint $table) {
                $table->id();
                $table->string('nama', 200);
                $table->string('singkatan', 50);
                $table->string('nomor_telepon', 50)->nullable();
                $table->double('latitude')->nullable();
                $table->double('longitude')->nullable();
                $table->timestamps();
            });
        }

        // 2. Pastikan kolom dinas_id ada di app_admins
        if (Schema::hasTable('app_admins') && !Schema::hasColumn('app_admins', 'dinas_id')) {
            Schema::table('app_admins', function (Blueprint $table) {
                $table->unsignedBigInteger('dinas_id')->nullable()->after('id');
            });
        }

        // 3. Pastikan kolom dinas_id ada di app_permohonan
        if (Schema::hasTable('app_permohonan') && !Schema::hasColumn('app_permohonan', 'dinas_id')) {
            Schema::table('app_permohonan', function (Blueprint $table) {
                $table->unsignedBigInteger('dinas_id')->nullable()->after('dinas_tujuan');
            });
        }

        // 4. Otomatis isi/perbarui 30 data Dinas & Badan saat deploy/migrate
        (new DinasSeeder())->run();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Safe down: do not drop table in production to prevent data loss
    }
};
