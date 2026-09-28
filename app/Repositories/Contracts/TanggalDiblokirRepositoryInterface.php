<?php

namespace App\Repositories\Contracts;

use App\Models\TanggalDiblokir;
use Illuminate\Database\Eloquent\Collection;

interface TanggalDiblokirRepositoryInterface
{
    public function getAll(): Collection;
    public function getAllUpcoming(?int $dinasId = null): Collection;
    
    public function findByTanggal(string $tanggal, ?int $dinasId = null): ?TanggalDiblokir;
    
    public function create(array $data): TanggalDiblokir;
    
    public function delete(TanggalDiblokir $tanggalDiblokir): bool;
    
    public function deleteByTanggal(string $tanggal, ?int $dinasId = null): bool;
}
