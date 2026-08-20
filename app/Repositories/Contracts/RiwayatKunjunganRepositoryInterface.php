<?php

namespace App\Repositories\Contracts;

use Illuminate\Pagination\LengthAwarePaginator;

interface RiwayatKunjunganRepositoryInterface
{
    /**
     * Mendapatkan daftar permohonan kunjungan kerja yang selesai dan memiliki review (paginated)
     */
    public function getRiwayatKunjungan(array $filters): LengthAwarePaginator;

    /**
     * Mendapatkan statistik ringkasan riwayat kunjungan publik
     */
    public function getStatistik(): array;
}
