<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Dinas;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminDinasSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Pastikan Data Master Dinas Terisi
        $initialDinas = [
            ['nama' => 'Badan Pengelolaan Pendapatan Daerah', 'singkatan' => 'BAPPENDA', 'nomor_telepon' => '(021) 875-8605'],
            ['nama' => 'Dinas Pendidikan', 'singkatan' => 'DISDIK', 'nomor_telepon' => '(021) 875-3123'],
            ['nama' => 'Dinas Kesehatan', 'singkatan' => 'DINKES', 'nomor_telepon' => '(021) 875-4567'],
            ['nama' => 'Dinas Komunikasi dan Informatika', 'singkatan' => 'DISKOMINFO', 'nomor_telepon' => '(021) 875-8899'],
            ['nama' => 'Dinas Pekerjaan Umum dan Penataan Ruang', 'singkatan' => 'PUPR', 'nomor_telepon' => '(021) 875-1122'],
            ['nama' => 'Dinas Perumahan, Kawasan Permukiman dan Pertanahan', 'singkatan' => 'DPKPP', 'nomor_telepon' => '(021) 875-3344'],
            ['nama' => 'Dinas Sosial', 'singkatan' => 'DINSOS', 'nomor_telepon' => '(021) 875-5566'],
            ['nama' => 'Dinas Perhubungan', 'singkatan' => 'DISHUB', 'nomor_telepon' => '(021) 875-7788'],
            ['nama' => 'Dinas Kependudukan dan Pencatatan Sipil', 'singkatan' => 'DISDUKCAPIL', 'nomor_telepon' => '(021) 875-9900'],
            ['nama' => 'Dinas Koperasi, Usaha Kecil dan Menengah', 'singkatan' => 'DISCOPUKM', 'nomor_telepon' => '(021) 875-2233'],
            ['nama' => 'Dinas Perdagangan dan Perindustrian', 'singkatan' => 'DISDAGIN', 'nomor_telepon' => '(021) 875-4455'],
            ['nama' => 'Dinas Tenaga Kerja', 'singkatan' => 'DISNAKER', 'nomor_telepon' => '(021) 875-6677'],
            ['nama' => 'Dinas Lingkungan Hidup', 'singkatan' => 'DLH', 'nomor_telepon' => '(021) 875-8800'],
            ['nama' => 'Dinas Ketahanan Pangan', 'singkatan' => 'DKP', 'nomor_telepon' => '(021) 875-1133'],
            ['nama' => 'Dinas Tanaman Pangan, Hortikultura dan Perkebunan', 'singkatan' => 'DISTANHORBUN', 'nomor_telepon' => '(021) 875-2244'],
            ['nama' => 'Dinas Perikanan dan Peternakan', 'singkatan' => 'DISKANNAK', 'nomor_telepon' => '(021) 875-3355'],
            ['nama' => 'Dinas Kebudayaan dan Pariwisata', 'singkatan' => 'DISBUDPAR', 'nomor_telepon' => '(021) 875-4466'],
            ['nama' => 'Dinas Pemuda dan Olahraga', 'singkatan' => 'DISPORA', 'nomor_telepon' => '(021) 875-5577'],
            ['nama' => 'Dinas Perpustakaan dan Kearsipan Daerah', 'singkatan' => 'DAPUSDA', 'nomor_telepon' => '(021) 875-6688'],
            ['nama' => 'Badan Perencanaan Pembangunan Daerah', 'singkatan' => 'BAPPEDALITBANG', 'nomor_telepon' => '(021) 875-7799'],
            ['nama' => 'Badan Kepegawaian dan Pengembangan SDM', 'singkatan' => 'BKPSDM', 'nomor_telepon' => '(021) 875-8811'],
            ['nama' => 'Badan Penanggulangan Bencana Daerah', 'singkatan' => 'BPBD', 'nomor_telepon' => '(021) 875-9922'],
            ['nama' => 'Satuan Polisi Pamong Praja', 'singkatan' => 'SATPOLPP', 'nomor_telepon' => '(021) 875-0033'],
            ['nama' => 'Sekretariat Daerah', 'singkatan' => 'SETDA', 'nomor_telepon' => '(021) 875-1144'],
            ['nama' => 'Sekretariat DPRD', 'singkatan' => 'SETWAN', 'nomor_telepon' => '(021) 875-2255'],
            ['nama' => 'Inspektorat Daerah', 'singkatan' => 'INSPEKTORAT', 'nomor_telepon' => '(021) 875-3366'],
        ];

        foreach ($initialDinas as $d) {
            Dinas::firstOrCreate(
                ['singkatan' => $d['singkatan']],
                [
                    'nama' => $d['nama'],
                    'nomor_telepon' => $d['nomor_telepon'],
                ]
            );
        }

        // 2. Buat Super Admin
        Admin::updateOrCreate(
            ['username' => 'admin'],
            [
                'password' => Hash::make('admin123'),
                'nama' => 'Super Administrator',
                'dinas_id' => null,
            ]
        );

        // 3. Buat Akun Admin untuk Setiap Dinas
        $allDinas = Dinas::all();
        foreach ($allDinas as $dinas) {
            $cleanSingkatan = Str::slug($dinas->singkatan, '_');
            $username = 'admin_' . $cleanSingkatan;
            $passwordStr = 'pass_' . Str::slug($dinas->singkatan, '');

            Admin::updateOrCreate(
                ['dinas_id' => $dinas->id],
                [
                    'username' => $username,
                    'password' => Hash::make($passwordStr),
                    'nama' => 'Admin ' . $dinas->singkatan,
                    'dinas_id' => $dinas->id,
                ]
            );
        }
    }
}
