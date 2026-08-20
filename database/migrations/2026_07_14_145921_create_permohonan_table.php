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
        Schema::create('permohonan', function (Blueprint $table) {
            $table->id();
            $table->string('kode', 30)->unique();
            $table->string('nomor_surat', 100);
            $table->string('instansi', 200);
            $table->string('nama_ketua_rombongan', 150);
            $table->string('jabatan_ketua_rombongan', 150);
            $table->string('nama_pic', 150);
            $table->string('jabatan_pic', 150);
            $table->string('no_telp', 20);
            $table->string('email', 150);
            $table->date('tanggal_kunjungan');
            $table->text('tujuan');
            $table->unsignedInteger('jumlah_peserta');
            $table->enum('rencana_menginap', ['Ya', 'Tidak'])->default('Tidak');
            $table->string('nama_hotel', 200)->nullable();
            $table->text('surat_permohonan')->nullable();
            $table->text('daftar_pertanyaan')->nullable();
            $table->enum('status', ['Pending', 'Disetujui', 'Ditolak', 'Revisi'])->default('Pending');
            $table->text('keterangan_admin')->nullable();
            $table->enum('bisa_direvisi', ['Ya', 'Tidak'])->nullable();
            $table->text('bukti_menginap')->nullable();
            $table->string('narasumber', 200)->nullable();
            $table->string('jam_penerimaan', 20)->nullable();
            $table->dateTime('tgl_pengajuan_awal');
            $table->dateTime('tgl_diproses')->nullable();
            $table->dateTime('tgl_revisi')->nullable();
            $table->timestamps();

            $table->index('kode');
            $table->index('status');
            $table->index('tanggal_kunjungan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permohonan');
    }
};
