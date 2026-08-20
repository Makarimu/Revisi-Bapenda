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
        Schema::table('permohonan', function (Blueprint $table) {
            if (!Schema::hasColumn('permohonan', 'hasil_kunjungan_pdf')) {
                $table->string('hasil_kunjungan_pdf')->nullable()->after('status');
            }
            if (!Schema::hasColumn('permohonan', 'hasil_kunjungan_uploaded_at')) {
                $table->dateTime('hasil_kunjungan_uploaded_at')->nullable()->after('hasil_kunjungan_pdf');
            }
            if (!Schema::hasColumn('permohonan', 'hasil_kunjungan_uploaded_by')) {
                $table->unsignedBigInteger('hasil_kunjungan_uploaded_by')->nullable()->after('hasil_kunjungan_uploaded_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('permohonan', function (Blueprint $table) {
            $table->dropColumn([
                'hasil_kunjungan_pdf',
                'hasil_kunjungan_uploaded_at',
                'hasil_kunjungan_uploaded_by',
            ]);
        });
    }
};
