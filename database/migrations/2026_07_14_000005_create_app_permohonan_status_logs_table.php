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
        Schema::create('app_permohonan_status_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('permohonan_id');
            $table->string('status_lama', 20)->nullable();
            $table->string('status_baru', 20);
            $table->text('keterangan')->nullable();
            $table->string('diubah_oleh', 150)->nullable();
            $table->timestamps();

            $table->foreign('permohonan_id')->references('id')->on('app_permohonan')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_permohonan_status_logs');
    }
};
