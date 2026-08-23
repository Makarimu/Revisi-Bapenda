<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Menambah kolom-kolom ringkasan ke tabel permohonan.
     * Migration ini sebelumnya menggunakan PRAGMA SQLite (recreate table).
     * Diubah ke Schema Builder Laravel yang kompatibel dengan MySQL.
     */
    public function up(): void
    {
        Schema::table('permohonan', function (Blueprint $table) {
            if (!Schema::hasColumn('permohonan', 'ringkasan_pdf_path')) {
                $table->text('ringkasan_pdf_path')->nullable()->after('updated_at');
            }
            if (!Schema::hasColumn('permohonan', 'ringkasan_uploaded_at')) {
                $table->dateTime('ringkasan_uploaded_at')->nullable()->after('ringkasan_pdf_path');
            }
            if (!Schema::hasColumn('permohonan', 'ringkasan_sent_at')) {
                $table->dateTime('ringkasan_sent_at')->nullable()->after('ringkasan_uploaded_at');
            }
            if (!Schema::hasColumn('permohonan', 'ringkasan_sent_by')) {
                $table->string('ringkasan_sent_by', 200)->nullable()->after('ringkasan_sent_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('permohonan', function (Blueprint $table) {
            $columns = ['ringkasan_pdf_path', 'ringkasan_uploaded_at', 'ringkasan_sent_at', 'ringkasan_sent_by'];
            foreach ($columns as $col) {
                if (Schema::hasColumn('permohonan', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
