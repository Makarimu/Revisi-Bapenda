<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('app_blacklist', function (Blueprint $table) {
            $table->id();
            $table->enum('tipe', ['email', 'instansi'])->default('email');
            $table->string('nilai', 255);
            $table->text('alasan')->nullable();
            $table->enum('status', ['aktif', 'nonaktif'])->default('aktif');
            $table->string('created_by', 150)->nullable();
            $table->timestamps();

            $table->index(['tipe', 'status']);
            $table->index(['nilai', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_blacklist');
    }
};
