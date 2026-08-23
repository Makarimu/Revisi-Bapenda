<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            // SQLite: recreate table with status including 'Selesai'
            DB::statement('PRAGMA foreign_keys=off');
            DB::statement("
                CREATE TABLE IF NOT EXISTS permohonan_temp AS SELECT * FROM permohonan
            ");
            DB::statement('DROP TABLE permohonan');
            DB::statement("
                CREATE TABLE permohonan (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    kode VARCHAR(50) NOT NULL UNIQUE,
                    nomor_surat VARCHAR(200),
                    instansi VARCHAR(200),
                    nama_ketua_rombongan VARCHAR(200),
                    jabatan_ketua_rombongan VARCHAR(200),
                    nama_pic VARCHAR(200),
                    jabatan_pic VARCHAR(200),
                    no_telp VARCHAR(50),
                    email VARCHAR(200),
                    tanggal_kunjungan DATE,
                    tujuan TEXT,
                    jumlah_peserta INTEGER UNSIGNED,
                    rencana_menginap VARCHAR(10) NOT NULL DEFAULT 'Tidak' CHECK (rencana_menginap IN ('Ya', 'Tidak')),
                    nama_hotel VARCHAR(200),
                    surat_permohonan TEXT,
                    daftar_pertanyaan TEXT,
                    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Disetujui', 'Ditolak', 'Revisi', 'Selesai')),
                    keterangan_admin TEXT,
                    bisa_direvisi VARCHAR(10) CHECK (bisa_direvisi IN ('Ya', 'Tidak')),
                    bukti_menginap TEXT,
                    narasumber VARCHAR(200),
                    jam_penerimaan VARCHAR(20),
                    tgl_pengajuan_awal DATETIME NOT NULL,
                    tgl_diproses DATETIME,
                    tgl_revisi DATETIME,
                    created_at DATETIME,
                    updated_at DATETIME
                )
            ");
            DB::statement("INSERT INTO permohonan SELECT * FROM permohonan_temp");
            DB::statement('DROP TABLE permohonan_temp');
            DB::statement('PRAGMA foreign_keys=on');
        } else {
            // MySQL: simple ALTER query
            DB::statement("ALTER TABLE permohonan MODIFY COLUMN status ENUM('Pending', 'Disetujui', 'Ditolak', 'Revisi', 'Selesai') NOT NULL DEFAULT 'Pending'");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            DB::statement('PRAGMA foreign_keys=off');
            DB::statement("
                CREATE TABLE IF NOT EXISTS permohonan_temp AS SELECT * FROM permohonan
            ");
            DB::statement('DROP TABLE permohonan');
            DB::statement("
                CREATE TABLE permohonan (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    kode VARCHAR(50) NOT NULL UNIQUE,
                    nomor_surat VARCHAR(200),
                    instansi VARCHAR(200),
                    nama_ketua_rombongan VARCHAR(200),
                    jabatan_ketua_rombongan VARCHAR(200),
                    nama_pic VARCHAR(200),
                    jabatan_pic VARCHAR(200),
                    no_telp VARCHAR(50),
                    email VARCHAR(200),
                    tanggal_kunjungan DATE,
                    tujuan TEXT,
                    jumlah_peserta INTEGER UNSIGNED,
                    rencana_menginap VARCHAR(10) NOT NULL DEFAULT 'Tidak' CHECK (rencana_menginap IN ('Ya', 'Tidak')),
                    nama_hotel VARCHAR(200),
                    surat_permohonan TEXT,
                    daftar_pertanyaan TEXT,
                    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Disetujui', 'Ditolak', 'Revisi')),
                    keterangan_admin TEXT,
                    bisa_direvisi VARCHAR(10) CHECK (bisa_direvisi IN ('Ya', 'Tidak')),
                    bukti_menginap TEXT,
                    narasumber VARCHAR(200),
                    jam_penerimaan VARCHAR(20),
                    tgl_pengajuan_awal DATETIME NOT NULL,
                    tgl_diproses DATETIME,
                    tgl_revisi DATETIME,
                    created_at DATETIME,
                    updated_at DATETIME
                )
            ");
            DB::statement("INSERT INTO permohonan SELECT * FROM permohonan_temp");
            DB::statement('DROP TABLE permohonan_temp');
            DB::statement('PRAGMA foreign_keys=on');
        } else {
            DB::statement("ALTER TABLE permohonan MODIFY COLUMN status ENUM('Pending', 'Disetujui', 'Ditolak', 'Revisi') NOT NULL DEFAULT 'Pending'");
        }
    }
};
