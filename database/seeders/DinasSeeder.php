<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Dinas;

class DinasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $dinasList = [
            ['id' => 1, 'nama' => 'Dinas Pendidikan', 'singkatan' => 'DISDIK', 'nomor_telepon' => '(021) 875-3123', 'latitude' => -6.475798, 'longitude' => 106.825812],
            ['id' => 2, 'nama' => 'Dinas Pemuda dan Olahraga', 'singkatan' => 'DISPORA', 'nomor_telepon' => '(021) 875-5577', 'latitude' => -6.495449, 'longitude' => 106.830338],
            ['id' => 3, 'nama' => 'Dinas Kebudayaan', 'singkatan' => 'DISBUD', 'nomor_telepon' => '(021) 875-4466', 'latitude' => -6.523591, 'longitude' => 106.831786],
            ['id' => 4, 'nama' => 'Dinas Kesehatan', 'singkatan' => 'DINKES', 'nomor_telepon' => '(021) 875-4567', 'latitude' => -6.482472, 'longitude' => 106.832463],
            ['id' => 5, 'nama' => 'Dinas Sosial', 'singkatan' => 'DINSOS', 'nomor_telepon' => '(021) 875-5566', 'latitude' => -6.475137, 'longitude' => 106.824207],
            ['id' => 6, 'nama' => 'Dinas Pemberdayaan Perempuan, Perlindungan Anak, Pengendalian Penduduk, dan Keluarga Berencana', 'singkatan' => 'DP3AP2KB', 'nomor_telepon' => '(021) 875-4477', 'latitude' => -6.476223, 'longitude' => 106.823568],
            ['id' => 7, 'nama' => 'Dinas Kependudukan dan Pencatatan Sipil', 'singkatan' => 'DISDUKCAPIL', 'nomor_telepon' => '(021) 875-9900', 'latitude' => -6.485573, 'longitude' => 106.837128],
            ['id' => 8, 'nama' => 'Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu', 'singkatan' => 'DPMPTSP', 'nomor_telepon' => '(021) 875-5588', 'latitude' => -6.481501, 'longitude' => 106.827548],
            ['id' => 9, 'nama' => 'Dinas Komunikasi dan Informatika', 'singkatan' => 'DISKOMINFO', 'nomor_telepon' => '(021) 875-8899', 'latitude' => -6.485570, 'longitude' => 106.838141],
            ['id' => 10, 'nama' => 'Dinas Arsip dan Perpustakaan Daerah', 'singkatan' => 'DAPD', 'nomor_telepon' => '(021) 875-6688', 'latitude' => -6.478134, 'longitude' => 106.823061],
            ['id' => 11, 'nama' => 'Dinas Pekerjaan Umum', 'singkatan' => 'DPU', 'nomor_telepon' => '(021) 875-1122', 'latitude' => -6.481239, 'longitude' => 106.830491],
            ['id' => 12, 'nama' => 'Dinas Perumahan, Kawasan Permukiman, dan Pertanahan', 'singkatan' => 'DPKP', 'nomor_telepon' => '(021) 875-3344', 'latitude' => -6.481554, 'longitude' => 106.831136],
            ['id' => 13, 'nama' => 'Dinas Lingkungan Hidup', 'singkatan' => 'DLH', 'nomor_telepon' => '(021) 875-8800', 'latitude' => -6.481097, 'longitude' => 106.830969],
            ['id' => 14, 'nama' => 'Dinas Perhubungan', 'singkatan' => 'DISHUB', 'nomor_telepon' => '(021) 875-7788', 'latitude' => -6.529837, 'longitude' => 106.829226],
            ['id' => 15, 'nama' => 'Dinas Pemadam Kebakaran', 'singkatan' => 'DAMKAR', 'nomor_telepon' => '(021) 875-6699', 'latitude' => -6.485524, 'longitude' => 106.836620],
            ['id' => 16, 'nama' => 'Dinas Tanaman Pangan, Hortikultura, dan Perkebunan', 'singkatan' => 'DISTANHORBUN', 'nomor_telepon' => '(021) 875-2244', 'latitude' => -6.576530, 'longitude' => 106.759787],
            ['id' => 17, 'nama' => 'Dinas Perikanan dan Peternakan', 'singkatan' => 'DISKANAK', 'nomor_telepon' => '(021) 875-3355', 'latitude' => -6.476653, 'longitude' => 106.823952],
            ['id' => 18, 'nama' => 'Dinas Perdagangan dan Perindustrian', 'singkatan' => 'DISDAGIN', 'nomor_telepon' => '(021) 875-4455', 'latitude' => -6.476992, 'longitude' => 106.824403],
            ['id' => 19, 'nama' => 'Dinas Koperasi, Usaha Kecil dan Menengah', 'singkatan' => 'DISKOPUKM', 'nomor_telepon' => '(021) 875-2233', 'latitude' => -6.474895, 'longitude' => 106.825222],
            ['id' => 20, 'nama' => 'Dinas Ketahanan Pangan', 'singkatan' => 'DKP', 'nomor_telepon' => '(021) 875-1133', 'latitude' => -6.475763, 'longitude' => 106.826614],
            ['id' => 21, 'nama' => 'Dinas Tenaga Kerja', 'singkatan' => 'DISNAKER', 'nomor_telepon' => '(021) 875-6677', 'latitude' => -6.475480, 'longitude' => 106.823813],
            ['id' => 22, 'nama' => 'Dinas Pemberdayaan Masyarakat dan Desa', 'singkatan' => 'DPMD', 'nomor_telepon' => '(021) 875-7700', 'latitude' => -6.475438, 'longitude' => 106.827736],
            ['id' => 23, 'nama' => 'Sekretariat Daerah', 'singkatan' => 'SETDA', 'nomor_telepon' => '(021) 875-1144', 'latitude' => -6.478245, 'longitude' => 106.824774],
            ['id' => 24, 'nama' => 'Badan Perencanaan Pembangunan, Riset dan Inovasi Daerah', 'singkatan' => 'BAPPERIDA', 'nomor_telepon' => '(021) 875-7799', 'latitude' => -6.476065, 'longitude' => 106.827126],
            ['id' => 25, 'nama' => 'Badan Penanggulangan Bencana Daerah', 'singkatan' => 'BPBD', 'nomor_telepon' => '(021) 875-9922', 'latitude' => -6.484659, 'longitude' => 106.838398],
            ['id' => 26, 'nama' => 'Satuan Polisi Pamong Praja', 'singkatan' => 'SATPOLPP', 'nomor_telepon' => '(021) 875-0033', 'latitude' => -6.476394, 'longitude' => 106.824391],
            ['id' => 27, 'nama' => 'Badan Pengelolaan Pendapatan Daerah', 'singkatan' => 'BAPPENDA', 'nomor_telepon' => '(021) 875-8605', 'latitude' => -6.484995, 'longitude' => 106.835242],
            ['id' => 28, 'nama' => 'Badan Kepegawaian dan Pengembangan SDM', 'singkatan' => 'BKPSDM', 'nomor_telepon' => '(021) 875-8811', 'latitude' => -6.475658, 'longitude' => 106.824069],
            ['id' => 29, 'nama' => 'Sekretariat DPRD', 'singkatan' => 'SETWAN', 'nomor_telepon' => '(021) 875-2255', 'latitude' => -6.479594, 'longitude' => 106.825891],
            ['id' => 30, 'nama' => 'Inspektorat Daerah', 'singkatan' => 'INSPEKTORAT', 'nomor_telepon' => '(021) 875-3366', 'latitude' => -6.478406, 'longitude' => 106.823630],
            ['id' => 31, 'nama' => 'Badan Kesatuan Bangsa dan Politik', 'singkatan' => 'BAKESBANGPOL', 'nomor_telepon' => '(021) 875-1234', 'latitude' => -6.475243, 'longitude' => 106.827227],
            ['id' => 32, 'nama' => 'Badan Pengelolaan Keuangan dan Aset Daerah', 'singkatan' => 'BPKAD', 'nomor_telepon' => '(021) 875-2345', 'latitude' => -6.475465, 'longitude' => 106.824493],
            ['id' => 33, 'nama' => 'Dinas Pariwisata dan Ekonomi Kreatif', 'singkatan' => 'DISPAREKRAF', 'nomor_telepon' => '(021) 875-3456', 'latitude' => -6.476835, 'longitude' => 106.826577],
            ['id' => 34, 'nama' => 'Dinas Pertanahan dan Penataan Ruang', 'singkatan' => 'DPTR', 'nomor_telepon' => '(021) 875-4567', 'latitude' => -6.484547, 'longitude' => 106.834086],
            ['id' => 35, 'nama' => 'RSUD Ciawi', 'singkatan' => 'RSUD CIAWI', 'nomor_telepon' => '(0251) 8240797', 'latitude' => -6.658948, 'longitude' => 106.852542],
            ['id' => 36, 'nama' => 'RSUD Cibinong', 'singkatan' => 'RSUD CIBINONG', 'nomor_telepon' => '(021) 8753482', 'latitude' => -6.473036, 'longitude' => 106.831322],
            ['id' => 37, 'nama' => 'RSUD Cileungsi', 'singkatan' => 'RSUD CILEUNGSI', 'nomor_telepon' => '(021) 89934668', 'latitude' => -6.428146, 'longitude' => 107.047719],
            ['id' => 38, 'nama' => 'RSUD Leuwiliang', 'singkatan' => 'RSUD LEUWILIANG', 'nomor_telepon' => '(0251) 8643200', 'latitude' => -6.567495, 'longitude' => 106.626126],
        ];

        foreach ($dinasList as $d) {
            Dinas::updateOrCreate(
                ['id' => $d['id']],
                [
                    'nama' => $d['nama'],
                    'singkatan' => $d['singkatan'],
                    'nomor_telepon' => $d['nomor_telepon'],
                    'latitude' => $d['latitude'],
                    'longitude' => $d['longitude'],
                ]
            );
        }
    }
}
