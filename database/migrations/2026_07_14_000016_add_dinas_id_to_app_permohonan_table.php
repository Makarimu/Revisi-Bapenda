<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('app_permohonan', function (Blueprint $table) {
            $table->unsignedBigInteger('dinas_id')->nullable()->after('dinas_tujuan');
            $table->foreign('dinas_id')->references('id')->on('app_md_dinas')->nullOnDelete();
        });

        // Map existing permohonan dinas_tujuan text to app_md_dinas id
        $permohonans = DB::table('app_permohonan')->get();
        foreach ($permohonans as $p) {
            if ($p->dinas_tujuan) {
                // Find matching dinas by name or abbreviation
                $dinas = DB::table('app_md_dinas')
                    ->where('nama', 'like', '%' . $p->dinas_tujuan . '%')
                    ->orWhere('singkatan', 'like', '%' . $p->dinas_tujuan . '%')
                    ->first();
                
                if ($dinas) {
                    DB::table('app_permohonan')
                        ->where('id', $p->id)
                        ->update(['dinas_id' => $dinas->id]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_permohonan', function (Blueprint $table) {
            $table->dropForeign(['dinas_id']);
            $table->dropColumn('dinas_id');
        });
    }
};
