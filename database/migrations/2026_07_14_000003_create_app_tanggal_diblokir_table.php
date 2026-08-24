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
        Schema::create('app_tanggal_diblokir', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal')->unique();
            $table->text('keterangan')->nullable();
            $table->string('diblokir_oleh', 150)->nullable();
            $table->dateTime('tgl_diblokir');
            $table->timestamps();

            $table->index('tanggal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_tanggal_diblokir');
    }
};
