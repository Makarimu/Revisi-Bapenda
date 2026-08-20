<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // SQLite tidak support ALTER COLUMN untuk enum.
        // Gunakan pendekatan recreate table (sama seperti migration sebelumnya).
        DB::statement('PRAGMA foreign_keys=off');

        // Backup data
        DB::statement('CREATE TABLE IF NOT EXISTS permohonan_temp AS SELECT * FROM permohonan');

        // Drop tabel lama
        DB::statement('DROP TABLE permohonan');

        // Recreate dengan kolom-kolom baru + status Ringkasan_Terkirim
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
                status VARCHAR(30) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Disetujui', 'Ditolak', 'Revisi', 'Selesai', 'Ringkasan_Terkirim')),
                keterangan_admin TEXT,
                bisa_direvisi VARCHAR(10) CHECK (bisa_direvisi IN ('Ya', 'Tidak')),
                bukti_menginap TEXT,
                narasumber VARCHAR(200),
                jam_penerimaan VARCHAR(20),
                tgl_pengajuan_awal DATETIME NOT NULL,
                tgl_diproses DATETIME,
                tgl_revisi DATETIME,
                tanggal_selesai_kunjungan DATETIME,
                ringkasan_pdf_path TEXT,
                ringkasan_uploaded_at DATETIME,
                ringkasan_sent_at DATETIME,
                ringkasan_sent_by VARCHAR(200),
                created_at DATETIME,
                updated_at DATETIME
            )
        ");

        // Restore data
        DB::statement("
            INSERT INTO permohonan (
                id, kode, nomor_surat, instansi, nama_ketua_rombongan,
                jabatan_ketua_rombongan, nama_pic, jabatan_pic, no_telp, email,
                tanggal_kunjungan, tujuan, jumlah_peserta, rencana_menginap, nama_hotel,
                surat_permohonan, daftar_pertanyaan, status, keterangan_admin, bisa_direvisi,
                bukti_menginap, narasumber, jam_penerimaan, tgl_pengajuan_awal,
                tgl_diproses, tgl_revisi, created_at, updated_at
            )
            SELECT
                id, kode, nomor_surat, instansi, nama_ketua_rombongan,
                jabatan_ketua_rombongan, nama_pic, jabatan_pic, no_telp, email,
                tanggal_kunjungan, tujuan, jumlah_peserta, rencana_menginap, nama_hotel,
                surat_permohonan, daftar_pertanyaan, status, keterangan_admin, bisa_direvisi,
                bukti_menginap, narasumber, jam_penerimaan, tgl_pengajuan_awal,
                tgl_diproses, tgl_revisi, created_at, updated_at
            FROM permohonan_temp
        ");

        DB::statement('DROP TABLE permohonan_temp');
        DB::statement('PRAGMA foreign_keys=on');
    }

    public function down(): void
    {
        DB::statement('PRAGMA foreign_keys=off');
        DB::statement('CREATE TABLE IF NOT EXISTS permohonan_temp AS SELECT * FROM permohonan');
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

        DB::statement("
            INSERT INTO permohonan (
                id, kode, nomor_surat, instansi, nama_ketua_rombongan,
                jabatan_ketua_rombongan, nama_pic, jabatan_pic, no_telp, email,
                tanggal_kunjungan, tujuan, jumlah_peserta, rencana_menginap, nama_hotel,
                surat_permohonan, daftar_pertanyaan, status, keterangan_admin, bisa_direvisi,
                bukti_menginap, narasumber, jam_penerimaan, tgl_pengajuan_awal,
                tgl_diproses, tgl_revisi, created_at, updated_at
            )
            SELECT
                id, kode, nomor_surat, instansi, nama_ketua_rombongan,
                jabatan_ketua_rombongan, nama_pic, jabatan_pic, no_telp, email,
                tanggal_kunjungan, tujuan, jumlah_peserta, rencana_menginap, nama_hotel,
                surat_permohonan, daftar_pertanyaan, status, keterangan_admin, bisa_direvisi,
                bukti_menginap, narasumber, jam_penerimaan, tgl_pengajuan_awal,
                tgl_diproses, tgl_revisi, created_at, updated_at
            FROM permohonan_temp
        ");

        DB::statement('DROP TABLE permohonan_temp');
        DB::statement('PRAGMA foreign_keys=on');
    }
};
