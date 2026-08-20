<?php

namespace Database\Factories;

use App\Models\Permohonan;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

/**
 * @extends Factory<Permohonan>
 */
class PermohonanFactory extends Factory
{
    protected $model = Permohonan::class;

    public function definition(): array
    {
        $instansi_list = [
            'DPRD Kab. Bogor',
            'Kementerian Keuangan',
            'Dinas Pendidikan',
            'Pemerintah Kota Depok',
            'Badan Pengelola Keuangan',
        ];

        $digits = array_map(fn() => (string) random_int(0, 9), range(1, 4));
        $letter = chr(random_int(65, 90));
        $pos = random_int(0, 4);
        array_splice($digits, $pos, 0, $letter);
        $suffix = implode('', $digits);

        return [
            'kode'                   => 'KUNKER-' . Carbon::now()->format('Ymd') . '-' . $suffix,
            'nomor_surat'            => $this->faker->numerify('###/###/####'),
            'instansi'               => $this->faker->randomElement($instansi_list),
            'nama_ketua_rombongan'   => $this->faker->name(),
            'jabatan_ketua_rombongan'=> 'Ketua',
            'nama_pic'               => $this->faker->name(),
            'jabatan_pic'            => 'Sekretaris',
            'no_telp'                => '08' . $this->faker->numerify('#########'),
            'email'                  => $this->faker->safeEmail(),
            'tanggal_kunjungan'      => Carbon::now()->addDays(rand(8, 30))->format('Y-m-d'),
            'tujuan'                 => $this->faker->sentence(),
            'jumlah_peserta'         => $this->faker->numberBetween(5, 50),
            'rencana_menginap'       => 'Tidak',
            'status'                 => 'Pending',
            'tgl_pengajuan_awal'     => Carbon::now(),
            // Ringkasan PDF fields (nullable by default)
            'tanggal_selesai_kunjungan' => null,
            'ringkasan_pdf_path'        => null,
            'ringkasan_uploaded_at'     => null,
            'ringkasan_sent_at'         => null,
            'ringkasan_sent_by'         => null,
        ];
    }
}
