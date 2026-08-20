<?php

namespace App\Repositories\Contracts;

use App\Models\TanggalDiblokir;
use Illuminate\Database\Eloquent\Collection;

interface TanggalDiblokirRepositoryInterface
{
    public function getAll(): Collection;
    public function getAllUpcoming(): Collection;
    
    public function findByTanggal(string $tanggal): ?TanggalDiblokir;
    
    public function create(array $data): TanggalDiblokir;
    
    public function delete(TanggalDiblokir $tanggalDiblokir): bool;
    
    public function deleteByTanggal(string $tanggal): bool;
}
