<?php

namespace App\Services;

use App\Repositories\Contracts\RiwayatKunjunganRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class RiwayatKunjunganService
{
    public function __construct(
        private RiwayatKunjunganRepositoryInterface $riwayatRepo
    ) {}

    public function getRiwayatKunjungan(array $filters): LengthAwarePaginator
    {
        return $this->riwayatRepo->getRiwayatKunjungan($filters);
    }

    public function getStatistik(): array
    {
        return $this->riwayatRepo->getStatistik();
    }
}
