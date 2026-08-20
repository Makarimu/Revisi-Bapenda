<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('permohonan_id')->constrained('permohonan')->onDelete('cascade');
            $table->tinyInteger('rating')->unsigned(); // 1–5
            $table->text('review');
            $table->string('status', 20)->default('pending'); // pending | approved | rejected
            $table->timestamps();

            $table->unique('permohonan_id'); // satu permohonan hanya boleh satu review
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
