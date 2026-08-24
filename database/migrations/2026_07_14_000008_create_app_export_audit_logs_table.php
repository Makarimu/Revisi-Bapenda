<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('app_export_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('admin_id')->nullable();
            $table->string('admin_name', 150)->nullable();
            $table->dateTime('waktu_export');
            $table->unsignedInteger('jumlah_data');
            $table->text('filter_used')->nullable(); // JSON string
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_export_audit_logs');
    }
};
