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
        $jsonPath = public_path('dinas_points.json');
        if (!file_exists($jsonPath)) {
            return;
        }

        $dinasData = json_decode(file_get_contents($jsonPath), true);
        if (!$dinasData) {
            return;
        }

        foreach ($dinasData as $d) {
            Dinas::updateOrCreate(
                ['id' => $d['id']],
                [
                    'nama' => $d['nama'],
                    'singkatan' => $d['singkatan'],
                    'latitude' => $d['latitude'],
                    'longitude' => $d['longitude'],
                    // Standard contact format for Kab. Bogor
                    'nomor_telepon' => '021-8758' . str_pad($d['id'], 3, '0', STR_PAD_LEFT),
                ]
            );
        }
    }
}
