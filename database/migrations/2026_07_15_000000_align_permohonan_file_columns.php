<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $renames = [
            'link_surat_1' => 'surat_permohonan',
            'link_surat_2' => 'daftar_pertanyaan',
            'link_bukti_menginap' => 'bukti_menginap',
        ];

        foreach ($renames as $from => $to) {
            if (Schema::hasColumn('permohonan', $from) && !Schema::hasColumn('permohonan', $to)) {
                Schema::table('permohonan', fn ($table) => $table->renameColumn($from, $to));
            }
        }
    }

    public function down(): void
    {
        // Existing installations should retain the corrected column names.
    }
};
