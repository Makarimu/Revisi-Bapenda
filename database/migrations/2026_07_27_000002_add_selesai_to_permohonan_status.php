<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // SQLite tidak mendukung ALTER COLUMN untuk enum, jadi kita
        // update CHECK constraint dengan cara memodifikasi langsung
        // Solusi: ubah status menjadi string biasa (hapus CHECK constraint)
        // atau buat migration yang me-recreate tabel (SQLite).
        //
        // Untuk SQLite, kita gunakan pendekatan DB statement untuk
        // memodifikasi tabel tanpa CHECK constraint yang ketat.
        //
        // Catatan: Pada SQLite, ENUM diimplementasikan sebagai string dengan CHECK constraint.
        // Kita drop dan recreate kolom menggunakan pragma.

        // Karena SQLite tidak bisa ALTER kolom enum secara langsung,
        // kita buat kolom baru sebagai string, copy data, drop yang lama.
        // Namun pada SQLite, cara paling andal adalah membuat tabel temporary.

        // Cara terbaik di SQLite: disable foreign keys, recreate table
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
    }

    public function down(): void
    {
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
    }
};
