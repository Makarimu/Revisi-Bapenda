<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $columns = DB::select("PRAGMA table_info(permohonan)");
        $columnNames = array_column($columns, 'name');
        if (!in_array('tgl_disetujui', $columnNames)) {
            DB::statement('ALTER TABLE permohonan ADD COLUMN tgl_disetujui DATETIME NULL');
        }
    }

    public function down(): void
    {
        // SQLite tidak mendukung DROP COLUMN — kolom dibiarkan (safe)
    }
};
